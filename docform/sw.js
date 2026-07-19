/* ════════════════════════════════════════════
   DocForm — Service Worker
   Estratégia híbrida:
     HTML  → Network First  (sempre fresco)
     CSS/JS → Stale While Revalidate (rápido + atualiza em bg)
     Assets → Cache First  (imagens, fontes)
   GitHub Pages compatible (relative paths)
════════════════════════════════════════════ */

const CACHE_VERSION = 'docform-v2';
const CACHE_STATIC  = `${CACHE_VERSION}-static`;
const CACHE_ASSETS  = `${CACHE_VERSION}-assets`;

/* Arquivos pré-cacheados na instalação */
const PRE_CACHE = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  /* CDN críticos cacheados offline */
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
  'https://unpkg.com/docx@8.5.0/build/index.umd.js',
];

/* Extensões tratadas como Assets (Cache First) */
const ASSET_EXTS = /\.(png|jpg|jpeg|svg|ico|webp|gif|woff2?|ttf|eot)(\?.*)?$/i;

/* URLs de fonte Google (Cache First após primeiro fetch) */
const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

/* ── INSTALL: pré-cache dos arquivos essenciais ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(PRE_CACHE))
      .then(() => self.skipWaiting())   // ativa imediatamente sem esperar fechar tabs
  );
});

/* ── ACTIVATE: limpa caches de versões antigas ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('docform-') && k !== CACHE_STATIC && k !== CACHE_ASSETS)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())  // assume controle de todos os tabs abertos
  );
});

/* ════════════════════════════════════════════
   FETCH — Roteamento por tipo de recurso
════════════════════════════════════════════ */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Ignora requisições não-GET e chrome-extension */
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  /* ── 1. HTML / Navegação → Network First ──────────────────────────
     Sempre tenta a rede. Se offline, serve o cache.
     Garante que o usuário sempre veja a versão mais recente.           */
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_STATIC));
    return;
  }

  /* ── 2. Fontes Google → Cache First (longa vida útil) ───────────── */
  if (FONT_ORIGINS.some(o => request.url.startsWith(o))) {
    event.respondWith(cacheFirst(request, CACHE_ASSETS));
    return;
  }

  /* ── 3. Assets (imagens, ícones, fontes locais) → Cache First ───── */
  if (ASSET_EXTS.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_ASSETS));
    return;
  }

  /* ── 4. CSS / JS (incluindo CDN) → Stale While Revalidate ──────── 
     Responde do cache (rápido), atualiza em background.               */
  if (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')  ||
    request.destination === 'script' ||
    request.destination === 'style'  ||
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'unpkg.com'
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
    return;
  }

  /* ── 5. Demais requisições → Network com fallback cache ─────────── */
  event.respondWith(networkFirst(request, CACHE_STATIC));
});

/* ════════════════════════════════════════════
   ESTRATÉGIAS
════════════════════════════════════════════ */

/* Network First: tenta rede; se falhar, usa cache */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreSearch: false });
    if (cached) return cached;
    /* Fallback final: serve index.html para permitir navegação offline */
    return caches.match('./index.html') || caches.match('./');
  }
}

/* Cache First: serve cache; se não tiver, busca na rede e armazena */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    /* Retorna resposta vazia 503 se offline e sem cache */
    return new Response('Recurso indisponível offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

/* Stale While Revalidate: serve cache imediatamente + atualiza em background */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok || response.type === 'opaque') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || fetchPromise;
}

/* ════════════════════════════════════════════
   BACKGROUND SYNC — Retry (futuro)
   Placeholder para sincronização offline → online
════════════════════════════════════════════ */
self.addEventListener('sync', event => {
  if (event.tag === 'docform-sync') {
    // Reservado para sincronização futura de documentos salvos
    event.waitUntil(Promise.resolve());
  }
});
