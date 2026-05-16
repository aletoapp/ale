/* ════════════════════════════════════════════════════
   A11Y WIDGET — Painel de Acessibilidade
   Integra-se com o sistema existente:
     - data-font="small|normal|large"  (01-root.css)
     - data-theme="dark|light"         (script.js)
     - data-lang="pt|en"              (script.js)

   Como usar:
   1. <link rel="stylesheet" href="assets/css/10-a11y-widget.css">
   2. <script src="assets/js/a11y-widget.js" defer></script>
   O script injeta o HTML e cria o live-region no <body>.
════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const STORE_KEY = 'aletor-a11y-v1';
  const html      = document.documentElement;
  const body      = document.body;

  /* ── Estado padrão ─────────────────────────────── */
  const defaults = {
    fontStep:  1,        // 0=small 1=normal 2=large
    contrast:  false,
    gray:      false,
    links:     false,
    dyslexia:  false,
    freeze:    false,
    guide:     false,
    cursor:    false,
    spacing:   0,        // 0=padrão 1=médio 2=alto
    lang:      null,     // null=herda do documento
    theme:     null,     // null=herda do documento
  };

  /* ── Persistência ──────────────────────────────── */
  function load() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); }
    catch { return Object.assign({}, defaults); }
  }

  function save(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  }

  let state = load();

  /* ── Helpers ────────────────────────────────────── */
  const FONT_STEPS  = ['small', 'normal', 'large'];
  const FONT_LABELS = ['Pequeno', 'Normal', 'Grande'];
  const SP_LABELS   = ['Padrão', 'Médio', 'Alto'];

  /* ── Aplica todo o estado no DOM ─────────────────── */
  function applyAll() {
    /* Font size */
    html.setAttribute('data-font', FONT_STEPS[state.fontStep]);
    try { localStorage.setItem('aletor-font-size', FONT_STEPS[state.fontStep]); } catch {}

    /* Theme */
    if (state.theme) html.setAttribute('data-theme', state.theme);

    /* Lang */
    if (state.lang) {
      html.setAttribute('lang', state.lang);
      document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = el.getAttribute('data-lang') === state.lang ? '' : 'none';
      });
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang-target') === state.lang);
      });
    }

    /* Body classes */
    body.classList.toggle('a11y-contrast', state.contrast);
    body.classList.toggle('a11y-gray',     state.gray);
    body.classList.toggle('a11y-links',    state.links);
    body.classList.toggle('a11y-dyslexia', state.dyslexia);
    body.classList.toggle('a11y-freeze',   state.freeze);
    body.classList.toggle('a11y-guide-on', state.guide);
    body.classList.toggle('a11y-cursor',   state.cursor);

    /* Spacing */
    body.classList.remove('a11y-sp1','a11y-sp2','a11y-sp3');
    if (state.spacing > 0) body.classList.add('a11y-sp' + state.spacing);
  }

  /* ── HTML do Widget ─────────────────────────────── */
  const ICON_A11Y = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="5" r="1.5"/><path d="M7 9h10M9 21l1.5-6L12 17l1.5-2L15 21"/><path d="M9.5 9.5C10.3 13 11 14.5 12 15c1-.5 1.7-2 2.5-5.5"/>
  </svg>`;

  const ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>`;

  const ICON_RESET = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="12" height="12">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
  </svg>`;

  function buildHTML() {
    const t = FONT_STEPS[state.fontStep];
    const sp = SP_LABELS[state.spacing];

    /* helpers para toggle e stepper */
    function sw(id, checked, label, desc) {
      return `
      <div class="a11y-row">
        <div class="a11y-row-info">
          <span class="a11y-row-name">${label}</span>
          <span class="a11y-row-desc">${desc}</span>
        </div>
        <label class="a11y-sw" aria-label="${label}">
          <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
          <span class="a11y-sw-track"></span>
        </label>
      </div>`;
    }

    return `
    <!-- FAB -->
    <button class="a11y-fab" id="a11yFab" aria-label="Abrir painel de acessibilidade" aria-expanded="false" aria-controls="a11yPanel">
      ${ICON_A11Y}
    </button>

    <!-- Backdrop -->
    <div class="a11y-backdrop" id="a11yBackdrop" aria-hidden="true"></div>

    <!-- Painel -->
    <aside class="a11y-panel" id="a11yPanel" role="dialog" aria-modal="true" aria-label="Painel de acessibilidade" hidden>

      <!-- Header -->
      <div class="a11y-hd">
        <div class="a11y-hd-left">
          <div class="a11y-hd-icon">${ICON_A11Y}</div>
          <div class="a11y-hd-text">
            <span class="a11y-hd-title">Acessibilidade</span>
            <span class="a11y-hd-sub">Ajustes de leitura · WCAG 2.1</span>
          </div>
        </div>
        <button class="a11y-close" id="a11yClose" aria-label="Fechar painel">
          ${ICON_CLOSE}
        </button>
      </div>

      <!-- Body -->
      <div class="a11y-body" id="a11yBody">

        <!-- TIPOGRAFIA -->
        <div class="a11y-sec">
          <span class="a11y-sec-label">Tipografia</span>

          <!-- Font size -->
          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Tamanho do texto</span>
              <span class="a11y-row-desc">Afeta toda a escala em rem</span>
            </div>
            <div class="a11y-stepper" role="group" aria-label="Tamanho do texto">
              <button class="a11y-step-btn" id="a11yFontDec" aria-label="Diminuir texto" ${state.fontStep === 0 ? 'disabled' : ''}>A−</button>
              <span class="a11y-step-val" id="a11yFontVal" aria-live="polite">${FONT_LABELS[state.fontStep]}</span>
              <button class="a11y-step-btn" id="a11yFontInc" aria-label="Aumentar texto" ${state.fontStep === 2 ? 'disabled' : ''}>A+</button>
            </div>
          </div>

          <!-- Espaçamento -->
          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Espaçamento</span>
              <span class="a11y-row-desc">Entre letras e palavras</span>
            </div>
            <div class="a11y-stepper" role="group" aria-label="Espaçamento">
              <button class="a11y-step-btn" id="a11ySpDec" aria-label="Menos espaço" ${state.spacing === 0 ? 'disabled' : ''}>−</button>
              <span class="a11y-step-val" id="a11ySpVal" aria-live="polite">${sp}</span>
              <button class="a11y-step-btn" id="a11ySpInc" aria-label="Mais espaço" ${state.spacing === 2 ? 'disabled' : ''}>+</button>
            </div>
          </div>

          <!-- Dislexia -->
          ${sw('a11yDyslexia', state.dyslexia, 'Fonte para dislexia', 'Arial · espaço extra · ritmo generoso')}
        </div>

        <!-- VISUAL -->
        <div class="a11y-sec">
          <span class="a11y-sec-label">Visual</span>
          ${sw('a11yContrast', state.contrast, 'Alto contraste', 'Aumenta contraste em 45%')}
          ${sw('a11yGray',     state.gray,     'Escala de cinza', 'Remove cores da interface')}
          ${sw('a11yLinks',    state.links,    'Destacar links', 'Sublinha e destaca âncoras')}
        </div>

        <!-- LEITURA -->
        <div class="a11y-sec">
          <span class="a11y-sec-label">Leitura</span>
          ${sw('a11yGuide',  state.guide,  'Guia de leitura', 'Linha dourada segue o cursor')}
          ${sw('a11yCursor', state.cursor, 'Cursor grande',   'Ponteiro ampliado e visível')}
          ${sw('a11yFreeze', state.freeze, 'Pausar animações','Para todos os movimentos')}
        </div>

        <!-- APARÊNCIA -->
        <div class="a11y-sec">
          <span class="a11y-sec-label">Aparência</span>

          <!-- Tema -->
          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Tema</span>
              <span class="a11y-row-desc">Claro ou escuro</span>
            </div>
            <div class="a11y-grp" role="group" aria-label="Tema">
              <button class="a11y-grp-btn ${state.theme === 'dark' || (!state.theme && html.getAttribute('data-theme') === 'dark') ? 'active' : ''}" data-theme-set="dark" aria-pressed="${state.theme === 'dark' || (!state.theme && html.getAttribute('data-theme') === 'dark')}">Escuro</button>
              <button class="a11y-grp-btn ${state.theme === 'light' || (!state.theme && html.getAttribute('data-theme') === 'light') ? 'active' : ''}" data-theme-set="light" aria-pressed="${state.theme === 'light' || (!state.theme && html.getAttribute('data-theme') === 'light')}">Claro</button>
            </div>
          </div>

          <!-- Idioma -->
          <div class="a11y-row">
            <div class="a11y-row-info">
              <span class="a11y-row-name">Idioma</span>
              <span class="a11y-row-desc">Muda conteúdo multilíngue</span>
            </div>
            <div class="a11y-grp" role="group" aria-label="Idioma">
              <button class="a11y-grp-btn ${(state.lang || html.getAttribute('lang') || 'pt').startsWith('pt') ? 'active' : ''}" data-lang-set="pt-BR" aria-pressed="${(state.lang || html.getAttribute('lang') || 'pt').startsWith('pt')}">PT</button>
              <button class="a11y-grp-btn ${(state.lang || html.getAttribute('lang') || 'pt').startsWith('en') ? 'active' : ''}" data-lang-set="en" aria-pressed="${(state.lang || html.getAttribute('lang') || 'pt').startsWith('en')}">EN</button>
            </div>
          </div>
        </div>

      </div><!-- /.a11y-body -->

      <!-- Footer reset -->
      <div class="a11y-ft">
        <button class="a11y-reset" id="a11yReset">
          ${ICON_RESET}
          Restaurar padrões
        </button>
      </div>

    </aside>

    <!-- Guia de leitura (linha) -->
    <div class="a11y-reading-guide" id="a11yGuide" aria-hidden="true"></div>

    <!-- Live region para screen readers -->
    <div id="a11yLive" aria-live="polite" aria-atomic="true" class="sr-only"></div>
    `;
  }

  /* ── Injeção no DOM ─────────────────────────────── */
  function inject() {
    const wrap = document.createElement('div');
    wrap.id = 'a11yRoot';
    wrap.innerHTML = buildHTML();
    document.body.appendChild(wrap);
  }

  /* ── Controles ──────────────────────────────────── */
  function announce(msg) {
    const live = document.getElementById('a11yLive');
    if (live) { live.textContent = ''; requestAnimationFrame(() => { live.textContent = msg; }); }
  }

  function openPanel() {
    const panel = document.getElementById('a11yPanel');
    const backdrop = document.getElementById('a11yBackdrop');
    const fab = document.getElementById('a11yFab');
    if (!panel) return;
    panel.removeAttribute('hidden');
    requestAnimationFrame(() => {
      panel.classList.add('open');
      backdrop.classList.add('open');
      backdrop.removeAttribute('aria-hidden');
    });
    fab.setAttribute('aria-expanded', 'true');
    document.getElementById('a11yClose').focus();
    body.style.overflow = 'hidden';
  }

  function closePanel() {
    const panel = document.getElementById('a11yPanel');
    const backdrop = document.getElementById('a11yBackdrop');
    const fab = document.getElementById('a11yFab');
    if (!panel) return;
    panel.classList.remove('open');
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    fab.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
    panel.addEventListener('transitionend', () => { panel.setAttribute('hidden', ''); }, { once: true });
    fab.focus();
  }

  function updateFontUI() {
    const dec = document.getElementById('a11yFontDec');
    const inc = document.getElementById('a11yFontInc');
    const val = document.getElementById('a11yFontVal');
    if (dec) dec.disabled = state.fontStep === 0;
    if (inc) inc.disabled = state.fontStep === 2;
    if (val) val.textContent = FONT_LABELS[state.fontStep];
    /* Sincroniza com os botões originais do nav (se existirem) */
    html.setAttribute('data-font', FONT_STEPS[state.fontStep]);
    try { localStorage.setItem('aletor-font-size', FONT_STEPS[state.fontStep]); } catch {}
  }

  function updateSpUI() {
    const dec = document.getElementById('a11ySpDec');
    const inc = document.getElementById('a11ySpInc');
    const val = document.getElementById('a11ySpVal');
    if (dec) dec.disabled = state.spacing === 0;
    if (inc) inc.disabled = state.spacing === 2;
    if (val) val.textContent = SP_LABELS[state.spacing];
  }

  function syncThemeUI(theme) {
    document.querySelectorAll('[data-theme-set]').forEach(btn => {
      const active = btn.getAttribute('data-theme-set') === theme;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active);
    });
  }

  function syncLangUI(lang) {
    document.querySelectorAll('[data-lang-set]').forEach(btn => {
      const active = lang && lang.startsWith(btn.getAttribute('data-lang-set').slice(0,2));
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active);
    });
  }

  /* ── Guia de leitura ─────────────────────────────── */
  let guideRAF = null;
  function onMouseMove(e) {
    const guide = document.getElementById('a11yGuide');
    if (!guide) return;
    if (guideRAF) cancelAnimationFrame(guideRAF);
    guideRAF = requestAnimationFrame(() => {
      guide.style.top = (e.clientY + window.scrollY) + 'px';
    });
  }

  function toggleGuide(on) {
    const guide = document.getElementById('a11yGuide');
    if (on) {
      body.addEventListener('mousemove', onMouseMove, { passive: true });
      if (guide) guide.style.display = 'block';
    } else {
      body.removeEventListener('mousemove', onMouseMove);
      if (guide) guide.style.display = 'none';
    }
  }

  /* ── Eventos ─────────────────────────────────────── */
  function bindEvents() {
    const $ = id => document.getElementById(id);

    /* FAB */
    $('a11yFab').addEventListener('click', () => {
      const panel = $('a11yPanel');
      panel && panel.classList.contains('open') ? closePanel() : openPanel();
    });

    /* Close */
    $('a11yClose').addEventListener('click', closePanel);
    $('a11yBackdrop').addEventListener('click', closePanel);

    /* Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && $('a11yPanel')?.classList.contains('open')) closePanel();
    });

    /* Font size */
    $('a11yFontDec').addEventListener('click', () => {
      if (state.fontStep > 0) { state.fontStep--; updateFontUI(); save(state); announce(FONT_LABELS[state.fontStep]); }
    });
    $('a11yFontInc').addEventListener('click', () => {
      if (state.fontStep < 2) { state.fontStep++; updateFontUI(); save(state); announce(FONT_LABELS[state.fontStep]); }
    });

    /* Spacing */
    $('a11ySpDec').addEventListener('click', () => {
      if (state.spacing > 0) {
        state.spacing--;
        body.classList.remove('a11y-sp1','a11y-sp2','a11y-sp3');
        if (state.spacing > 0) body.classList.add('a11y-sp' + state.spacing);
        updateSpUI(); save(state); announce('Espaçamento: ' + SP_LABELS[state.spacing]);
      }
    });
    $('a11ySpInc').addEventListener('click', () => {
      if (state.spacing < 2) {
        state.spacing++;
        body.classList.remove('a11y-sp1','a11y-sp2','a11y-sp3');
        body.classList.add('a11y-sp' + state.spacing);
        updateSpUI(); save(state); announce('Espaçamento: ' + SP_LABELS[state.spacing]);
      }
    });

    /* Toggles */
    const toggleMap = [
      ['a11yContrast', 'contrast', 'Alto contraste'],
      ['a11yGray',     'gray',     'Escala de cinza'],
      ['a11yLinks',    'links',    'Destacar links'],
      ['a11yDyslexia', 'dyslexia', 'Fonte dislexia'],
      ['a11yFreeze',   'freeze',   'Animações pausadas'],
      ['a11yCursor',   'cursor',   'Cursor grande'],
      ['a11yGuide',    'guide',    'Guia de leitura'],
    ];

    toggleMap.forEach(([id, key, label]) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('change', () => {
        state[key] = el.checked;
        if (key === 'guide') toggleGuide(state[key]);
        else body.classList.toggle('a11y-' + key, state[key]);
        save(state); announce(label + (state[key] ? ' ativado' : ' desativado'));
      });
    });

    /* Theme buttons */
    document.querySelectorAll('[data-theme-set]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-theme-set');
        state.theme = t;
        html.setAttribute('data-theme', t);
        syncThemeUI(t);
        /* Sincroniza com o toggle original do nav */
        const ttDot = document.getElementById('ttDot');
        const ttLabel = document.getElementById('ttLabel');
        if (ttDot)   ttDot.textContent   = t === 'dark' ? '🌙' : '☀️';
        if (ttLabel) ttLabel.textContent = t === 'dark' ? 'Versão clara' : 'Versão escura';
        save(state);
        announce('Tema ' + (t === 'dark' ? 'escuro' : 'claro') + ' ativado');
      });
    });

    /* Lang buttons */
    document.querySelectorAll('[data-lang-set]').forEach(btn => {
      btn.addEventListener('click', () => {
        const l = btn.getAttribute('data-lang-set');
        state.lang = l;
        html.setAttribute('lang', l);
        syncLangUI(l);
        /* Sincroniza com os lang-btn do nav */
        document.querySelectorAll('.lang-btn').forEach(lb => {
          const target = lb.getAttribute('data-lang-target') || lb.textContent.trim().toLowerCase();
          lb.classList.toggle('active', target === l.slice(0,2));
        });
        /* Mostra/oculta conteúdo data-lang */
        document.querySelectorAll('[data-lang]').forEach(el => {
          el.style.display = el.getAttribute('data-lang') === l ? '' : 'none';
        });
        save(state);
        announce('Idioma alterado para ' + (l.startsWith('pt') ? 'Português' : 'English'));
      });
    });

    /* Focus trap */
    $('a11yPanel').addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = $('a11yPanel').querySelectorAll(
        'button:not([disabled]), input, [tabindex="0"]'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* Reset */
    $('a11yReset').addEventListener('click', () => {
      /* Remove body classes */
      ['contrast','gray','links','dyslexia','freeze','guide-on','cursor',
       'sp1','sp2','sp3'].forEach(c => body.classList.remove('a11y-' + c));

      toggleGuide(false);

      state = Object.assign({}, defaults);
      save(state);

      /* Restaura font e tema do sistema */
      html.setAttribute('data-font', 'normal');
      try { localStorage.removeItem('aletor-font-size'); } catch {}

      /* Rebuid UI */
      const root = document.getElementById('a11yRoot');
      if (root) { root.remove(); inject(); bindEvents(); applyAll(); }

      announce('Todos os ajustes restaurados');
    });
  }

  /* ── Init ────────────────────────────────────────── */
  function init() {
    inject();
    applyAll();
    bindEvents();
    if (state.guide) toggleGuide(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
