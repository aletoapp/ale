/* ── FADE-IN SCROLL ── */
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting) e.target.classList.add('visible');
  });
}, {threshold:0.1});
document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

/* ── YOUTUBE THUMBNAIL → PLAY ── */
const ytWrapper    = document.getElementById('yt-wrapper');
const ytOverlay    = document.getElementById('yt-overlay');
const ytPlayCircle = document.getElementById('yt-play-circle');
const ytIframe     = document.getElementById('yt-iframe');
const ytThumb      = document.getElementById('yt-thumb');

if(ytWrapper) {
  ytWrapper.addEventListener('mouseenter', () => {
    ytPlayCircle.style.transform  = 'scale(1.1)';
    ytPlayCircle.style.boxShadow  = '0 0 36px rgba(255,107,0,0.65)';
  });
  ytWrapper.addEventListener('mouseleave', () => {
    ytPlayCircle.style.transform  = 'scale(1)';
    ytPlayCircle.style.boxShadow  = '0 0 24px rgba(255,107,0,0.4)';
  });
  ytWrapper.addEventListener('click', () => {
    ytIframe.src = 'https://www.youtube.com/embed/uD67_gYFRjQ?rel=0&autoplay=1';
    ytIframe.style.display = 'block';
    ytOverlay.style.transition = 'opacity 0.4s ease';
    ytOverlay.style.opacity = '0';
    setTimeout(() => { ytOverlay.style.display = 'none'; }, 400);
    ytThumb.style.transition = 'opacity 0.4s ease';
    ytThumb.style.opacity = '0';
  });
}

/* ── OVERLAY PLAY DO VÍDEO ── */
const overlay = document.getElementById('play-overlay');
if(overlay) {
  overlay.addEventListener('click', () => openVideoModal());
}

/* ── MODAL VÍDEO ── */
function openVideoModal() {
  const m = document.getElementById('video-modal');
  m.style.display = 'flex';
  requestAnimationFrame(() => m.classList.add('open'));
  document.body.style.overflow = 'hidden';
  const v = document.getElementById('modal-video');
  v.currentTime = 0;
  v.play();
}
function closeVideoModal() {
  const m = document.getElementById('video-modal');
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 250);
  document.body.style.overflow = '';
  document.getElementById('modal-video').pause();
}
document.getElementById('video-modal').addEventListener('click', function(e) {
  if (e.target === this) closeVideoModal();
});

/* ── LIGHTBOX IMAGENS ── */
const lbImages = [
  { src: 'https://aletoapp.github.io/bike/img/01.jpg',   caption: 'Suspensão traseira' },
  { src: 'https://aletoapp.github.io/bike/img/02.jpg',   caption: 'Display digital' },
  { src: 'https://aletoapp.github.io/bike/img/03.jpg',   caption: 'Banco de couro' },
  { src: 'https://aletoapp.github.io/bike/img/04.jpg',   caption: 'Freio a disco' },
  { src: 'https://aletoapp.github.io/bike/img/001.webp', caption: 'R10 Full — Vista 1' },
  { src: 'https://aletoapp.github.io/bike/img/002.webp', caption: 'R10 Full — Vista 2' },
  { src: 'https://aletoapp.github.io/bike/img/003.webp', caption: 'R10 Full — Vista 3' },
];
let lbCurrent = 0;

function openLightbox(index) {
  lbCurrent = index;
  const lb = document.getElementById('lightbox');
  lb.style.display = 'flex';
  requestAnimationFrame(() => lb.classList.add('open'));
  document.body.style.overflow = 'hidden';
  const thumbsEl = document.getElementById('lb-thumbs');
  if (!thumbsEl.children.length) {
    lbImages.forEach((img, i) => {
      const t = document.createElement('img');
      t.src = img.src; t.alt = img.caption;
      t.className = 'lb-thumb';
      t.onclick = () => lbGoTo(i);
      thumbsEl.appendChild(t);
    });
  }
  lbGoTo(index);
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  setTimeout(() => { lb.style.display = 'none'; }, 250);
  document.body.style.overflow = '';
}
function lbGoTo(index) {
  lbCurrent = (index + lbImages.length) % lbImages.length;
  const imgEl = document.getElementById('lb-img');
  imgEl.classList.add('fade');
  setTimeout(() => {
    imgEl.src = lbImages[lbCurrent].src;
    imgEl.alt = lbImages[lbCurrent].caption;
    document.getElementById('lb-caption').textContent = lbImages[lbCurrent].caption;
    document.getElementById('lb-counter').textContent = (lbCurrent + 1) + ' / ' + lbImages.length;
    imgEl.classList.remove('fade');
  }, 200);
  document.querySelectorAll('.lb-thumb').forEach((t, i) => t.classList.toggle('active', i === lbCurrent));
}
function lbNav(dir) { lbGoTo(lbCurrent + dir); }

document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) closeLightbox();
});
document.querySelectorAll('.lightbox-trigger').forEach(el => {
  el.addEventListener('click', () => openLightbox(parseInt(el.dataset.index)));
});

/* ── TECLADO ── */
document.addEventListener('keydown', e => {
  if (document.getElementById('lightbox').classList.contains('open')) {
    if (e.key === 'ArrowRight') lbNav(1);
    if (e.key === 'ArrowLeft')  lbNav(-1);
    if (e.key === 'Escape')     closeLightbox();
  }
  if (document.getElementById('video-modal').classList.contains('open')) {
    if (e.key === 'Escape') closeVideoModal();
  }
});

/* ── DRAWER MENU ── */
(function() {
  const btn     = document.getElementById('hamburger');
  const drawer  = document.getElementById('nav-drawer');
  const overlay = document.getElementById('nav-drawer-overlay');
  const close   = document.getElementById('drawer-close');

  function openDrawer() {
    drawer.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    btn.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  overlay.addEventListener('click', closeDrawer);
  close.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
})();

/* ── TOGGLE MODO CLARO/ESCURO ── */
(function() {
  const html   = document.documentElement;
  const btn    = document.getElementById('theme-toggle');
  const ripple = document.getElementById('theme-ripple');

  const saved = localStorage.getItem('r10-theme');
  if (saved === 'light') html.classList.add('light');

  btn.addEventListener('click', function(e) {
    const rect    = btn.getBoundingClientRect();
    const cx      = rect.left + rect.width  / 2;
    const cy      = rect.top  + rect.height / 2;
    const isLight = html.classList.contains('light');
    const size    = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight) * 2.2);
    const color   = isLight ? '#0A0A0A' : '#F4F2EE';

    ripple.style.cssText = `
      width:${size}px;
      height:${size}px;
      top:${cy - size/2}px;
      left:${cx - size/2}px;
      background:${color};
      transform:scale(0);
      opacity:1;
    `;

    requestAnimationFrame(() => {
      ripple.style.transform  = 'scale(1)';
      ripple.style.transition = 'transform 0.55s cubic-bezier(.4,0,.2,1)';
    });

    setTimeout(() => {
      html.classList.toggle('light');
      localStorage.setItem('r10-theme', html.classList.contains('light') ? 'light' : 'dark');
    }, 180);

    setTimeout(() => {
      ripple.style.opacity    = '0';
      ripple.style.transition = 'opacity 0.35s ease';
    }, 480);

    setTimeout(() => { ripple.style.cssText = ''; }, 820);
  });
})();
