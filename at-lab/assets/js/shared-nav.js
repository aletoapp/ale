/**
 * shared-nav.js — Alexandre Torres
 * Injeta nav + footer mínimos em todas as páginas satélite.
 * Uso: <script src="/assets/js/shared-nav.js" defer></script>
 *
 * Detecta o pathname atual para marcar o item ativo e
 * respeita o data-theme já definido no <html>.
 */

(function () {
  'use strict';

  /* ── Ferramentas registradas ── */
  const TOOLS = [
    { label: 'AT·Lab',    href: '/at-lab/',   tag: 'hub'        },
    { label: 'DocForm',   href: '/docform/',  tag: 'automação'  },
    { label: 'iList',     href: '/ilist/',    tag: 'listas'     },
    { label: 'VoiceLab', href: '/voicelab/', tag: 'áudio'      },
    { label: 'Receitas',  href: '/receitas/', tag: 'culinária'  },
  ];

  const MAIN = { label: 'alexandretorres.com.br', href: '/' };

  /* ── Utilidades ── */
  const current = window.location.pathname.replace(/\/?$/, '/');

  function isActive(href) {
    return current === href || current.startsWith(href) && href !== '/';
  }

  /* ── CSS injetado (tokens herdados do tema global) ── */
  const CSS = `
    :root{
      --sn-bg:   rgba(8,8,7,.92);
      --sn-bdr:  rgba(200,169,110,.10);
      --sn-gold: #c8a96e;
      --sn-ink:  #f0ece2;
      --sn-dim:  rgba(200,169,110,.38);
      --sn-h:    48px;
      --sn-mono: 'DM Mono', monospace;
    }
    [data-theme="light"]{
      --sn-bg:   rgba(245,240,232,.94);
      --sn-bdr:  rgba(0,0,0,.09);
      --sn-gold: #9c7c3e;
      --sn-ink:  #0a0907;
      --sn-dim:  rgba(156,124,62,.40);
    }

    #at-shared-nav{
      position: fixed; top: 0; left: 0; right: 0; z-index: 500;
      height: var(--sn-h);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2rem;
      background: var(--sn-bg);
      border-bottom: 1px solid var(--sn-bdr);
      backdrop-filter: blur(18px) saturate(1.5);
      -webkit-backdrop-filter: blur(18px) saturate(1.5);
      font-family: var(--sn-mono);
      font-size: .6rem; letter-spacing: .14em; text-transform: uppercase;
      transition: background .4s, border-color .4s;
    }

    #at-shared-nav a{
      color: var(--sn-dim);
      text-decoration: none;
      transition: color .2s;
      white-space: nowrap;
    }
    #at-shared-nav a:hover{ color: var(--sn-gold); }
    #at-shared-nav a.sn-active{ color: var(--sn-gold); }

    .sn-home{
      display: flex; align-items: center; gap: .7rem; flex-shrink: 0;
    }
    .sn-home-dot{
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--sn-gold);
      flex-shrink: 0;
      animation: snPulse 2.2s ease-in-out infinite;
    }
    @keyframes snPulse{
      0%,100%{ box-shadow: 0 0 0 0 rgba(200,169,110,.5); }
      50%     { box-shadow: 0 0 0 4px rgba(200,169,110,0); }
    }

    .sn-sep{
      width: 1px; height: 14px;
      background: var(--sn-bdr); flex-shrink: 0;
    }

    .sn-tools{
      display: flex; align-items: center; gap: 0; overflow-x: auto;
      scrollbar-width: none;
    }
    .sn-tools::-webkit-scrollbar{ display: none; }

    .sn-tool{
      padding: .3rem .85rem;
      border-right: 1px solid var(--sn-bdr);
      line-height: 1; transition: background .2s;
    }
    .sn-tool:first-child{ border-left: 1px solid var(--sn-bdr); }
    .sn-tool a.sn-active{
      color: var(--sn-gold);
      background: rgba(200,169,110,.07);
    }
    [data-theme="light"] .sn-tool a.sn-active{
      background: rgba(156,124,62,.08);
    }

    /* badge "hub" diferenciado */
    .sn-tool[data-tag="hub"] a{
      color: var(--sn-gold);
    }

    /* empurra o body pra baixo do nav */
    body{ padding-top: var(--sn-h) !important; }

    /* ── Footer mínimo ── */
    #at-shared-footer{
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: .8rem;
      padding: 1.6rem 2rem;
      border-top: 1px solid var(--sn-bdr);
      font-family: var(--sn-mono);
      font-size: .55rem; letter-spacing: .1em; text-transform: uppercase;
      color: var(--sn-dim);
      background: var(--sn-bg);
      margin-top: 4rem;
    }
    #at-shared-footer a{
      color: var(--sn-dim); text-decoration: none; transition: color .2s;
    }
    #at-shared-footer a:hover{ color: var(--sn-gold); }
    .sn-ft-links{ display: flex; gap: 1.4rem; flex-wrap: wrap; }

    @media(max-width:640px){
      #at-shared-nav{ padding: 0 1rem; }
      .sn-tool{ padding: .3rem .6rem; }
      #at-shared-footer{ padding: 1.2rem 1rem; flex-direction: column; align-items: flex-start; }
    }
  `;

  /* ── Injeta o <style> ── */
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ── Monta o nav ── */
  function buildNav() {
    const nav = document.createElement('nav');
    nav.id = 'at-shared-nav';
    nav.setAttribute('aria-label', 'Navegação global');

    /* — lado esquerdo: home — */
    const home = document.createElement('div');
    home.className = 'sn-home';
    home.innerHTML = `
      <span class="sn-home-dot" aria-hidden="true"></span>
      <a href="${MAIN.href}" title="Página principal">${MAIN.label}</a>
    `;

    /* — separador — */
    const sep = document.createElement('span');
    sep.className = 'sn-sep';
    sep.setAttribute('aria-hidden', 'true');

    /* — lado direito: ferramentas — */
    const tools = document.createElement('div');
    tools.className = 'sn-tools';
    tools.setAttribute('role', 'list');

    TOOLS.forEach(tool => {
      const item = document.createElement('div');
      item.className = 'sn-tool';
      item.setAttribute('data-tag', tool.tag);
      item.setAttribute('role', 'listitem');

      const a = document.createElement('a');
      a.href = tool.href;
      a.textContent = tool.label;
      if (isActive(tool.href)) {
        a.classList.add('sn-active');
        a.setAttribute('aria-current', 'page');
      }
      item.appendChild(a);
      tools.appendChild(item);
    });

    nav.appendChild(home);
    nav.appendChild(sep);
    nav.appendChild(tools);

    document.body.insertAdjacentElement('afterbegin', nav);
  }

  /* ── Monta o footer ── */
  function buildFooter() {
    const ft = document.createElement('footer');
    ft.id = 'at-shared-footer';

    const links = TOOLS.filter(t => !isActive(t.href))
      .map(t => `<a href="${t.href}">${t.label}</a>`)
      .join('');

    ft.innerHTML = `
      <span>© 2026 <a href="${MAIN.href}">Alexandre Torres</a></span>
      <div class="sn-ft-links">
        ${links}
        <a href="/privacidade/">Privacidade</a>
      </div>
    `;

    document.body.appendChild(ft);
  }

  /* ── Não roda na home ── */
  if (current === '/') return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { buildNav(); buildFooter(); });
  } else {
    buildNav();
    buildFooter();
  }

})();
