/* aletor.js — Otimizado para Lighthouse 100
   Mudanças vs original:
   - Carregado com defer (não bloqueia render)
   - IIFEs mantidos para escopo isolado
   - Sem alterações de lógica — apenas organização
*/

/* ════════════════════════════════════════════
   THEME TOGGLE
════════════════════════════════════════════ */
(function () {
  const html   = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const ttDot  = document.getElementById('ttDot');
  const ttLabel = document.getElementById('ttLabel');
  let isDark = true;

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    isDark = !isDark;
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    ttDot.textContent   = isDark ? '🌙' : '☀️';
    ttLabel.textContent = isDark ? 'Versão clara' : 'Versão escura';
  });

  /* Respeita preferência do sistema na primeira visita */
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    isDark = false;
    html.setAttribute('data-theme', 'light');
    ttDot.textContent   = '☀️';
    ttLabel.textContent = 'Versão escura';
  }
}());


/* ════════════════════════════════════════════
   HERO — CINEMATIC SEQUENTIAL REVEAL
════════════════════════════════════════════ */
(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const seq = [
    { id: 'heroEyebrow',   delay: 300  },
    { id: 'hl1',           delay: 900  },
    { id: 'hl2',           delay: 1900 },
    { id: 'hlDiv',         delay: 2700 },
    { id: 'hl3',           delay: 2850 },
    { id: 'heroSub',       delay: 3600 },
    { id: 'heroMechanism', delay: 3950 },
    { id: 'heroMicroProof',delay: 4250 },
    { id: 'heroDiagnostic',delay: 4500 },
    { id: 'heroDiagNote',  delay: 4700 },
    { id: 'heroCtaRow',    delay: 4950 },
    { id: 'heroStats',     delay: 5200 },
  ];

  const mobileSeq = [
    { id: 'heroEyebrow',   delay: 200  },
    { id: 'hl1',           delay: 550  },
    { id: 'hl2',           delay: 1050 },
    { id: 'hlDiv',         delay: 1500 },
    { id: 'hl3',           delay: 1600 },
    { id: 'heroSub',       delay: 2100 },
    { id: 'heroMechanism', delay: 2350 },
    { id: 'heroMicroProof',delay: 2550 },
    { id: 'heroDiagnostic',delay: 2750 },
    { id: 'heroDiagNote',  delay: 2900 },
    { id: 'heroCtaRow',    delay: 3100 },
    { id: 'heroStats',     delay: 3300 },
  ];

  const isMobile = window.innerWidth <= 768;
  const active   = isMobile ? mobileSeq : seq;

  if (reducedMotion) {
    /* Sem animação: mostra tudo imediatamente */
    active.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) el.classList.add('visible');
    });
    return;
  }

  active.forEach(({ id, delay }) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('visible');
    }, delay);
  });
}());


/* ════════════════════════════════════════════
   SCROLL REVEALS
════════════════════════════════════════════ */
(function () {
  const srEls = document.querySelectorAll('.sr');
  if (!srEls.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  srEls.forEach(el => io.observe(el));
}());


/* ════════════════════════════════════════════
   FADE-IN — PROGRESSIVE DELAY
════════════════════════════════════════════ */
(function () {
  const fadeEls = document.querySelectorAll('.fade-in');
  if (!fadeEls.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach(el => io.observe(el));
}());


/* ════════════════════════════════════════════
   HERO DIAGNOSTIC — BUTTON HANDLER
════════════════════════════════════════════ */
(function () {
  const diagBtn   = document.getElementById('heroDiagBtn');
  const diagInput = document.getElementById('heroDiagInput');
  if (!diagBtn || !diagInput) return;

  function send() {
    const email = diagInput.value.trim();
    if (!email || !email.includes('@')) {
      diagInput.style.borderLeft = '2px solid var(--rust)';
      diagInput.setAttribute('aria-invalid', 'true');
      const original = diagInput.getAttribute('placeholder');
      diagInput.placeholder = 'Digite um e-mail válido';
      setTimeout(() => {
        diagInput.style.borderLeft = '';
        diagInput.removeAttribute('aria-invalid');
        diagInput.placeholder = original;
      }, 2000);
      return;
    }
    const waText = encodeURIComponent(
      `Olá Alexandre, quero receber o diagnóstico gratuito da minha landing page. Meu e-mail: ${email}`
    );
    window.open(`https://wa.me/5527996252050?text=${waText}`, '_blank', 'noopener,noreferrer');
    diagInput.value = '';
    diagBtn.textContent = 'Enviado ✓';
    diagBtn.style.background = '#5fa870';
    setTimeout(() => {
      diagBtn.textContent = 'Diagnóstico →';
      diagBtn.style.background = '';
    }, 3000);
  }

  diagBtn.addEventListener('click', send);
  diagInput.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
}());


/* ════════════════════════════════════════════
   PLACEHOLDER RESPONSIVO — diagnóstico input
════════════════════════════════════════════ */
(function () {
  const inp = document.getElementById('heroDiagInput');
  if (!inp) return;
  function updatePlaceholder() {
    inp.placeholder = window.innerWidth <= 480
      ? (inp.dataset.placeholderMobile || 'Seu e-mail para receber o:')
      : 'Seu e-mail para receber o diagnóstico grátis';
  }
  updatePlaceholder();
  window.addEventListener('resize', updatePlaceholder, { passive: true });
}());


/* ════════════════════════════════════════════
   MODAL GOOGLE REVIEWS
════════════════════════════════════════════ */
(function () {
  const overlay  = document.getElementById('reviewsModal');
  const btnOpen  = document.getElementById('btnOpenReviews');
  const btnClose = document.getElementById('btnCloseReviews');
  if (!overlay || !btnOpen) return;

  function openModal () { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; btnClose && btnClose.focus(); }
  function closeModal() { overlay.classList.remove('open'); document.body.style.overflow = ''; btnOpen.focus(); }

  btnOpen.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });
}());


/* ════════════════════════════════════════════
   CTA FINAL CINEMATOGRÁFICO — word-by-word reveal
════════════════════════════════════════════ */
(function () {
  const section = document.getElementById('cta-final');
  if (!section) return;
  const words = section.querySelectorAll('.cfw');
  const line2 = document.getElementById('cfLine2');
  const ctaEl = document.getElementById('cfCta');
  let triggered = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function runReveal() {
    if (triggered) return;
    triggered = true;
    if (reducedMotion) {
      words.forEach(w => w.classList.add('in'));
      if (line2) line2.classList.add('in');
      if (ctaEl) ctaEl.classList.add('in');
      return;
    }
    const delay = 90;
    words.forEach(function(w, i) { setTimeout(function() { w.classList.add('in'); }, i * delay); });
    const line2Start = words.length * delay + 80;
    setTimeout(function() { if (line2) line2.classList.add('in'); }, line2Start);
    setTimeout(function() { if (ctaEl) ctaEl.classList.add('in'); }, line2Start + 520);
  }

  const io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) { runReveal(); io.disconnect(); } });
  }, { threshold: 0.25 });
  io.observe(section);
}());