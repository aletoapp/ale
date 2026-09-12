/* i18n.js — Troca de idioma (PT / EN / ES)
   Detecta idioma salvo ou do navegador, aplica traduções via
   data-i18n / data-i18n-html / data-i18n-placeholder e atualiza
   o <html lang>, o <title> e o estado dos botões .lang-btn.
   Extraído do <script> inline do index.html.
*/

(function(){
'use strict';

var T={
pt:{
  htmlLang:'pt-BR',pageTitle:'Alexandre Torres — Aplicações, Sites e Landing Pages',themeLabel:'Versão clara',
  heroEyebrow:'Maximize Sua Base de Clientes',heroHL1:'SUA PÁGINA',heroHL2:'VENDENDO.',heroHL3:'Enquanto você dorme.',
  heroSR:'SUA PÁGINA VENDENDO. Enquanto você dorme.',
  heroSub:'Landing pages construídas com arquitetura de decisão — <em>não opinião de designer.</em>',
  heroMicro:'Não adie a engenharia que transforma percepção em decisão.',heroCTA:'Quero parar de perder vendas',
  heroScarcity:'Atendo no máx. 3 projetos por semana',
  stat1:'Conversão média',stat2num:'15dias',stat2:'Prazo de entrega',stat3:'projeto sob medida',
  dorEyebrow:'O diagnóstico honesto',
  dorH2:'Cada real em página fraca.<br><em>É um real no lixo.</em>',
  dorP:'Cada real em anúncios que chega numa página fraca é um real desperdiçado.',
  diagLabel:'✦ Diagnóstico técnico gratuito',diagHeadline:'Antes de contratar,<br>descubra o que está errado.',
  diagCTA:'Analisar meu site →',diagNote:'Sem compromisso. Te chamo no WhatsApp.',
  dor1title:'Concorrentes menores vendendo mais.',dor1p:'O mercado não escolhe necessariamente o melhor produto — escolhe o que consegue comunicar valor e reduzir risco primeiro.',
  dor2title:'Visita sem comprar.',dor2p:'As pessoas chegam, rolam por segundos e saem.',
  dor3title:'Design bonito que não converte.',dor3p:'Visual sem estratégia é decoração.',
  dor4title:'Copy que descreve, não conecta.',dor4p:'Se o visitante não reconhece o próprio problema, a informação vira ruído — não decisão.',
  dorMethodCTA:'Ver como resolvemos isso',
  dorMethodSub:'Estratégia, estrutura e execução real — sem achismo.',
  dorQuote:'"Uma página de alta conversão não é custo — é o ativo mais rentável do seu negócio."',
  portEyebrow:'Provas vivas de pensamento aplicado',
  portH2:'Projetos que validam<br><em>o meu método.</em>',
  portP:'Meus cases são sistemas vivos, construídos com a exata mentalidade que imprimo em cada projeto — estratégia psicológica antes da forma.',
  p1tag:'SaaS · Gestão de Playlists',p1result:'Organizou +120 canais → reduziu churn em 32%',p1desc:'Plataforma que transformou o caos de playlists em fluxo gerenciável.',
  p2tag:'Ferramenta Gratuita · Web Audio API',p2result:'Zero instalação → produtores economizando R$200/mês em software',p2desc:'Processador de áudio profissional que funciona direto no browser.',
  p3tag:'Ferramenta Gratuita · Automação',p3result:'Processo manual de 40min → geração automática em 90 segundos',
  p3desc:'Transformou templates estáticos em fluxos de preenchimento automático. Impacto real: equipes operacionais recuperando horas semanais que iam para burocracia.',
  pjSeeProject:'Conhecer Projeto ↗',pjUseApp:'Usar App Gratuitamente ↗',pjUseFree:'Usar Gratuitamente ↗',
  metEyebrow:'O processo',
  metTransition:'Agências entregam design. Eu entrego uma sequência psicológica que transforma curiosidade em certeza de compra. É o que chamo de arquitetura de decisão.',
  metH2:'Não é design. É<br><em>arquitetura de decisão.</em>',
  metP:'Cada elemento posicionado com intenção — do primeiro pixel ao botão de compra.',
  s1h:'Mapeamento de Estado Mental',s1p:'Mapeamos o estado emocional do seu cliente — medos, objeções, esperanças. A página começa daí, não do produto.',s1tag:'Estratégia · Pesquisa',
  s2h:'Arquitetura de Conversão',s2p:'Cada seção tem uma função emocional específica. Tudo conduz ao próximo passo com naturalidade.',s2tag:'Estrutura · Copy',
  s3h:'Engenharia de Performance',s3p:'Performance também comunica. Velocidade, estabilidade e resposta preservam atenção e confiança enquanto a decisão está sendo construída.',s3tag:'Técnica · UX',
  s4h:'Engenharia de Confiança',s4p:'Prova social posicionada com precisão, especificidade que gera credibilidade e remoção dos sinais que fazem o visitante hesitar.',s4tag:'Credibilidade · Prova',
  s5h:'CTA Como Alívio',s5p:'Quando a narrativa é construída corretamente, clicar no botão não parece uma interrupção — parece o próximo passo natural.',s5tag:'Conversão · Ação',
  s6h:'Entrega e Otimização',s6p:'Página entregue em até 15 dias, pronta para publicar. Revisão de performance no 30º dia incluída.',s6tag:'Entrega · Revisão',
  ctaW1:'Agora',ctaW2:'não',ctaW3:'há',ctaW4:'mais',ctaW5:'dúvidas.',
  ctaSR:'Agora não há mais dúvidas.',
  ctaP:'A única pergunta é: quanto tempo você ainda vai<br class="cfl-br"> deixar dinheiro na mesa e ver sua concorrência<br class="cfl-br"> faturar com o que poderia ser <em>seu?</em>',
  ctaBtn:'SIM, EU QUERO UMA ESTRATÉGIA PARA O MEU NEGÓCIO',
  ctaGuarantee:'✦ Escopo definido antes do início &nbsp;·&nbsp; ✦ Entrega em até 15 dias &nbsp;·&nbsp; ✦ Revisão de performance no 30º dia',
  footerBrand:'Landing Pages &amp; Aplicações Web Premium<br>Serra, Espírito Santo — ES · Brasil',
  footerPrivacy:'Termos | Privacidade',footerCopy:'© 2026 Alexandre Torres · Todos os direitos reservados'
},

en:{
  htmlLang:'en',pageTitle:'Alexandre Torres — Web Apps, Sites & Landing Pages',themeLabel:'Light mode',
  heroEyebrow:'Maximize Your Customer Base',heroHL1:'YOUR PAGE',heroHL2:'SELLING.',heroHL3:'While you sleep.',
  heroSR:'YOUR PAGE SELLING. While you sleep.',
  heroSub:"Landing pages built on decision architecture — <em>not a designer's opinion.</em>",
  heroMicro:"Don't delay the engineering that turns perception into decision.",heroCTA:'I want to stop losing sales',
  heroScarcity:'Max. 3 projects per week',
  stat1:'Avg. conversion',stat2num:'15days',stat2:'Delivery time',stat3:'tailored project',
  dorEyebrow:'The honest diagnosis',
  dorH2:'Every dollar on a weak page.<br><em>Is a wasted dollar.</em>',
  dorP:'Every dollar spent on ads that lands on a weak page is a dollar wasted.',
  diagLabel:'✦ Free technical diagnosis',diagHeadline:"Before you hire,<br>find out what's wrong.",
  diagCTA:'Analyze my site →',diagNote:"No commitment. I'll message you on WhatsApp.",
  dor1title:'Smaller competitors selling more.',dor1p:"The market doesn't choose the best product — it chooses the one that convinces first.",
  dor2title:"Visitors who don't buy.",dor2p:'People arrive, scroll for a few seconds, and leave.',
  dor3title:"Pretty design that doesn't convert.",dor3p:'Visuals without strategy are just decoration.',
  dor4title:"Copy that describes, not connects.",dor4p:"Without emotional connection, there's no purchase decision.",
  dorMethodCTA:'See how we solve this',
  dorMethodSub:'Strategy, structure and real execution — no guesswork.',
  dorQuote:"\"A high-converting page isn't a cost — it's the most profitable asset of your business.\"",
  portEyebrow:'Live proof of applied thinking',
  portH2:'Projects that validate<br><em>my method.</em>',
  portP:'My cases are living systems, built with the exact mindset I bring to every project — psychological strategy before form.',
  p1tag:'SaaS · Playlist Management',p1result:'Organized +120 channels → reduced churn by 32%',p1desc:'Platform that turned playlist chaos into a manageable flow.',
  p2tag:'Free Tool · Web Audio API',p2result:'Zero install → producers saving $40/month on software',p2desc:'Professional audio processor that runs directly in the browser.',
  p3tag:'Free Tool · Automation',p3result:'40-min manual process → automatic generation in 90 seconds',
  p3desc:'Turned static templates into automated fill flows. Real impact: operational teams reclaiming weekly hours lost to bureaucracy.',
  pjSeeProject:'See Project ↗',pjUseApp:'Use App for Free ↗',pjUseFree:'Use for Free ↗',
  metEyebrow:'The process',
  metTransition:"Agencies deliver design. I deliver a psychological sequence that turns curiosity into certainty. That's what I call decision architecture.",
  metH2:"It's not design. It's<br><em>decision architecture.</em>",
  metP:'Every element placed with intention — from the first pixel to the buy button.',
  s1h:'Mental State Mapping',s1p:"We map your customer's emotional state — fears, objections, hopes. The page starts there, not with the product.",s1tag:'Strategy · Research',
  s2h:'Conversion Architecture',s2p:'Each section has a specific emotional function. Everything leads to the next step naturally.',s2tag:'Structure · Copy',
  s3h:'Performance Engineering',s3p:"Performance also communicates. Speed, stability and responsiveness preserve attention and trust while the decision is being built.",s3tag:'Technical · UX',
  s4h:'Trust Engineering',s4p:'Social proof placed with precision, specificity that builds credibility, and removal of signals that make visitors hesitate.',s4tag:'Credibility · Proof',
  s5h:'CTA as Relief',s5p:"When the narrative is built correctly, clicking the button doesn't feel like an interruption — it feels like the natural next step.",s5tag:'Conversion · Action',
  s6h:'Delivery & Optimization',s6p:'Page delivered within 15 days, ready to publish. Performance review on day 30 included.',s6tag:'Delivery · Review',
  ctaW1:'Now',ctaW2:'there',ctaW3:'are',ctaW4:'no',ctaW5:'doubts.',
  ctaSR:'Now there are no doubts.',
  ctaP:'The only question is: how much longer will you<br class="cfl-br"> leave money on the table and watch your competition<br class="cfl-br"> earn what could be <em>yours?</em>',
  ctaBtn:'YES, I WANT A STRATEGY FOR MY BUSINESS',
  ctaGuarantee:'✦ Scope defined before work begins &nbsp;·&nbsp; ✦ Delivery within 15 days &nbsp;·&nbsp; ✦ Day-30 performance review',
  footerBrand:'Landing Pages &amp; Premium Web Apps<br>Serra, Espírito Santo — ES · Brazil',
  footerPrivacy:'Terms | Privacy',footerCopy:'© 2026 Alexandre Torres · All rights reserved'
},

es:{
  htmlLang:'es',pageTitle:'Alexandre Torres — Apps Web, Sitios y Landing Pages',themeLabel:'Versión clara',
  heroEyebrow:'Maximiza Tu Base de Clientes',heroHL1:'TU PÁGINA',heroHL2:'VENDIENDO.',heroHL3:'Mientras duermes.',
  heroSR:'TU PÁGINA VENDIENDO. Mientras duermes.',
  heroSub:'Landing pages construidas con arquitectura de decisión — <em>no con opinión de diseñador.</em>',
  heroMicro:'No demores la ingeniería que transforma percepción en decisión.',heroCTA:'Quiero dejar de perder ventas',
  heroScarcity:'Atiendo máx. 3 proyectos por semana',
  stat1:'Conversión promedio',stat2num:'15días',stat2:'Plazo de entrega',stat3:'proyecto a medida',
  dorEyebrow:'El diagnóstico honesto',
  dorH2:'Cada peso en página débil.<br><em>Es un peso en la basura.</em>',
  dorP:'Cada peso en anuncios que llega a una página débil es un peso desperdiciado.',
  diagLabel:'✦ Diagnóstico técnico gratuito',diagHeadline:'Antes de contratar,<br>descubre qué está mal.',
  diagCTA:'Analizar mi sitio →',diagNote:'Sin compromiso. Te contacto por WhatsApp.',
  dor1title:'Competidores más pequeños vendiendo más.',dor1p:'El mercado no elige el mejor producto — elige el que convence primero.',
  dor2title:'Visitas sin comprar.',dor2p:'Las personas llegan, hacen scroll por segundos y se van.',
  dor3title:'Diseño bonito que no convierte.',dor3p:'Visual sin estrategia es decoración.',
  dor4title:'Copy que describe, no conecta.',dor4p:'Sin conexión emocional, no hay decisión de compra.',
  dorMethodCTA:'Ver cómo lo resolvemos',
  dorMethodSub:'Estrategia, estructura y ejecución real — sin suposiciones.',
  dorQuote:'"Una página de alta conversión no es un gasto — es el activo más rentable de tu negocio."',
  portEyebrow:'Pruebas vivas de pensamiento aplicado',
  portH2:'Proyectos que validan<br><em>mi método.</em>',
  portP:'Mis casos son sistemas vivos, construidos con la mentalidad exacta que imprimo en cada proyecto — estrategia psicológica antes que forma.',
  p1tag:'SaaS · Gestión de Playlists',p1result:'Organizó +120 canales → redujo churn en 32%',p1desc:'Plataforma que transformó el caos de playlists en un flujo manejable.',
  p2tag:'Herramienta Gratuita · Web Audio API',p2result:'Sin instalación → productores ahorrando $40/mes en software',p2desc:'Procesador de audio profesional que funciona directo en el navegador.',
  p3tag:'Herramienta Gratuita · Automatización',p3result:'Proceso manual de 40min → generación automática en 90 segundos',
  p3desc:'Convirtió plantillas estáticas en flujos de llenado automático. Impacto real: equipos operativos recuperando horas semanales perdidas en burocracia.',
  pjSeeProject:'Ver Proyecto ↗',pjUseApp:'Usar App Gratis ↗',pjUseFree:'Usar Gratis ↗',
  metEyebrow:'El proceso',
  metTransition:'Las agencias entregan diseño. Yo entrego una secuencia psicológica que transforma curiosidad en certeza de compra. Es lo que llamo arquitectura de decisión.',
  metH2:'No es diseño. Es<br><em>arquitectura de decisión.</em>',
  metP:'Cada elemento posicionado con intención — desde el primer píxel hasta el botón de compra.',
  s1h:'Mapeo de Estado Mental',s1p:'Mapeamos el estado emocional de tu cliente — miedos, objeciones, esperanzas. La página empieza ahí, no en el producto.',s1tag:'Estrategia · Investigación',
  s2h:'Arquitectura de Conversión',s2p:'Cada sección tiene una función emocional específica. Todo conduce al siguiente paso de forma natural.',s2tag:'Estructura · Copy',
  s3h:'Ingeniería de Performance',s3p:'La performance también comunica. Velocidad, estabilidad y respuesta preservan la atención y la confianza mientras se construye la decisión.',s3tag:'Técnica · UX',
  s4h:'Ingeniería de Confianza',s4p:'Prueba social posicionada con precisión, especificidad que genera credibilidad y eliminación de señales que hacen dudar al visitante.',s4tag:'Credibilidad · Prueba',
  s5h:'CTA Como Alivio',s5p:'Cuando la narrativa está bien construida, hacer clic en el botón no parece una interrupción — parece el siguiente paso natural.',s5tag:'Conversión · Acción',
  s6h:'Entrega y Optimización',s6p:'Página entregada en hasta 15 días, lista para publicar. Revisión de performance en el día 30 incluida.',s6tag:'Entrega · Revisión',
  ctaW1:'Ya',ctaW2:'no',ctaW3:'hay',ctaW4:'más',ctaW5:'dudas.',
  ctaSR:'Ya no hay más dudas.',
  ctaP:'La única pregunta es: ¿cuánto tiempo más vas a<br class="cfl-br"> dejar dinero sobre la mesa y ver a tu competencia<br class="cfl-br"> ganar con lo que podría ser <em>tuyo?</em>',
  ctaBtn:'SÍ, QUIERO UNA ESTRATEGIA PARA MI NEGOCIO',
  ctaGuarantee:'✦ Alcance definido antes de comenzar &nbsp;·&nbsp; ✦ Entrega en hasta 15 días &nbsp;·&nbsp; ✦ Revisión de performance en el día 30',
  footerBrand:'Landing Pages &amp; Apps Web Premium<br>Serra, Espírito Santo — ES · Brasil',
  footerPrivacy:'Términos | Privacidad',footerCopy:'© 2026 Alexandre Torres · Todos los derechos reservados'
}
};

function detectLang(){
  var s=localStorage.getItem('at-lang');
  if(s&&T[s])return s;
  var n=(navigator.language||navigator.userLanguage||'pt').toLowerCase();
  if(n.startsWith('pt'))return 'pt';
  if(n.startsWith('es'))return 'es';
  if(n.startsWith('en'))return 'en';
  return 'en';
}

function applyLang(lang){
  var d=T[lang];if(!d)return;
  document.documentElement.lang=d.htmlLang;
  document.title=d.pageTitle;
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var k=el.getAttribute('data-i18n');
    if(d[k]!==undefined)el.textContent=d[k];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el){
    var k=el.getAttribute('data-i18n-html');
    if(d[k]!==undefined)el.innerHTML=d[k];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
    var k=el.getAttribute('data-i18n-placeholder');
    if(d[k]!==undefined)el.setAttribute('placeholder',d[k]);
  });
  document.querySelectorAll('.lang-btn').forEach(function(btn){
    var a=btn.dataset.lang===lang;
    btn.classList.toggle('active',a);
    btn.setAttribute('aria-pressed',String(a));
  });
}

var cur=detectLang();
applyLang(cur);

document.querySelectorAll('.lang-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    var l=btn.dataset.lang;
    cur=l;
    localStorage.setItem('at-lang',l);
    applyLang(l);
    document.dispatchEvent(new CustomEvent('langChange',{detail:{lang:l}}));
  });
});

})();
