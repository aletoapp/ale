/* ════════════════════════════════════════════════════
   CHAT-WIDGET — Assistente de vendas (Alexandre Torres)
   ──────────────────────────────────────────────────────
   - Injeta o FAB + janela de chat dinamicamente (sem tocar
     no HTML existente). Basta incluir este script + o CSS
     correspondente em todas as páginas.
   - Conversa com a Cloudflare Worker (worker.js, endpoint
     Gemini) definida em WORKER_URL.
   - Se a Worker falhar ou não estiver configurada ainda,
     cai graciosamente para o link do WhatsApp.
   - Histórico da conversa persiste em sessionStorage
     (sobrevive à troca de página, some ao fechar a aba).
   - Acessível: foco preso na janela aberta, ESC fecha,
     aria-live para novas mensagens, respeita
     prefers-reduced-motion.
════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── CONFIGURAÇÃO ───────────────────────────────────
     Troque pela URL da sua Worker publicada.
     Enquanto o valor abaixo continuar com "seu-worker",
     o widget já funciona no modo "coleta e leva pro
     WhatsApp" — sem precisar da API configurada.
  ─────────────────────────────────────────────────────── */
  const WORKER_URL   = 'https://seu-worker.seu-subdominio.workers.dev';
  const WHATSAPP_NUM = '5527996252050';
  const STORAGE_KEY  = 'aletor-chat-history';

  const WORKER_READY = !WORKER_URL.includes('seu-worker');

  const GREETING =
    'Olá! Sou o assistente do Alexandre. Me conta rapidamente: qual é a sua página ou negócio hoje — e onde você acha que está travando a venda?';

  const QUICK_REPLIES = [
    { label: 'Diagnóstico grátis',   msg: 'Quero o diagnóstico técnico gratuito da minha página.' },
    { label: 'Quanto custa?',        msg: 'Quanto custa uma landing page de alta conversão?' },
    { label: 'Ver projetos',         msg: 'Quero ver exemplos de projetos que você já entregou.' },
  ];

  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP_NUM + '?text=' + encodeURIComponent(text);
  }

  let history = [];
  let lastFocused = null;

  /* ── PERSISTÊNCIA ────────────────────────────────────── */

  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) history = JSON.parse(raw);
    } catch (e) { history = []; }
  }

  function saveHistory() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch (e) {}
  }

  /* ── CONSTRUÇÃO DA UI ────────────────────────────────── */

  function buildUI() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-fab-wrap';
    wrap.innerHTML =
      '<button type="button" class="chat-fab-btn" id="chatFabBtn" aria-haspopup="dialog" aria-expanded="false" aria-controls="chatWindow" aria-label="Abrir chat com Alexandre Torres">' +
        '<span class="chat-fab-pulse" aria-hidden="true"></span>' +
        '<svg class="chat-fab-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
        '<svg class="chat-fab-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>' +
      '<span class="chat-fab-label" id="chatFabLabel">Falar com Alexandre</span>';

    const win = document.createElement('div');
    win.className = 'chat-window';
    win.id = 'chatWindow';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-modal', 'false');
    win.setAttribute('aria-label', 'Chat com Alexandre Torres');
    win.innerHTML =
      '<div class="chat-hd">' +
        '<div class="chat-hd-left">' +
          '<div class="chat-hd-avatar" aria-hidden="true">AT</div>' +
          '<div class="chat-hd-text">' +
            '<span class="chat-hd-name">Alexandre Torres</span>' +
            '<span class="chat-hd-status"><span class="chat-hd-status-dot" aria-hidden="true"></span>Online agora</span>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="chat-hd-close" id="chatCloseBtn" aria-label="Fechar chat">&times;</button>' +
      '</div>' +
      '<div class="chat-msgs" id="chatMsgs" aria-live="polite"></div>' +
      '<div class="chat-quick" id="chatQuick"></div>' +
      '<div class="chat-input-area">' +
        '<textarea class="chat-input" id="chatInput" rows="1" placeholder="Digite sua dúvida ou objetivo..." aria-label="Sua mensagem"></textarea>' +
        '<button type="button" class="chat-send-btn" id="chatSendBtn" aria-label="Enviar mensagem">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="chat-footer"><a href="' + waLink('Olá Alexandre, vim do site e quero falar direto no WhatsApp.') + '" target="_blank" rel="noopener noreferrer">Prefere falar direto no WhatsApp? →</a></div>';

    document.body.appendChild(wrap);
    document.body.appendChild(win);

    wireEvents(wrap, win);
    renderQuickReplies();
    renderHistory();
  }

  function wireEvents(wrap, win) {
    const fabBtn   = document.getElementById('chatFabBtn');
    const fabLabel = document.getElementById('chatFabLabel');
    const closeBtn = document.getElementById('chatCloseBtn');
    const input    = document.getElementById('chatInput');
    const sendBtn  = document.getElementById('chatSendBtn');

    function openChat() {
      lastFocused = document.activeElement;
      win.classList.add('open');
      fabBtn.classList.add('is-open');
      fabBtn.setAttribute('aria-expanded', 'true');
      fabBtn.setAttribute('aria-label', 'Fechar chat com Alexandre Torres');
      wrap.classList.add('is-open');
      if (history.length === 0) botSay(GREETING);
      document.addEventListener('keydown', onKeydown);
      setTimeout(function () { input.focus(); }, 260);
    }

    function closeChat() {
      win.classList.remove('open');
      fabBtn.classList.remove('is-open');
      fabBtn.setAttribute('aria-expanded', 'false');
      fabBtn.setAttribute('aria-label', 'Abrir chat com Alexandre Torres');
      wrap.classList.remove('is-open');
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      else fabBtn.focus();
    }

    function onKeydown(e) {
      if (e.key === 'Escape') { closeChat(); return; }
      if (e.key === 'Tab') trapFocus(e, win);
    }

    fabBtn.addEventListener('click', function () {
      win.classList.contains('open') ? closeChat() : openChat();
    });
    fabLabel.addEventListener('click', openChat);
    closeBtn.addEventListener('click', closeChat);

    function autoGrow() {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 88) + 'px';
    }
    input.addEventListener('input', autoGrow);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitMessage();
      }
    });
    sendBtn.addEventListener('click', submitMessage);

    function submitMessage() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      autoGrow();
      userSay(text);
      requestReply(text);
    }
  }

  function trapFocus(e, container) {
    const focusables = container.querySelectorAll('button, [href], textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  /* ── SUGESTÕES RÁPIDAS ───────────────────────────────── */

  function renderQuickReplies() {
    const box = document.getElementById('chatQuick');
    if (!box) return;
    box.innerHTML = '';
    QUICK_REPLIES.forEach(function (q) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-quick-btn';
      btn.textContent = q.label;
      btn.addEventListener('click', function () {
        userSay(q.msg);
        requestReply(q.msg);
      });
      box.appendChild(btn);
    });
  }

  function hideQuickReplies() {
    const box = document.getElementById('chatQuick');
    if (box) box.style.display = 'none';
  }

  /* ── MENSAGENS ───────────────────────────────────────── */

  function renderHistory() {
    const container = document.getElementById('chatMsgs');
    if (!container) return;
    container.innerHTML = '';
    history.forEach(function (m) {
      appendBubble(m.role === 'user' ? 'user' : 'bot', m.content);
    });
    if (history.length > 0) hideQuickReplies();
    scrollToBottom();
  }

  function appendBubble(sender, text, link) {
    const container = document.getElementById('chatMsgs');
    const el = document.createElement('div');
    el.className = 'chat-msg ' + sender;
    el.appendChild(document.createTextNode(text));
    if (link) {
      el.appendChild(document.createElement('br'));
      const a = document.createElement('a');
      a.href = link.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = link.label;
      el.appendChild(a);
    }
    container.appendChild(el);
    scrollToBottom();
    return el;
  }

  function scrollToBottom() {
    const container = document.getElementById('chatMsgs');
    if (container) container.scrollTop = container.scrollHeight;
  }

  function botSay(text, link) {
    history.push({ role: 'model', content: text });
    saveHistory();
    appendBubble('bot', text, link);
  }

  function userSay(text) {
    history.push({ role: 'user', content: text });
    saveHistory();
    appendBubble('user', text);
    hideQuickReplies();
  }

  function showTyping() {
    const container = document.getElementById('chatMsgs');
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.id = 'chatTyping';
    el.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById('chatTyping');
    if (el) el.remove();
  }

  /* ── COMUNICAÇÃO COM A WORKER ────────────────────────── */

  function requestReply(userText) {
    showTyping();

    if (!WORKER_READY) {
      // Modo sem backend configurado ainda: resposta local + condução ao WhatsApp.
      setTimeout(function () {
        hideTyping();
        botSay(
          'Recebi sua mensagem! Meu assistente automático ainda está sendo configurado — ' +
          'pra não te fazer esperar, me chama direto no WhatsApp que eu respondo pessoalmente:',
          { href: waLink('Olá Alexandre, vim do site. ' + userText), label: 'Abrir WhatsApp →' }
        );
      }, 600);
      return;
    }

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        hideTyping();
        if (data && data.reply) {
          botSay(data.reply);
        } else {
          botSay('Tive uma oscilação por aqui. Pode me chamar direto no WhatsApp:',
            { href: waLink('Olá Alexandre, vim do site e o chat travou. ' + userText), label: 'Abrir WhatsApp →' });
        }
      })
      .catch(function () {
        hideTyping();
        botSay('Não consegui conectar agora. Me chama direto no WhatsApp:',
          { href: waLink('Olá Alexandre, vim do site e o chat não conectou. ' + userText), label: 'Abrir WhatsApp →' });
      });
  }

  /* ── INIT ────────────────────────────────────────────── */

  function init() {
    loadHistory();
    buildUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
