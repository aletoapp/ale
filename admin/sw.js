// ── Service Worker · Chat-Protocolo · Admin ──────────────────────────────────
// Arquivo: sw.js
// Colocar em: alexandretorres.com.br/admin/sw.js (mesma pasta do admin.html)

const CACHE_VERSION = 'protocolo-admin-v2';
const SHELL = [
  '/admin/admin.html',
  '/admin/manifest.json',
  '/admin/img/icon-192.svg',
  '/admin/img/icon-512.svg',
];

// ── Instala e faz cache do shell (fica instalável e sobrevive a quedas de rede) ─
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(SHELL).catch(() => {}))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(nomes => Promise.all(
        nomes.filter(n => n !== CACHE_VERSION).map(n => caches.delete(n))
      )),
      clients.claim()
    ])
  );
});

// Cache-first apenas para o shell estático; tudo que é API vai direto pra rede
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return; // nunca cacheia dados do painel

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => cached))
  );
});

// ── Contador de badge (não lido) — persiste entre notificações ───────────────
let naoLidas = 0;

async function atualizarBadge(delta, zerar = false) {
  if (!('setAppBadge' in self.navigator)) return;
  naoLidas = zerar ? 0 : Math.max(0, naoLidas + delta);
  try {
    if (naoLidas > 0) await self.navigator.setAppBadge(naoLidas);
    else await self.navigator.clearAppBadge();
  } catch {}
}

// ── Push: notificação bem visível, que só fecha manualmente ──────────────────
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body:     data.body  || 'Nova mensagem recebida.',
    icon:     data.icon  || '/admin/img/icon-512.png',
    badge:    data.badge || '/admin/img/icon-192.png',
    image:    data.image || undefined,
    vibrate:  [250, 120, 250, 120, 250],
    tag:      data.protocolo || 'nova-mensagem',
    renotify: true,
    requireInteraction: true,   // ← não some sozinha: só fecha se o admin clicar
    silent:   false,
    data: {
      url:       data.url || 'https://alexandretorres.com.br/admin/admin.html',
      protocolo: data.protocolo || ''
    },
    actions: [
      { action: 'abrir',  title: 'Abrir atendimento' },
      { action: 'fechar', title: 'Dispensar' }
    ]
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || '🔔 Nova mensagem — Protocolo', options),
      atualizarBadge(1),
      // Avisa qualquer aba/janela do painel já aberta, para acender o popup lateral na hora
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
        lista.forEach(client => client.postMessage({
          tipo: 'nova-mensagem-push',
          protocolo: data.protocolo || '',
          preview: data.body || ''
        }));
      })
    ])
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'fechar') {
    event.waitUntil(atualizarBadge(0, true));
    return;
  }

  const urlAlvo = event.notification.data.url;

  event.waitUntil(
    Promise.all([
      atualizarBadge(0, true),
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
        for (const client of lista) {
          if (client.url.includes('alexandretorres.com.br/admin') && 'focus' in client) {
            client.postMessage({ tipo: 'abrir-protocolo', protocolo: event.notification.data.protocolo });
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(urlAlvo);
      })
    ])
  );
});

// Fecha sem clicar (usuário arrastou/limpou pela central de notificações do SO)
self.addEventListener('notificationclose', () => {
  // mantém o badge — só zera quando o admin de fato abre o painel
});

// Permite que a página zere o badge manualmente (ex: ao focar a aba)
self.addEventListener('message', event => {
  if (event.data === 'zerar-badge') atualizarBadge(0, true);
});
