/**
 * generate-sitemap.js (VERSÃO APRIMORADA)
 *
 * Gera o sitemap.xml automaticamente com:
 *  - URLs de todos os index.html encontrados no repositório
 *  - <lastmod> baseado na data do último commit Git de cada arquivo (boas práticas Google)
 *  - Formato ISO 8601 com timezone: 2026-03-31T19:31:56+00:00
 *  - <priority> automático (1.0 para raiz, 0.8 para subpáginas)
 *  - <changefreq> automático baseado na frequência de commits
 *  - APRIMORADO: Exclui pastas de assets (/img, /images, /assets, etc)
 *
 * Como usar localmente:
 *   node generate-sitemap.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURAÇÃO — edite apenas esta seção
// ============================================================

const BASE_URL = 'https://alexandretorres.com.br'; // ← SEM barra no final

// Pastas e arquivos a ignorar na varredura
const IGNORE = [
  'node_modules',
  '.git',
  '.github',
  'vendor',
  'dist',
  'build',
  'coverage',
];

// Pastas de assets que NÃO devem ter suas URLs no sitemap
// Mesmo que tenham index.html, elas serão ignoradas
const ASSET_FOLDERS = [
  'img',
  'images',
  'assets',
  'media',
  'css',
  'js',
  'fonts',
  'icons',
  'videos',
  'downloads',
  'uploads',
  'static',
];

// ============================================================

/**
 * Verifica se um caminho contém uma pasta de assets
 * Exemplo: '/projeto/img/index.html' → true
 */
function containsAssetFolder(filePath) {
  const parts = filePath.toLowerCase().split(path.sep);
  return ASSET_FOLDERS.some((folder) => parts.includes(folder));
}

/**
 * Retorna a data do último commit Git de um arquivo
 * no formato ISO 8601 com offset UTC: 2026-03-31T19:31:56+00:00
 */
function getGitLastmod(filePath) {
  try {
    const timestamp = execSync(
      `git log -1 --format="%cI" -- "${filePath}"`,
      { encoding: 'utf8' }
    ).trim();

    if (!timestamp) {
      return toIsoWithOffset(new Date());
    }

    return toIsoWithOffset(new Date(timestamp));
  } catch {
    return toIsoWithOffset(new Date());
  }
}

/**
 * Retorna quantos commits um arquivo teve nos últimos 30 dias
 * para determinar o changefreq
 */
function getChangeFreq(filePath) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceStr = since.toISOString().split('T')[0];

    const count = execSync(
      `git log --since="${sinceStr}" --format="%h" -- "${filePath}" | wc -l`,
      { encoding: 'utf8' }
    ).trim();

    const n = parseInt(count, 10);
    if (n >= 8) return 'daily';
    if (n >= 4) return 'weekly';
    if (n >= 1) return 'monthly';
    return 'yearly';
  } catch {
    return 'monthly';
  }
}

/**
 * Converte Date para ISO 8601 com +00:00 em vez de Z
 * Padrão preferido pelo Google Search Console
 */
function toIsoWithOffset(date) {
  return date.toISOString().replace('Z', '+00:00');
}

/**
 * Varre recursivamente o diretório em busca de arquivos index.html
 * Pula pastas de assets automaticamente
 */
function findIndexFiles(dir, found = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const entry of entries) {
    if (IGNORE.includes(entry.name)) continue;
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Pula pastas de assets
      if (!ASSET_FOLDERS.includes(entry.name.toLowerCase())) {
        findIndexFiles(fullPath, found);
      }
    } else if (entry.name === 'index.html') {
      found.push(fullPath);
    }
  }

  return found;
}

/**
 * Converte caminho de arquivo em URL pública (URLs limpas, sem index.html)
 * ./index.html          → https://site.com/
 * ./projeto1/index.html → https://site.com/projeto1/
 */
function fileToUrl(filePath) {
  let relative = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
  relative = relative.replace(/index\.html$/, '');
  const url = BASE_URL + '/' + relative;
  return url.replace(/([^:])\/\/+/g, '$1/');
}

/**
 * Define a prioridade SEO da URL:
 * Raiz (/) = 1.0, subpáginas = 0.8
 */
function getPriority(url) {
  return url === BASE_URL + '/' ? '1.0' : '0.8';
}

// ============================================================
// EXECUÇÃO
// ============================================================

console.log('🗺️  Gerando sitemap.xml (versão aprimorada)...\n');

const root = process.cwd();
const indexFiles = findIndexFiles(root);

if (indexFiles.length === 0) {
  console.warn('⚠️  Nenhum index.html encontrado. Verifique o diretório.');
  process.exit(0);
}

// Ordena: raiz primeiro, depois alfabético
indexFiles.sort((a, b) => {
  const aRel = path.relative(root, a);
  const bRel = path.relative(root, b);
  if (aRel === 'index.html') return -1;
  if (bRel === 'index.html') return 1;
  return aRel.localeCompare(bRel);
});

const urlEntries = indexFiles.map((filePath) => {
  const rel = path.relative(root, filePath);
  const url = fileToUrl(rel);
  const lastmod = getGitLastmod(rel);
  const changefreq = getChangeFreq(rel);
  const priority = getPriority(url);

  console.log(`✓ ${url}`);
  console.log(`  lastmod:    ${lastmod}`);
  console.log(`  changefreq: ${changefreq}`);
  console.log(`  priority:   ${priority}\n`);

  return [
    '  <url>',
    `    <loc>${url}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
});

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urlEntries.join('\n'),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap, 'utf8');

console.log(`✅ sitemap.xml gerado com ${indexFiles.length} URL(s).`);
console.log(`   (${ASSET_FOLDERS.length} pastas de assets foram excluídas)\n`);
