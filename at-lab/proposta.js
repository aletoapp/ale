/* ══════════════════════════════════════════════════════
   AT-LAB — proposta.js
   Animações, scroll reveal, theme toggle, CTA cinematic
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Respeita preferência de movimento reduzido ── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ════════════════════════════════════════════════════
     THEME TOGGLE
  ════════════════════════════════════════════════════ */
  const html        = document.documentElement;
  const toggle      = document.getElementById('themeToggle');
  const ttLabel     = document.getElementById('ttLabel');
  const ttDot       = document.querySelector('.tt-dot');

  const STORAGE_KEY = 'atlab-theme';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (ttLabel) ttLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    if (ttDot)   ttDot.textContent   = theme === 'dark' ? '☽' : '☀';
    if (toggle)  toggle.setAttribute('aria-checked', theme === 'light' ? 'true' : 'false');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (_) {}
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  applyTheme(getInitialTheme());

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
    });
  }

  /* ════════════════════════════════════════════════════
     HERO — entrada sequencial
  ════════════════════════════════════════════════════ */
  function initHeroEntrance() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.hero-eyebrow, .hl-line, .hl-divider, .hero-sub, .hero-cta-row, .hero-stats')
        .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    const eyebrow  = document.getElementById('heroEyebrow');
    const hl1      = document.getElementById('hl1');
    const hlDiv    = document.getElementById('hlDiv');
    const hl2      = document.getElementById('hl2');
    const heroSub  = document.getElementById('heroSub');
    const heroCta  = document.getElementById('heroCtaRow');
    const heroStats = document.getElementById('heroStats');

    const seq = [
      { el: eyebrow,   cls: 'visible', delay: 100  },
      { el: hl1,       cls: 'visible', delay: 400  },
      { el: hlDiv,     cls: 'visible', delay: 600  },
      { el: hl2,       cls: 'visible', delay: 750  },
      { el: heroSub,   cls: 'visible', delay: 1050 },
      { el: heroCta,   cls: 'visible', delay: 1250 },
      { el: heroStats, cls: 'visible', delay: 1450 },
    ];

    seq.forEach(({ el, cls, delay }) => {
      if (!el) return;
      setTimeout(() => el.classList.add(cls), delay);
    });
  }

  /* ════════════════════════════════════════════════════
     SCROLL REVEAL — IntersectionObserver
  ════════════════════════════════════════════════════ */
  function initScrollReveal() {
    const items = document.querySelectorAll('.sr');
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach(el => el.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach(el => observer.observe(el));
  }

  /* ════════════════════════════════════════════════════
     CTA FINAL — palavras animadas individualmente
  ════════════════════════════════════════════════════ */
  function initCtaFinal() {
    const words = document.querySelectorAll('.cfw');
    const line2 = document.getElementById('cflLine2');
    const cta   = document.getElementById('cflCta');

    if (!words.length) return;

    if (prefersReducedMotion) {
      words.forEach(w => w.classList.add('in'));
      if (line2) { line2.style.opacity = '1'; line2.style.transform = 'none'; }
      if (cta)   { cta.style.opacity   = '1'; cta.style.transform   = 'none'; }
      return;
    }

    const section = document.getElementById('cta-final');
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(section);

          words.forEach((word, i) => {
            setTimeout(() => word.classList.add('in'), i * 95);
          });

          const totalDelay = words.length * 95 + 100;
          if (line2) {
            setTimeout(() => line2.classList.add('in'), totalDelay);
          }
          if (cta) {
            setTimeout(() => cta.classList.add('in'), totalDelay + 250);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
  }

  /* ════════════════════════════════════════════════════
     PROCESSO STEPS — hover kinesis
  ════════════════════════════════════════════════════ */
  function initProcessoKinesis() {
    const steps = document.querySelectorAll('.ps-step');
    steps.forEach(step => {
      step.addEventListener('mouseenter', () => {
        const num = step.querySelector('.ps-num');
        if (num) num.style.color = 'var(--gold)';
      });
      step.addEventListener('mouseleave', () => {
        const num = step.querySelector('.ps-num');
        if (num) num.style.color = '';
      });
    });
  }

  /* ════════════════════════════════════════════════════
     SMOOTH SCROLL — links internos
  ════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const id     = anchor.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const navHeight = document.getElementById('site-nav')?.offsetHeight || 60;
        const top       = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ════════════════════════════════════════════════════
     NAV — sombra ao scroll
  ════════════════════════════════════════════════════ */
  function initNavScroll() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (window.scrollY > 20) {
          nav.style.boxShadow = '0 4px 40px rgba(0,0,0,0.4)';
        } else {
          nav.style.boxShadow = 'none';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ════════════════════════════════════════════════════
     CONTADORES ANIMADOS — hero stats
  ════════════════════════════════════════════════════ */
  function initCounters() {
    if (prefersReducedMotion) return;
    // Os valores do hero stats são estáticos (R$0, Edge, 100%) —
    // nenhuma animação de contador é aplicada; reservado para uso futuro.
  }

  /* ════════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════════ */
  function init() {
    initHeroEntrance();
    initScrollReveal();
    initCtaFinal();
    initProcessoKinesis();
    initSmoothScroll();
    initNavScroll();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
