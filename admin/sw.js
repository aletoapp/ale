// ── Service Worker · Chat-Protocolo ──────────────────────────────────────────
// Arquivo: sw.js
// Colocar em: alexandretorres.com.br/admin/sw.js (mesma pasta do admin.html)

self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body:    data.body  || 'Nova mensagem recebida.',
    icon:    data.icon  || '/admin/icone-192.png',
    badge:   data.badge || '/admin/icone-192.png',
    vibrate: [200, 100, 200],
    tag:     data.protocolo || 'nova-mensagem',
    renotify: true,
    data: {
      url: data.url || 'https://alexandretorres.com.br/admin/admin.html'
    },
    actions: [
      { action: 'abrir', title: 'Abrir atendimento' },
      { action: 'fechar', title: 'Dispensar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Nova mensagem', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'fechar') return;

  const urlAlvo = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
      // Se já tem a aba aberta, foca nela
      for (const client of lista) {
        if (client.url.includes('alexandretorres.com.br/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão abre nova aba
      if (clients.openWindow) {
        return clients.openWindow(urlAlvo);
      }
    })
  );
});

// Ativa imediatamente sem esperar reload
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));
