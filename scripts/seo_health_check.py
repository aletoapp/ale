#!/usr/bin/env python3
"""
seo_health_check.py
────────────────────
Audita os cabeçalhos (title, meta description, canonical, robots,
Open Graph, Twitter Card e JSON-LD) de um conjunto de páginas HTML do
mesmo site e aponta:

  • tags ausentes, duplicadas ou fora do tamanho ideal
  • canonical/og:url/JSON-LD "url" inconsistentes entre si
  • title / meta description / H1 duplicados entre páginas diferentes
  • possível canibalização (títulos ou H1 muito parecidos em páginas
    diferentes disputando a mesma intenção de busca)
  • @id de JSON-LD repetido entre páginas sem ser uma entidade global
    (#person, #website) — geralmente sinal de bloco copiado e não
    atualizado
  • perguntas de FAQPage repetidas em mais de uma página

Não depende de nenhuma biblioteca externa — só Python 3 padrão.

USO
────
    python seo_health_check.py pasta-do-site/
    python seo_health_check.py pagina1.html pagina2.html pagina3.html
    python seo_health_check.py pasta-do-site/ --out relatorio.md

O script varre recursivamente pastas em busca de *.html e gera um
relatório em Markdown (padrão: seo-health-report.md) além de imprimir
o resultado no terminal.
"""

import argparse
import glob
import json
import os
import re
import sys
from collections import defaultdict
from difflib import SequenceMatcher
from html.parser import HTMLParser

TITLE_MIN, TITLE_MAX = 30, 60
DESC_MIN, DESC_MAX = 70, 160
SIMILARITY_THRESHOLD = 0.82  # acima disso, título/H1 é "quase igual" -> possível canibalização
GLOBAL_ID_SUFFIXES = ("#person", "#website", "#organization")


# ────────────────────────────────────────────────────────────────
# Parsing do <head> (e H1) sem dependências externas
# ────────────────────────────────────────────────────────────────
class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_title = False
        self.title = None
        self._title_done = False  # só o primeiro <title> (o da página) conta
        self.metas = []
        self.links = []
        self.jsonld_raw = []
        self._in_jsonld = False
        self._jsonld_buffer = []
        self.h1s = []
        self._in_h1 = False
        self._h1_buffer = []
        self._svg_depth = 0  # <title>/<h1>-like tags dentro de <svg> são só acessibilidade, não contam

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "svg":
            self._svg_depth += 1
        if tag == "title" and self._svg_depth == 0 and not self._title_done:
            self.in_title = True
        elif tag == "meta":
            self.metas.append(attrs)
        elif tag == "link":
            self.links.append(attrs)
        elif tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self._in_jsonld = True
            self._jsonld_buffer = []
        elif tag == "h1" and self._svg_depth == 0:
            self._in_h1 = True
            self._h1_buffer = []

    def handle_endtag(self, tag):
        if tag == "svg":
            self._svg_depth = max(0, self._svg_depth - 1)
        if tag == "title" and self.in_title:
            self.in_title = False
            self._title_done = True
        elif tag == "script" and self._in_jsonld:
            self._in_jsonld = False
            self.jsonld_raw.append("".join(self._jsonld_buffer))
        elif tag == "h1" and self._in_h1:
            self._in_h1 = False
            self.h1s.append("".join(self._h1_buffer).strip())

    def handle_data(self, data):
        if self.in_title:
            self.title = (self.title or "") + data
        if self._in_jsonld:
            self._jsonld_buffer.append(data)
        if self._in_h1:
            self._h1_buffer.append(data)


def normalize(text):
    return re.sub(r"\s+", " ", text or "").strip()


def similarity(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def get_meta(metas, key, val):
    for m in metas:
        if m.get(key, "").lower() == val.lower():
            return normalize(m.get("content", ""))
    return None


def get_all_meta(metas, key, val):
    return [normalize(m.get("content", "")) for m in metas if m.get(key, "").lower() == val.lower()]


def jsonld_type_of(node):
    t = node.get("@type")
    if isinstance(t, list):
        return "/".join(t)
    return t or "(sem @type)"


def flatten_jsonld(raw_blocks):
    """Retorna (nodes, errors) resolvendo @graph e listas soltas."""
    nodes, errors = [], []
    for raw in raw_blocks:
        raw = raw.strip()
        if not raw:
            continue
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            errors.append(str(e))
            continue
        if isinstance(data, dict) and "@graph" in data:
            nodes.extend(data["@graph"])
        elif isinstance(data, list):
            nodes.extend(data)
        elif isinstance(data, dict):
            nodes.append(data)
    return nodes, errors


def analyze_file(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        html = f.read()

    parser = HeadParser()
    parser.feed(html)

    canonical, canonical_count = None, 0
    for l in parser.links:
        if l.get("rel", "").lower() == "canonical":
            canonical_count += 1
            canonical = l.get("href")

    jsonld_nodes, jsonld_errors = flatten_jsonld(parser.jsonld_raw)

    return {
        "path": path,
        "title": normalize(parser.title),
        "desc": get_meta(parser.metas, "name", "description"),
        "robots": get_meta(parser.metas, "name", "robots"),
        "canonical": canonical,
        "canonical_count": canonical_count,
        "meta_count_desc": len(get_all_meta(parser.metas, "name", "description")),
        "og": {k: get_meta(parser.metas, "property", f"og:{k}") for k in ("title", "description", "url", "type", "image")},
        "tw": {k: get_meta(parser.metas, "name", f"twitter:{k}") for k in ("title", "description", "card", "image")},
        "jsonld_nodes": jsonld_nodes,
        "jsonld_errors": jsonld_errors,
        "h1s": [normalize(h) for h in parser.h1s],
    }


EXCLUDE_DIR_NAMES = {"admin"}  # pastas internas que não são conteúdo público — não fazem parte da auditoria de SEO


def collect_files(paths):
    files = []
    for p in paths:
        if os.path.isdir(p):
            for f in sorted(glob.glob(os.path.join(p, "**", "*.html"), recursive=True)):
                rel_parts = os.path.normpath(f).split(os.sep)
                if any(part in EXCLUDE_DIR_NAMES for part in rel_parts):
                    continue
                files.append(f)
        else:
            files.extend(sorted(glob.glob(p)))
    seen, out = set(), []
    for f in files:
        if f not in seen:
            seen.add(f)
            out.append(f)
    return out


# ────────────────────────────────────────────────────────────────
# Relatório
# ────────────────────────────────────────────────────────────────
def build_report(pages, out_path):
    lines = [f"# Relatório de Saúde de SEO — {len(pages)} página(s) analisadas\n"]
    issues = []  # (severidade, arquivo, mensagem)

    def flag(sev, page, msg):
        issues.append((sev, page, msg))

    # ---- checks por página --------------------------------------
    for p in pages:
        name = p["path"]

        if not p["title"]:
            flag("ALTA", name, "Sem <title>.")
        else:
            L = len(p["title"])
            if L < TITLE_MIN:
                flag("MÉDIA", name, f'<title> curto ({L} caracteres): "{p["title"]}"')
            elif L > TITLE_MAX:
                flag("MÉDIA", name, f'<title> longo ({L} caracteres, risco de truncar no Google): "{p["title"]}"')

        if not p["desc"]:
            flag("ALTA", name, "Sem meta description.")
        else:
            L = len(p["desc"])
            if L < DESC_MIN:
                flag("BAIXA", name, f"meta description curta ({L} caracteres).")
            elif L > DESC_MAX:
                flag("MÉDIA", name, f"meta description longa ({L} caracteres, risco de truncar).")

        if p["meta_count_desc"] > 1:
            flag("ALTA", name, f'{p["meta_count_desc"]}x <meta name="description"> — deveria haver só uma.')

        if p["canonical_count"] == 0:
            flag("ALTA", name, 'Sem <link rel="canonical">.')
        elif p["canonical_count"] > 1:
            flag("ALTA", name, f'{p["canonical_count"]}x tag canonical — deveria haver só uma.')

        if p["canonical"] and p["og"].get("url") and p["canonical"].rstrip("/") != p["og"]["url"].rstrip("/"):
            flag("MÉDIA", name, f'canonical ({p["canonical"]}) difere de og:url ({p["og"]["url"]}).')

        if not p["og"].get("title"):
            flag("BAIXA", name, "Sem og:title.")
        if not p["og"].get("description"):
            flag("BAIXA", name, "Sem og:description.")
        if not p["tw"].get("card"):
            flag("BAIXA", name, "Sem twitter:card.")

        if len(p["h1s"]) == 0:
            flag("ALTA", name, "Sem <h1> na página.")
        elif len(p["h1s"]) > 1:
            flag("MÉDIA", name, f'{len(p["h1s"])}x <h1> na mesma página (deveria ter só uma).')

        for e in p["jsonld_errors"]:
            flag("ALTA", name, f"JSON-LD malformado / não parseável: {e}")

        if not p["jsonld_nodes"]:
            flag("MÉDIA", name, "Nenhum bloco JSON-LD encontrado.")

        types_seen = defaultdict(int)
        for node in p["jsonld_nodes"]:
            types_seen[jsonld_type_of(node)] += 1
        for t, count in types_seen.items():
            if count > 1 and t in ("BlogPosting", "Article", "WebPage", "FAQPage"):
                flag("MÉDIA", name, f"{count}x nós do tipo {t} no mesmo JSON-LD — confira se não é duplicação.")

    # ---- 1. duplicidade exata entre páginas -----------------------
    lines.append("\n## 1. Duplicidade entre páginas\n")

    def group_by(key_func, label):
        buckets = defaultdict(list)
        for p in pages:
            v = key_func(p)
            if v:
                buckets[v].append(p["path"])
        dups = {k: v for k, v in buckets.items() if len(v) > 1}
        if dups:
            lines.append(f"**{label} idêntico(a) em mais de uma página:**\n")
            for val, paths in dups.items():
                lines.append(f'- "{val}" → {", ".join(os.path.basename(x) for x in paths)}')
                for pth in paths:
                    flag("ALTA", pth, f'{label} duplicado(a) com outra(s) página(s): "{val}"')
            lines.append("")
        else:
            lines.append(f"Nenhum(a) {label.lower()} duplicado(a). ✅\n")

    group_by(lambda p: p["title"], "Title")
    group_by(lambda p: p["desc"], "Meta description")
    group_by(lambda p: p["canonical"], "Canonical")

    h1_buckets = defaultdict(list)
    for p in pages:
        for h in p["h1s"]:
            h1_buckets[h].append(p["path"])
    dups_h1 = {k: v for k, v in h1_buckets.items() if len(set(v)) > 1}
    if dups_h1:
        lines.append("**H1 idêntico em mais de uma página:**\n")
        for val, paths in dups_h1.items():
            uniq = sorted(set(paths))
            lines.append(f'- "{val}" → {", ".join(os.path.basename(x) for x in uniq)}')
            for pth in uniq:
                flag("ALTA", pth, f'H1 duplicado com outra página: "{val}"')
        lines.append("")

    # ---- 2. canibalização por similaridade -------------------------
    lines.append("\n## 2. Possível canibalização (títulos muito parecidos)\n")
    found_similar = False
    for i in range(len(pages)):
        for j in range(i + 1, len(pages)):
            a, b = pages[i], pages[j]
            ta, tb = a.get("title"), b.get("title")
            if ta and tb:
                sim = similarity(ta, tb)
                if sim >= SIMILARITY_THRESHOLD and ta.lower() != tb.lower():
                    found_similar = True
                    lines.append(
                        f'- **{sim:.0%} parecido** entre `{os.path.basename(a["path"])}` e `{os.path.basename(b["path"])}`:'
                    )
                    lines.append(f'  - "{ta}"')
                    lines.append(f'  - "{tb}"')
                    flag(
                        "MÉDIA",
                        a["path"],
                        f'Title {sim:.0%} parecido com {os.path.basename(b["path"])} — possível canibalização de palavra-chave.',
                    )
    if not found_similar:
        lines.append("Nenhuma similaridade de título acima do limiar encontrada. ✅\n")

    # ---- 3. JSON-LD @id entre páginas -----------------------------
    lines.append("\n## 3. JSON-LD: @id compartilhado entre páginas\n")
    id_map = defaultdict(list)
    for p in pages:
        for node in p["jsonld_nodes"]:
            nid = node.get("@id")
            if nid:
                id_map[nid].append(p["path"])
    cross = {k: v for k, v in id_map.items() if len(set(v)) > 1}
    if cross:
        for nid, paths in cross.items():
            uniq = sorted(set(paths))
            if nid.rstrip("/").endswith(GLOBAL_ID_SUFFIXES):
                lines.append(f'- `{nid}` compartilhado (esperado — entidade global) → {", ".join(os.path.basename(x) for x in uniq)}')
            else:
                lines.append(f'- ⚠️ `{nid}` aparece em mais de uma página e NÃO parece ser entidade global → {", ".join(os.path.basename(x) for x in uniq)}')
                for pth in uniq:
                    flag("MÉDIA", pth, f'@id "{nid}" também aparece em outra página — confira se não foi copiado sem atualizar.')
    else:
        lines.append("Nenhum @id não-global repetido entre páginas. ✅")

    # ---- 4. canonical vs JSON-LD url -------------------------------
    lines.append("\n## 4. Canonical vs. JSON-LD (campo \"url\")\n")
    any_mismatch = False
    for p in pages:
        canon = p["canonical"]
        if not canon:
            continue
        for node in p["jsonld_nodes"]:
            u = node.get("url")
            if u and isinstance(u, str) and u.rstrip("/") != canon.rstrip("/"):
                any_mismatch = True
                lines.append(f'- `{os.path.basename(p["path"])}`: nó {jsonld_type_of(node)} tem url=`{u}`, mas canonical é `{canon}`.')
                flag("MÉDIA", p["path"], f'JSON-LD ({jsonld_type_of(node)}.url={u}) não bate com o canonical ({canon}).')
    if not any_mismatch:
        lines.append("Nenhuma inconsistência entre canonical e JSON-LD. ✅")

    # ---- 5. FAQ repetida entre páginas ------------------------------
    lines.append("\n## 5. Perguntas de FAQ repetidas entre páginas\n")
    faq_q = defaultdict(list)
    for p in pages:
        for node in p["jsonld_nodes"]:
            if jsonld_type_of(node) == "FAQPage":
                for q in node.get("mainEntity", []):
                    name = normalize(q.get("name", ""))
                    if name:
                        faq_q[name.lower()].append(p["path"])
    dup_faq = {k: v for k, v in faq_q.items() if len(set(v)) > 1}
    if dup_faq:
        for q, paths in dup_faq.items():
            uniq = sorted(set(paths))
            lines.append(f'- "{q}" aparece em: {", ".join(os.path.basename(x) for x in uniq)}')
            for pth in uniq:
                flag("BAIXA", pth, f'Pergunta de FAQ repetida em outra página: "{q}" — o Google tende a mostrar o rich snippet de apenas uma.')
    else:
        lines.append("Nenhuma pergunta de FAQ repetida entre páginas. ✅")

    # ---- 6. resumo final ---------------------------------------------
    lines.append("\n## 6. Resumo — todos os alertas\n")
    order = {"ALTA": 0, "MÉDIA": 1, "BAIXA": 2}
    issues_sorted = sorted(issues, key=lambda x: (order.get(x[0], 9), x[1]))
    if not issues_sorted:
        lines.append("Nenhum problema encontrado. ✅")
    else:
        counts = defaultdict(int)
        for sev, _, _ in issues_sorted:
            counts[sev] += 1
        lines.append(f'**{counts.get("ALTA",0)} alta(s) · {counts.get("MÉDIA",0)} média(s) · {counts.get("BAIXA",0)} baixa(s)**')
        current = None
        for sev, page, msg in issues_sorted:
            if sev != current:
                lines.append(f"\n### Prioridade {sev}\n")
                current = sev
            lines.append(f"- `{os.path.basename(page)}`: {msg}")

    report = "\n".join(lines)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(report)
    return report


def main():
    ap = argparse.ArgumentParser(
        description="Audita title/meta/canonical/OG/JSON-LD de páginas HTML e aponta duplicidade e canibalização."
    )
    ap.add_argument("paths", nargs="+", help="Arquivo(s) .html e/ou pasta(s) com os HTMLs do site.")
    ap.add_argument("--out", default="seo-health-report.md", help="Arquivo de saída (Markdown). Padrão: seo-health-report.md")
    args = ap.parse_args()

    files = collect_files(args.paths)
    if not files:
        print("Nenhum arquivo .html encontrado nos caminhos informados.")
        sys.exit(1)

    pages = []
    for f in files:
        try:
            pages.append(analyze_file(f))
        except Exception as e:
            print(f"Falha ao processar {f}: {e}")

    report = build_report(pages, args.out)
    print(report)
    print(f"\n\n[Relatório salvo em: {args.out}]")


if __name__ == "__main__":
    main()
