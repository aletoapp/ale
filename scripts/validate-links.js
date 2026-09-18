#!/usr/bin/env node
/**
 * validate-links.js
 * ──────────────────
 * Varre um arquivo .html ou uma pasta inteira, extrai todo href/src/srcset,
 * resolve cada um pra URL absoluta (usando o <link rel="canonical"> de cada
 * página como base, então funciona pra qualquer artigo — não só um) e
 * confere se responde com sucesso. Gera relatório no console e em JSON.
 *
 * Uso:
 *   node validate-links.js "site/"                          (pasta inteira)
 *   node validate-links.js "posicionamento.html"             (1 arquivo)
 *   node validate-links.js site/ https://alexandretorres.com.br
 *   node validate-links.js site/ --out link-check-report.json --concurrency 10
 *
 * Sai com código 1 se houver qualquer link quebrado (bom pra travar o CI).
 */

const fs = require('fs');
const path = require('path');

// ── Parse de argumentos ──────────────────────────────────────────
const rawArgs = process.argv.slice(2);
const positional = [];
const opts = { out: 'link-check-report.json', concurrency: 8, timeout: 8000 };

for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i];
  if (a === '--out') opts.out = rawArgs[++i];
  else if (a === '--concurrency') opts.concurrency = parseInt(rawArgs[++i], 10);
  else if (a === '--timeout') opts.timeout = parseInt(rawArgs[++i], 10);
  else positional.push(a);
}

const inputPath = positional[0];
const baseUrl = (positional[1] || 'https://alexandretorres.com.br').replace(/\/$/, '');

if (!inputPath || !fs.existsSync(inputPath)) {
  console.error(`❌ Caminho não encontrado: ${inputPath || '(nenhum informado)'}`);
  console.error('Uso: node validate-links.js <arquivo.html|pasta> [baseUrl] [--out relatorio.json]');
  process.exit(1);
}

// ── Descobre quais arquivos .html processar ─────────────────────
// Pastas internas que não são conteúdo público — não fazem parte da checagem de links.
const EXCLUDE_DIR_NAMES = new Set(['admin']);

function collectHtmlFiles(p) {
  const stat = fs.statSync(p);
  if (stat.isFile()) return p.endsWith('.html') ? [p] : [];
  const out = [];
  for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
    if (EXCLUDE_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(p, entry.name);
    if (entry.isDirectory()) out.push(...collectHtmlFiles(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = collectHtmlFiles(inputPath);
if (files.length === 0) {
  console.error('❌ Nenhum arquivo .html encontrado.');
  process.exit(1);
}

// ── Extração de links de um arquivo ──────────────────────────────
// Aceita aspas simples ou duplas, href/src, e ainda quebra srcset em URLs individuais.
const ATTR_REGEX = /\b(?:href|src|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const CANONICAL_REGEX = /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i;

function shouldSkip(url) {
  return (
    !url ||
    url.startsWith('#') ||
    url.startsWith('javascript:') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:') ||
    url.startsWith('data:')
  );
}

function extractLinks(htmlContent) {
  const urls = new Set();
  let match;
  while ((match = ATTR_REGEX.exec(htmlContent)) !== null) {
    const raw = match[1] !== undefined ? match[1] : match[2];
    // Verifica o valor INTEIRO antes de tentar separar por vírgula — um data: URI em
    // base64 quase sempre tem vírgula dentro (ex: "data:image/png;base64,AAAA"), e se
    // checarmos isso depois do split ele é interpretado por engano como srcset.
    if (!raw || shouldSkip(raw)) continue;
    // srcset pode ter várias URLs separadas por vírgula, cada uma seguida de um descritor ("1x", "480w")
    const candidates = raw.includes(',') ? raw.split(',').map((s) => s.trim().split(/\s+/)[0]) : [raw];
    for (const c of candidates) {
      if (!shouldSkip(c)) urls.add(c);
    }
  }
  return urls;
}

function resolveBase(htmlContent, filePath) {
  const m = htmlContent.match(CANONICAL_REGEX);
  if (m) {
    try {
      return new URL(m[1]);
    } catch {
      /* canonical malformado — cai no fallback abaixo */
    }
  }
  // Sem canonical: assume que o link é relativo à raiz do site.
  return new URL(baseUrl + '/');
}

// ── Checagem de uma URL, com cache global (evita checar a mesma URL 2x) ──
const cache = new Map();

async function checkUrlOnce(fullUrl) {
  const controller1 = new AbortController();
  const t1 = setTimeout(() => controller1.abort(), opts.timeout);
  try {
    let res = await fetch(fullUrl, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'AT-LinkValidator/2.0' },
      signal: controller1.signal,
    });
    clearTimeout(t1);
    // Alguns servidores não implementam HEAD direito (405/403/501) — tenta GET.
    if ([405, 403, 501].includes(res.status)) {
      const controller2 = new AbortController();
      const t2 = setTimeout(() => controller2.abort(), opts.timeout);
      res = await fetch(fullUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'AT-LinkValidator/2.0' },
        signal: controller2.signal,
      });
      clearTimeout(t2);
    }
    return {
      url: fullUrl,
      status: res.status,
      redirected: res.redirected,
      finalUrl: res.redirected ? res.url : undefined,
      ok: res.status >= 200 && res.status < 400,
    };
  } catch (err) {
    clearTimeout(t1);
    return { url: fullUrl, status: 'ERR', error: err.message, ok: false };
  }
}

async function checkUrl(fullUrl) {
  if (cache.has(fullUrl)) return cache.get(fullUrl);
  // 1 nova tentativa em caso de erro de rede transitório (não em caso de 4xx/5xx real).
  let result = await checkUrlOnce(fullUrl);
  if (!result.ok && result.status === 'ERR') {
    result = await checkUrlOnce(fullUrl);
  }
  cache.set(fullUrl, result);
  return result;
}

// ── Pool de concorrência simples (sem dependência externa) ───────
async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function runner() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));
  return results;
}

// ── Execução principal ────────────────────────────────────────────
async function run() {
  const baseHost = new URL(baseUrl).host;
  const report = { generated_at: new Date().toISOString(), base_url: baseUrl, files: [] };
  let totalChecked = 0;
  let totalFailures = 0;

  for (const file of files) {
    const htmlContent = fs.readFileSync(file, 'utf8');
    const base = resolveBase(htmlContent, file);
    const rawLinks = [...extractLinks(htmlContent)];

    const resolved = rawLinks
      .map((raw) => {
        try {
          return { raw, full: new URL(raw, base).toString() };
        } catch {
          return { raw, full: null, malformed: true };
        }
      })
      .filter((x) => x.full || x.malformed);

    console.log(`\n🔍 ${file} — ${resolved.length} link(s)/asset(s) encontrados`);

    const fileResults = await runWithConcurrency(resolved, opts.concurrency, async (item) => {
      if (item.malformed) {
        return { raw: item.raw, ok: false, status: 'URL_MALFORMADA' };
      }
      const r = await checkUrl(item.full);
      const isInternal = (() => {
        try {
          return new URL(item.full).host === baseHost;
        } catch {
          return false;
        }
      })();
      return { raw: item.raw, ...r, internal: isInternal };
    });

    for (const r of fileResults) {
      totalChecked++;
      const icon = r.ok ? '✅' : '❌';
      const scope = r.internal === false ? '🌐externo' : r.internal === true ? '🏠interno' : '';
      const extra = r.redirected ? ` (redirecionou → ${r.finalUrl})` : r.error ? ` — ${r.error}` : '';
      console.log(`  ${icon} [${r.status}] ${scope} ${r.url || r.raw}${extra}`);
      if (!r.ok) totalFailures++;
    }

    report.files.push({
      file,
      canonical_base: base.toString(),
      links: fileResults,
      failures: fileResults.filter((r) => !r.ok).length,
    });
  }

  fs.writeFileSync(opts.out, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n-----------------------------------------');
  console.log(`Validação finalizada. ${totalChecked} link(s) checado(s), ${totalFailures} falha(s).`);
  console.log(`Relatório salvo em: ${opts.out}`);
  process.exit(totalFailures > 0 ? 1 : 0);
}

run();
