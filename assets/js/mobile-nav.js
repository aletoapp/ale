/* mobile-nav.js — Menu hambúrguer (herdado do index-velho)
   Abre/fecha o menu mobile, controla dropdowns internos
   (Produtos / Contato) e fecha com Escape ou clique no scrim.
   Extraído do <script> inline do index.html.
*/

(function () {
  var toggle = document.getElementById('hamburger-toggle');
  var nav    = document.getElementById('mobile-nav');
  var scrim  = document.getElementById('mnav-scrim');
  if (!toggle || !nav || !scrim) return;

  var firstLink = nav.querySelector('.mnav-link,.mnav-toggle');
  var dropdownToggles = Array.prototype.slice.call(nav.querySelectorAll('.mnav-toggle'));

  function closeAllDropdowns() {
    dropdownToggles.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
      var menu = document.getElementById(btn.getAttribute('aria-controls'));
      if (menu) menu.hidden = true;
    });
  }

  function openMenu() {
    nav.hidden = false;
    scrim.hidden = false;

    requestAnimationFrame(function () {
      nav.classList.add('open');
    });

    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    nav.classList.remove('open');

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');

    toggle.focus();
    closeAllDropdowns();

    setTimeout(function () {
      nav.hidden = true;
      scrim.hidden = true;
    }, 300);
  }

  toggle.addEventListener('click', function () {
    toggle.getAttribute('aria-expanded') === 'true'
      ? closeMenu()
      : openMenu();
  });

  scrim.addEventListener('click', closeMenu);

  dropdownToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      dropdownToggles.forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          var otherMenu = document.getElementById(other.getAttribute('aria-controls'));
          if (otherMenu) otherMenu.hidden = true;
        }
      });
      btn.setAttribute('aria-expanded', String(!isOpen));
      var menu = document.getElementById(btn.getAttribute('aria-controls'));
      if (menu) menu.hidden = isOpen;
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
  });
}());
