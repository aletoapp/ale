/* ════════════════════════════════════════════
   STATE
════════════════════════════════════════════ */
let currentPreset = 'generico';
let logoDataUrl   = null;
let wmDataUrl     = null;
let wmPosition    = 'center';
let cvPhotoDataUrl = null;
let cvSkills      = [];
let expCount=0, eduCount=0, cursoCount=0, idiomaCount=0;
let formatOpts    = {};

/* ════════════════════════════════════════════
   PRESET_CONFIG — Fonte única de verdade
   Cada preset define: título, assinantes,
   referência legal, chips padrão, rodapé
   jurídico e contexto B2B para RH/terceirização.
   Acesse via: PRESET_CONFIG[currentPreset]
════════════════════════════════════════════ */
const PRESET_CONFIG = {

  'aluguel-residencial': {
    titulo:    'CONTRATO DE LOCAÇÃO RESIDENCIAL',
    sign1:     { label: 'Locador',    placeholder: 'Nome completo do Locador' },
    sign2:     { label: 'Locatário',  placeholder: 'Nome completo do Locatário' },
    lei:       'Lei 8.245/91 (Lei do Inquilinato)',
    leiShort:  'Lei 8.245/91',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: false, testemunhas: true },
    footerLegal: 'Regido pela Lei 8.245/91 — Lei do Inquilinato',
    badge:     { text: 'Lei do Inquilinato · Lei 8.245/91', color: '#1a5276', bg: 'rgba(26,82,118,0.12)' },
    context:   'Locação de imóvel residencial — pessoa física. Inclui cláusulas de vistoria, garantia e reajuste.',
  },

  'aluguel-comercial': {
    titulo:    'CONTRATO DE LOCAÇÃO COMERCIAL',
    sign1:     { label: 'Locador',    placeholder: 'Nome / Razão Social do Locador' },
    sign2:     { label: 'Locatário',  placeholder: 'Razão Social do Locatário (CNPJ)' },
    lei:       'Lei 8.245/91 — Arts. 51–57 (Locação Não Residencial)',
    leiShort:  'Lei 8.245/91 · Art. 51',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: true, testemunhas: true },
    footerLegal: 'Locação não residencial — Lei 8.245/91, Arts. 51–57',
    badge:     { text: 'Locação Comercial · Lei 8.245/91 Art. 51', color: '#1a5276', bg: 'rgba(26,82,118,0.12)' },
    context:   'Locação comercial — CNPJ obrigatório. Direito à renovação compulsória (Art. 51). Atenção a benfeitorias e destinação.',
  },

  'aluguel-veiculo': {
    titulo:    'CONTRATO DE LOCAÇÃO DE VEÍCULO',
    sign1:     { label: 'Locador',    placeholder: 'Locador / Proprietário do veículo' },
    sign2:     { label: 'Locatário',  placeholder: 'Locatário / Condutor responsável' },
    lei:       'Código Civil — Arts. 565–578 (Locação de Coisas)',
    leiShort:  'CC Arts. 565–578',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: false, testemunhas: false },
    footerLegal: 'Locação de coisas móveis — CC Arts. 565–578',
    badge:     { text: 'Locação de Veículo · CC Arts. 565–578', color: '#6e2f8a', bg: 'rgba(110,47,138,0.10)' },
    context:   'Locação de bem móvel — inclui placa, quilometragem, sinistros e responsabilidade por danos.',
  },

  'prestacao-servicos': {
    titulo:    'CONTRATO DE PRESTAÇÃO DE SERVIÇOS',
    sign1:     { label: 'Contratante', placeholder: 'Razão Social / Nome do Contratante' },
    sign2:     { label: 'Contratado',  placeholder: 'Razão Social / Nome do Contratado' },
    lei:       'Código Civil — Arts. 593–609 (Prestação de Serviço)',
    leiShort:  'CC Arts. 593–609',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: true, testemunhas: false },
    footerLegal: 'Prestação de Serviços — CC Arts. 593–609 | Sem vínculo empregatício (Súm. 331 TST)',
    badge:     { text: 'Prestação de Serviços · CC Arts. 593–609', color: '#0e6655', bg: 'rgba(14,102,85,0.10)' },
    context:   'Serviços entre PJ/PF. Atenção: sem subordinação para não configurar vínculo CLT (Súmula 331 TST).',
  },

  'trabalho-freelance': {
    titulo:    'CONTRATO DE TRABALHO AUTÔNOMO / FREELANCE',
    sign1:     { label: 'Contratante', placeholder: 'Razão Social / Nome do Contratante' },
    sign2:     { label: 'Prestador',   placeholder: 'Nome / Razão Social do Prestador' },
    lei:       'CC Art. 593 + Lei 13.429/2017 + IN RFB 971/2009',
    leiShort:  'CC Art. 593 · Lei 13.429/17',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: true, testemunhas: false },
    footerLegal: 'Trabalho autônomo — CC Art. 593 | Sem vínculo empregatício | Retenção ISS/INSS conforme regime',
    badge:     { text: 'Freelance · CC Art. 593 · Lei 13.429/17', color: '#784212', bg: 'rgba(120,66,18,0.10)' },
    context:   'Autônomo/freelancer — CPF ou CNPJ. Verificar retenções tributárias (ISS, INSS, IRRF) conforme IN RFB 971/2009.',
  },

  'compra-venda': {
    titulo:    'CONTRATO DE COMPRA E VENDA',
    sign1:     { label: 'Vendedor',  placeholder: 'Nome completo / Razão Social do Vendedor' },
    sign2:     { label: 'Comprador', placeholder: 'Nome completo / Razão Social do Comprador' },
    lei:       'Código Civil — Arts. 481–532 (Compra e Venda)',
    leiShort:  'CC Arts. 481–532',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: true, testemunhas: true },
    footerLegal: 'Compra e Venda — CC Arts. 481–532 | Evicção: CC Art. 447 | Vícios ocultos: CC Art. 441',
    badge:     { text: 'Compra e Venda · CC Arts. 481–532', color: '#1a5276', bg: 'rgba(26,82,118,0.12)' },
    context:   'Transferência de propriedade — móvel ou imóvel. Inclui garantia por evicção e vícios ocultos (CC Arts. 441–448).',
  },

  'parceria': {
    titulo:    'CONTRATO DE PARCERIA COMERCIAL',
    sign1:     { label: 'Parceiro A', placeholder: 'Razão Social / Nome do Parceiro A' },
    sign2:     { label: 'Parceiro B', placeholder: 'Razão Social / Nome do Parceiro B' },
    lei:       'Código Civil — Arts. 981–1.141 (Sociedade) + Art. 421 (Liberdade contratual)',
    leiShort:  'CC Art. 421 · Arts. 981+',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: true, testemunhas: false },
    footerLegal: 'Parceria Comercial — CC Art. 421 (Liberdade Contratual) | Resultado não garante sociedade de fato',
    badge:     { text: 'Parceria Comercial · CC Art. 421', color: '#0e6655', bg: 'rgba(14,102,85,0.10)' },
    context:   'Joint venture ou parceria operacional. Cuidado: partilha de lucros pode configurar sociedade irregular — incluir cláusula de exclusão (CC Art. 981).',
  },

  'nda': {
    titulo:    'ACORDO DE CONFIDENCIALIDADE (NDA)',
    sign1:     { label: 'Divulgante', placeholder: 'Nome / Razão Social da parte Divulgante' },
    sign2:     { label: 'Receptor',   placeholder: 'Nome / Razão Social da parte Receptora' },
    lei:       'CC Art. 927 (Responsabilidade Civil) + LGPD (Lei 13.709/2018)',
    leiShort:  'CC Art. 927 · LGPD 13.709/18',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: true, testemunhas: false },
    footerLegal: 'NDA — CC Art. 927 | LGPD Lei 13.709/2018 | Violação sujeita a perdas e danos + multa contratual',
    badge:     { text: 'NDA · CC Art. 927 · LGPD 13.709/18', color: '#6e2f8a', bg: 'rgba(110,47,138,0.10)' },
    context:   'Confidencialidade unilateral ou bilateral. Cobre segredos industriais, dados pessoais (LGPD), algoritmos e estratégias de negócio.',
  },

  'danos': {
    titulo:    'INSTRUMENTO PARTICULAR DE COBRANÇA POR DANOS',
    sign1:     { label: 'Credor',  placeholder: 'Nome / Razão Social do Credor (quem sofreu o dano)' },
    sign2:     { label: 'Devedor', placeholder: 'Nome / Razão Social do Devedor (responsável pelo dano)' },
    lei:       'Código Civil — Art. 186 (Ato Ilícito) + Art. 927 (Obrigação de Indenizar)',
    leiShort:  'CC Arts. 186 e 927',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: false, testemunhas: true },
    footerLegal: 'Cobrança por Danos — CC Art. 186 (Ato Ilícito) e Art. 927 (Responsabilidade Civil)',
    badge:     { text: 'Cobrança de Danos · CC Arts. 186 e 927', color: '#922b21', bg: 'rgba(146,43,33,0.10)' },
    context:   'Instrumento de confissão de dívida por dano causado. Pode ser título executivo extrajudicial se assinado por 2 testemunhas (CPC Art. 784, III).',
  },

  'emprestimo': {
    titulo:    'CONTRATO DE MÚTUO / EMPRÉSTIMO',
    sign1:     { label: 'Mutuante', placeholder: 'Nome / Razão Social do Mutuante (quem empresta)' },
    sign2:     { label: 'Mutuário', placeholder: 'Nome / Razão Social do Mutuário (quem recebe)' },
    lei:       'Código Civil — Arts. 586–592 (Mútuo)',
    leiShort:  'CC Arts. 586–592',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: false, testemunhas: true },
    footerLegal: 'Contrato de Mútuo — CC Arts. 586–592 | Juros limitados a 1% a.m. (CC Art. 591 c/c Lei Usura)',
    badge:     { text: 'Mútuo / Empréstimo · CC Arts. 586–592', color: '#1a5276', bg: 'rgba(26,82,118,0.12)' },
    context:   'Empréstimo de dinheiro ou bem fungível. Juros máximos: 1% a.m. (CC Art. 591). Com testemunhas = título executivo extrajudicial.',
  },

  'trabalho': {
    titulo:    'CONTRATO INDIVIDUAL DE TRABALHO',
    sign1:     { label: 'Empregador', placeholder: 'Razão Social da Empresa (CNPJ)' },
    sign2:     { label: 'Empregado',  placeholder: 'Nome completo do Empregado (CPF/CTPS)' },
    lei:       'CLT — Arts. 442–456 + NR aplicáveis + Lei 13.467/2017 (Reforma Trabalhista)',
    leiShort:  'CLT Arts. 442–456 · Lei 13.467/17',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: true, testemunhas: false },
    footerLegal: 'Contrato de Trabalho — CLT Arts. 442–456 | Reforma Trabalhista Lei 13.467/2017 | FGTS obrigatório',
    badge:     { text: 'CLT Arts. 442–456 · Reforma Trabalhista 13.467/17', color: '#145a32', bg: 'rgba(20,90,50,0.10)' },
    context:   'Vínculo empregatício CLT. Obrigatório: registro em CTPS, FGTS (8% s/ salário), INSS patronal. Verificar NRs aplicáveis à função.',
  },

  'generico': {
    titulo:    'DOCUMENTO PARTICULAR',
    sign1:     { label: 'Parte A', placeholder: 'Nome / Razão Social da Parte A' },
    sign2:     { label: 'Parte B', placeholder: 'Nome / Razão Social da Parte B' },
    lei:       'Código Civil — Art. 421 (Liberdade Contratual) + Art. 425 (Contratos Atípicos)',
    leiShort:  'CC Arts. 421 e 425',
    foro:      true,
    chips:     { numerarClausulas: true, espacoAssinatura: true, dataLocal: true, paginacao: true, rodape: true, govbr: false, testemunhas: false },
    footerLegal: 'Documento particular — CC Arts. 421 e 425 | Princípio da liberdade contratual',
    badge:     { text: 'Contrato Atípico · CC Arts. 421 e 425', color: '#424949', bg: 'rgba(66,73,73,0.10)' },
    context:   'Documento de uso geral. Adapte o tipo ao conteúdo para obter as referências legais corretas.',
  },
};

/* Retrocompatibilidade: PRESET_TITLES derivado do PRESET_CONFIG */
const PRESET_TITLES = Object.fromEntries(
  Object.entries(PRESET_CONFIG).map(([k, v]) => [k, v.titulo])
);

/* ════════════════════════════════════════════
   AUTO-SCALE PREVIEW
   Scales the 794px-wide doc page to fit its
   container, so the preview always matches
   the visual layout on any screen size.
════════════════════════════════════════════ */
function scaleDocPreview(wrapperId) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;
  const docW = 794;
  const container = wrapper.closest('.doc-frame') || wrapper.parentElement;
  const availW = container ? container.clientWidth - 2 : 0;
  if (!availW) return;

  if (wrapperId === 'preview-pages-wrap') {
    // Contract: page is a child .doc-page
    const page = wrapper.querySelector('.doc-page');
    if (!page) return;
    if (availW < docW) {
      const scale = availW / docW;
      page.style.transform = `scale(${scale})`;
      page.style.transformOrigin = 'top center';
      wrapper.style.height = Math.ceil(page.scrollHeight * scale) + 'px';
      wrapper.style.overflow = 'hidden';
    } else {
      page.style.transform = '';
      page.style.transformOrigin = '';
      wrapper.style.height = '';
      wrapper.style.overflow = '';
    }
  } else {
    // CV / Email: wrapper itself is the A4 page div
    if (availW < docW) {
      const scale = availW / docW;
      wrapper.style.transform = `scale(${scale})`;
      wrapper.style.transformOrigin = 'top center';
      const parent = wrapper.parentElement;
      if (parent) parent.style.height = Math.ceil(wrapper.scrollHeight * scale) + 'px';
    } else {
      wrapper.style.transform = '';
      wrapper.style.transformOrigin = '';
      const parent = wrapper.parentElement;
      if (parent) parent.style.height = '';
    }
  }
}
function scaleAllPreviews() {
  scaleDocPreview('preview-pages-wrap');
  scaleDocPreview('cv-preview');
  scaleDocPreview('email-preview');
}
window.addEventListener('resize', scaleAllPreviews);

/* ════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════ */
function navigate(tab, sidebarEl, bnId) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  document.querySelectorAll('.sidebar .nav-item').forEach(n => n.classList.remove('active'));
  if (sidebarEl) sidebarEl.classList.add('active');
  else {
    const map = { home: 0, formatar: 2, curriculo: 3, email: 4 };
    const items = document.querySelectorAll('.sidebar .nav-item');
    if (items[map[tab]]) items[map[tab]].classList.add('active');
  }
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
  const bnEl = document.getElementById(bnId || 'bn-' + tab);
  if (bnEl) bnEl.classList.add('active');

  // 🔁 Toggle Inteligente: email mode → ocultar Assinante 1 e Assinante 2
  const sign1Row = document.getElementById('sign1-name')?.closest('.fg');
  const sign2Row = document.getElementById('sign2-name')?.closest('.fg');
  const signParent = sign1Row?.parentElement; // .form-row contendo ambos
  if (signParent) {
    signParent.style.display = (tab === 'email') ? 'none' : '';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function quickPreset(preset) {
  navigate('formatar');
  setTimeout(() => {
    const btn = document.querySelector(`[data-preset="${preset}"]`);
    if (btn) selectPreset(btn);
    document.getElementById('input-text').focus();
  }, 80);
}

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Options chips
  document.querySelectorAll('[data-opt]').forEach(btn => {
    formatOpts[btn.dataset.opt] = btn.classList.contains('on');
    btn.addEventListener('click', () => {
      formatOpts[btn.dataset.opt] = !formatOpts[btn.dataset.opt];
      btn.classList.toggle('on', formatOpts[btn.dataset.opt]);
    });
  });
  // Date
  document.getElementById('doc-data').value = new Date().toISOString().split('T')[0];
  // Auto-detect toggle
  document.getElementById('auto-detect-toggle').addEventListener('change', function() {
    if (!this.checked) document.getElementById('detect-banner-wrap').style.display = 'none';
  });
  // Text area char count + detect on input (debounced)
  document.getElementById('input-text').addEventListener('input', () => {
    updateCount();
    clearTimeout(window._detectTimer);
    window._detectTimer = setTimeout(runAutoDetect, 600);
  });
  // Paste → análise imediata após o browser inserir o texto
  document.getElementById('input-text').addEventListener('paste', () => {
    updateCount();
    clearTimeout(window._detectTimer);
    window._detectTimer = setTimeout(() => {
      const text = document.getElementById('input-text').value;
      analisarTextoInteligente(text);
    }, 120); // aguarda o browser concluir o paste
  });
  // WM opacity slider
  const slider = document.getElementById('wm-opacity');
  slider.addEventListener('input', () => {
    document.getElementById('wm-opacity-val').textContent = slider.value + '%';
  });
  // Skills input
  document.getElementById('skills-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = this.value.trim().replace(/,$/, '');
      if (val && !cvSkills.includes(val)) { cvSkills.push(val); renderSkills(); }
      this.value = '';
    }
  });
  // Initial exp/edu
  addExp(); addEdu();
});

/* ════════════════════════════════════════════
   AUTO-DETECT  (Fingerprints por tipo)
════════════════════════════════════════════ */
const DETECT_FP = {
  'aluguel-residencial': { title:'Aluguel Residencial',    icon:'🏠', kw:[/locador/i,/locat[aá]rio/i,/im[oó]vel residencial/i,/aluguel/i,/vistoria/i,/fiador/i,/cau[çc][aã]o/i] },
  'aluguel-comercial':   { title:'Aluguel Comercial',      icon:'🏢', kw:[/locador/i,/locat[aá]rio/i,/im[oó]vel comercial/i,/ponto comercial/i,/CNPJ/i,/fundo de com[eé]rcio/i] },
  'aluguel-veiculo':     { title:'Locação de Veículo',     icon:'🚗', kw:[/ve[ií]culo/i,/placa/i,/quilometragem/i,/locador/i,/combust[ií]vel/i,/sinistro/i] },
  'prestacao-servicos':  { title:'Prestação de Serviços',  icon:'🤝', kw:[/prestador/i,/contratante/i,/contratado/i,/honor[aá]r/i,/escopo/i,/entreg[aá]vel/i] },
  'trabalho-freelance':  { title:'Freelance / Autônomo',   icon:'💼', kw:[/freelance/i,/aut[oô]nomo/i,/profissional liberal/i,/demanda/i,/pagamento por projeto/i] },
  'compra-venda':        { title:'Compra e Venda',         icon:'💰', kw:[/comprador/i,/vendedor/i,/pre[çc]o de venda/i,/escritura/i,/transfer[eê]ncia/i] },
  'parceria':            { title:'Parceria Comercial',     icon:'🔗', kw:[/parceiro/i,/parceria/i,/lucros/i,/joint venture/i,/colabora[çc][aã]o/i] },
  'nda':                 { title:'NDA / Confidencialidade',icon:'🔒', kw:[/confidencial/i,/sigilo/i,/NDA/i,/n[aã]o divulg/i,/propriedade intelectual/i] },
  'danos':               { title:'Cobrança por Danos',     icon:'⚠️', kw:[/danos/i,/preju[ií]zos/i,/indeniza[çc][aã]o/i,/ressarcimento/i,/responsabilidade civil/i] },
  'emprestimo':          { title:'Empréstimo / Mútuo',     icon:'💳', kw:[/mutu[aá]rio/i,/mutuante/i,/empr[eé]stimo/i,/devedor/i,/credor/i,/juros/i] },
  'trabalho':            { title:'Contrato de Trabalho',   icon:'📋', kw:[/empregado/i,/empregador/i,/sal[aá]rio/i,/CLT/i,/jornada/i,/FGTS/i] },
};

/* ════════════════════════════════════════════
   CONTEXT MAPPER — Score thresholds
   Score ≥ 2 → sugestão (suggest)
   Score ≥ 4 → auto-aplica preset
════════════════════════════════════════════ */
const CM_SCORE_SUGGEST   = 2;
const CM_SCORE_AUTO      = 4;

function autoDetect(text) {
  let best = null, bestScore = 0;
  for (const [preset, fp] of Object.entries(DETECT_FP)) {
    const score = fp.kw.filter(rx => rx.test(text)).length;
    if (score > bestScore) { bestScore = score; best = { preset, ...fp, score }; }
  }
  if (!best || bestScore < CM_SCORE_SUGGEST) return null;
  return { ...best, confidence: Math.min(100, Math.round((best.score / best.kw.length) * 100)) };
}

/* ════════════════════════════════════════════
   AUTO-FILL ENGINE — analisarTextoInteligente
   Pipeline: Normalize → Pattern Extraction →
   Confidence Score → Apply Fields → UI Feedback
════════════════════════════════════════════ */

/* ── Confidence thresholds ── */
const AF_THRESHOLD_APPLY  = 60;   // aplica automaticamente acima disso
const AF_THRESHOLD_SUGGEST = 35;  // sugere (não aplica) acima disso

/* ── Regex patterns ── */
const AF_PATTERNS = {

  // ① TÍTULO: primeiras 5 linhas, CAIXA ALTA, ≥3 palavras, ≤120 chars
  titulo: {
    extract(lines) {
      const rx = /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇÀÈÌÒÙÄ\s\/\-–—\.]{10,120}$/;
      for (const line of lines.slice(0, 5)) {
        const t = line.trim();
        if (!t) continue;
        if (t !== t.toUpperCase()) continue;          // deve ser tudo maiúscula
        if (!rx.test(t)) continue;                    // charset jurídico
        if (t.split(/\s+/).filter(Boolean).length < 3) continue; // ≥ 3 palavras
        // Rejeita linhas que parecem apenas datas ou números
        if (/^\d[\d\/\-\s]+$/.test(t)) continue;
        return { value: t, confidence: 90 };
      }
      return null;
    }
  },

  // ② CIDADE / ESTADO: múltiplos padrões
  cidade: {
    patterns: [
      // "São Paulo – SP, 2 de abril de 2026" ou sem data
      { rx: /([A-ZÁÉÍÓÚÂÊÎÔÛÃÕA-Za-záéíóúâêîôûãõ][^\n,–\-]{2,35}?)\s*[–\-]\s*([A-Z]{2})\s*[,\n]/, fmt: (m) => `${m[1].trim()} – ${m[2]}`, conf: 88 },
      // "São Paulo, 2 de abril de 2026"
      { rx: /^([A-ZÁÉÍÓÚÂÊÎÔÛÃÕA-Za-záéíóúâêîôûãõ][^\n,]{2,40}),\s*\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/m, fmt: (m) => m[1].trim(), conf: 85 },
      // "Local: São Paulo – SP"
      { rx: /local[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕA-Za-záéíóúâêîôûãõ][^\n,]{2,40})/i, fmt: (m) => m[1].trim(), conf: 80 },
      // "em São Paulo – SP,"
      { rx: /\bem\s+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕA-Za-záéíóúâêîôûãõ][^\n,]{2,40}?(?:\s*[–\-]\s*[A-Z]{2})?),/m, fmt: (m) => m[1].trim(), conf: 72 },
      // "Cidade – UF" isolado no texto
      { rx: /\b([A-ZÁÉÍÓÚÂÊÎÔÛÃÕA-Za-záéíóúâêîôûãõ][a-záéíóúâêîôûãõ]+(?:\s+[A-Za-záéíóúâêîôûãõ]+){0,3})\s*[–\-]\s*(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/, fmt: (m) => `${m[1].trim()} – ${m[2]}`, conf: 78 },
    ],
    extract(text) {
      for (const p of this.patterns) {
        const m = text.match(p.rx);
        if (m) {
          const val = p.fmt(m).replace(/\.$/, '').replace(/\s{2,}/g, ' ').trim();
          if (val.length >= 3) return { value: val, confidence: p.conf };
        }
      }
      return null;
    }
  },

  // ③ DATA: regex canônico \d{1,2}\s+de\s+\w+\s+de\s+\d{4} → YYYY-MM-DD
  // Retorna null se não encontrar data no texto — o campo usa o valor
  // padrão (hoje) definido no DOMContentLoaded, sem sobrescrever silenciosamente.
  data: {
    MESES: { janeiro:1,fevereiro:2,marco:3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12 },
    extract(text) {
      const rxLong = /\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/i;
      const m = text.match(rxLong);
      if (m) {
        const parts = m[0].match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i);
        if (parts) {
          const mesKey = parts[2].toLowerCase()
            .replace(/ç/g,'c').replace(/ã/g,'a').replace(/á/g,'a')
            .replace(/é/g,'e').replace(/ê/g,'e').replace(/í/g,'i')
            .replace(/ó/g,'o').replace(/ô/g,'o').replace(/ú/g,'u');
          const mes = this.MESES[mesKey];
          if (mes) {
            const d = `${parts[3]}-${String(mes).padStart(2,'0')}-${String(parts[1]).padStart(2,'0')}`;
            return { value: d, confidence: 85 };
          }
        }
      }
      // Nenhuma data encontrada no texto — retorna null, não aplica nada
      return null;
    }
  },

  // ④ NÚMERO DO DOCUMENTO: padrões como "001/2026", "Nº 12/2025"
  numero: {
    extract(text) {
      const rxs = [
        /n[º°uo]\.?\s*(\d{1,6}[\/-]\d{2,4})/i,
        /processo[\s#:]+(\d[\d\.\-\/]+)/i,
        /ref(?:er[eê]ncia)?[\s.:]+([A-Z0-9][\w\-\/]{2,20})/i,
        /contrato[\s#nº]*(\d{1,6}[\/-]\d{2,4})/i,
      ];
      for (const rx of rxs) {
        const m = text.match(rx);
        if (m) return { value: m[1].trim(), confidence: 80 };
      }
      return null;
    }
  },

  // ⑤ PARTES (Assinante 1 & 2)
  // Regex canônico: primeiro match → Assinante 1, segundo match → Assinante 2
  partes: {
    LABEL_RX: /(Contratante|Contratado|Locador|Locatário|Vendedor|Comprador|Outorgante):\s*(.+)/gi,
    extract(text) {
      const found = { sign1: null, sign2: null };
      // Itera todos os matches na ordem em que aparecem no texto
      const matches = [...text.matchAll(this.LABEL_RX)];
      if (matches[0]) {
        const name = matches[0][2].trim().replace(/\s{2,}/g, ' ').split(/[,\n]/)[0].trim();
        if (name.length >= 3) found.sign1 = { value: name, confidence: 82 };
      }
      if (matches[1]) {
        const name = matches[1][2].trim().replace(/\s{2,}/g, ' ').split(/[,\n]/)[0].trim();
        if (name.length >= 3) found.sign2 = { value: name, confidence: 82 };
      }
      return found;
    }
  },
};

/* ── Normaliza o texto antes de processar ── */
function normalizarTexto(raw) {
  return raw
    .replace(/\r\n/g, '\n')                     // CRLF → LF
    .replace(/\r/g, '\n')                        // CR antigo
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '') // zero-width chars
    .replace(/[ \t]{2,}/g, ' ')                 // múltiplos espaços/tabs → 1
    .trim();
}

/* ── Aplica um campo no DOM com feedback visual (.auto-filled) ── */
/* ── Aplica um campo no DOM com feedback visual (.auto-filled)
   Regra única para todos os campos:
   - Se vazio → preenche sempre.
   - Se já tem valor digitado pelo usuário → nunca sobrescreve.
   - Exceção doc-titulo: permite sobrescrever se o valor atual
     for um dos títulos padrão de preset (gerado automaticamente),
     pois o usuário não o digitou manualmente. ── */
function _applyField(id, value, confidence, label) {
  const el = document.getElementById(id);
  if (!el || !value) return false;

  const current = el.value.trim();
  if (current) {
    const isPresetDefault = id === 'doc-titulo' &&
      Object.values(PRESET_TITLES).includes(current);
    if (!isPresetDefault) return false;
  }

  el.value = value;
  el.classList.add('auto-filled');
  setTimeout(() => el.classList.remove('auto-filled'), 2000);
  return true;
}

/* ── Alias semântico para campos de assinatura — mesma regra ── */
function _applySignField(id, value) {
  return _applyField(id, value, 0, '');
}

/* ── Renderiza o painel de feedback do Auto-Fill ── */
function _renderAutoFillFeedback(fields) {
  const wrap = document.getElementById('detect-banner-wrap');
  if (!fields.length) return;

  // Agrupa: primeiro a detecção de tipo (se houver), depois campos extraídos
  const rows = fields.map(f => `
    <div class="af-field-row">
      <span class="af-field-icon">${f.icon}</span>
      <div class="af-field-body">
        <div class="af-field-label">${f.label}</div>
        <div class="af-field-value">${f.value}</div>
      </div>
      <div class="af-conf-badge" style="--conf:${f.confidence}%">${f.confidence}%</div>
    </div>`).join('');

  wrap.style.display = 'block';
  wrap.innerHTML = `
    <div class="detect-banner af-engine-banner">
      <div class="af-header">
        <span class="af-header-icon">🧠</span>
        <div class="af-header-body">
          <div class="af-header-title">Auto-Fill detectou ${fields.length} campo${fields.length>1?'s':''}</div>
          <div class="af-header-sub">Campos marcados em verde foram preenchidos automaticamente</div>
        </div>
        <button class="af-dismiss" onclick="document.getElementById('detect-banner-wrap').style.display='none'">✕</button>
      </div>
      <div class="af-fields">${rows}</div>
    </div>`;
}

/* ════════════════════════════════════════════
   🎯 FUNÇÃO PRINCIPAL: analisarTextoInteligente
════════════════════════════════════════════ */
function analisarTextoInteligente(text) {
  if (!document.getElementById('auto-detect-toggle')?.checked) return;
  if (!text || text.length < 60) return;

  // STEP 1 — Normalize
  const normalized = normalizarTexto(text);
  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

  const applied = [];   // campos realmente aplicados
  const detected = [];  // itens para o painel de feedback

  // STEP 2 — Pattern Extraction + Confidence + Apply

  // ①  Título
  const tResult = AF_PATTERNS.titulo.extract(lines);
  if (tResult && tResult.confidence >= AF_THRESHOLD_SUGGEST) {
    const ok = _applyField('doc-titulo', tResult.value, tResult.confidence, 'Título');
    if (ok) {
      applied.push('doc-titulo');
      detected.push({ icon:'📄', label:'Título do Documento', value: tResult.value, confidence: tResult.confidence });
    }
  }

  // ②  Cidade
  const cResult = AF_PATTERNS.cidade.extract(normalized);
  if (cResult && cResult.confidence >= AF_THRESHOLD_SUGGEST) {
    const ok = _applyField('doc-cidade', cResult.value, cResult.confidence, 'Cidade');
    if (ok) {
      applied.push('doc-cidade');
      detected.push({ icon:'📍', label:'Cidade – Estado', value: cResult.value, confidence: cResult.confidence });
    }
  }

  // ③  Data
  const dResult = AF_PATTERNS.data.extract(normalized);
  // Só aplica se encontrou data real no texto (confidence >= threshold).
  // Se não encontrou, deixa o valor padrão definido no DOMContentLoaded (hoje).
  if (dResult && dResult.confidence >= AF_THRESHOLD_SUGGEST) {
    const ok = _applyField('doc-data', dResult.value, dResult.confidence, 'Data');
    if (ok) {
      applied.push('doc-data');
      detected.push({ icon:'📅', label:'Data de Elaboração', value: dResult.value, confidence: dResult.confidence });
    }
  }

  // ④  Número
  const nResult = AF_PATTERNS.numero.extract(normalized);
  if (nResult && nResult.confidence >= AF_THRESHOLD_SUGGEST) {
    const ok = _applyField('doc-numero', nResult.value, nResult.confidence, 'Número');
    if (ok) {
      applied.push('doc-numero');
      detected.push({ icon:'🔢', label:'Número / Ref.', value: nResult.value, confidence: nResult.confidence });
    }
  }

  // ⑤  Partes (sign1 / sign2)
  const pResult = AF_PATTERNS.partes.extract(normalized);
  if (pResult.sign1 && pResult.sign1.confidence >= AF_THRESHOLD_SUGGEST) {
    const ok = _applySignField('sign1-name', pResult.sign1.value);
    if (ok) {
      applied.push('sign1-name');
      detected.push({ icon:'👤', label:'Assinante 1', value: pResult.sign1.value, confidence: pResult.sign1.confidence });
    }
  }
  if (pResult.sign2 && pResult.sign2.confidence >= AF_THRESHOLD_SUGGEST) {
    const ok = _applySignField('sign2-name', pResult.sign2.value);
    if (ok) {
      applied.push('sign2-name');
      detected.push({ icon:'👤', label:'Assinante 2', value: pResult.sign2.value, confidence: pResult.sign2.confidence });
    }
  }

  // ⑥  Tipo de documento (auto-detect por fingerprint)
  const typeResult = autoDetect(normalized);
  if (typeResult) {
    detected.push({ icon: typeResult.icon, label: 'Tipo de Documento', value: `${typeResult.title} · ${typeResult.confidence}% confiança`, confidence: typeResult.confidence });
  }

  // STEP 3 — UI Feedback
  if (detected.length > 0) {
    _renderAutoFillFeedback(detected);
  } else {
    document.getElementById('detect-banner-wrap').style.display = 'none';
  }

  // STEP 4 — Context Mapper: auto-aplica preset se score ≥ CM_SCORE_AUTO (4)
  if (typeResult && typeResult.score >= CM_SCORE_AUTO) {
    const btn = document.querySelector(`[data-preset="${typeResult.preset}"]`);
    if (btn) selectPreset(btn);
  }
}

/* ── Compatibilidade: runAutoDetect chama a nova engine ── */
function runAutoDetect() {
  const text = document.getElementById('input-text').value;
  analisarTextoInteligente(text);
}

function applyDetected(preset, title) {
  const btn = document.querySelector(`[data-preset="${preset}"]`);
  if (btn) selectPreset(btn);
  showToast(`Tipo aplicado: ${title}`, 'ok');
  document.getElementById('detect-banner-wrap').style.display = 'none';
}

/* ════════════════════════════════════════════
   PRESET
════════════════════════════════════════════ */
function selectPreset(btn) {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  currentPreset = btn.dataset.preset;

  const cfg = PRESET_CONFIG[currentPreset] || PRESET_CONFIG['generico'];

  /* ── 1. Título ─────────────────────────────────────── */
  const tituloEl = document.getElementById('doc-titulo');
  const allTitles = Object.values(PRESET_TITLES);
  if (!tituloEl.value || allTitles.includes(tituloEl.value)) {
    tituloEl.value = cfg.titulo;
    tituloEl.classList.add('auto-filled');
    setTimeout(() => tituloEl.classList.remove('auto-filled'), 1800);
  }

  /* ── 2. Labels e placeholders dos assinantes ─────────*/
  const s1El = document.getElementById('sign1-name');
  const s2El = document.getElementById('sign2-name');
  const s1LabelEl = document.getElementById('sign1-label');
  const s2LabelEl = document.getElementById('sign2-label');
  if (s1LabelEl) s1LabelEl.textContent = cfg.sign1.label;
  if (s2LabelEl) s2LabelEl.textContent = cfg.sign2.label;
  if (s1El) s1El.placeholder = cfg.sign1.placeholder;
  if (s2El) s2El.placeholder = cfg.sign2.placeholder;
  /* Limpa valores genéricos padrão ao trocar de preset */
  const genericSignals = ['PARTE CONTRATANTE','PARTE CONTRATADA','Parte A','Parte B',
    'Locador','Locatário','Contratante','Contratado','Vendedor','Comprador',
    'Divulgante','Receptor','Mutuante','Mutuário','Empregador','Empregado',
    'Credor','Devedor','Parceiro A','Parceiro B','Prestador'];
  if (s1El && genericSignals.includes(s1El.value.trim())) s1El.value = '';
  if (s2El && genericSignals.includes(s2El.value.trim())) s2El.value = '';

  /* ── 3. Chips — aplicar padrões do preset ────────────*/
  if (cfg.chips) {
    document.querySelectorAll('[data-opt]').forEach(chip => {
      const opt = chip.dataset.opt;
      if (opt in cfg.chips) {
        const on = cfg.chips[opt];
        formatOpts[opt] = on;
        chip.classList.toggle('on', on);
      }
    });
  }

  /* ── 4. Badge de conformidade legal ─────────────────*/
  _renderLegalBadge(cfg);
}

/* ── Renderiza o badge legal abaixo dos presets ── */
function _renderLegalBadge(cfg) {
  let wrap = document.getElementById('legal-badge-wrap');
  if (!wrap) {
    /* Cria o container logo após a grade de presets, se não existir */
    wrap = document.createElement('div');
    wrap.id = 'legal-badge-wrap';
    wrap.style.cssText = 'margin-top:10px;';
    const grid = document.getElementById('presets-container');
    if (grid) grid.insertAdjacentElement('afterend', wrap);
  }
  const badge = cfg.badge || {};
  const ctx   = cfg.context || '';
  wrap.innerHTML = `
    <div style="
      display:flex;align-items:flex-start;gap:10px;
      background:${badge.bg||'rgba(201,168,76,0.08)'};
      border:1px solid ${badge.color||'var(--ink)'}33;
      border-left:3px solid ${badge.color||'var(--ink)'};
      border-radius:var(--radius);padding:10px 13px;
      animation:fadeUp 0.2s ease;
    ">
      <span style="font-size:0.9rem;flex-shrink:0;margin-top:1px;">⚖️</span>
      <div style="min-width:0;">
        <div style="
          font-family:var(--font-mono);font-size:0.65rem;
          font-weight:600;letter-spacing:0.07em;
          color:${badge.color||'var(--ink)'};
          text-transform:uppercase;margin-bottom:3px;
        ">${badge.text||cfg.leiShort||''}</div>
        ${ctx ? `<div style="font-size:0.75rem;color:var(--text-2);line-height:1.5;">${ctx}</div>` : ''}
      </div>
    </div>`;
}
function updateCount() {
  const n = document.getElementById('input-text').value.length;
  document.getElementById('char-count').textContent = n.toLocaleString('pt-BR') + ' caracteres';
}

function limparFormulario() {
  // 1. Limpa o textarea e atualiza contador
  document.getElementById('input-text').value = '';
  updateCount();

  // 2. Limpa todos os campos preenchidos pelo auto-fill
  ['doc-titulo','doc-numero','doc-cidade','doc-data','sign1-name','sign2-name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // 3. Esconde o painel de detecção/auto-fill
  const banner = document.getElementById('detect-banner-wrap');
  if (banner) banner.style.display = 'none';

  // 4. Remove seleção de preset e volta ao genérico
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
  currentPreset = 'generico';

  // 5. Esconde o preview se estiver visível
  const preview = document.getElementById('preview-section');
  if (preview) preview.style.display = 'none';
}

/* ════════════════════════════════════════════
   TEXT PROCESSING
════════════════════════════════════════════ */
const CLAUSE_KW = [/\b(objeto|vigencia|vigência|prazo|valor|locaç|locac|serviç|servic|pagamento|rescis[ãa]o|obrigaç|multa|penalidade|garantia|vistoria|uso|sub(locaç|rogaç)|reajuste|índice|indice|foro|jurisdiç|compra|venda|prestação|confidencial|sigilo|propriedade|entrega|devolu[çc][aã]o|rescissão|cessão|cessao|arbitragem|inadimpl|mora|juros|vencimento|carência|renovação|prorrogaç|benfeitorias|conservaç|manutenç|notificaç|comunicaç|disposiç|gerais|finais)\b/i];
const ORDINAL_CLAUSE   = /^(\d+[ºo°ª]?\s*[-–—.])\s+\S/;
const CANONICAL_CLAUSE = /^(cl[aá]usula|artigo|art\.|§\s*\d)/i;
const SECTION_MARKER   = /^(da[s]?\s+|do[s]?\s+|de\s+)[A-ZÁÉÍÓÚÂÊÎÔÛÃÕ]/;

function isClauseTitle(line) {
  const t = line.trim();
  if (!t || t.length < 4) return false;
  if (CANONICAL_CLAUSE.test(t)) return true;
  if (ORDINAL_CLAUSE.test(t)) return true;
  const isAllCaps = t === t.toUpperCase() && /[A-ZÁÉÍÓÚÂÊÎÔÛÃÕ]/.test(t);
  if (!isAllCaps) return false;
  if (t.includes(',')) return false;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;
  if (CLAUSE_KW.some(rx => rx.test(t))) return true;
  if (SECTION_MARKER.test(t) && words.length >= 3) return true;
  if (words.length >= 5 && !/\d/.test(t)) return true;
  return false;
}
function processText(rawText) {
  const blocks = [];
  const lines = rawText.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    // ── Detecção de tabela Markdown (|col|col|)
    if (/^\|.+\|/.test(t)) {
      const tableLines = [];
      while (i < lines.length && /^\|.+\|/.test(lines[i].trim())) {
        tableLines.push(lines[i].trim());
        i++;
      }
      blocks.push({ type: 'table', lines: tableLines });
      continue;
    }

    // ── Detecção de tabela tabulada (tabs ou 2+ espaços entre colunas)
    if (/\t/.test(t) && t.split('\t').filter(Boolean).length >= 2) {
      const tableLines = [];
      while (i < lines.length && /\t/.test(lines[i]) && lines[i].split('\t').filter(Boolean).length >= 2) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table-tab', lines: tableLines });
      continue;
    }

    if (!t) { blocks.push({ type: 'blank' }); i++; continue; }
    if (/^[-•·*]\s/.test(t) || /^\d+\)\s/.test(t)) { blocks.push({ type: 'list', text: t.replace(/^[-•·*]\s+/, '').replace(/^\d+\)\s+/, '') }); i++; continue; }
    if (isClauseTitle(t)) {
      const clauseMatch = t.match(/^(cl[aá]usula\s+\d+[ºoª°]*)\s*(?:\.|-–—|[-–—])\s*\.?\s*(.*)/i);
      if (clauseMatch) {
        const clauseTitle = clauseMatch[1].trim();
        const body        = clauseMatch[2].trim();
        if (body.length > 40) {
          blocks.push({ type: 'clause', text: clauseTitle });
          const bodyNorm = (body === body.toUpperCase())
            ? body.charAt(0) + body.slice(1).toLowerCase()
            : body;
          blocks.push({ type: 'para', text: bodyNorm });
          i++; continue;
        } else if (body.length > 0) {
          blocks.push({ type: 'clause', text: clauseTitle + (body ? ' — ' + body : '') });
          i++; continue;
        }
      }
      blocks.push({ type: 'clause', text: t });
      i++; continue;
    }
    blocks.push({ type: 'para', text: t });
    i++;
  }
  return blocks;
}
function renderBlocks(blocks, numerarClausulas) {
  let html = '', clausulaNum = 0, i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === 'blank') { i++; continue; }

    // ── Tabela Markdown
    if (b.type === 'table') {
      const rows = b.lines.filter(l => !/^\|[-:\s|]+\|$/.test(l)); // remove linha separadora
      if (rows.length > 0) {
        const header = rows[0].split('|').filter(c => c.trim() !== '');
        const body   = rows.slice(1);
        html += `<div class="doc-table-wrap"><table class="doc-table">
          <thead><tr>${header.map(h => `<th>${esc(h.trim())}</th>`).join('')}</tr></thead>
          <tbody>${body.map(r => {
            const cells = r.split('|').filter(c => c.trim() !== '');
            return `<tr>${cells.map(c => `<td>${esc(c.trim())}</td>`).join('')}</tr>`;
          }).join('')}</tbody>
        </table></div>`;
      }
      i++; continue;
    }

    // ── Tabela tabulada
    if (b.type === 'table-tab') {
      const rows = b.lines.map(l => l.split('\t').map(c => c.trim()).filter(Boolean));
      if (rows.length > 0) {
        const header = rows[0];
        const body   = rows.slice(1);
        html += `<div class="doc-table-wrap"><table class="doc-table">
          <thead><tr>${header.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
          <tbody>${body.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>`;
      }
      i++; continue;
    }

    if (b.type === 'clause') {
      clausulaNum++;
      const clean = b.text
        .replace(/^cl[aá]usula\s+\d+[ºoª°]*\s*[-–—]?\s*\.?\s*/i,'')
        .replace(/^art(?:igo)?\s*\.\s*\d+[ºoª°]*\s*[-–—]?\s*\.?\s*/i,'')
        .replace(/^\d+[ºoª°]*\s*[-–—.]\s*/i,'')
        .replace(/^\.\s*/,'')
        .replace(/^[-–—]\s*/,'')
        .replace(/\s*[-–—]\s*$/,'')
        .trim();
      const numMatch = b.text.match(/\d+/);
      const numOrd   = numMatch ? numMatch[0] : String(clausulaNum);
      const titleDisplay = numerarClausulas
        ? `CLÁUSULA ${clausulaNum}ª${clean ? ' — ' + clean.toUpperCase() : ''}`
        : (clean ? clean.toUpperCase() : `CLÁUSULA ${numOrd}ª`);
      let clauseContent = ''; i++;
      while (i < blocks.length && blocks[i].type !== 'clause') {
        const cb = blocks[i];
        if (cb.type === 'para')       clauseContent += `<p class="doc-clause-content">${esc(cb.text)}</p>`;
        if (cb.type === 'list')       clauseContent += `<div class="doc-list-item">${esc(cb.text)}</div>`;
        if (cb.type === 'table')      { /* renderiza inline */ const tmpBlocks = [cb]; clauseContent += renderBlocks(tmpBlocks, false); }
        if (cb.type === 'table-tab')  { const tmpBlocks = [cb]; clauseContent += renderBlocks(tmpBlocks, false); }
        i++;
      }
      html += `<div class="doc-clause-block"><div class="doc-clause-title">${esc(titleDisplay)}</div>${clauseContent}</div>`;
    } else if (b.type === 'para') {
      html += `<p class="doc-para">${esc(b.text)}</p>`; i++;
    } else if (b.type === 'list') {
      html += `<div class="doc-list-item">${esc(b.text)}</div>`; i++;
    } else { i++; }
  }
  return html;
}
function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ════════════════════════════════════════════
   BUILD PAGINATED HTML PREVIEW
   Each .doc-page = one A4 sheet at 794×1123px
   Content area = 606×921px (25mm margins)
════════════════════════════════════════════ */
function buildPaginatedHtml(bodyHtml, opts) {
  const { titulo, numero, sign1, sign2, cidade, data } = opts;
  const opacity = (document.getElementById('wm-opacity')?.value || 12) / 100;

  // Watermark HTML
  function wmPage(pos) {
    if (!wmDataUrl) return '';
    const styles = {
      center:       `top:50%;left:50%;transform:translate(-50%,-50%);width:55%;opacity:${opacity}`,
      'top-left':   `top:16mm;left:16mm;width:28%;opacity:${opacity}`,
      'top-right':  `top:16mm;right:16mm;width:28%;opacity:${opacity}`,
      'bottom-right':`bottom:24mm;right:16mm;width:28%;opacity:${opacity}`,
    };
    return `<div class="doc-watermark" style="${styles[pos]||styles.center}"><img src="${wmDataUrl}" alt=""></div>`;
  }

  const logoHtml = logoDataUrl
    ? `<div class="doc-logo-row right"><img src="${logoDataUrl}" alt="Logo"></div>` : '';

  const docHeader = `
    <div class="doc-header-block">
      <div class="doc-title">${esc(titulo)}</div>
      ${numero ? `<div class="doc-subtitle">Nº ${esc(numero)}</div>` : ''}
    </div>`;

  let signHtml = '';
  if (formatOpts.espacoAssinatura) {
    const govBrHtml = formatOpts.govbr ? `
      <div class="govbr-box" style="margin-top:8mm;">
        <strong>□ Assinatura Digital via Gov.br / ICP-Brasil</strong>
        Acesse: <strong>gov.br/assinatura-eletronica</strong> — Validade jurídica conforme Lei nº 14.063/2020
      </div>` : '';
    const witnessHtml = formatOpts.testemunhas ? `
      <div class="witness-section">
        <div class="witness-title">Testemunhas</div>
        <div class="witness-area">
          <div class="witness-block"><div class="witness-line"></div><div class="witness-label">1ª Testemunha<br>Nome: ___________________________<br>CPF: ___________________</div></div>
          <div class="witness-block"><div class="witness-line"></div><div class="witness-label">2ª Testemunha<br>Nome: ___________________________<br>CPF: ___________________</div></div>
        </div>
      </div>` : '';
    signHtml = `
      <div class="sign-section">
        ${formatOpts.dataLocal ? `<p class="sign-location">${esc(cidade)}, ${data}.</p>` : ''}
        <div class="sign-area">
          <div class="sign-block">
            <div class="sign-space"></div>
            <div class="sign-name">${esc(sign1)}</div>
            <div class="sign-detail">CPF: ___.___.___-__</div>
          </div>
          <div class="sign-block">
            <div class="sign-space"></div>
            <div class="sign-name">${esc(sign2)}</div>
            <div class="sign-detail">CPF: ___.___.___-__</div>
          </div>
        </div>
        ${govBrHtml}
        ${witnessHtml}
      </div>`;
  }

  const cfg        = PRESET_CONFIG[currentPreset] || PRESET_CONFIG['generico'];
  const footerLegal = cfg.footerLegal || '';
  const footerBase = formatOpts.rodape
    ? `${esc(titulo)}${numero ? ' · Nº ' + esc(numero) : ''}` : '';

  // ── Área útil de conteúdo por página (px a 96dpi)
  // A4 = 1123px altura. Margens: topo 75px, fundo 94px, rodapé ~22px
  const PAGE_H = 1123;
  const MARGIN_TOP  = 75;
  const MARGIN_BOT  = formatOpts.rodape ? 116 : 94; // espaço extra p/ rodapé
  const CONTENT_H   = PAGE_H - MARGIN_TOP - MARGIN_BOT; // ~912px úteis

  // ── Mede o conteúdo completo num container off-screen de largura real
  const probe = document.createElement('div');
  probe.style.cssText = [
    'position:absolute', 'top:-9999px', 'left:-9999px',
    'width:606px',        // largura útil: 794 - 113(mL) - 75(mR)
    'font-family:"Times New Roman",Times,serif',
    'font-size:12pt', 'line-height:1.9', 'visibility:hidden',
  ].join(';');
  probe.innerHTML = bodyHtml + signHtml;
  document.body.appendChild(probe);
  const totalContentH = probe.scrollHeight;
  document.body.removeChild(probe);

  // ── Fatia o conteúdo em páginas usando os elementos-filho como unidade
  // Cada filho (cláusula, parágrafo, seção de assinatura) é medido
  // individualmente; nunca quebra no meio de um elemento.
  const probeWrap = document.createElement('div');
  probeWrap.style.cssText = [
    'position:absolute', 'top:-9999px', 'left:-9999px',
    'width:606px',
    'font-family:"Times New Roman",Times,serif',
    'font-size:12pt', 'line-height:1.9', 'visibility:hidden',
  ].join(';');
  probeWrap.innerHTML = bodyHtml + signHtml;
  document.body.appendChild(probeWrap);

  const allChildren = Array.from(probeWrap.childNodes).filter(
    n => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent.trim())
  );

  const pages   = [];   // array de strings HTML, uma por página
  let   pageContent = '';
  let   pageUsed    = 0; // px acumulados na página atual
  let   isFirst     = true;

  // Primeira página tem cabeçalho: mede quanto ele ocupa
  const headerProbe = document.createElement('div');
  headerProbe.style.cssText = probeWrap.style.cssText;
  headerProbe.innerHTML = (logoDataUrl
    ? `<div class="doc-logo-row right"><img src="${logoDataUrl}" style="max-height:36px;max-width:150px;"></div>` : '')
    + `<div class="doc-header-block"><div class="doc-title">${esc(titulo)}</div>${numero?`<div class="doc-subtitle">Nº ${esc(numero)}</div>`:''}</div>`;
  document.body.appendChild(headerProbe);
  const headerH = headerProbe.scrollHeight;
  document.body.removeChild(headerProbe);

  pageUsed = headerH;

  for (const child of allChildren) {
    const el = child.cloneNode(true);
    const measurer = document.createElement('div');
    measurer.style.cssText = probeWrap.style.cssText;
    measurer.appendChild(el);
    document.body.appendChild(measurer);
    const childH = measurer.scrollHeight;
    document.body.removeChild(measurer);

    if (pageUsed + childH > CONTENT_H && pageContent) {
      // Fecha página atual e abre nova
      pages.push(pageContent);
      pageContent = '';
      pageUsed    = 0;
      isFirst     = false;
    }

    pageContent += child.nodeType === Node.ELEMENT_NODE
      ? child.outerHTML
      : `<p class="doc-para">${child.textContent}</p>`;
    pageUsed += childH;
  }
  // Última página
  if (pageContent) pages.push(pageContent);

  document.body.removeChild(probeWrap);

  // ── Monta o HTML final com uma .doc-page por fatia
  const totalPages = Math.max(pages.length, 1);
  let result = '';

  pages.forEach((slice, idx) => {
    const pageNum  = idx + 1;
    const isFirstP = idx === 0;
    result += `<div class="doc-page">
      <div class="doc-page-content">
        <div class="doc-contract">
          ${isFirstP ? logoHtml : ''}
          ${isFirstP ? docHeader : ''}
          <div class="doc-body"${isFirstP ? ' id="doc-body-editable"' : ''}>${slice}</div>
        </div>
      </div>
      ${wmPage(wmPosition)}
      ${formatOpts.rodape ? `<div class="doc-footer"><span>${footerBase}${footerLegal ? ' · ' + esc(footerLegal) : ''}</span><span>Página ${pageNum} de ${totalPages}</span></div>` : ''}
    </div>`;
  });

  return result;
}

/* ════════════════════════════════════════════
   FORMAT DOCUMENT
════════════════════════════════════════════ */
function formatarDocumento() {
  const texto = document.getElementById('input-text').value.trim();
  if (!texto) { showToast('Cole o texto do contrato antes de formatar.', 'err'); return; }

  const cfg    = PRESET_CONFIG[currentPreset] || PRESET_CONFIG['generico'];
  const titulo  = document.getElementById('doc-titulo').value || cfg.titulo || 'CONTRATO';
  const numero  = document.getElementById('doc-numero').value;
  const cidade  = document.getElementById('doc-cidade').value || '___________________________';
  const dataRaw = document.getElementById('doc-data').value;
  const data    = dataRaw ? formatDate(dataRaw) : hojeFormatado();
  const sign1   = document.getElementById('sign1-name').value.trim() || cfg.sign1.label.toUpperCase();
  const sign2   = document.getElementById('sign2-name').value.trim() || cfg.sign2.label.toUpperCase();

  const blocks   = processText(texto);
  const bodyHtml = renderBlocks(blocks, formatOpts.numerarClausulas);
  const clauseCount = blocks.filter(b => b.type === 'clause').length;

  const pageHtml = buildPaginatedHtml(bodyHtml, { titulo, numero, sign1, sign2, cidade, data });

  const wrap = document.getElementById('preview-pages-wrap');
  wrap.innerHTML = pageHtml;
  scaleDocPreview('preview-pages-wrap');

  document.getElementById('preview-section').style.display = 'block';
  document.getElementById('preview-info').textContent =
    `${clauseCount} cláusula${clauseCount !== 1 ? 's' : ''} · ${texto.length.toLocaleString('pt-BR')} chars` +
    (logoDataUrl ? ' · logotipo' : '') + (wmDataUrl ? ' · marca d\'água' : '');

  document.getElementById('preview-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Documento formatado!', 'ok');
  setTimeout(() => scaleDocPreview('preview-pages-wrap'), 80);
}

/* ════════════════════════════════════════════
   EDIT PREVIEW — contenteditable toggle
════════════════════════════════════════════ */
let _previewEditMode = false;

function toggleEditPreview() {
  const body = document.getElementById('doc-body-editable');
  const btn  = document.getElementById('btn-edit-toggle');
  if (!body) { showToast('Formate o documento primeiro.', 'err'); return; }

  _previewEditMode = !_previewEditMode;

  if (_previewEditMode) {
    // Enable editing on the whole doc-contract area
    const contract = body.closest('.doc-contract') || body;
    contract.setAttribute('contenteditable', 'true');
    contract.setAttribute('spellcheck', 'true');
    contract.style.outline = 'none';
    contract.style.cursor  = 'text';
    // Mark as edited on any input
    contract.addEventListener('input', () => { body.dataset.edited = 'true'; }, { once: false, passive: true });
    // Visual cue: subtle golden left border on editable body
    body.style.borderLeft  = '2px solid var(--ink)';
    body.style.paddingLeft = '8px';
    btn.innerHTML = '✅ Concluir';
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-secondary');
    document.querySelector('#preview-section .preview-toolbar')?.classList.add('editing');
    showToast('Modo edição ativo — clique no texto para editar.', 'ok');
    // Focus the body for immediate editing
    setTimeout(() => body.focus(), 50);
  } else {
    const contract = body.closest('.doc-contract') || body;
    contract.removeAttribute('contenteditable');
    contract.style.cursor = '';
    body.style.borderLeft  = '';
    body.style.paddingLeft = '';
    btn.innerHTML = '✏️ Editar';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    document.querySelector('#preview-section .preview-toolbar')?.classList.remove('editing');
    if (body.dataset.edited === 'true') {
      showToast('Edição salva — PDF e DOCX refletirão o conteúdo editado.', 'ok');
    } else {
      showToast('Modo edição desativado.', 'ok');
    }
  }
}

/* ════════════════════════════════════════════
   PDF EXPORT — jsPDF VECTOR (REAL TEXT)
   
   Strategy:
   1. Collect all content from the built DOM
   2. Render to PDF using jsPDF native text calls
   3. Margins: 25mm left/right/top, 28mm bottom
   4. Fonts: times (serif) for body, helvetica for titles
   5. Images: base64 logo + watermark via addImage
   
   This produces real vector PDFs — searchable,
   copy-pasteable, sharp at any zoom/print size.
════════════════════════════════════════════ */
async function exportarPDF(tipo) {
  const btn = document.getElementById(
    tipo === 'contrato' ? 'btn-pdf-contrato' : tipo === 'cv' ? 'btn-pdf-cv' : tipo === 'email' ? 'btn-pdf-email' : null
  );
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Gerando…'; }

  showToast('Gerando PDF…');
  await new Promise(r => setTimeout(r, 80));

  try {
    const { jsPDF } = window.jspdf;

    if (tipo === 'contrato') {
      await exportContratoPDF();
    } else if (tipo === 'cv') {
      await exportCvPDF();
    } else if (tipo === 'email') {
      await exportEmailPDF();
    }
  } catch(e) {
    console.error(e);
    showToast('Erro ao gerar PDF. Tente novamente.', 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '⬇ PDF'; }
  }
}

/* ── Contract PDF ── */
async function exportContratoPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pW = 210, pH = 297;
  // Margens: Esq 3cm (encadernação), Sup 2cm, Dir 2,5cm, Inf 2,5cm — praxe contratual
  const mL = 30, mR = 25, mT = 20, mB = 25; // mL:3cm (encadernação) · mR/mT:2,5cm/2cm · mB:2,5cm — padrão OAB/Tribunais
  const cW = pW - mL - mR; // 160mm content width

  const titulo  = document.getElementById('doc-titulo').value || PRESET_TITLES[currentPreset] || 'CONTRATO';
  const numero  = document.getElementById('doc-numero').value;
  const cidade  = document.getElementById('doc-cidade').value || '___________________________';
  const dataRaw = document.getElementById('doc-data').value;
  const dataStr = dataRaw ? formatDate(dataRaw) : hojeFormatado();
  const _cfg    = PRESET_CONFIG[currentPreset] || PRESET_CONFIG['generico'];
  const sign1   = document.getElementById('sign1-name').value.trim() || _cfg.sign1.label.toUpperCase();
  const sign2   = document.getElementById('sign2-name').value.trim() || _cfg.sign2.label.toUpperCase();

  // Use edited preview content if available, otherwise fallback to original input
  const _editedBody = document.getElementById('doc-body-editable');
  const textoBase   = (_editedBody && _editedBody.dataset.edited === 'true')
    ? (_editedBody.innerText || _editedBody.textContent || '').trim()
    : document.getElementById('input-text').value.trim();
  const blocks  = processText(textoBase);

  let pageNum = 1;
  let y = mT;

  function newPage() {
    stampPageFooter();
    pdf.addPage();
    pageNum++;
    y = mT;
    addLogoAndWatermark();
  }
  function ensureSpace(needed) {
    if (y + needed > pH - mB) newPage();
  }
  function imgFmt(dataUrl) {
    if (!dataUrl) return 'JPEG';
    if (dataUrl.startsWith('data:image/png')) return 'PNG';
    if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
    return 'JPEG';
  }
  function addLogoAndWatermark() {
    if (logoDataUrl) {
      try { pdf.addImage(logoDataUrl, imgFmt(logoDataUrl), pW - mR - 40, mT, 40, 10, undefined, 'FAST'); } catch(e) {}
    }
    if (wmDataUrl) {
      const opacity = (document.getElementById('wm-opacity')?.value || 12) / 100;
      const wmW = 100, wmH = 100;
      const posMap = {
        center:       { x: (pW-wmW)/2, y: (pH-wmH)/2 },
        'top-left':   { x: mL, y: mT + 10 },
        'top-right':  { x: pW - mR - wmW, y: mT + 10 },
        'bottom-right':{ x: pW - mR - wmW, y: pH - mB - wmH },
      };
      const pos = posMap[wmPosition] || posMap.center;
      pdf.saveGraphicsState();
      pdf.setGState(pdf.GState({ opacity }));
      try { pdf.addImage(wmDataUrl, imgFmt(wmDataUrl), pos.x, pos.y, wmW, wmH, undefined, 'FAST'); } catch(e) {}
      pdf.restoreGraphicsState();
    }
  }
  function stampPageFooter() {
    if (formatOpts.paginacao || formatOpts.rodape) {
      const pCfg = PRESET_CONFIG[currentPreset] || PRESET_CONFIG['generico'];
      pdf.setFont('times', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(160,160,160);
      /* Linha separadora do rodapé */
      pdf.setDrawColor(200,200,200);
      pdf.setLineWidth(0.2);
      pdf.line(mL, pH - 13, pW - mR, pH - 13);
      if (formatOpts.rodape) {
        /* Linha 1: título + número */
        const footerTitle = titulo.substring(0, 52) + (numero ? ' · Nº ' + numero : '');
        pdf.text(footerTitle, mL, pH - 10);
        /* Linha 2: referência legal — diferencial B2B */
        if (pCfg.footerLegal) {
          pdf.setFontSize(6.5);
          pdf.setTextColor(180,180,180);
          pdf.text(pCfg.footerLegal, mL, pH - 6.5);
        }
      }
      if (formatOpts.paginacao) {
        pdf.setFontSize(7.5);
        pdf.setTextColor(160,160,160);
        pdf.text(`Página ${pageNum}`, pW - mR, pH - 8.5, { align: 'right' });
      }
    }
  }

  /* ── Tabelas (markdown `| col |` e tabuladas) — parser compartilhado com o preview ── */
  function parseTableBlock(b) {
    if (b.type === 'table') {
      const rows = b.lines.filter(l => !/^\|[-:\s|]+\|$/.test(l));
      if (!rows.length) return null;
      const header = rows[0].split('|').map(c => c.trim()).filter(c => c !== '');
      const body   = rows.slice(1).map(r => r.split('|').map(c => c.trim()).filter(c => c !== ''));
      return { header, body };
    }
    if (b.type === 'table-tab') {
      const rows = b.lines.map(l => l.split('\t').map(c => c.trim()).filter(Boolean));
      if (!rows.length) return null;
      return { header: rows[0], body: rows.slice(1) };
    }
    return null;
  }
  function drawTablePDF(b) {
    const t = parseTableBlock(b);
    if (!t || !t.header.length) return;
    const nCols   = t.header.length;
    const colW    = cW / nCols;
    const padX    = 2, lineH = 4.6;
    pdf.setFontSize(9);

    function drawRow(cells, isHeader) {
      const wrapped = cells.map(c => pdf.splitTextToSize(String(c ?? ''), colW - padX * 2));
      const rowLines = Math.max(1, ...wrapped.map(w => w.length));
      const rowH = rowLines * lineH + 2.4;
      ensureSpace(rowH);
      const rowTop = y;
      if (isHeader) {
        pdf.setFillColor(240, 236, 228);
        pdf.rect(mL, rowTop, cW, rowH, 'F');
      }
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.15);
      pdf.setFont('times', isHeader ? 'bold' : 'normal');
      pdf.setTextColor(20, 20, 20);
      wrapped.forEach((lines, ci) => {
        const cellX = mL + ci * colW;
        lines.forEach((ln, li) => pdf.text(ln, cellX + padX, rowTop + 3.2 + li * lineH));
        pdf.rect(cellX, rowTop, colW, rowH);
      });
      y = rowTop + rowH;
    }

    drawRow(t.header, true);
    t.body.forEach(r => drawRow(r, false));
    y += 4;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(12);
  }

  // Page 1 setup
  addLogoAndWatermark();
  if (logoDataUrl) y += 14; // push content below logo

  // Title block
  pdf.setDrawColor(30,30,30);
  pdf.setLineWidth(0.5);

  pdf.setFont('times', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(20,20,20);
  const tituloLines = pdf.splitTextToSize(titulo.toUpperCase(), cW);
  tituloLines.forEach(line => {
    pdf.text(line, pW/2, y, { align: 'center' });
    y += 6.5;
  });
  if (numero) {
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(80,80,80);
    pdf.text(`Nº ${numero}`, pW/2, y, { align: 'center' });
    y += 5;
  }
  // horizontal rule
  pdf.setDrawColor(30,30,30); pdf.setLineWidth(0.4);
  pdf.line(mL, y+2, pW-mR, y+2);
  y += 8;

  // Body
  const clauseNums = {};
  let clauseCount = 0;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'blank') { y += 1; continue; }

    if (b.type === 'table' || b.type === 'table-tab') {
      drawTablePDF(b);
      continue;
    }

    if (b.type === 'clause') {
      clauseCount++;
      const clean = b.text
        .replace(/^cl[aá]usula\s+\d+[ºoª°]*\s*[-–—]?\s*/i,'')
        .replace(/^art(?:igo)?\s*\.\s*\d+[ºoª°]*\s*[-–—]?\s*/i,'')
        .replace(/^\d+[ºoª°]*\s*[-–—.]\s*/i,'');
      const titleDisplay = formatOpts.numerarClausulas
        ? `CLÁUSULA ${clauseCount}ª — ${clean.toUpperCase()}`
        : clean.toUpperCase();

      ensureSpace(16);
      y += 3; // extra space before clause title
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(20,20,20);
      const cLines = pdf.splitTextToSize(titleDisplay, cW);
      cLines.forEach(line => {
        pdf.text(line, mL, y);
        y += 6;
      });
      y += 2;

    } else if (b.type === 'para') {
      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(20,20,20);
      const indent = 12.5; // 1.25cm recuo padrão jurídico
      const pLines = pdf.splitTextToSize(b.text, cW);
      ensureSpace(pLines.length * 7.6 + 3);
      // primeira linha com recuo
      pdf.text(pLines[0], mL + indent, y);
      y += 7.6;
      for (let li = 1; li < pLines.length; li++) {
        pdf.text(pLines[li], mL, y);
        y += 7.6;
      }
      y += 2;

    } else if (b.type === 'list') {
      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(20,20,20);
      const lLines = pdf.splitTextToSize(b.text, cW - 12);
      ensureSpace(lLines.length * 7.6 + 2);
      pdf.text('–', mL + 6, y);
      pdf.text(lLines[0], mL + 12, y);
      y += 7.6;
      for (let li = 1; li < lLines.length; li++) {
        pdf.text(lLines[li], mL + 12, y);
        y += 7.6;
      }
      y += 1;
    }
  }

  // Signatures
  if (formatOpts.espacoAssinatura) {
    ensureSpace(70);
    y += 6;
    if (formatOpts.dataLocal) {
      pdf.setFont('times', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(30,30,30);
      pdf.text(`${cidade}, ${dataStr}.`, pW/2, y, { align: 'center' });
      y += 14;
    }
    const colW = (cW - 20) / 2;
    const col1x = mL, col2x = mL + colW + 20;
    // sign lines
    pdf.setDrawColor(30,30,30); pdf.setLineWidth(0.3);
    pdf.line(col1x, y, col1x + colW, y);
    pdf.line(col2x, y, col2x + colW, y);
    y += 5;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(20,20,20);
    const s1Lines = pdf.splitTextToSize(sign1, colW);
    const s2Lines = pdf.splitTextToSize(sign2, colW);
    const centerCol1 = col1x + colW/2;
    const centerCol2 = col2x + colW/2;
    s1Lines.forEach((l,li) => { pdf.text(l, centerCol1, y + li*5, { align:'center' }); });
    s2Lines.forEach((l,li) => { pdf.text(l, centerCol2, y + li*5, { align:'center' }); });
    y += Math.max(s1Lines.length, s2Lines.length) * 5 + 2;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100,100,100);
    pdf.text('CPF: ___.___.___-__', centerCol1, y, { align:'center' });
    pdf.text('CPF: ___.___.___-__', centerCol2, y, { align:'center' });
    y += 10;

    if (formatOpts.govbr) {
      ensureSpace(24);
      pdf.setDrawColor(0,102,204);
      pdf.setLineWidth(0.4);
      pdf.setLineDash([2,2]);
      pdf.rect(mL, y, cW, 20);
      pdf.setLineDash([]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(0,102,204);
      pdf.text('□ Assinatura Digital via Gov.br / ICP-Brasil', pW/2, y+7, { align:'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.text('Acesse: gov.br/assinatura-eletronica — Validade jurídica conforme Lei nº 14.063/2020', pW/2, y+13, { align:'center' });
      y += 22;
    }

    if (formatOpts.testemunhas) {
      ensureSpace(40);
      pdf.setFont('times', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(60,60,60);
      pdf.text('TESTEMUNHAS', mL, y);
      y += 12;
      const tw = (cW - 16) / 2;
      pdf.setDrawColor(120,120,120); pdf.setLineWidth(0.2);
      pdf.line(mL, y, mL+tw, y);
      pdf.line(mL+tw+16, y, mL+tw+16+tw, y);
      y += 4;
      pdf.setFont('times', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(80,80,80);
      pdf.text('1ª Testemunha', mL+tw/2, y, { align:'center' });
      pdf.text('2ª Testemunha', mL+tw+16+tw/2, y, { align:'center' });
      y += 4;
      pdf.text('CPF: ___________________', mL+tw/2, y, { align:'center' });
      pdf.text('CPF: ___________________', mL+tw+16+tw/2, y, { align:'center' });
    }
  }

  stampPageFooter();

  const fname = `contrato_${currentPreset}_${Date.now()}.pdf`;
  pdf.save(fname);
  showToast(`PDF gerado (${pageNum} pág.)!`, 'ok');
}

/* ── CV PDF ── */
async function exportCvPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pW = 210, pH = 297;
  const mL = 20, mR = 20, mT = 20, mB = 20;
  const cW = pW - mL - mR;
  let y = mT, pageNum = 1;

  const nome  = document.getElementById('cv-nome').value.trim();
  if (!nome) { showToast('Informe o nome no currículo.', 'err'); return; }

  function newPage() {
    pdf.addPage(); pageNum++; y = mT;
  }
  function ensureSpace(n) { if (y + n > pH - mB) newPage(); }

  // Header strip
  pdf.setFillColor(26, 58, 92);
  pdf.rect(0, 0, pW, 38, 'F');

  if (cvPhotoDataUrl) {
    try { pdf.addImage(cvPhotoDataUrl, 'JPEG', mL, 6, 24, 24, undefined, 'FAST'); } catch(e){}
    const tx = mL + 28;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(255,255,255);
    pdf.text(nome, tx, 17);
    const cargo = document.getElementById('cv-cargo').value.trim();
    if (cargo) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(180,200,220);
      pdf.text(cargo, tx, 24);
    }
  } else {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(255,255,255);
    pdf.text(nome, pW/2, 18, { align:'center' });
    const cargo = document.getElementById('cv-cargo').value.trim();
    if (cargo) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(180,200,220);
      pdf.text(cargo, pW/2, 26, { align:'center' });
    }
  }

  y = 44;

  // Contact bar
  const contacts = [
    document.getElementById('cv-tel').value,
    document.getElementById('cv-email').value,
    document.getElementById('cv-cidade').value,
    document.getElementById('cv-linkedin').value,
  ].filter(Boolean).join('  ·  ');
  if (contacts) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(80,80,80);
    pdf.text(contacts, pW/2, y, { align:'center', maxWidth: cW });
    y += 7;
  }

  pdf.setDrawColor(26,58,92);
  pdf.setLineWidth(0.4);
  pdf.line(mL, y, pW-mR, y);
  y += 6;

  function cvSection(title) {
    ensureSpace(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(26,58,92);
    pdf.text(title.toUpperCase(), mL, y);
    pdf.setDrawColor(26,58,92); pdf.setLineWidth(0.3);
    pdf.line(mL, y+1.5, pW-mR, y+1.5);
    y += 7;
  }
  function cvBody(text, size=10, color=[30,30,30], indent=0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(text, cW - indent);
    ensureSpace(lines.length * (size*0.36) + 2);
    lines.forEach(l => { pdf.text(l, mL+indent, y); y += size * 0.36; });
    y += 2;
  }

  const resumo = document.getElementById('cv-resumo').value.trim();
  if (resumo) { cvSection('Resumo Profissional'); cvBody(resumo, 10); y += 2; }

  // Experience
  let hasExp = false;
  for (let i = 0; i < expCount; i++) {
    if (!document.getElementById(`exp-${i}`)) continue;
    const cargo = document.getElementById(`exp-cargo-${i}`)?.value?.trim();
    const emp   = document.getElementById(`exp-emp-${i}`)?.value?.trim();
    if (!cargo && !emp) continue;
    if (!hasExp) { cvSection('Experiência Profissional'); hasExp = true; }
    const ini = document.getElementById(`exp-ini-${i}`)?.value?.trim();
    const fim = document.getElementById(`exp-fim-${i}`)?.value?.trim();
    const desc = document.getElementById(`exp-desc-${i}`)?.value?.trim();
    const periodo = [ini, fim].filter(Boolean).join(' – ');
    ensureSpace(8);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10.5); pdf.setTextColor(20,20,20);
    pdf.text(cargo || '—', mL, y);
    if (periodo) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(100,100,100); pdf.text(periodo, pW-mR, y, { align:'right' }); }
    y += 5;
    if (emp) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); pdf.setTextColor(70,90,110); pdf.text(emp, mL, y); y += 4.5; }
    if (desc) { cvBody(desc, 9.5, [60,60,60]); }
    y += 2;
  }

  // Education
  let hasEdu = false;
  for (let i = 0; i < eduCount; i++) {
    if (!document.getElementById(`edu-${i}`)) continue;
    const grau  = document.getElementById(`edu-grau-${i}`)?.value || '';
    const curso = document.getElementById(`edu-curso-${i}`)?.value?.trim();
    const inst  = document.getElementById(`edu-inst-${i}`)?.value?.trim();
    const ano   = document.getElementById(`edu-ano-${i}`)?.value?.trim();
    if (!curso && !inst) continue;
    if (!hasEdu) { cvSection('Formação Acadêmica'); hasEdu = true; }
    ensureSpace(8);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10.5); pdf.setTextColor(20,20,20);
    pdf.text(`${grau}${curso?' — '+curso:''}`, mL, y);
    if (ano) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(100,100,100); pdf.text(ano, pW-mR, y, { align:'right' }); }
    y += 5;
    if (inst) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); pdf.setTextColor(70,90,110); pdf.text(inst, mL, y); y += 5; }
    y += 1;
  }

  // Courses
  let hasCurso = false;
  for (let i = 0; i < cursoCount; i++) {
    if (!document.getElementById(`curso-${i}`)) continue;
    const n = document.getElementById(`curso-nome-${i}`)?.value?.trim();
    if (!n) continue;
    if (!hasCurso) { cvSection('Cursos & Certificações'); hasCurso = true; }
    const inst = document.getElementById(`curso-inst-${i}`)?.value?.trim();
    const ano  = document.getElementById(`curso-ano-${i}`)?.value?.trim();
    ensureSpace(7);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(20,20,20);
    pdf.text(n, mL, y);
    if (ano) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(100,100,100); pdf.text(ano, pW-mR, y, { align:'right' }); }
    y += 5;
    if (inst) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); pdf.setTextColor(70,90,110); pdf.text(inst, mL, y); y += 4; }
    y += 1;
  }

  // Skills
  if (cvSkills.length) {
    cvSection('Habilidades Técnicas');
    let sx = mL, sy = y;
    cvSkills.forEach(skill => {
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); pdf.setTextColor(26,58,92);
      const sw = pdf.getTextWidth(skill) + 8;
      if (sx + sw > pW - mR) { sx = mL; sy += 7; ensureSpace(7); y = sy; }
      pdf.setFillColor(232,238,245);
      pdf.roundedRect(sx, sy-5, sw, 6.5, 1.5, 1.5, 'F');
      pdf.text(skill, sx+4, sy);
      sx += sw + 4;
    });
    y = sy + 9;
  }

  // Languages
  let hasIdioma = false;
  for (let i = 0; i < idiomaCount; i++) {
    if (!document.getElementById(`idioma-${i}`)) continue;
    const n     = document.getElementById(`idioma-nome-${i}`)?.value?.trim();
    const nivel = document.getElementById(`idioma-nivel-${i}`)?.value || '';
    if (!n) continue;
    if (!hasIdioma) { cvSection('Idiomas'); hasIdioma = true; }
    const cert = document.getElementById(`idioma-cert-${i}`)?.value?.trim();
    ensureSpace(6);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(20,20,20);
    pdf.text(`${n} — ${nivel}${cert?' · '+cert:''}`, mL, y);
    y += 5;
  }

  const nome_ = nome.replace(/\s+/g,'_');
  pdf.save(`curriculo_${nome_}.pdf`);
  showToast(`PDF gerado (${pageNum} pág.)!`, 'ok');
}

/* ── Email PDF ── */
async function exportEmailPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pW = 210, pH = 297;
  const mL = 30, mR = 25, mT = 20, mB = 25; // mL:3cm (encadernação) · mR/mT:2,5cm/2cm · mB:2,5cm — padrão OAB/Tribunais
  const cW = pW - mL - mR;
  let y = mT;

  function ensureSpace(n) { if (y + n > pH - mB) { pdf.addPage(); y = mT; } }

  const assunto  = document.getElementById('em-assunto').value.trim();
  const de       = document.getElementById('em-de').value.trim();
  const para     = document.getElementById('em-para').value.trim();
  const local    = document.getElementById('em-local').value.trim() || hojeFormatado();
  const corpo    = document.getElementById('em-corpo').value.trim();
  const assin    = document.getElementById('em-assinatura').value.trim();

  if (logoDataUrl) {
    const fmt = logoDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    try { pdf.addImage(logoDataUrl, fmt, pW-mR-40, y, 40, 10, undefined, 'FAST'); } catch(e){}
  }

  pdf.setFont('times', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(26,58,92);
  const assLines = pdf.splitTextToSize(assunto || 'E-mail Corporativo', cW);
  assLines.forEach(l => { pdf.text(l, mL, y); y += 7.5; });

  pdf.setDrawColor(26,58,92); pdf.setLineWidth(0.5);
  pdf.line(mL, y+1, pW-mR, y+1);
  y += 7;

  pdf.setFont('times', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(80,80,80);
  if (de)   { pdf.setFont('times','bold'); pdf.text('De:', mL, y); pdf.setFont('times','normal'); pdf.text(de, mL+10, y); y += 5; }
  if (para) { pdf.setFont('times','bold'); pdf.text('Para:', mL, y); pdf.setFont('times','normal'); pdf.text(para, mL+13, y); y += 5; }
  pdf.setFont('times','bold'); pdf.text('Data:', mL, y); pdf.setFont('times','normal'); pdf.text(local, mL+13, y);
  y += 9;

  // Body
  pdf.setFont('times', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(20,20,20);
  const paras = corpo.split('\n').filter(l => l.trim());
  paras.forEach(para => {
    const lines = pdf.splitTextToSize(para, cW);
    ensureSpace(lines.length * 6.5 + 4);
    lines.forEach(l => { pdf.text(l, mL, y); y += 6.5; });
    y += 3;
  });

  if (assin) {
    ensureSpace(24);
    pdf.setDrawColor(180,180,180); pdf.setLineWidth(0.3);
    pdf.line(mL, y+2, mL+60, y+2);
    y += 7;
    pdf.setFont('times','normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(80,80,80);
    assin.split(',').forEach(line => {
      const l = line.trim();
      if (l) { pdf.text(l, mL, y); y += 5; }
    });
  }

  pdf.save(`email_formal_${Date.now()}.pdf`);
  showToast('PDF gerado!', 'ok');
}

/* ════════════════════════════════════════════
   LOGO / WATERMARK HANDLERS
════════════════════════════════════════════ */
function loadLogo(input) {
  const file = input.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    logoDataUrl = e.target.result;
    const img = document.getElementById('logo-preview-img');
    img.src = logoDataUrl; img.style.display = 'block';
    document.getElementById('logo-ph').style.display = 'none';
    document.getElementById('logo-drop').classList.add('has-logo');
    document.getElementById('logo-rm').style.display = 'block';
    showToast('Logotipo carregado!', 'ok');
  };
  r.readAsDataURL(file);
}
function removeLogo() {
  logoDataUrl = null;
  document.getElementById('logo-preview-img').style.display = 'none';
  document.getElementById('logo-ph').style.display = '';
  document.getElementById('logo-drop').classList.remove('has-logo');
  document.getElementById('logo-rm').style.display = 'none';
  document.getElementById('logo-file').value = '';
}
function loadWatermark(input) {
  const file = input.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    wmDataUrl = e.target.result;
    const img = document.getElementById('wm-preview-img');
    img.src = wmDataUrl; img.style.display = 'block';
    document.getElementById('wm-ph').style.display = 'none';
    document.getElementById('wm-drop').classList.add('has-logo');
    document.getElementById('wm-rm').style.display = 'block';
    showToast('Marca d\'água carregada!', 'ok');
  };
  r.readAsDataURL(file);
}
function removeWatermark() {
  wmDataUrl = null;
  document.getElementById('wm-preview-img').style.display = 'none';
  document.getElementById('wm-ph').style.display = '';
  document.getElementById('wm-drop').classList.remove('has-logo');
  document.getElementById('wm-rm').style.display = 'none';
  document.getElementById('wm-file').value = '';
}
function selWmPos(btn) {
  document.querySelectorAll('.wm-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  wmPosition = btn.dataset.wm;
}

/* ════════════════════════════════════════════
   CV HELPERS
════════════════════════════════════════════ */
function loadPhoto(input) {
  const file = input.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    cvPhotoDataUrl = e.target.result;
    const img = document.getElementById('cv-photo-img');
    img.src = cvPhotoDataUrl; img.style.display = 'block';
    document.getElementById('cv-photo-ph').style.display = 'none';
  };
  r.readAsDataURL(file);
}
function renderSkills() {
  const wrap = document.getElementById('skills-wrap');
  wrap.querySelectorAll('.tag').forEach(t => t.remove());
  cvSkills.forEach((s, i) => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `${esc(s)} <span class="tag-rm" onclick="removeSkill(${i})">×</span>`;
    wrap.appendChild(tag);
  });
}
function removeSkill(i) { cvSkills.splice(i, 1); renderSkills(); }

function addExp() {
  const i = expCount++;
  const d = document.createElement('div');
  d.className = 'fieldset'; d.id = `exp-${i}`;
  d.innerHTML = `<legend>Experiência ${i+1}</legend>
    <div class="form-grid" style="margin-top:8px;">
      <div class="form-row">
        <div class="fg"><label>Cargo / Função</label><input type="text" id="exp-cargo-${i}" placeholder="Gerente de Projetos"></div>
        <div class="fg"><label>Empresa</label><input type="text" id="exp-emp-${i}" placeholder="Nome da empresa"></div>
      </div>
      <div class="form-row">
        <div class="fg"><label>Início</label><input type="text" id="exp-ini-${i}" placeholder="Jan/2020"></div>
        <div class="fg"><label>Fim</label><input type="text" id="exp-fim-${i}" placeholder="Dez/2023 ou Atual"></div>
      </div>
      <div class="fg"><label>Atividades / Conquistas</label>
        <textarea id="exp-desc-${i}" rows="3" placeholder="Principais responsabilidades e resultados..."></textarea>
      </div>
    </div>
    <button class="btn btn-danger" style="margin-top:6px;" onclick="document.getElementById('exp-${i}').remove()">Remover</button>`;
  document.getElementById('cv-exp-container').appendChild(d);
}
function addEdu() {
  const i = eduCount++;
  const d = document.createElement('div');
  d.className = 'fieldset'; d.id = `edu-${i}`;
  d.innerHTML = `<legend>Formação ${i+1}</legend>
    <div class="form-grid" style="margin-top:8px;">
      <div class="form-row">
        <div class="fg"><label>Grau</label>
          <select id="edu-grau-${i}"><option>Ensino Médio</option><option>Técnico</option><option>Graduação</option><option>Pós-Graduação</option><option>MBA</option><option>Mestrado</option><option>Doutorado</option></select>
        </div>
        <div class="fg"><label>Curso / Área</label><input type="text" id="edu-curso-${i}" placeholder="Administração de Empresas"></div>
      </div>
      <div class="form-row">
        <div class="fg"><label>Instituição</label><input type="text" id="edu-inst-${i}" placeholder="Universidade / Faculdade"></div>
        <div class="fg"><label>Conclusão</label><input type="text" id="edu-ano-${i}" placeholder="2022 ou Em andamento"></div>
      </div>
    </div>
    <button class="btn btn-danger" style="margin-top:6px;" onclick="document.getElementById('edu-${i}').remove()">Remover</button>`;
  document.getElementById('cv-edu-container').appendChild(d);
}
function addCurso() {
  const i = cursoCount++;
  const d = document.createElement('div');
  d.className = 'fieldset'; d.id = `curso-${i}`;
  d.innerHTML = `<legend>Curso ${i+1}</legend>
    <div class="form-row" style="margin-top:8px;">
      <div class="fg"><label>Curso / Certificação</label><input type="text" id="curso-nome-${i}" placeholder="AWS Cloud Practitioner"></div>
      <div class="fg"><label>Instituição</label><input type="text" id="curso-inst-${i}" placeholder="Udemy / AWS"></div>
      <div class="fg"><label>Ano · Carga</label><input type="text" id="curso-ano-${i}" placeholder="2024 · 40h"></div>
    </div>
    <button class="btn btn-danger" style="margin-top:6px;" onclick="document.getElementById('curso-${i}').remove()">Remover</button>`;
  document.getElementById('cv-curso-container').appendChild(d);
}
function addIdioma() {
  const i = idiomaCount++;
  const d = document.createElement('div');
  d.className = 'fieldset'; d.id = `idioma-${i}`;
  d.innerHTML = `<legend>Idioma ${i+1}</legend>
    <div class="form-row" style="margin-top:8px;">
      <div class="fg"><label>Idioma</label><input type="text" id="idioma-nome-${i}" placeholder="Inglês"></div>
      <div class="fg"><label>Nível</label>
        <select id="idioma-nivel-${i}"><option>Básico</option><option>Intermediário</option><option>Avançado</option><option>Fluente</option><option>Nativo</option></select>
      </div>
      <div class="fg"><label>Certificação</label><input type="text" id="idioma-cert-${i}" placeholder="TOEFL 95 · IELTS 7.5"></div>
    </div>
    <button class="btn btn-danger" style="margin-top:6px;" onclick="document.getElementById('idioma-${i}').remove()">Remover</button>`;
  document.getElementById('cv-idioma-container').appendChild(d);
}

/* ════════════════════════════════════════════
   CV PREVIEW HTML
════════════════════════════════════════════ */
function gerarCV() {
  const nome = document.getElementById('cv-nome').value.trim();
  if (!nome) { showToast('Informe o nome no currículo.', 'err'); return; }
  const v = id => document.getElementById(id)?.value?.trim() || '';
  const photoEl = cvPhotoDataUrl
    ? `<img src="${cvPhotoDataUrl}" class="cv-photo">`
    : `<div class="cv-photo-ph">👤</div>`;
  const contacts = [v('cv-tel'),v('cv-email'),v('cv-cidade')].filter(Boolean).map(c=>`<span>• ${c}</span>`).join(' ');
  const redes = [v('cv-linkedin')&&`LinkedIn: ${v('cv-linkedin')}`,v('cv-github')&&`GitHub: ${v('cv-github')}`,v('cv-site')&&`Site: ${v('cv-site')}`].filter(Boolean).map(r=>`<span>• ${r}</span>`).join(' ');
  const infoAll = [v('cv-nascimento')&&`Nascimento: ${formatDate(v('cv-nascimento'))}`,v('cv-estado-civil')&&`Estado civil: ${v('cv-estado-civil')}`,v('cv-disp')&&`Disponibilidade: ${v('cv-disp')}`,v('cv-pcd')==='Sim'&&`PCD: Sim`,v('cv-salario')&&`Pretensão: ${v('cv-salario')}`,v('cv-cnh')&&`CNH Cat. ${v('cv-cnh')}`,v('cv-veiculo')&&`Veículo: ${v('cv-veiculo')}`].filter(Boolean);
  let expHtml='',eduHtml='',cursoHtml='',idiomaHtml='';
  for(let i=0;i<expCount;i++){if(!document.getElementById(`exp-${i}`))continue;const cargo=v(`exp-cargo-${i}`),emp=v(`exp-emp-${i}`),ini=v(`exp-ini-${i}`),fim=v(`exp-fim-${i}`),desc=v(`exp-desc-${i}`);if(!cargo&&!emp)continue;const periodo=[ini,fim].filter(Boolean).join(' – ');expHtml+=`<div class="cv-item"><div class="cv-item-title">${cargo}</div><div class="cv-item-sub">${emp}${periodo?' · '+periodo:''}</div>${desc?`<div class="cv-item-desc">${desc.replace(/\n/g,'<br>')}</div>`:''}</div>`;}
  for(let i=0;i<eduCount;i++){if(!document.getElementById(`edu-${i}`))continue;const grau=document.getElementById(`edu-grau-${i}`)?.value||'',curso=v(`edu-curso-${i}`),inst=v(`edu-inst-${i}`),ano=v(`edu-ano-${i}`);if(!curso&&!inst)continue;eduHtml+=`<div class="cv-item"><div class="cv-item-title">${grau}${curso?' — '+curso:''}</div><div class="cv-item-sub">${[inst,ano].filter(Boolean).join(' · ')}</div></div>`;}
  for(let i=0;i<cursoCount;i++){if(!document.getElementById(`curso-${i}`))continue;const n=v(`curso-nome-${i}`),inst=v(`curso-inst-${i}`),ano=v(`curso-ano-${i}`);if(!n)continue;cursoHtml+=`<div class="cv-item"><div class="cv-item-title">${n}</div><div class="cv-item-sub">${[inst,ano].filter(Boolean).join(' · ')}</div></div>`;}
  for(let i=0;i<idiomaCount;i++){if(!document.getElementById(`idioma-${i}`))continue;const n=v(`idioma-nome-${i}`),nivel=document.getElementById(`idioma-nivel-${i}`)?.value||'',cert=v(`idioma-cert-${i}`);if(!n)continue;idiomaHtml+=`<div class="cv-item"><div class="cv-item-title">${n} — ${nivel}${cert?' · '+cert:''}</div></div>`;}
  const vol=v('cv-voluntario'),prem=v('cv-premios'),pub=v('cv-publicacoes');
  const extraHtml=[vol&&`<div class="cv-item"><div class="cv-item-title">Trabalho Voluntário</div><div class="cv-item-desc">${vol}</div></div>`,prem&&`<div class="cv-item"><div class="cv-item-title">Prêmios &amp; Reconhecimentos</div><div class="cv-item-desc">${prem}</div></div>`,pub&&`<div class="cv-item"><div class="cv-item-title">Publicações / Projetos</div><div class="cv-item-desc">${pub}</div></div>`].filter(Boolean).join('');
  const logoEl = logoDataUrl ? `<div style="text-align:right;margin-bottom:5mm;"><img src="${logoDataUrl}" style="max-height:32px;max-width:130px;object-fit:contain;"></div>` : '';
  document.getElementById('cv-doc-inner').innerHTML = `
    ${logoEl}
    <div class="cv-head">
      <div class="cv-photo-wrap">${photoEl}</div>
      <div style="flex:1;min-width:0;">
        <div class="cv-name">${nome}</div>
        ${v('cv-cargo')?`<div class="cv-role">${v('cv-cargo')}</div>`:''}
        ${contacts?`<div class="cv-contacts">${contacts}</div>`:''}
        ${redes?`<div class="cv-contacts" style="margin-top:2pt;">${redes}</div>`:''}
      </div>
    </div>
    ${infoAll.length?`<div class="cv-sec"><div class="cv-sec-title">Informações</div><div style="font-size:9.5pt;color:#444;display:flex;flex-wrap:wrap;gap:0 18px;line-height:1.8;">${infoAll.map(i=>`<span>• ${i}</span>`).join('')}</div></div>`:''}
    ${v('cv-resumo')?`<div class="cv-sec"><div class="cv-sec-title">Resumo Profissional</div><div style="font-size:10pt;color:#333;text-align:justify;">${v('cv-resumo')}</div></div>`:''}
    ${expHtml?`<div class="cv-sec"><div class="cv-sec-title">Experiência Profissional</div>${expHtml}</div>`:''}
    ${eduHtml?`<div class="cv-sec"><div class="cv-sec-title">Formação Acadêmica</div>${eduHtml}</div>`:''}
    ${cursoHtml?`<div class="cv-sec"><div class="cv-sec-title">Cursos &amp; Certificações</div>${cursoHtml}</div>`:''}
    ${cvSkills.length?`<div class="cv-sec"><div class="cv-sec-title">Habilidades Técnicas</div><div>${cvSkills.map(s=>`<span class="cv-skill-tag">${s}</span>`).join('')}</div></div>`:''}
    ${idiomaHtml?`<div class="cv-sec"><div class="cv-sec-title">Idiomas</div>${idiomaHtml}</div>`:''}
    ${extraHtml?`<div class="cv-sec"><div class="cv-sec-title">Informações Adicionais</div>${extraHtml}</div>`:''}
  `;
  document.getElementById('cv-preview-section').style.display = 'block';
  scaleDocPreview('cv-preview');
  document.getElementById('cv-preview-section').scrollIntoView({ behavior: 'smooth' });
  showToast('Currículo gerado!', 'ok');
  setTimeout(() => { scaleDocPreview("cv-preview"); scaleDocPreview("email-preview"); }, 80);
}

/* ════════════════════════════════════════════
   EMAIL PREVIEW
════════════════════════════════════════════ */
function formatarEmail() {
  const corpo   = document.getElementById('em-corpo').value.trim();
  if (!corpo) { showToast('Cole o corpo do e-mail.', 'err'); return; }
  const de      = document.getElementById('em-de').value.trim();
  const para    = document.getElementById('em-para').value.trim();
  const assunto = document.getElementById('em-assunto').value.trim();
  const local   = document.getElementById('em-local').value.trim() || hojeFormatado();
  const assin   = document.getElementById('em-assinatura').value.trim();

  // Cada linha do corpo é escapada individualmente antes de ir para innerHTML
  const paras = corpo.split('\n')
    .filter(l => l.trim())
    .map(l => `<p style="margin-bottom:8pt;">${esc(l.trim())}</p>`)
    .join('');

  // Assinatura: split por vírgula ANTES de escapar cada parte
  const assinHtml = assin
    ? assin.split(',').map(s => esc(s.trim())).filter(Boolean).join('<br>')
    : '';

  const logoEl = logoDataUrl
    ? `<img src="${logoDataUrl}" style="max-height:32px;max-width:130px;float:right;object-fit:contain;">`
    : '';

  document.getElementById('email-preview').innerHTML = `
    <div style="border-bottom:2.5px solid #1a3a5c;padding-bottom:7mm;margin-bottom:6mm;overflow:hidden;">
      ${logoEl}
      <div style="font-size:15pt;font-weight:700;color:#1a3a5c;font-family:'Times New Roman',serif;line-height:1.2;">${esc(assunto || 'E-mail Corporativo')}</div>
      ${de   ? `<div style="font-size:9pt;color:#555;margin-top:4pt;"><strong>De:</strong> ${esc(de)}</div>`   : ''}
      ${para ? `<div style="font-size:9pt;color:#555;"><strong>Para:</strong> ${esc(para)}</div>`              : ''}
      <div style="font-size:9pt;color:#555;"><strong>Data:</strong> ${esc(local)}</div>
    </div>
    <div style="font-size:11pt;color:#1a1a1a;line-height:1.75;">${paras}</div>
    ${assinHtml ? `<div style="margin-top:9mm;padding-top:4mm;border-top:1px solid #ccc;font-size:9.5pt;color:#444;">${assinHtml}</div>` : ''}
  `;
  document.getElementById('email-preview-section').style.display = 'block';
  scaleDocPreview('email-preview');
  document.getElementById('email-preview-section').scrollIntoView({ behavior: 'smooth' });
  showToast('E-mail formatado!', 'ok');
  setTimeout(() => { scaleDocPreview("cv-preview"); scaleDocPreview("email-preview"); }, 80);
}

/* ════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════ */
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function formatDate(s) {
  if (!s) return '';
  try { const [y,m,d]=s.split('-'); return `${parseInt(d)} de ${MESES[parseInt(m)-1]} de ${y}`; }
  catch { return s; }
}
function hojeFormatado() { const h=new Date(); return `${h.getDate()} de ${MESES[h.getMonth()]} de ${h.getFullYear()}`; }

function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = (type==='ok'?'✓  ':type==='err'?'⚠  ':'◌  ') + msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3600);
}


/* ════════════════════════════════════════════
   PWA — SERVICE WORKER + INSTALL PROMPT
   GitHub Pages: usa sw.js real (não Blob URL).
   manifest.json linkado no <head> do HTML.
════════════════════════════════════════════ */
(function initPWA() {

  /* ── 1. Service Worker ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then(reg => {
          reg.addEventListener('updatefound', () => {
            const next = reg.installing;
            if (!next) return;
            next.addEventListener('statechange', () => {
              if (next.state === 'installed' && navigator.serviceWorker.controller) {
                showToast('🔄 Nova versão disponível — recarregue para atualizar', '');
              }
            });
          });
        })
        .catch(err => console.warn('[DocForm SW] Falha no registro:', err));
    });
  }

  /* ── 2. Indicador offline/online ── */
  function _syncOfflineBar() {
    const bar = document.getElementById('offline-bar');
    if (!bar) return;
    if (navigator.onLine) {
      bar.style.display = 'none';
      document.body.classList.remove('is-offline');
    } else {
      bar.style.display = 'flex';
      document.body.classList.add('is-offline');
    }
  }
  window.addEventListener('online',  _syncOfflineBar);
  window.addEventListener('offline', _syncOfflineBar);
  window.addEventListener('load',    _syncOfflineBar);

  /* ── 3. Deep-link via ?page= (shortcuts do manifest) ── */
  const _page = new URLSearchParams(window.location.search).get('page');
  if (_page && ['formatar', 'curriculo', 'email'].includes(_page)) {
    window.addEventListener('DOMContentLoaded', () => navigate(_page));
  }

  /* ── 4. Install Prompt ── */
  let _deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _deferredPrompt = e;
    if (!sessionStorage.getItem('pwa-dismissed')) {
      setTimeout(() => {
        const b = document.getElementById('pwa-banner');
        if (b) b.style.display = 'flex';
      }, 3000);
    }
  });

  window.pwaInstall = async function () {
    const b = document.getElementById('pwa-banner');
    if (b) b.style.display = 'none';
    if (!_deferredPrompt) return;
    _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;
    _deferredPrompt = null;
    if (outcome === 'accepted') {
      showToast('✅ DocForm instalado com sucesso!', 'ok');
      const badge = document.getElementById('pwa-status-badge');
      if (badge) badge.textContent = '📲 App';
    }
  };

  window.pwaDismiss = function () {
    const b = document.getElementById('pwa-banner');
    if (b) b.style.display = 'none';
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  /* ── 5. Detecta modo standalone (já instalado) ── */
  window.addEventListener('appinstalled', () => {
    const b = document.getElementById('pwa-banner');
    if (b) b.style.display = 'none';
    const badge = document.getElementById('pwa-status-badge');
    if (badge) badge.textContent = '📲 App';
    showToast('📲 DocForm instalado!', 'ok');
  });

  const _mq = window.matchMedia('(display-mode: standalone)');
  function _applyStandaloneBadge(isStandalone) {
    const badge = document.getElementById('pwa-status-badge');
    if (!badge) return;
    badge.textContent = isStandalone ? '📲 App' : 'v 1.0';
    badge.title = isStandalone ? 'Rodando como app instalado' : '';
  }
  window.addEventListener('DOMContentLoaded', () => {
    _applyStandaloneBadge(_mq.matches || window.navigator.standalone === true);
  });
  _mq.addEventListener('change', e => _applyStandaloneBadge(e.matches));

})();


/* ════════════════════════════════════════════
   DOCX EXPORT
   Uses docx.js (UMD) — produz .docx real
   compatível com Word, LibreOffice, Google Docs
════════════════════════════════════════════ */
async function exportarDOCX(tipo) {
  if (typeof docx === 'undefined') {
    showToast('Biblioteca DOCX ainda carregando, aguarde…', 'err');
    return;
  }
  const btnId = tipo === 'contrato' ? 'btn-docx-contrato' : tipo === 'cv' ? 'btn-docx-cv' : 'btn-docx-email';
  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>'; }
  showToast('Gerando DOCX…');
  await new Promise(r => setTimeout(r, 60));
  try {
    if (tipo === 'contrato') await exportContratoDocx();
    else if (tipo === 'cv')  await exportCvDocx();
    else if (tipo === 'email') await exportEmailDocx();
  } catch(e) {
    console.error(e);
    showToast('Erro ao gerar DOCX.', 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '⬇ DOCX'; }
  }
}

/* ── helpers docx ── */
function _dPara(text, opts = {}) {
  const { bold, center, size, color, indent, spacing } = opts;
  const run = new docx.TextRun({
    text: text || '',
    bold: bold || false,
    size: size || 24,       // half-points: 24 = 12pt
    color: color || '111111',
    font: 'Times New Roman',
  });
  return new docx.Paragraph({
    children: [run],
    alignment: center ? docx.AlignmentType.CENTER : docx.AlignmentType.JUSTIFIED,
    indent: indent ? { firstLine: 708 } : undefined,  // 1.25cm ≈ 708 twips
    spacing: spacing || { line: 360, lineRule: docx.LineRuleType.AUTO }, // 1.5×
  });
}
function _dBlank(n = 1) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(new docx.Paragraph({ children: [new docx.TextRun('')], spacing: { after: 80 } }));
  return arr;
}
function _dLine() {
  return new docx.Paragraph({
    children: [],
    border: { bottom: { color: '111111', space: 1, style: docx.BorderStyle.SINGLE, size: 6 } },
    spacing: { after: 120 },
  });
}
/* ── Tabelas (markdown `| col |` e tabuladas) — mesmo parser do preview/PDF ── */
function _dParseTableBlock(b) {
  if (b.type === 'table') {
    const rows = b.lines.filter(l => !/^\|[-:\s|]+\|$/.test(l));
    if (!rows.length) return null;
    const header = rows[0].split('|').map(c => c.trim()).filter(c => c !== '');
    const body   = rows.slice(1).map(r => r.split('|').map(c => c.trim()).filter(c => c !== ''));
    return { header, body };
  }
  if (b.type === 'table-tab') {
    const rows = b.lines.map(l => l.split('\t').map(c => c.trim()).filter(Boolean));
    if (!rows.length) return null;
    return { header: rows[0], body: rows.slice(1) };
  }
  return null;
}
function _dCell(text, { header } = {}) {
  return new docx.TableCell({
    children: [new docx.Paragraph({
      children: [new docx.TextRun({ text: text || '', bold: !!header, size: 20, font: 'Times New Roman' })],
    })],
    shading: header ? { fill: 'F0ECE4' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}
function _dTable(b) {
  const t = _dParseTableBlock(b);
  if (!t || !t.header.length) return null;
  const rows = [
    new docx.TableRow({ children: t.header.map(h => _dCell(h, { header: true })) }),
    ...t.body.map(r => new docx.TableRow({ children: t.header.map((_, ci) => _dCell(r[ci] || '')) })),
  ];
  return new docx.Table({ rows, width: { size: 100, type: docx.WidthType.PERCENTAGE } });
}

/* ── Contract DOCX ── */
async function exportContratoDocx() {
  const titulo  = document.getElementById('doc-titulo').value || PRESET_TITLES[currentPreset] || 'CONTRATO';
  const numero  = document.getElementById('doc-numero').value;
  const cidade  = document.getElementById('doc-cidade').value || '___________________________';
  const dataRaw = document.getElementById('doc-data').value;
  const dataStr = dataRaw ? formatDate(dataRaw) : hojeFormatado();
  const _cfg    = PRESET_CONFIG[currentPreset] || PRESET_CONFIG['generico'];
  const sign1   = document.getElementById('sign1-name').value.trim() || _cfg.sign1.label.toUpperCase();
  const sign2   = document.getElementById('sign2-name').value.trim() || _cfg.sign2.label.toUpperCase();
  const texto   = document.getElementById('input-text').value.trim();
  const blocks  = processText(texto);

  const children = [];

  // Título
  children.push(_dPara(titulo.toUpperCase(), { bold: true, center: true, size: 28, spacing: { after: 80 } }));
  if (numero) children.push(_dPara(`Nº ${numero}`, { center: true, size: 22, color: '555555', spacing: { after: 200 } }));
  children.push(_dLine());
  children.push(..._dBlank());

  // Body
  let clauseCount = 0;
  for (const b of blocks) {
    if (b.type === 'blank') { children.push(..._dBlank()); continue; }
    if (b.type === 'table' || b.type === 'table-tab') {
      const tbl = _dTable(b);
      if (tbl) { children.push(tbl); children.push(..._dBlank()); }
      continue;
    }
    if (b.type === 'clause') {
      clauseCount++;
      const clean = b.text.replace(/^cl[aá]usula\s+\d+[ºoª°]*\s*[-–—]?\s*\.?\s*/i,'').replace(/^art(?:igo)?\s*\.\s*\d+[ºoª°]*\s*[-–—]?\s*\.?\s*/i,'').replace(/^\d+[ºoª°]*\s*[-–—.]\s*/i,'').replace(/^\.\s*/,'').trim();
      const title = formatOpts.numerarClausulas ? `CLÁUSULA ${clauseCount}ª — ${clean.toUpperCase()}` : clean.toUpperCase();
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: title, bold: true, size: 24, font: 'Times New Roman', color: '111111' })],
        spacing: { before: 280, after: 100 },
      }));
    } else if (b.type === 'para') {
      children.push(_dPara(b.text, { indent: true, spacing: { line: 360, lineRule: docx.LineRuleType.AUTO, after: 100 } }));
    } else if (b.type === 'list') {
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: '– ' + b.text, size: 24, font: 'Times New Roman' })],
        indent: { left: 851 },
        spacing: { after: 80 },
      }));
    }
  }

  // Signatures
  if (formatOpts.espacoAssinatura) {
    children.push(..._dBlank(2));
    if (formatOpts.dataLocal) {
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: `${cidade}, ${dataStr}.`, size: 22, font: 'Times New Roman' })],
        alignment: docx.AlignmentType.RIGHT,
        spacing: { after: 480 },
      }));
    }

    // ── Assinatura: underscores + tab central — compatível com WordPad/Word/LibreOffice ──
    // Usa underscores como linha e tab stop central para colocar os dois blocos lado a lado.
    // Sem tabelas, sem indent right/left — evita o bug de compressão vertical do WordPad.
    const LINE = '_'.repeat(32); // linha de assinatura com underscores
    const TAB  = 4680;           // tab stop central em twips (~8,25cm)

    // Linha de assinatura (dois campos lado a lado via tab)
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({ text: LINE, size: 22, font: 'Times New Roman', color: '111111' }),
        new docx.TextRun({ text: '\t', size: 22 }),
        new docx.TextRun({ text: LINE, size: 22, font: 'Times New Roman', color: '111111' }),
      ],
      tabStops: [{ type: docx.TabStopType.LEFT, position: TAB }],
      spacing: { before: 560, after: 60 },
    }));
    // Nome assinante 1 | Nome assinante 2
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({ text: sign1, bold: true, size: 20, font: 'Times New Roman' }),
        new docx.TextRun({ text: '\t', size: 20 }),
        new docx.TextRun({ text: sign2, bold: true, size: 20, font: 'Times New Roman' }),
      ],
      tabStops: [{ type: docx.TabStopType.LEFT, position: TAB }],
      spacing: { after: 40 },
    }));
    // CPF 1 | CPF 2
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({ text: 'CPF: ___.___.___-__', size: 18, color: '888888', font: 'Times New Roman' }),
        new docx.TextRun({ text: '\t', size: 18 }),
        new docx.TextRun({ text: 'CPF: ___.___.___-__', size: 18, color: '888888', font: 'Times New Roman' }),
      ],
      tabStops: [{ type: docx.TabStopType.LEFT, position: TAB }],
      spacing: { after: 80 },
    }));

    if (formatOpts.govbr) {
      children.push(..._dBlank());
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: '□ Assinatura Digital via Gov.br / ICP-Brasil', bold: true, size: 20, color: '0066CC', font: 'Arial' })],
        alignment: docx.AlignmentType.CENTER,
        border: { top: { style: docx.BorderStyle.DASHED, size: 4, color: '0066CC' }, bottom: { style: docx.BorderStyle.DASHED, size: 4, color: '0066CC' }, left: { style: docx.BorderStyle.DASHED, size: 4, color: '0066CC' }, right: { style: docx.BorderStyle.DASHED, size: 4, color: '0066CC' } },
        spacing: { before: 120, after: 80 },
      }));
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: 'Acesse: gov.br/assinatura-eletronica — Lei nº 14.063/2020', size: 18, color: '0066CC', font: 'Arial' })],
        alignment: docx.AlignmentType.CENTER, spacing: { after: 80 },
      }));
    }

    if (formatOpts.testemunhas) {
      children.push(..._dBlank());
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: 'TESTEMUNHAS', bold: true, size: 20, font: 'Times New Roman', color: '444444' })],
        spacing: { after: 200 },
      }));
      // Linha | Linha
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({ text: '_'.repeat(32), size: 22, font: 'Times New Roman', color: '888888' }),
          new docx.TextRun({ text: '\t', size: 22 }),
          new docx.TextRun({ text: '_'.repeat(32), size: 22, font: 'Times New Roman', color: '888888' }),
        ],
        tabStops: [{ type: docx.TabStopType.LEFT, position: 4680 }],
        spacing: { before: 400, after: 60 },
      }));
      // Label | Label
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({ text: '1ª Testemunha', size: 18, color: '666666', font: 'Times New Roman' }),
          new docx.TextRun({ text: '\t', size: 18 }),
          new docx.TextRun({ text: '2ª Testemunha', size: 18, color: '666666', font: 'Times New Roman' }),
        ],
        tabStops: [{ type: docx.TabStopType.LEFT, position: 4680 }],
        spacing: { after: 40 },
      }));
      // Nome | Nome
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({ text: 'Nome: ___________________________', size: 18, color: '666666', font: 'Times New Roman' }),
          new docx.TextRun({ text: '\t', size: 18 }),
          new docx.TextRun({ text: 'Nome: ___________________________', size: 18, color: '666666', font: 'Times New Roman' }),
        ],
        tabStops: [{ type: docx.TabStopType.LEFT, position: 4680 }],
        spacing: { after: 40 },
      }));
      // CPF | CPF
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({ text: 'CPF: ___________________', size: 18, color: '666666', font: 'Times New Roman' }),
          new docx.TextRun({ text: '\t', size: 18 }),
          new docx.TextRun({ text: 'CPF: ___________________', size: 18, color: '666666', font: 'Times New Roman' }),
        ],
        tabStops: [{ type: docx.TabStopType.LEFT, position: 4680 }],
        spacing: { after: 80 },
      }));
    }
  }

  const doc = new docx.Document({
    creator: 'DocForm v1',
    title: titulo,
    sections: [{
      properties: {
        page: {
          margin: { top: 1134, right: 1134, bottom: 1417, left: 1701 }, // 2cm/2cm/2.5cm/3cm em twips
          pageNumbers: { start: 1, formatType: docx.NumberFormat.DECIMAL },
        },
      },
      footers: {
        default: new docx.Footer({
          children: [
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: titulo.substring(0,48) + (numero ? ' · Nº ' + numero : ''), size: 14, color: 'aaaaaa', font: 'Times New Roman' }),
                new docx.TextRun({ text: '\t', size: 14 }),
                new docx.TextRun({ text: _cfg.footerLegal || '', size: 13, color: 'bbbbbb', font: 'Times New Roman' }),
                new docx.TextRun({ text: '\t', size: 14 }),
                new docx.TextRun({ text: 'Página ', size: 14, color: 'aaaaaa', font: 'Times New Roman' }),
                new docx.TextRun({ children: [docx.PageNumber.CURRENT], size: 14, color: 'aaaaaa', font: 'Times New Roman' }),
              ],
              tabStops: [
                { type: docx.TabStopType.CENTER, position: 4680 },
                { type: docx.TabStopType.RIGHT,  position: 9360 },
              ],
              border: { top: { style: docx.BorderStyle.SINGLE, size: 2, color: 'dddddd', space: 3 } },
            }),
          ],
        }),
      },
      children,
    }],
  });

  const buf = await docx.Packer.toBlob(doc);
  const fname = `contrato_${currentPreset}_${Date.now()}.docx`;
  saveAs(buf, fname);
  showToast('DOCX gerado com sucesso!', 'ok');
}

/* ── CV DOCX ── */
async function exportCvDocx() {
  const nome = document.getElementById('cv-nome').value.trim();
  if (!nome) { showToast('Informe o nome no currículo.', 'err'); return; }

  const v = id => document.getElementById(id)?.value?.trim() || '';
  const children = [];

  // Header: name
  children.push(new docx.Paragraph({
    children: [new docx.TextRun({ text: nome, bold: true, size: 44, font: 'Calibri', color: '1a3a5c' })],
    alignment: docx.AlignmentType.CENTER,
    spacing: { after: 60 },
  }));
  const cargo = v('cv-cargo');
  if (cargo) children.push(new docx.Paragraph({
    children: [new docx.TextRun({ text: cargo, size: 26, font: 'Calibri', color: '4a6080' })],
    alignment: docx.AlignmentType.CENTER,
    spacing: { after: 60 },
  }));

  const contacts = [v('cv-tel'), v('cv-email'), v('cv-cidade'), v('cv-linkedin')].filter(Boolean).join('  ·  ');
  if (contacts) children.push(new docx.Paragraph({
    children: [new docx.TextRun({ text: contacts, size: 18, font: 'Calibri', color: '555555' })],
    alignment: docx.AlignmentType.CENTER,
    spacing: { after: 160 },
    border: { bottom: { style: docx.BorderStyle.SINGLE, size: 12, color: '1a3a5c', space: 4 } },
  }));

  function cvSection(title) {
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: title.toUpperCase(), bold: true, size: 22, font: 'Calibri', color: '1a3a5c' })],
      spacing: { before: 280, after: 60 },
      border: { bottom: { style: docx.BorderStyle.SINGLE, size: 6, color: '1a3a5c', space: 2 } },
    }));
  }
  function cvBody(text, opts = {}) {
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({ text, size: opts.size || 20, font: 'Calibri', color: opts.color || '333333' })],
      spacing: { after: opts.after || 60 },
    }));
  }

  const resumo = v('cv-resumo');
  if (resumo) { cvSection('Resumo Profissional'); cvBody(resumo, { size: 20 }); }

  // Experience
  let hasExp = false;
  for (let i = 0; i < expCount; i++) {
    if (!document.getElementById(`exp-${i}`)) continue;
    const cargo2 = document.getElementById(`exp-cargo-${i}`)?.value?.trim();
    const emp    = document.getElementById(`exp-emp-${i}`)?.value?.trim();
    if (!cargo2 && !emp) continue;
    if (!hasExp) { cvSection('Experiência Profissional'); hasExp = true; }
    const ini = document.getElementById(`exp-ini-${i}`)?.value?.trim() || '';
    const fim = document.getElementById(`exp-fim-${i}`)?.value?.trim() || '';
    const desc = document.getElementById(`exp-desc-${i}`)?.value?.trim() || '';
    const periodo = [ini, fim].filter(Boolean).join(' – ');
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({ text: cargo2 || '—', bold: true, size: 22, font: 'Calibri', color: '1a1a1a' }),
        periodo ? new docx.TextRun({ text: `\t${periodo}`, size: 18, font: 'Calibri', color: '888888' }) : new docx.TextRun(''),
      ],
      tabStops: [{ type: docx.TabStopType.RIGHT, position: 9360 }],
      spacing: { after: 40 },
    }));
    if (emp) cvBody(emp, { size: 20, color: '1a3a5c', after: 40 });
    if (desc) cvBody(desc, { size: 19, color: '555555' });
    children.push(..._dBlank());
  }

  // Education
  let hasEdu = false;
  for (let i = 0; i < eduCount; i++) {
    if (!document.getElementById(`edu-${i}`)) continue;
    const grau  = document.getElementById(`edu-grau-${i}`)?.value || '';
    const curso = document.getElementById(`edu-curso-${i}`)?.value?.trim() || '';
    const inst  = document.getElementById(`edu-inst-${i}`)?.value?.trim() || '';
    const ano   = document.getElementById(`edu-ano-${i}`)?.value?.trim() || '';
    if (!curso && !inst) continue;
    if (!hasEdu) { cvSection('Formação Acadêmica'); hasEdu = true; }
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({ text: `${grau}${curso?' — '+curso:''}`, bold: true, size: 22, font: 'Calibri', color: '1a1a1a' }),
        ano ? new docx.TextRun({ text: `\t${ano}`, size: 18, font: 'Calibri', color: '888888' }) : new docx.TextRun(''),
      ],
      tabStops: [{ type: docx.TabStopType.RIGHT, position: 9360 }],
      spacing: { after: 40 },
    }));
    if (inst) cvBody(inst, { size: 20, color: '1a3a5c' });
    children.push(..._dBlank());
  }

  // Courses
  let hasCurso = false;
  for (let i = 0; i < cursoCount; i++) {
    if (!document.getElementById(`curso-${i}`)) continue;
    const n = document.getElementById(`curso-nome-${i}`)?.value?.trim();
    if (!n) continue;
    if (!hasCurso) { cvSection('Cursos & Certificações'); hasCurso = true; }
    const inst = document.getElementById(`curso-inst-${i}`)?.value?.trim() || '';
    const ano  = document.getElementById(`curso-ano-${i}`)?.value?.trim() || '';
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({ text: n, bold: true, size: 21, font: 'Calibri', color: '1a1a1a' }),
        ano ? new docx.TextRun({ text: `\t${ano}`, size: 18, font: 'Calibri', color: '888888' }) : new docx.TextRun(''),
      ],
      tabStops: [{ type: docx.TabStopType.RIGHT, position: 9360 }],
      spacing: { after: 40 },
    }));
    if (inst) cvBody(inst, { size: 20, color: '1a3a5c' });
    children.push(..._dBlank());
  }

  // Skills
  if (cvSkills.length) {
    cvSection('Habilidades Técnicas');
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: cvSkills.join('  ·  '), size: 20, font: 'Calibri', color: '1a3a5c' })],
      spacing: { after: 80 },
    }));
  }

  // Languages
  let hasIdioma = false;
  for (let i = 0; i < idiomaCount; i++) {
    if (!document.getElementById(`idioma-${i}`)) continue;
    const n     = document.getElementById(`idioma-nome-${i}`)?.value?.trim();
    const nivel = document.getElementById(`idioma-nivel-${i}`)?.value || '';
    if (!n) continue;
    if (!hasIdioma) { cvSection('Idiomas'); hasIdioma = true; }
    const cert = document.getElementById(`idioma-cert-${i}`)?.value?.trim() || '';
    cvBody(`${n} — ${nivel}${cert?' · '+cert:''}`, { size: 20 });
  }

  const doc = new docx.Document({
    creator: 'DocForm v1',
    title: `Currículo — ${nome}`,
    sections: [{
      properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } } },
      children,
    }],
  });

  const buf = await docx.Packer.toBlob(doc);
  saveAs(buf, `curriculo_${nome.replace(/\s+/g,'_')}.docx`);
  showToast('DOCX do currículo gerado!', 'ok');
}

/* ── Email DOCX ── */
async function exportEmailDocx() {
  const assunto = document.getElementById('em-assunto').value.trim() || 'E-mail Corporativo';
  const de      = document.getElementById('em-de').value.trim();
  const para    = document.getElementById('em-para').value.trim();
  const local   = document.getElementById('em-local').value.trim() || hojeFormatado();
  const corpo   = document.getElementById('em-corpo').value.trim();
  const assin   = document.getElementById('em-assinatura').value.trim();

  const children = [];

  children.push(new docx.Paragraph({
    children: [new docx.TextRun({ text: assunto, bold: true, size: 36, font: 'Calibri', color: '1a3a5c' })],
    spacing: { after: 80 },
    border: { bottom: { style: docx.BorderStyle.SINGLE, size: 12, color: '1a3a5c', space: 4 } },
  }));
  children.push(..._dBlank());

  const meta = [de && `De: ${de}`, para && `Para: ${para}`, `Data: ${local}`].filter(Boolean);
  meta.forEach(m => children.push(new docx.Paragraph({
    children: [new docx.TextRun({ text: m, size: 19, font: 'Calibri', color: '666666' })],
    spacing: { after: 40 },
  })));
  children.push(..._dBlank());

  // Body paragraphs
  corpo.split('\n').filter(l => l.trim()).forEach(line => {
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: line.trim(), size: 24, font: 'Calibri', color: '111111' })],
      spacing: { line: 360, lineRule: docx.LineRuleType.AUTO, after: 120 },
    }));
  });

  if (assin) {
    children.push(..._dBlank());
    children.push(new docx.Paragraph({
      children: [],
      border: { top: { style: docx.BorderStyle.SINGLE, size: 4, color: 'cccccc', space: 2 } },
      spacing: { before: 200, after: 80 },
    }));
    assin.split(',').forEach(line => {
      const l = line.trim();
      if (l) children.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: l, size: 19, font: 'Calibri', color: '555555' })],
        spacing: { after: 40 },
      }));
    });
  }

  const doc = new docx.Document({
    creator: 'DocForm v1',
    title: assunto,
    sections: [{
      properties: { page: { margin: { top: 1134, right: 1134, bottom: 1417, left: 1701 } } },
      children,
    }],
  });

  const buf = await docx.Packer.toBlob(doc);
  saveAs(buf, `email_formal_${Date.now()}.docx`);
  showToast('DOCX do e-mail gerado!', 'ok');
}