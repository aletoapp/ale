#!/usr/bin/env node
/**
 * generate-sitemap.js
 * ────────────────────
 * Varre o repositório em busca de páginas .html publicáveis e gera o
 * sitemap.xml. Reescrito do zero porque o arquivo original se perdeu
 * (o conteúdo dele virou o próprio XML gerado — provavelmente algum
 * comando antigo redirecionava a saída pra cima do script, tipo
 * `node generate-sitemap.js > generate-sitemap.js` em vez de
 * `> sitemap.xml`). Pra nunca mais acontecer, este script escreve o
 * arquivo de saída ele mesmo, com fs.writeFileSync — não depende de
 * redirecionamento (`>`) de shell nenhum.
 *
 * Uso:
 *   node generate-sitemap.js
 *   node generate-sitemap.js --base https://alexandretorres.com.br --out sitemap.xml
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const opt = { base: 'https://alexandretorres.com.br', out: 'sitemap.xml', root: '.' };
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--base') opt.base = args[++i];
  else if (args[i] === '--out') opt.out = args[++i];
  else if (args[i] === '--root') opt.root = args[++i];
}
opt.base = opt.base.replace(/\/$/, '');

// Pastas/arquivos que existem no repo mas NÃO são páginas de conteúdo público —
// não entram no sitemap.
const EXCLUDE_DIRS = new Set(['admin', 'node_modules', '.github', 'scripts', 'assets']);
const EXCLUDE_FILES = new Set(['painel-seo.html']); // painel interno de SEO, tem noindex

// changefreq/priority por seção — ajuste aqui se quiser outros pesos.
const RULES = [
  { test: (url) => url === '/', changefreq: 'weekly', priority: '1.0' },
  { test: (url) => url === '/blog/', changefreq: 'weekly', priority: '0.9' },
  { test: (url) => url === '/at-lab/', changefreq: 'monthly', priority: '0.9' },
  { test: (url) => url.startsWith('/blog/') && url !== '/blog/', changefreq: 'monthly', priority: '0.7' },
  { test: () => true, changefreq: 'monthly', priority: '0.8' }, // default
];

function collectHtmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectHtmlFiles(full));
    } else if (entry.name.endsWith('.html') && !EXCLUDE_FILES.has(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function fileToUrlPath(file) {
  // "index.html" na raiz -> "/"
  // "blog/index.html"    -> "/blog/"
  // "privacidade.html"   -> "/privacidade.html" (arquivo solto, sem pasta própria)
  const rel = path.relative(opt.root, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function lastModFor(file) {
  // Usa a data do último commit git que tocou o arquivo — é mais fiel ao "última
  // modificação de verdade" do que o mtime do arquivo (que no CI é sempre a hora do checkout).
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${file}"`, { encoding: 'utf8' }).trim();
    if (iso) return iso;
  } catch {
    /* sem git disponível, ou arquivo novo/não commitado ainda — cai no fallback */
  }
  return new Date().toISOString();
}

function buildSitemap(urls) {
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${opt.base}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function main() {
  const files = collectHtmlFiles(opt.root);
  const urls = files
    .map((f) => {
      const loc = fileToUrlPath(f);
      const rule = RULES.find((r) => r.test(loc));
      return { loc, lastmod: lastModFor(f), changefreq: rule.changefreq, priority: rule.priority };
    })
    // home primeiro, depois ordem alfabética — só por organização
    .sort((a, b) => (a.loc === '/' ? -1 : b.loc === '/' ? 1 : a.loc.localeCompare(b.loc)));

  const xml = buildSitemap(urls);
  fs.writeFileSync(path.join(opt.root, opt.out), xml, 'utf8');
  console.log(`✅ ${opt.out} gerado com ${urls.length} URL(s).`);
  urls.forEach((u) => console.log(`  ${u.loc}`));
}

main();
