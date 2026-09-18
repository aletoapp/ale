#!/usr/bin/env python3
"""
fetch_seo_data.py
──────────────────
Busca métricas do Google Analytics 4 (GA4 Data API) e do Google Search
Console (Search Console API) usando uma service account, e salva tudo
num único JSON que o painel estático (HTML/JS) consome depois.

SEGURANÇA: a chave da service account só existe na variável de ambiente
GOOGLE_SERVICE_ACCOUNT_JSON, injetada em tempo de execução pelo GitHub
Actions a partir de um Secret criptografado (Settings → Secrets and
variables → Actions). Este script nunca grava, imprime ou loga o
conteúdo dessa variável.

Variáveis de ambiente esperadas:
    GOOGLE_SERVICE_ACCOUNT_JSON  conteúdo do JSON da service account (string)
    GA4_PROPERTY_ID              ID numérico da propriedade GA4 (ex: "123456789")
    GSC_SITE_URL                 URL exata cadastrada no Search Console
                                  (ex.: "https://alexandretorres.com.br/" ou,
                                  se for propriedade de domínio,
                                  "sc-domain:alexandretorres.com.br")

Se GA4_PROPERTY_ID ou GSC_SITE_URL não estiverem definidos, a respectiva
etapa é simplesmente pulada (com aviso), então dá pra ligar uma fonte
de cada vez.

Pré-requisito nas contas Google (feito uma vez, pela interface web):
    1. Crie uma service account no Google Cloud Console e gere uma chave JSON.
    2. No GA4: Admin → Property Access Management → adicione o e-mail
       da service account como "Viewer".
    3. No Search Console: Configurações → Usuários e permissões →
       adicione o e-mail da service account como usuário.

Uso:
    python fetch_seo_data.py --out dashboard-data.json --days 28
"""

import argparse
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta


def load_credentials(scopes):
    """Carrega as credenciais a partir da env var, sem nunca gravá-las em disco."""
    from google.oauth2 import service_account

    raw = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not raw:
        raise RuntimeError("Variável de ambiente GOOGLE_SERVICE_ACCOUNT_JSON não definida.")
    info = json.loads(raw)
    return service_account.Credentials.from_service_account_info(info, scopes=scopes)


def fetch_ga4(property_id, days):
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

    creds = load_credentials(["https://www.googleapis.com/auth/analytics.readonly"])
    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
        dimensions=[Dimension(name="pagePath")],
        metrics=[
            Metric(name="sessions"),
            Metric(name="activeUsers"),
            Metric(name="conversions"),
            Metric(name="averageSessionDuration"),
        ],
        order_bys=[{"metric": {"metric_name": "sessions"}, "desc": True}],
        limit=50,
    )
    response = client.run_report(request)

    pages = []
    for row in response.rows:
        pages.append(
            {
                "path": row.dimension_values[0].value,
                "sessions": int(row.metric_values[0].value),
                "activeUsers": int(row.metric_values[1].value),
                "conversions": float(row.metric_values[2].value),
                "avgSessionDuration": round(float(row.metric_values[3].value), 1),
            }
        )

    totals = {
        "sessions": sum(p["sessions"] for p in pages),
        "activeUsers": sum(p["activeUsers"] for p in pages),
        "conversions": sum(p["conversions"] for p in pages),
    }
    return {"period_days": days, "totals": totals, "top_pages": pages}


def fetch_search_console(site_url, days):
    from googleapiclient.discovery import build

    creds = load_credentials(["https://www.googleapis.com/auth/webmasters.readonly"])
    service = build("searchconsole", "v1", credentials=creds)

    end = datetime.utcnow().date() - timedelta(days=2)  # GSC processa com ~2 dias de atraso
    start = end - timedelta(days=days)

    by_page = (
        service.searchanalytics()
        .query(
            siteUrl=site_url,
            body={
                "startDate": start.isoformat(),
                "endDate": end.isoformat(),
                "dimensions": ["page"],
                "rowLimit": 100,
            },
        )
        .execute()
    )

    # (query, página) — é isso que permite achar canibalização de verdade:
    # se a MESMA consulta traz mais de uma página sua, elas estão competindo.
    by_page_query = (
        service.searchanalytics()
        .query(
            siteUrl=site_url,
            body={
                "startDate": start.isoformat(),
                "endDate": end.isoformat(),
                "dimensions": ["query", "page"],
                "rowLimit": 500,
            },
        )
        .execute()
    )

    pages = [
        {
            "page": row["keys"][0],
            "clicks": row["clicks"],
            "impressions": row["impressions"],
            "ctr": round(row["ctr"] * 100, 2),
            "position": round(row["position"], 1),
        }
        for row in by_page.get("rows", [])
    ]

    query_pages = defaultdict(list)
    for row in by_page_query.get("rows", []):
        query, page = row["keys"]
        query_pages[query].append(
            {"page": page, "clicks": row["clicks"], "position": round(row["position"], 1)}
        )

    cannibalization = [
        {"query": q, "pages": v} for q, v in query_pages.items() if len({p["page"] for p in v}) > 1
    ]
    cannibalization.sort(key=lambda x: -sum(p["clicks"] for p in x["pages"]))

    totals = {
        "clicks": sum(p["clicks"] for p in pages),
        "impressions": sum(p["impressions"] for p in pages),
    }
    return {
        "period_days": days,
        "totals": totals,
        "pages": pages,
        "cannibalization": cannibalization[:20],
    }


def main():
    ap = argparse.ArgumentParser(description="Busca métricas de GA4 + Search Console pro painel de SEO.")
    ap.add_argument("--out", default="dashboard-data.json")
    ap.add_argument("--days", type=int, default=28)
    args = ap.parse_args()

    property_id = os.environ.get("GA4_PROPERTY_ID")
    site_url = os.environ.get("GSC_SITE_URL")

    data = {"generated_at": datetime.utcnow().isoformat() + "Z"}

    if property_id:
        try:
            data["ga4"] = fetch_ga4(property_id, args.days)
        except Exception as e:
            print(f"Aviso: falha ao buscar GA4: {e}", file=sys.stderr)
            data["ga4"] = {"error": str(e)}
    else:
        print("Aviso: GA4_PROPERTY_ID não definido — pulando GA4.", file=sys.stderr)

    if site_url:
        try:
            data["search_console"] = fetch_search_console(site_url, args.days)
        except Exception as e:
            print(f"Aviso: falha ao buscar Search Console: {e}", file=sys.stderr)
            data["search_console"] = {"error": str(e)}
    else:
        print("Aviso: GSC_SITE_URL não definido — pulando Search Console.", file=sys.stderr)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Dados salvos em {args.out}")


if __name__ == "__main__":
    main()
