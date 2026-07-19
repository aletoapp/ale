/* ════════════════════════════════════════════════════════
   a11y-widget.js — Painel de acessibilidade (FAB)
   ────────────────────────────────────────────────────────
   • Botão flutuante fixo, canto inferior direito
   • Cores herdadas do design system (--gold / --bg / --ink)
   • Não modal — página continua utilizável com o painel aberto
   • Sem body.style.overflow — mudanças visíveis ao vivo
   • tabindex="-1" nos inputs; o track (role=switch) é o focável
   ════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── HTML do painel ──────────────────────────────────── */

  function buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'a11yPanel';
    panel.className = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Ajustes de acessibilidade');
    panel.hidden = true;

    panel.innerHTML = `
      <div class="a11y-hd">
        <div class="a11y-hd-left">
          <div class="a11y-hd-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="1.5"/>
              <path d="M5 8h14M8 8v4l-2 4m6-8v4l2 4m-4-4h4"/>
            </svg>
          </div>
          <div class="a11y-hd-text">
            <span class="a11y-hd-title">Acessibilidade</span>
            <span class="a11y-hd-sub">Ajustes de leitura · WCAG 2.1</span>
          </div>
        </div>
        <button class="a11y-close" id="a11yClose" type="button" aria-label="Fechar painel de acessibilidade">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>
      </div>

      <div class="a11y-body">

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
              <button class="a11y-step-btn" id="spDec" type="button" aria-label="Reduzir espaçamento">−</button>
              <span  class="a11y-step-val"  id="spVal" aria-live="polite">Normal</span>
              <button class="a11y-step-btn" id="spInc" type="button" aria-label="Aumentar espaçamento">+</button>
            </div>
          </div>
        </div>

      </div><!-- /a11y-body -->

      <div class="a11y-ft">
        <button class="a11y-reset" id="a11yReset" type="button">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M1 6a5 5 0 1 0 1.5-3.5L1 1v3h3"/>
          </svg>
          Restaurar padrões
        </button>
      </div>
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


  /* ── FAB (botão flutuante + rótulo vertical) ──────── */

  function buildFab() {
    const wrap = document.createElement('div');
    wrap.className = 'a11y-fab-wrap';

    wrap.innerHTML = `
      <span class="a11y-fab-label">Acessibilidade</span>
      <button class="a11y-fab-btn" id="a11yNavBtn" type="button"
        aria-haspopup="dialog" aria-controls="a11yPanel" aria-expanded="false"
        aria-label="Abrir painel de acessibilidade">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="5" r="1.5"/>
          <path d="M5 8h14M8 8v4l-2 4m6-8v4l2 4m-4-4h4"/>
        </svg>
      </button>
    `;

    return wrap;
  }


  /* ── Lógica principal ────────────────────────────── */

  function init() {
    /* 1 — Painel */
    const panel = buildPanel();
    document.body.appendChild(panel);

    /* 2 — Guia de leitura */
    buildReadingGuide();

    /* 3 — FAB */
    const fabWrap = buildFab();
    document.body.appendChild(fabWrap);
    const fabBtn = document.getElementById('a11yNavBtn');
    wireToggle(fabBtn, panel);

    /* 4 — Fecha */
    document.getElementById('a11yClose').addEventListener('click', () => closePanel(panel));

    /* 5 — Escape fecha o painel */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) closePanel(panel);
    });

    /* 6 — Clique fora fecha o painel */
    document.addEventListener('click', function (e) {
      if (!panel.classList.contains('open')) return;
      if (panel.contains(e.target) || fabBtn.contains(e.target)) return;
      closePanel(panel);
    });

    /* 7 — Features */
    wireFeatures(panel);

    /* 8 — Reset */
    document.getElementById('a11yReset').addEventListener('click', () => resetAll(panel));

    /* 9 — Recupera estado salvo */
    restoreState(panel);

    /* 10 — Live region para leitores de tela */
    let live = document.getElementById('a11yLiveRegion');
    if (!live) {
      live = document.createElement('div');
      live.id = 'a11yLiveRegion';
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      live.className = 'sr-only';
      document.body.appendChild(live);
    }
  }


  /* ── Abrir / fechar ──────────────────────────────── */

  function wireToggle(btn, panel) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = panel.classList.contains('open');
      if (isOpen) {
        closePanel(panel);
      } else {
        openPanel(panel);
      }
    });
  }

  function openPanel(panel) {
    panel.hidden = false;
    /* força reflow para a transição de entrada funcionar */
    void panel.offsetHeight;
    panel.classList.add('open');
    const btn = document.getElementById('a11yNavBtn');
    if (btn) { btn.setAttribute('aria-expanded', 'true'); btn.classList.add('is-open'); }
    setTimeout(() => {
      const closeBtn = document.getElementById('a11yClose');
      if (closeBtn) closeBtn.focus();
    }, 300);
  }

  function closePanel(panel) {
    panel.classList.remove('open');
    const btn = document.getElementById('a11yNavBtn');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('is-open');
      btn.focus();
    }
    setTimeout(() => { panel.hidden = true; }, 300);
  }


  /* ── Features ────────────────────────────────────── */

  function wireFeatures(panel) {
    function sw(id, bodyClass, storageKey) {
      const input = document.getElementById(id);
      if (!input) return;
      const track = input.nextElementSibling;

      function apply(checked) {
        input.checked = checked;
        track.setAttribute('aria-checked', String(checked));
        document.body.classList.toggle(bodyClass, checked);
        save(storageKey, checked);
      }

      track.addEventListener('click', () => apply(!input.checked));
      track.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          apply(!input.checked);
        }
      });

      return apply;
    }

    sw('swContrast', 'a11y-contrast', 'a11y-contrast');
    sw('swGray',     'a11y-gray',     'a11y-gray');
    sw('swLinks',    'a11y-links',    'a11y-links');
    sw('swDyslexia', 'a11y-dyslexia', 'a11y-dyslexia');
    sw('swFreeze',   'a11y-freeze',   'a11y-freeze');
    sw('swCursor',   'a11y-cursor',   'a11y-cursor');
    sw('swGuide',    'a11y-guide-on', 'a11y-guide');

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

  function restoreState() {
    const toggleMap = {
      'a11y-contrast': 'swContrast',
      'a11y-gray':     'swGray',
      'a11y-links':    'swLinks',
      'a11y-dyslexia': 'swDyslexia',
      'a11y-freeze':   'swFreeze',
      'a11y-cursor':   'swCursor',
      'a11y-guide':    'swGuide',
    };
    const classMap = {
      'a11y-contrast': 'a11y-contrast',
      'a11y-gray':     'a11y-gray',
      'a11y-links':    'a11y-links',
      'a11y-dyslexia': 'a11y-dyslexia',
      'a11y-freeze':   'a11y-freeze',
      'a11y-cursor':   'a11y-cursor',
      'a11y-guide':    'a11y-guide-on',
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

    const SP_STEPS   = ['Normal', 'Médio', 'Amplo'];
    const SP_CLASSES = ['', 'a11y-sp2', 'a11y-sp3'];
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
  }

  function resetAll() {
    ['a11y-contrast','a11y-gray','a11y-links','a11y-dyslexia',
     'a11y-freeze','a11y-cursor','a11y-guide-on',
     'a11y-sp2','a11y-sp3'].forEach(c => document.body.classList.remove(c));

    ['swContrast','swGray','swLinks','swDyslexia','swFreeze','swCursor','swGuide'].forEach(function (id) {
      const input = document.getElementById(id);
      if (!input) return;
      input.checked = false;
      const track = input.nextElementSibling;
      if (track) track.setAttribute('aria-checked', 'false');
    });

    const spVal = document.getElementById('spVal');
    const spDec = document.getElementById('spDec');
    const spInc = document.getElementById('spInc');
    if (spVal) spVal.textContent = 'Normal';
    if (spDec) spDec.disabled = true;
    if (spInc) spInc.disabled = false;

    ['a11y-contrast','a11y-gray','a11y-links','a11y-dyslexia',
     'a11y-freeze','a11y-cursor','a11y-guide','a11y-spacing'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (_) {}
    });

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
