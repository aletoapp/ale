/* ════════════════════════════════════════════════════════
   a11y-widget.js — Painel de acessibilidade (FAB)
   ────────────────────────────────────────────────────────
   • Botão flutuante fixo no canto inferior direito
   • Cores herdadas do design system (--gold / --bg / --ink)
   • Injeção de CSS fallback para evitar vazamento textual
   • Compatível com leitores de tela e navegação por teclado (WCAG 2.1)
   ════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Estado compartilhado do Espaçamento ─────────────
     Centralizado aqui (fora de wireFeatures) para que
     restoreState() e resetAll() consigam manter spIdx
     sincronizado com a UI — evitando o bug em que os
     botões +/- ficavam dessincronizados após restaurar
     um valor salvo ou clicar em "Restaurar padrões". ── */
  const SP_STEPS = ['Normal', 'Médio', 'Amplo'];
  const SP_CLASSES = ['', 'a11y-sp2', 'a11y-sp3'];
  let spIdx = 0;

  function applySpacing(idx, silent) {
    spIdx = idx;
    SP_CLASSES.forEach(c => { if (c) document.body.classList.remove(c); });
    if (SP_CLASSES[idx]) document.body.classList.add(SP_CLASSES[idx]);
    const spVal = document.getElementById('spVal');
    const spDec = document.getElementById('spDec');
    const spInc = document.getElementById('spInc');
    if (spVal) spVal.textContent = SP_STEPS[idx];
    if (spDec) spDec.disabled = idx === 0;
    if (spInc) spInc.disabled = idx === SP_STEPS.length - 1;
    save('a11y-spacing', idx);
    if (!silent) announce(`Espaçamento de texto ajustado para: ${SP_STEPS[idx]}`);
  }

  /* ── Estilos de Emergência (Garante layout fixo se o CSS externo falhar) ── */
  function injectFallbackStyles() {
    if (document.getElementById('a11y-fallback-styles')) return;
    const style = document.createElement('style');
    style.id = 'a11y-fallback-styles';
    style.textContent = `
      .a11y-fab-wrap {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        pointer-events: auto !important;
      }
      .a11y-fab-label {
        font-family: var(--font-mono, monospace) !important;
        font-size: 11px !important;
        letter-spacing: 0.1em !important;
        text-transform: uppercase !important;
        color: var(--gold, #c8a96e) !important;
        background: var(--bg-card, rgba(20,20,18,0.95)) !important;
        padding: 4px 8px !important;
        border-radius: 4px !important;
        border: 1px solid rgba(200,169,110,0.2) !important;
        white-space: nowrap !important;
      }
      .a11y-fab-btn {
        width: 44px !important;
        height: 44px !important;
        border-radius: 50% !important;
        background: var(--gold, #c8a96e) !important;
        color: var(--bg, #080807) !important;
        border: none !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        transition: transform 0.2s ease !important;
      }
      .a11y-fab-btn:hover { transform: scale(1.08) !important; }
      .a11y-fab-btn svg { width: 22px !important; height: 22px !important; }
      .a11y-panel[hidden] { display: none !important; }
      .a11y-fab-wrap[hidden] { display: none !important; }
      .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              <span class="a11y-step-val" id="spVal" aria-live="polite">Normal</span>
              <button class="a11y-step-btn" id="spInc" type="button" aria-label="Aumentar espaçamento">+</button>
            </div>
          </div>
        </div>
      </div>

      <div class="a11y-ft">
        <button class="a11y-reset" id="a11yReset" type="button">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M1 6a5 5 0 1 0 1.5-3.5L1 1v3h3"/>
          </svg>
          Restaurar Configurações
        </button>
      </div>
    `;

    return panel;
  }

  /* ── Guia de leitura ─────────────────────────────── */
  function buildReadingGuide() {
    if (document.getElementById('a11yReadingGuide')) return;
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

  /* ── FAB (botão flutuante + rótulo) ──────────────── */
  function buildFab() {
    const wrap = document.createElement('div');
    wrap.className = 'a11y-fab-wrap';
    wrap.id = 'a11yFabWrap';

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
    // Injeta os estilos essenciais
    injectFallbackStyles();

    // Evita duplicidades
    if (document.getElementById('a11yPanel')) return;

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

    /* 4 — Fecha no botão 'x' */
    const closeBtn = document.getElementById('a11yClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closePanel(panel));
    }

    /* 5 — Keydown: Escape fecha o painel */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        closePanel(panel);
      }
    });

    /* 6 — Clique fora fecha o painel */
    document.addEventListener('click', function (e) {
      if (!panel.classList.contains('open')) return;
      if (panel.contains(e.target) || fabBtn.contains(e.target)) return;
      closePanel(panel);
    });

    /* 7 — Eventos das funcionalidades */
    wireFeatures();

    /* 8 — Reset */
    const resetBtn = document.getElementById('a11yReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => resetAll());
    }

    /* 9 — Recupera estado salvo */
    restoreState();

    /* 10 — Live region para leitores de tela */
    if (!document.getElementById('a11yLiveRegion')) {
      const live = document.createElement('div');
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
      isOpen ? closePanel(panel) : openPanel(panel);
    });
  }

  function openPanel(panel) {
    panel.hidden = false;
    void panel.offsetHeight; // Força reflow para transição
    panel.classList.add('open');
    const btn = document.getElementById('a11yNavBtn');
    if (btn) {
      btn.setAttribute('aria-expanded', 'true');
      btn.classList.add('is-open');
    }
    // Esconde o FAB (rótulo + botão) enquanto o painel está aberto,
    // evitando que "ACESSIBILIDADE" fique sobreposto ao rodapé do
    // painel (botão "Restaurar Configurações"). Fechar continua
    // disponível via X, Esc ou clique fora.
    const fabWrap = document.getElementById('a11yFabWrap');
    if (fabWrap) fabWrap.hidden = true;
    setTimeout(() => {
      const closeBtn = document.getElementById('a11yClose');
      if (closeBtn) closeBtn.focus();
    }, 100);
  }

  function closePanel(panel) {
    panel.classList.remove('open');
    // Reexibe o FAB ANTES de focar o botão — focar um elemento
    // com [hidden] (display:none) falha silenciosamente.
    const fabWrap = document.getElementById('a11yFabWrap');
    if (fabWrap) fabWrap.hidden = false;
    const btn = document.getElementById('a11yNavBtn');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('is-open');
      btn.focus();
    }
    setTimeout(() => { panel.hidden = true; }, 300);
  }

  /* ── Notificação para Screen Readers ─────────────── */
  function announce(text) {
    const live = document.getElementById('a11yLiveRegion');
    if (live) live.textContent = text;
  }

  /* ── Funcionalidades de troca ────────────────────── */
  function wireFeatures() {
    function sw(id, bodyClass, storageKey, labelText) {
      const input = document.getElementById(id);
      if (!input) return;
      const track = input.nextElementSibling;

      function apply(checked, silent) {
        input.checked = checked;
        if (track) track.setAttribute('aria-checked', String(checked));
        document.body.classList.toggle(bodyClass, checked);
        save(storageKey, checked);
        if (!silent) {
          announce(`${labelText} ${checked ? 'ativado' : 'desativado'}.`);
        }
      }

      if (track) {
        track.addEventListener('click', () => apply(!input.checked));
        track.addEventListener('keydown', function (e) {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            apply(!input.checked);
          }
        });
      }
    }

    sw('swContrast', 'a11y-contrast', 'a11y-contrast', 'Alto contraste');
    sw('swGray',     'a11y-gray',     'a11y-gray',     'Escala de cinza');
    sw('swLinks',    'a11y-links',    'a11y-links',    'Destacar links');
    sw('swDyslexia', 'a11y-dyslexia', 'a11y-dyslexia', 'Fonte para dislexia');
    sw('swFreeze',   'a11y-freeze',   'a11y-freeze',   'Pausar animações');
    sw('swCursor',   'a11y-cursor',   'a11y-cursor',   'Cursor ampliado');
    sw('swGuide',    'a11y-guide-on', 'a11y-guide',    'Guia de leitura');

    /* Espaçamento (Stepper) — usa applySpacing/spIdx do escopo do módulo */
    const spDec = document.getElementById('spDec');
    const spInc = document.getElementById('spInc');

    if (spDec && spInc) {
      spDec.addEventListener('click', () => { if (spIdx > 0) applySpacing(spIdx - 1); });
      spInc.addEventListener('click', () => { if (spIdx < SP_STEPS.length - 1) applySpacing(spIdx + 1); });
    }
  }

  /* ── Persistência de Dados (localStorage) ─────────── */
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
    const toggleMap = [
      { key: 'a11y-contrast', id: 'swContrast', class: 'a11y-contrast' },
      { key: 'a11y-gray',     id: 'swGray',     class: 'a11y-gray' },
      { key: 'a11y-links',    id: 'swLinks',    class: 'a11y-links' },
      { key: 'a11y-dyslexia', id: 'swDyslexia', class: 'a11y-dyslexia' },
      { key: 'a11y-freeze',   id: 'swFreeze',   class: 'a11y-freeze' },
      { key: 'a11y-cursor',   id: 'swCursor',   class: 'a11y-cursor' },
      { key: 'a11y-guide',    id: 'swGuide',    class: 'a11y-guide-on' }
    ];

    toggleMap.forEach(item => {
      const val = load(item.key);
      if (val === true) {
        const input = document.getElementById(item.id);
        if (input) {
          input.checked = true;
          const track = input.nextElementSibling;
          if (track) track.setAttribute('aria-checked', 'true');
          document.body.classList.add(item.class);
        }
      }
    });

    const savedSp = load('a11y-spacing');
    if (typeof savedSp === 'number' && savedSp >= 0 && savedSp < SP_STEPS.length) {
      applySpacing(savedSp, true); // silent + sincroniza spIdx com o valor salvo
    }
  }

  function resetAll() {
    ['a11y-contrast','a11y-gray','a11y-links','a11y-dyslexia',
     'a11y-freeze','a11y-cursor','a11y-guide-on',
     'a11y-sp2','a11y-sp3'].forEach(c => document.body.classList.remove(c));

    ['swContrast','swGray','swLinks','swDyslexia','swFreeze','swCursor','swGuide'].forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.checked = false;
      const track = input.nextElementSibling;
      if (track) track.setAttribute('aria-checked', 'false');
    });

    applySpacing(0, true); // silent + zera spIdx de verdade (era o bug: só resetava a UI)

    ['a11y-contrast','a11y-gray','a11y-links','a11y-dyslexia',
     'a11y-freeze','a11y-cursor','a11y-guide','a11y-spacing'].forEach(k => {
      try { localStorage.removeItem(k); } catch (_) {}
    });

    announce('Configurações de acessibilidade restauradas para os padrões.');
  }

  /* ── Inicialização ───────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
