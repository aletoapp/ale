/* ════════════════════════════════════════════════════════
   a11y-widget.js — Painel de acessibilidade AT·Lab
   ────────────────────────────────────────────────────────
   • Botão vive em .nav-right — NÃO é FAB flutuante
   • Apenas 2 idiomas: PT / EN
   • Não duplica tema nem tamanho de fonte (já estão na nav)
   • Sem body.style.overflow — não bloqueia scroll da página
   • Sem backdrop-filter — mudanças visíveis ao vivo
   • tabindex="-1" nos inputs para evitar scroll ao footer
   ════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── HTML do painel ──────────────────────────────────── */

  function buildHTML() {
    const panel = document.createElement('div');
    panel.id = 'a11yPanel';
    panel.className = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');   /* não modal — página continua acessível */
    panel.setAttribute('aria-label', 'Ajustes de acessibilidade');

    panel.innerHTML = `
      <!-- Header -->
      <div class="a11y-hd">
        <div class="a11y-hd-left">
          <div class="a11y-hd-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="1.5"/>
              <path d="M5 8h14M8 8v4l-2 4m6-8v4l2 4m-4-4h4"/>
            </svg>
          </div>
          <div class="a11y-hd-text">
            <span class="a11y-hd-title">Acessibilidade AT·Lab</span>
            <span class="a11y-hd-sub">Ajustes de leitura · WCAG 2.1</span>
          </div>
        </div>
        <button class="a11y-close" id="a11yClose" aria-label="Fechar painel de acessibilidade">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="a11y-body">

        <!-- Visão -->
        <div class="a11y-sec">
          <div class="a11y-sec-label">Visão</div>

          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Alto contraste</span>
              <span class="a11y-row-desc">Aumenta diferença tonal</span>
            </div>
            <label class="a11y-sw" aria-label="Alto contraste">
              <input type="checkbox" id="swContrast" tabindex="-1">
              <span class="a11y-sw-track" role="switch" aria-checked="false" tabindex="0" aria-label="Alto contraste"></span>
            </label>
          </div>

          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Escala de cinza</span>
              <span class="a11y-row-desc">Remove cores da interface</span>
            </div>
            <label class="a11y-sw" aria-label="Escala de cinza">
              <input type="checkbox" id="swGray" tabindex="-1">
              <span class="a11y-sw-track" role="switch" aria-checked="false" tabindex="0" aria-label="Escala de cinza"></span>
            </label>
          </div>

          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Destacar links</span>
              <span class="a11y-row-desc">Sublinha e realça âncoras</span>
            </div>
            <label class="a11y-sw" aria-label="Destacar links">
              <input type="checkbox" id="swLinks" tabindex="-1">
              <span class="a11y-sw-track" role="switch" aria-checked="false" tabindex="0" aria-label="Destacar links"></span>
            </label>
          </div>

          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Guia de leitura</span>
              <span class="a11y-row-desc">Linha que segue o cursor</span>
            </div>
            <label class="a11y-sw" aria-label="Guia de leitura">
              <input type="checkbox" id="swGuide" tabindex="-1">
              <span class="a11y-sw-track" role="switch" aria-checked="false" tabindex="0" aria-label="Guia de leitura"></span>
            </label>
          </div>

          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Cursor ampliado</span>
              <span class="a11y-row-desc">Ponteiro maior e mais visível</span>
            </div>
            <label class="a11y-sw" aria-label="Cursor ampliado">
              <input type="checkbox" id="swCursor" tabindex="-1">
              <span class="a11y-sw-track" role="switch" aria-checked="false" tabindex="0" aria-label="Cursor ampliado"></span>
            </label>
          </div>
        </div>

        <!-- Leitura -->
        <div class="a11y-sec">
          <div class="a11y-sec-label">Leitura</div>

          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Fonte para dislexia</span>
              <span class="a11y-row-desc">Espaçamento e ritmo generosos</span>
            </div>
            <label class="a11y-sw" aria-label="Fonte para dislexia">
              <input type="checkbox" id="swDyslexia" tabindex="-1">
              <span class="a11y-sw-track" role="switch" aria-checked="false" tabindex="0" aria-label="Fonte para dislexia"></span>
            </label>
          </div>

          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Pausar animações</span>
              <span class="a11y-row-desc">Congela todas as transições</span>
            </div>
            <label class="a11y-sw" aria-label="Pausar animações">
              <input type="checkbox" id="swFreeze" tabindex="-1">
              <span class="a11y-sw-track" role="switch" aria-checked="false" tabindex="0" aria-label="Pausar animações"></span>
            </label>
          </div>

          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Espaçamento</span>
              <span class="a11y-row-desc">Kerning e word-spacing</span>
            </div>
            <div class="a11y-stepper" role="group" aria-label="Espaçamento de texto">
              <button class="a11y-step-btn" id="spDec" aria-label="Reduzir espaçamento">−</button>
              <span  class="a11y-step-val"  id="spVal" aria-live="polite">Normal</span>
              <button class="a11y-step-btn" id="spInc" aria-label="Aumentar espaçamento">+</button>
            </div>
          </div>
        </div>

        <!-- Idioma — apenas PT e EN -->
        <div class="a11y-sec">
          <div class="a11y-sec-label">Idioma</div>
          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Idioma do site</span>
              <span class="a11y-row-desc">Altera todo o conteúdo</span>
            </div>
            <div class="a11y-grp" role="group" aria-label="Selecionar idioma">
              <button class="a11y-grp-btn active" id="langPT" aria-pressed="true"  lang="pt">PT</button>
              <button class="a11y-grp-btn"        id="langEN" aria-pressed="false" lang="en">EN</button>
            </div>
          </div>
        </div>

      </div><!-- /a11y-body -->

      <!-- Footer -->
      <div class="a11y-ft">
        <button class="a11y-reset" id="a11yReset">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M1 6a5 5 0 1 0 1.5-3.5L1 1v3h3"/>
          </svg>
          Restaurar padrões
        </button>
      </div>

      <!-- Guia de leitura (elemento separado, fora do painel) -->
    `;

    return panel;
  }


  /* ── Guia de leitura ─────────────────────────────── */

  function buildReadingGuide() {
    const guide = document.createElement('div');
    guide.className = 'a11y-reading-guide';
    guide.id = 'a11yReadingGuide';
    guide.setAttribute('aria-hidden', 'true');
    document.body.appendChild(guide);

    document.addEventListener('mousemove', function (e) {
      if (document.body.classList.contains('a11y-guide-on')) {
        guide.style.top = e.clientY + 'px';
      }
    }, { passive: true });
  }


  /* ── Botão na nav (.nav-right) ───────────────────── */

  function buildNavBtn() {
    const btn = document.createElement('button');
    btn.id = 'a11yNavBtn';
    btn.className = 'a11y-nav-btn';
    btn.setAttribute('aria-controls', 'a11yPanel');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir painel de acessibilidade');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="5" r="1.5"/>
        <path d="M5 8h14M8 8v4l-2 4m6-8v4l2 4m-4-4h4"/>
      </svg>
      <span class="a11y-nav-label">Acessibilidade</span>
    `;
    return btn;
  }


  /* ── Lógica principal ────────────────────────────── */

  function init() {
    /* 1 — Insere o painel no body */
    const panel = buildHTML();
    document.body.appendChild(panel);

    /* 2 — Guia de leitura */
    buildReadingGuide();

    /* 3 — Botão na nav */
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
      const navBtn = buildNavBtn();
      /* Insere antes do theme-toggle (último filho típico) */
      navRight.insertBefore(navBtn, navRight.firstChild);
      wireToggle(navBtn, panel);
    }

    /* 4 — Fecha */
    document.getElementById('a11yClose').addEventListener('click', () => closePanel(panel));

    /* 5 — Fecha ao pressionar Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) closePanel(panel);
    });

    /* 6 — Features */
    wireFeatures(panel);

    /* 7 — Reset */
    document.getElementById('a11yReset').addEventListener('click', () => resetAll(panel));

    /* 8 — Recupera estado salvo */
    restoreState(panel);

    /* 9 — Live region para leitores de tela (font-control já usa fontLiveRegion) */
    let liveA11y = document.getElementById('a11yLiveRegion');
    if (!liveA11y) {
      liveA11y = document.createElement('div');
      liveA11y.id = 'a11yLiveRegion';
      liveA11y.setAttribute('aria-live', 'polite');
      liveA11y.setAttribute('aria-atomic', 'true');
      liveA11y.className = 'sr-only';
      document.body.appendChild(liveA11y);
    }
  }


  /* ── Abrir / fechar ──────────────────────────────── */

  function wireToggle(btn, panel) {
    btn.addEventListener('click', function () {
      const isOpen = panel.classList.contains('open');
      if (isOpen) {
        closePanel(panel);
      } else {
        openPanel(panel);
      }
    });
  }

  function openPanel(panel) {
    panel.classList.add('open');
    /* NÃO trava o scroll — usuário precisa ver as mudanças ao vivo */
    const btn = document.getElementById('a11yNavBtn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    /* Foco no botão fechar */
    setTimeout(() => {
      const closeBtn = document.getElementById('a11yClose');
      if (closeBtn) closeBtn.focus();
    }, 420);
  }

  function closePanel(panel) {
    panel.classList.remove('open');
    const btn = document.getElementById('a11yNavBtn');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  }


  /* ── Features ────────────────────────────────────── */

  function wireFeatures(panel) {
    /* Helpers */
    function sw(id, bodyClass, storageKey) {
      const input = document.getElementById(id);
      if (!input) return;
      /* O track (role=switch) é o elemento focável */
      const track = input.nextElementSibling;

      function apply(checked) {
        input.checked = checked;
        track.setAttribute('aria-checked', String(checked));
        document.body.classList.toggle(bodyClass, checked);
        save(storageKey, checked);
      }

      /* Clique no track (label delega para aqui via pointer) */
      track.addEventListener('click', () => apply(!input.checked));

      /* Teclado no track */
      track.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          apply(!input.checked);
        }
      });

      return apply;
    }

    sw('swContrast',  'a11y-contrast',  'a11y-contrast');
    sw('swGray',      'a11y-gray',      'a11y-gray');
    sw('swLinks',     'a11y-links',     'a11y-links');
    sw('swDyslexia',  'a11y-dyslexia',  'a11y-dyslexia');
    sw('swFreeze',    'a11y-freeze',    'a11y-freeze');
    sw('swCursor',    'a11y-cursor',    'a11y-cursor');

    /* Guia de leitura */
    sw('swGuide', 'a11y-guide-on', 'a11y-guide');

    /* Espaçamento — stepper */
    const SP_STEPS = ['Normal', 'Médio', 'Amplo'];
    const SP_CLASSES = ['', 'a11y-sp2', 'a11y-sp3'];
    let spIdx = 0;

    const spVal = document.getElementById('spVal');
    const spDec = document.getElementById('spDec');
    const spInc = document.getElementById('spInc');

    function applySpacing(idx) {
      SP_CLASSES.forEach(c => { if (c) document.body.classList.remove(c); });
      if (SP_CLASSES[idx]) document.body.classList.add(SP_CLASSES[idx]);
      spVal.textContent = SP_STEPS[idx];
      spDec.disabled = idx === 0;
      spInc.disabled = idx === SP_STEPS.length - 1;
      save('a11y-spacing', idx);
    }

    spDec.addEventListener('click', () => { if (spIdx > 0) applySpacing(--spIdx); });
    spInc.addEventListener('click', () => { if (spIdx < SP_STEPS.length - 1) applySpacing(++spIdx); });
    applySpacing(spIdx);

    /* Idioma — apenas PT / EN */
    const langPT = document.getElementById('langPT');
    const langEN = document.getElementById('langEN');

    function setLang(lang) {
      document.documentElement.setAttribute('lang', lang);
      /* Sincroniza com o lang-switcher da nav, se existir */
      document.querySelectorAll('.lang-btn').forEach(function (btn) {
        const active = btn.dataset.lang === lang || btn.textContent.trim().toLowerCase() === lang.toLowerCase();
        btn.classList.toggle('active', active);
      });
      langPT.classList.toggle('active', lang === 'pt');
      langEN.classList.toggle('active', lang === 'en');
      langPT.setAttribute('aria-pressed', String(lang === 'pt'));
      langEN.setAttribute('aria-pressed', String(lang === 'en'));
      save('a11y-lang', lang);
    }

    langPT.addEventListener('click', () => setLang('pt'));
    langEN.addEventListener('click', () => setLang('en'));
  }


  /* ── Persistência ────────────────────────────────── */

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function load(key) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : null;
    } catch (_) { return null; }
  }

  function restoreState(panel) {
    const toggleMap = {
      'a11y-contrast':  'swContrast',
      'a11y-gray':      'swGray',
      'a11y-links':     'swLinks',
      'a11y-dyslexia':  'swDyslexia',
      'a11y-freeze':    'swFreeze',
      'a11y-cursor':    'swCursor',
      'a11y-guide':     'swGuide',
    };
    const classMap = {
      'a11y-contrast':  'a11y-contrast',
      'a11y-gray':      'a11y-gray',
      'a11y-links':     'a11y-links',
      'a11y-dyslexia':  'a11y-dyslexia',
      'a11y-freeze':    'a11y-freeze',
      'a11y-cursor':    'a11y-cursor',
      'a11y-guide':     'a11y-guide-on',
    };

    Object.keys(toggleMap).forEach(function (key) {
      const val = load(key);
      if (val === true) {
        const input = document.getElementById(toggleMap[key]);
        if (input) {
          input.checked = true;
          const track = input.nextElementSibling;
          if (track) track.setAttribute('aria-checked', 'true');
          document.body.classList.add(classMap[key]);
        }
      }
    });

    /* Espaçamento */
    const SP_STEPS   = ['Normal', 'Médio', 'Amplo'];
    const SP_CLASSES  = ['', 'a11y-sp2', 'a11y-sp3'];
    const savedSp = load('a11y-spacing');
    if (typeof savedSp === 'number' && savedSp > 0 && savedSp < SP_STEPS.length) {
      SP_CLASSES.forEach(c => { if (c) document.body.classList.remove(c); });
      if (SP_CLASSES[savedSp]) document.body.classList.add(SP_CLASSES[savedSp]);
      const spVal = document.getElementById('spVal');
      const spDec = document.getElementById('spDec');
      const spInc = document.getElementById('spInc');
      if (spVal) spVal.textContent = SP_STEPS[savedSp];
      if (spDec) spDec.disabled = savedSp === 0;
      if (spInc) spInc.disabled = savedSp === SP_STEPS.length - 1;
    }

    /* Idioma */
    const savedLang = load('a11y-lang');
    if (savedLang === 'en') {
      document.documentElement.setAttribute('lang', 'en');
      const langPT = document.getElementById('langPT');
      const langEN = document.getElementById('langEN');
      if (langPT) { langPT.classList.remove('active'); langPT.setAttribute('aria-pressed', 'false'); }
      if (langEN) { langEN.classList.add('active');    langEN.setAttribute('aria-pressed', 'true');  }
    }
  }

  function resetAll(panel) {
    /* Remove classes do body */
    ['a11y-contrast','a11y-gray','a11y-links','a11y-dyslexia',
     'a11y-freeze','a11y-cursor','a11y-guide-on',
     'a11y-sp1','a11y-sp2','a11y-sp3'].forEach(c => document.body.classList.remove(c));

    /* Reseta inputs */
    ['swContrast','swGray','swLinks','swDyslexia','swFreeze','swCursor','swGuide'].forEach(function (id) {
      const input = document.getElementById(id);
      if (!input) return;
      input.checked = false;
      const track = input.nextElementSibling;
      if (track) track.setAttribute('aria-checked', 'false');
    });

    /* Espaçamento */
    const spVal = document.getElementById('spVal');
    const spDec = document.getElementById('spDec');
    const spInc = document.getElementById('spInc');
    if (spVal) spVal.textContent = 'Normal';
    if (spDec) spDec.disabled = true;
    if (spInc) spInc.disabled = false;

    /* Idioma → PT */
    document.documentElement.setAttribute('lang', 'pt');
    const langPT = document.getElementById('langPT');
    const langEN = document.getElementById('langEN');
    if (langPT) { langPT.classList.add('active');    langPT.setAttribute('aria-pressed', 'true');  }
    if (langEN) { langEN.classList.remove('active'); langEN.setAttribute('aria-pressed', 'false'); }

    /* Limpa storage */
    ['a11y-contrast','a11y-gray','a11y-links','a11y-dyslexia',
     'a11y-freeze','a11y-cursor','a11y-guide','a11y-spacing','a11y-lang'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (_) {}
    });

    /* Feedback */
    const live = document.getElementById('a11yLiveRegion');
    if (live) live.textContent = 'Configurações de acessibilidade restauradas.';
  }


  /* ── Inicia após DOM pronto ──────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
