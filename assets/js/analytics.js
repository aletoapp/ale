/* analytics.js — Google Tag Manager / GA4
   Carregamento adiado até a primeira interação real do usuário
   (scroll, mouse, touch ou teclado) ou 2.5s de fallback.
   Extraído do <script> inline do index.html.
*/

(function () {
  var loaded = false;
  window.dataLayer = window.dataLayer || [];

  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  window.loadGA = loadGA;

  function loadGA(cb) {
    if (loaded) { cb && cb(); return; }
    loaded = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-6N2WJ5YKW9';
    document.head.appendChild(s);

    gtag('js', new Date());
    gtag('config', 'G-6N2WJ5YKW9');

    events.forEach(function (e) { window.removeEventListener(e, loadGA); });
    clearTimeout(fallback);
    cb && cb();
  }

  var events = ['scroll', 'mousemove', 'touchstart', 'keydown'];
  events.forEach(function (e) { window.addEventListener(e, loadGA, { passive: true, once: true }); });

  var fallback = setTimeout(loadGA, 2500);

  window.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.btn-whats').forEach(function (el) {
      el.addEventListener('click', function () {
        loadGA(function () { gtag('event', 'whatsapp_click'); });
      });
    });
  });
}());
