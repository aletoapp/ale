// ── Service Worker · Cliente · Chat-Protocolo ────────────────────────────────
// Arquivo: sw-cliente.js
// Colocar em: alexandretorres.com.br/atendimento/sw-cliente.js

self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title || 'Resposta recebida!', {
      body:    data.body  || 'Seu atendimento foi respondido. Toque para ver.',
      icon:    data.icon  || '/atendimento/icone-192.png',
      badge:   data.badge || '/atendimento/icone-192.png',
      vibrate: [200, 100, 200],
      tag:     data.protocolo || 'resposta',
      renotify: true,
      data: {
        url: data.url || 'https://alexandretorres.com.br/atendimento/index.html'
      },
      actions: [
        { action: 'abrir', title: 'Ver resposta' },
        { action: 'fechar', title: 'Dispensar' }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'fechar') return;

  const urlAlvo = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
      for (const client of lista) {
        if (client.url.includes('alexandretorres.com.br/atendimento') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(urlAlvo);
    })
  );
});

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));
