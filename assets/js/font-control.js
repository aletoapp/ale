/* ════════════════════════════════════════════════════
   FONT CONTROL — A- / A+
   Camada 1: preferência explícita do usuário

   Como funciona:
   - Aplica data-font="small|normal|large" no <html>
   - CSS (01-root.css) reage via html[data-font="..."] { font-size }
   - Todo valor em rem herda a escala automaticamente
   - Preferência salva em localStorage para persistir entre sessões
   - Respeita prefers-reduced-motion (sem transição de tamanho)

   HTML necessário no .nav-right (antes de .theme-toggle):
   <div class="font-ctrl" role="group" aria-label="Tamanho do texto">
     <button class="font-btn" id="fontDecrease" aria-label="Diminuir texto">A−</button>
     <button class="font-btn" id="fontIncrease" aria-label="Aumentar texto">A+</button>
   </div>
════════════════════════════════════════════════════ */

(function () {
  const STEPS  = ['small', 'normal', 'large'];
  const KEY    = 'aletor-font-size';
  const html   = document.documentElement;
  const btnDec = document.getElementById('fontDecrease');
  const btnInc = document.getElementById('fontIncrease');

  if (!btnDec || !btnInc) return;

  /* Lê preferência salva ou usa padrão */
  let current = localStorage.getItem(KEY) || 'normal';
  if (!STEPS.includes(current)) current = 'normal';

  function apply(size) {
    current = size;
    html.setAttribute('data-font', size);
    localStorage.setItem(KEY, size);

    /* Feedback para leitores de tela */
    const labels = { small: 'Texto pequeno', normal: 'Texto normal', large: 'Texto grande' };
    const live = document.getElementById('fontLiveRegion');
    if (live) live.textContent = labels[size];
  }

  /* Aplica ao carregar (sem flash) */
  apply(current);

  btnDec.addEventListener('click', () => {
    const idx = STEPS.indexOf(current);
    if (idx > 0) apply(STEPS[idx - 1]);
  });

  btnInc.addEventListener('click', () => {
    const idx = STEPS.indexOf(current);
    if (idx < STEPS.length - 1) apply(STEPS[idx + 1]);
  });
}());
