# DocForm — Changelog · Etapa 1 de Melhorias

Implementado a partir do ROADMAP_MELHORIAS.md, priorizando itens de **alto impacto e baixa/média complexidade** que não exigem trocar a arquitetura atual do app (isso preserva 100% do que já funciona).

## ✅ O que foi feito

### Fase 3 — Novos Presets Jurídicos
- **Distrato Contratual** (CC Art. 472)
- **Procuração Ad Judicia et Extra** — padrão OAB (CC Arts. 653–692 + CPC Art. 105)
- **Termo de Consentimento LGPD** (Lei 13.709/2018, Arts. 7º–9º)
- **Notificação Extrajudicial / Aviso Prévio** (CC Arts. 397 e 402)

Cada um com: título automático, campos de assinantes, base legal, badge colorido e **fingerprint de detecção automática** (o app já sugere o preset certo ao colar o texto).

### Fase 2 — Resiliência Offline
- **Rascunho automático**: o texto e os campos principais (título, número, assinantes) são salvos localmente enquanto você digita.
- Se a aba fechar ou a conexão cair antes de exportar, o DocForm oferece **restaurar o rascunho** na próxima abertura.
- Versão do Service Worker atualizada (`v3`) para forçar atualização em quem já instalou o app.

### Fase 6 — Acessibilidade & UX
- **Modo Zen** (botão 🧘 no cabeçalho): oculta a barra lateral para foco total na edição, com preferência salva.
- **Navegação por teclado**: itens de menu, presets e cartões agora respondem a Tab + Enter/Espaço (antes só funcionavam com clique/toque).
- **Skip link** ("Pular para o conteúdo") para leitores de tela e usuários de teclado.
- Contraste de foco visível (`focus-visible`) em todos os elementos interativos.
- `aria-label` no toggle de detecção automática.

## 🔜 Próximas etapas (ainda no roadmap, não implementadas nesta rodada)
Por serem de maior complexidade/risco — trocar o textarea por um editor WYSIWYG, motor de paginação A4 dinâmica com quebras reais, réguas de margem drag-and-drop, IndexedDB completo, file_handlers do manifest — recomendo tratá-las em rodadas separadas, testando cada uma isoladamente. Posso seguir com a próxima fase quando você quiser (ex.: Fase 1 — Editor Rico, ou Fase 3 — tipografia serifada por categoria).

---

# Etapa 2

## ✅ O que foi feito

### Fase 7 — Metadados de Exportação (PDF e DOCX)
- PDF e DOCX de contrato, currículo e e-mail agora saem com **título, autor, assunto e palavras-chave** embutidos no arquivo (usando o preset jurídico, partes e lei aplicável).
- Melhora indexação, busca no computador do usuário e credibilidade do arquivo ao abrir no Word/Adobe Reader.

### Fase 3 — Gestão de Viúvas e Órfãs (correção real, não só CSS)
- **Bug corrigido no motor de PDF**: o título de cláusula reservava espaço só para si mesmo — podia acabar sozinho no fim da página com o parágrafo inteiro empurrado para a página seguinte. Agora o motor verifica se título + início do parágrafo cabem juntos antes de decidir quebrar a página.
- **Bloco de assinaturas + Gov.br + Testemunhas** agora reserva o espaço combinado de uma vez, garantindo que fiquem sempre na mesma folha (antes podiam ser separados se a assinatura coubesse mas o carimbo Gov.br não).
- Regras `page-break-inside/after` adicionadas em `styles.css` para quando o usuário usa "Imprimir" do navegador (Ctrl+P) em vez de exportar PDF.

## ⏸️ Considerado e descartado nesta rodada
- **Conversão de valores monetários por extenso** (Fase 4): decidi não inserir isso automaticamente no corpo do documento porque conflita com o princípio central do DocForm — "o conteúdo não é alterado, apenas a formatação". Inserir texto extra (mesmo que só o valor por extenso) muda o conteúdo jurídico do contrato, e um erro de regex em um valor monetário seria um risco real. Uma versão mais segura seria mostrar o valor por extenso como **referência/copiável num painel lateral**, sem tocar no texto do documento — posso implementar assim se você quiser.


---

# Etapa 3

## 🔍 Descoberta importante
Ao revisar o `script.js` a fundo, encontrei que **dois itens que o roadmap marcava como "alta complexidade" já estavam implementados** de forma mais simples do que a proposta original (TipTap/Quill), mas funcional:
- **Paginação A4 real dinâmica** (`buildPaginatedHtml`): o app já mede a altura de cada elemento renderizado e quebra o conteúdo em páginas `.doc-page` de verdade — não é uma simulação.
- **Edição inline no preview** (`toggleEditPreview`): já existia um modo `contenteditable` que permite editar o texto diretamente na pré-visualização A4, refletindo no PDF/DOCX exportado.

Por isso, em vez de trocar tudo por uma biblioteca externa (TipTap/Quill — risco alto de quebrar a sincronia entre preview, PDF e DOCX), evoluí o que já existe.

## ✅ O que foi feito

### Fase 1 — Barra de Ferramentas Flutuante (estilo Medium/Notion)
- Ao selecionar qualquer texto no modo de edição, aparece uma barra flutuante com: **Negrito, Itálico, Sublinhado, Tachado**, alinhamento (esquerda/centro/justificado), marcadores e numeração.
- A barra se posiciona automaticamente acima do texto selecionado e mostra qual formatação já está ativa.

### Fase 1 — Higienização de Cola (Paste Sanitizer)
- Ao colar conteúdo do ChatGPT, Claude, Word ou Google Docs no modo de edição, o DocForm agora **remove automaticamente** `style=""`, `class=""`, fontes e cores incorporadas.
- Mantém apenas a estrutura semântica (títulos, parágrafos, listas, tabelas, negrito/itálico/sublinhado) — exatamente como pedia o roadmap.
- Corrigido durante o desenvolvimento: um bug em que tags aninhadas dentro de um `<div>` colado escapariam da limpeza (a recursão agora sanitiza os elementos mesmo depois de "desembrulhar" wrappers).

## 🔜 Ainda no roadmap (não implementado)
- Suporte a **tabelas dinâmicas com redimensionamento de colunas** dentro do editor (tabelas já são suportadas na formatação automática, mas não editáveis via arraste).
- **Réguas de margem drag-and-drop** — a paginação já é real, mas o ajuste de margens ainda é só numérico (não há régua visual).
- **IndexedDB completo** — hoje o rascunho é salvo via `localStorage` (mais simples, funciona offline igual, mas com limite de ~5MB — suficiente para texto, não para anexos grandes).

---

# Etapa 4

## ✅ O que foi feito

### Fase 4 — Detecção Automática de CPF/CNPJ (Auto-Fill Local)
- O app agora **detecta automaticamente CPF e CNPJ** presentes no texto colado (ex.: "João da Silva, portador do CPF nº 123.456.789-00...").
- Os documentos detectados são associados às partes **pela ordem de aparição no texto** e usados para preencher o bloco de assinatura no lugar do placeholder em branco (`___.___.___-__`) — no preview, no PDF exportado e no DOCX exportado (as três saídas ficam sincronizadas).
- Se nenhum CPF/CNPJ for encontrado, o comportamento antigo (linha em branco para preenchimento manual) é mantido — nada quebra para quem não inclui essa informação no texto.
- O contador de "documentos detectados" aparece no resumo abaixo do preview, para o usuário saber que a extração aconteceu.

## ⚠️ Nota de escopo
Não avancei para os campos completos de qualificação (RG, Estado Civil, Profissão, Endereço/CEP) nesta rodada — a extração de CPF/CNPJ já cobre o dado mais usado nas assinaturas, e associar corretamente RG/Estado Civil/Profissão a cada parte exigiria um parser de proximidade mais sofisticado (risco de atribuir o dado errado à parte errada). Prefiro fazer isso como uma etapa própria, com mais testes, se você confirmar que quer seguir por aí.

---

# Etapa 5

## 🔍 Mais uma descoberta
Revisando a Fase 4 do roadmap, vi que o "score ponderado" e a extração de título/cidade/data/número/partes com confiança **já existiam** (`analisarTextoInteligente`, `AF_PATTERNS`) — só faltava a peça que o roadmap descreve explicitamente: *"Sugestões contextuais inteligentes via toast: 'Detectamos que este é um Contrato de Locação. Deseja aplicar o Preset...?'"*. Isso foi implementado nesta etapa.

## ✅ O que foi feito

### Fase 4 — Sugestão Acionável de Preset
- Quando o app detecta o tipo de documento mas a confiança não é alta o bastante para aplicar sozinho, agora aparece uma sugestão **com botão "Aplicar"** no painel de detecção — exatamente como descrito no roadmap.
- Quando a confiança é alta e o preset já foi aplicado automaticamente, o painel informa isso claramente ("Tipo de Documento (aplicado)"), sem pedir confirmação desnecessária.

### Fase 2 — File Handlers do PWA
- Adicionado `file_handlers` no `manifest.json`: com o app instalado, o usuário pode abrir um `.txt` direto pelo sistema operacional ("Abrir com... DocForm") e o conteúdo cai automaticamente no editor, já disparando a detecção automática.
- SW atualizado para `v4`.

## 🔜 Ainda no roadmap (avaliado e adiado conscientemente)
- **Réguas de margem drag-and-drop**: hoje as margens são fixas (padrão OAB/Tribunais) em três motores diferentes (preview, PDF, DOCX). Parametrizar isso com uma régua visual arrastável exigiria unificar essas três fontes de verdade — decidi não arriscar sem poder testar visualmente o resultado numa rodada só.
- **RG/Estado Civil/Profissão/CEP** no auto-fill: mais arriscado que CPF/CNPJ porque a posição no texto associa menos claramente a cada parte — a chance de atribuir o dado errado é maior.
- **Tabelas com redimensionamento de colunas por arraste** no editor: as tabelas já funcionam na formatação automática, mas o redimensionamento manual ainda não foi implementado.
- **.docx como file_handler**: só implementei `.txt` porque o app não tem hoje um leitor de `.docx` (só escreve); ler `.docx` exigiria adicionar uma biblioteca de parsing, o que é uma peça nova, não um ajuste do que já existe.

---

# Etapa 6 — Correções críticas + Anexos com validade jurídica

## 🐛 Bugs reais corrigidos

### 1. Editor não funcionava em documentos de 2+ páginas
O modo de edição (`contenteditable`) e a exportação só liam a **primeira página** do documento formatado. Num contrato real (que quase sempre passa de 1 página), o texto das páginas seguintes não era editável — e, pior, podia ser **perdido silenciosamente na exportação em DOCX** (que nunca aplicava nenhuma edição feita no preview, nem mesmo da página 1).
- Edição agora funciona em **todas as páginas**.
- `getEditedFullText()` junta o conteúdo editado de todas as páginas, na ordem certa, para PDF **e** DOCX.
- O modo de edição **já vem ativo automaticamente** ao formatar — não é mais preciso clicar em "✏️ Editar" para descobrir que o preview é editável.

### 2. Logotipo distorcido no PDF/DOCX
No preview HTML o logo já respeitava a proporção original, mas na exportação em **PDF** (contrato e e-mail) ele era forçado a um retângulo fixo de 40×10mm — **esticando a imagem**. E o **DOCX não incluía logo nenhum**.
- Adicionado campo **"Nome da Empresa"** ao lado do logotipo.
- A proporção real da imagem é capturada no upload (`logoAspect`) e usada para calcular largura/altura corretas em PDF e DOCX — a imagem **nunca é esticada**, apenas encolhida mantendo a forma original.
- Nome da empresa agora aparece ao lado do logotipo no cabeçalho, nas três saídas (preview, PDF, DOCX).

## ✅ Novo recurso: Anexos com validade jurídica
Implementado conforme as boas práticas que você descreveu:
- Cada imagem vira um **Anexo (A, B, C...)** em página própria, com:
  - Identificação clara no topo ("ANEXO A — Planta Baixa do Imóvel")
  - **Legenda explicativa** e **data do registro** (opcionais)
  - **Linha de rubrica** para as duas partes no rodapé da página do anexo
  - Imagem **redimensionada sem distorção** (mesma técnica de proporção real usada no logotipo) — nunca corta nem estica, mesmo em fotos, plantas baixas ou prints de tela
- Botão **"📋 Copiar referência sugerida"**: gera um texto pronto (ex.: *"conforme demonstrado no Anexo A, que contém a planta baixa..."*) para você colar no corpo do contrato — o app não insere isso sozinho no seu texto, porque alterar o conteúdo automaticamente vai contra o princípio central do DocForm.
- Funciona nas três saídas: preview, PDF (jsPDF vetorial) e DOCX (nativo, com `docx.ImageRun`).

## ⚠️ Fora do escopo desta etapa
- **Assinatura digital de fato / hash do documento**: isso depende da plataforma de assinatura (Gov.br, DocuSign, Clicksign) — o DocForm prepara o documento (espaço de rubrica, referência ao anexo, imagem nítida) para ser assinado nessas plataformas, mas não gera hash criptográfico por conta própria.
- **Qualidade/nitidez da imagem**: o app não faz upscaling nem correção de nitidez — a responsabilidade de anexar uma imagem legível (não borrada, não cortada) continua sendo do usuário, como orientado no card de Anexos.

---

# Etapa 7 — Correções de raiz (PWA), Editor Rico, Posição do Logo, Assinatura Digital, Largura

## 🔴 Causas raiz do botão de PWA nunca aparecer (existiam antes das minhas edições)
1. **`script.js` carregado duas vezes** no `app.html` (uma `defer` no `<head>`, outra sem `defer` no fim do `<body>`) — causava erro de "identificador já declarado" e comportamento imprevisível entre navegadores. Removida a duplicata; agora carrega uma única vez, via `defer`.
2. **PWA duplicado**: existia uma implementação inline no `app.html` E outra dentro do `script.js` — a mais antiga (inline) sempre vencia por rodar por último, sobrescrevendo a mais completa. Removida a duplicata.
3. **`sw.js` pré-cacheava `index.html`, mas o arquivo se chama `app.html`** — isso fazia a instalação do Service Worker **falhar silenciosamente todas as vezes** (o `cache.addAll` original falha por inteiro se UM recurso da lista 404). Sem SW ativo, o Chrome nunca oferece instalar. Corrigido o nome e trocado `addAll` por `add()` individual com `catch`, para um recurso faltando nunca mais derrubar a instalação inteira.
4. **`manifest.json` referenciava ícones que nunca existiam** (`icon-192.png`, `icon-512.png`) — sem ícones reais, o Chrome não considera o app instalável. Gerados os dois ícones + um favicon, no estilo visual do app.
5. **`start_url` do manifest apontava para `./`**, que só funciona se o servidor tratar `app.html` como documento padrão — corrigido para `./app.html` explicitamente. Mesmo ajuste nos atalhos e no `file_handler`.
6. **Favicon com URL quebrada** (`https://assets/...` — um domínio inválido, não um caminho relativo) e outro apontando pra um arquivo inexistente — corrigidos.
7. **Estratégia de cache de CSS/JS trocada de "stale-while-revalidate" para "network-first"**: antes, toda vez que novos arquivos eram publicados, a primeira visita ainda mostrava a versão **anterior** (só atualizava no carregamento seguinte) — isso explica boa parte da sensação de "nada muda depois de várias edições". Bibliotecas de CDN (jsPDF, docx.js) continuam em cache rápido, já que a versão vem fixa na própria URL.

## ✅ Editor de Texto Rico
- O textarea simples da etapa de entrada foi substituído por uma caixa de edição (`contenteditable`) com **barra de formatação fixa e sempre visível** (negrito, itálico, sublinhado, listas com marcadores/numeradas, limpar formatação).
- Mantém 100% de compatibilidade com o motor de auto-formatação: o texto plano continua alimentando a detecção de cláusulas, título, partes etc. exatamente como antes — a formatação manual serve para organizar visualmente enquanto você escreve.
- Colar conteúdo do ChatGPT/Word/Google Docs já vem com o sanitizador de cola (reaproveitado da Etapa 3).

## ✅ Posição do Logotipo e da Marca d'água
- Os botões de "Posição" eram da Marca d'água, mas sem nenhum feedback visual imediato (só apareciam no PDF final) — pareciam quebrados. Adicionado um **indicador visual instantâneo** (pontinho que se move) na zona de upload.
- O **logotipo** não tinha nenhum controle de posição — adicionado toggle **Esquerda/Direita**, funcionando no preview, PDF e DOCX.

## ✅ Espaçamento logo → corpo do texto
- Aumentada a folga entre o cabeçalho (logo/empresa) e o título/corpo: 8mm→12mm no preview, 14mm→20mm no PDF, espaçamento equivalente no DOCX.

## ✅ Assinatura Eletrônica: Gov.br, DocuSign e Clicksign
- O chip binário "Área Gov.br" virou um **seletor com 4 opções**: Nenhuma / Gov.br / DocuSign / Clicksign.
- Cada plataforma tem rótulo e cor de destaque próprios (sem usar logotipos de terceiros — só texto), aplicados de forma consistente no preview, PDF e DOCX.
- Presets que já vinham com Gov.br como padrão continuam vindo pré-selecionados, mas agora o usuário pode trocar livremente.

## ✅ Largura do app
- `.main` deixou de ter um teto fixo de 860px e agora ocupa `calc(94vw - 228px)` — a soma do app (sidebar + conteúdo) passa a usar ~94% da largura da tela, em vez de deixar uma faixa grande vazia em monitores largos. Em telas pequenas (mobile), continua 100% como antes.

---

# Etapa 8 — Bug do negrito nas cláusulas + Editor unificado dentro do Modo Edição

## 🐛 Bug real corrigido: cláusula inteira saindo em negrito/maiúsculas
Confirmado com suas capturas de tela: quando o título e o corpo da cláusula vinham na MESMA linha no formato "Cláusula Nª (Assunto): texto do parágrafo..." (o formato mais comum gerado por IA), o motor de formatação não conseguia separar título de corpo — e jogava a linha inteira para o estilo de título (negrito + maiúsculas).

Causa raiz: o regex que separa "número da cláusula" de "resto do texto" só reconhecia separador por traço ou ponto (`Cláusula 1ª - Título`), não por parênteses (`Cláusula 1ª (Título): corpo`). Reescrevi o regex para reconhecer os dois formatos — testei com as frases exatas das suas imagens e as 6 variações passaram corretamente (título fica em negrito, corpo fica normal).

## ✅ Editor de texto reorganizado — agora só existe DENTRO do Modo Edição
Como você apontou, não fazia sentido ter um editor rico separado na etapa de colar o texto. Reverti a entrada de texto (③ Texto do Contrato) para um textarea simples — só para colar o texto bruto — e concentrei toda a edição rica exclusivamente no **Modo Edição** (o botão "✏️ Editar" sobre o documento já formatado).

## ✅ Barra de ferramentas ampliada — agora com ~25 funções, estilo Word
A barra flutuante de 6 botões virou uma **barra fixa no topo do preview**, com:
- Fonte (Times New Roman, Arial, Georgia, Courier New, Calibri) e tamanho
- Estilo de parágrafo (Parágrafo, Título 1/2/3)
- Negrito, Itálico, Sublinhado, Tachado
- Cor do texto e cor de destaque (marca-texto)
- Alinhamento (esquerda, centro, direita, justificado)
- Marcadores, numeração, aumentar/diminuir recuo
- Inserir link, inserir tabela, limpar formatação
- Desfazer / Refazer

A barra aparece automaticamente ao entrar no Modo Edição e some ao sair. A seleção de texto é preservada mesmo ao usar os seletores de fonte/cor (que normalmente tirariam o foco do documento) — implementei um mecanismo que guarda e restaura a seleção antes de cada comando.


---

# Etapa 9 — Fechamento da "superfície única" (colar direto no documento) + mobile

## 🔍 Contexto
O `app.html` já estava no modelo novo (o `<textarea id="input-text">` virou um campo **oculto** e o texto é colado direto na folha do documento, com o botão "🪄 Aplicar Formatação"), mas o `script.js` ainda seguia parte do modelo antigo. Esta etapa fecha essa ligação. Tudo abaixo foi reproduzido e verificado no Chromium headless (27 verificações automatizadas + capturas de tela em desktop e celular).

## 🐛 Bugs corrigidos — superfície única
- **Não havia onde colar o texto**: `initBlankCanvas()` existia mas nunca era chamada → a área do documento abria vazia. Agora é criada no carregamento (com placeholder dentro da folha).
- **`updateCount()` lançava `TypeError`** (`#char-count` foi removido do HTML). Quebrava `limparFormulario()`. Agora é seguro e mostra a contagem no cabeçalho do documento.
- **"Limpar" escondia a seção do documento inteira** — que agora é a própria superfície de colar. Removido.
- **`setInputText()` só atualizava o campo oculto**: restaurar rascunho, abrir `.txt` pelo SO (file_handlers) e "Limpar" não mostravam nada. Agora atualizam a folha visível (`setCanvasText`, `focusCanvas`).
- **Bloco de assinatura entrava no texto de exportação**: `getCanvasPlainText()` lia o `.sign-section` (data/local, assinantes, Gov.br/DocuSign, testemunhas), que o PDF/DOCX geram sozinhos a partir dos campos → assinatura duplicada na exportação e acúmulo a cada "Aplicar Formatação". Agora esse bloco é ignorado; a partir da 2ª formatação o HTML é idêntico (ponto fixo). *(Deduzido pelo texto entregue à exportação e pelo código dos motores; a exportação em si não pôde ser executada offline.)*
- **Folha em branco invisível**: com o painel oculto, `clientWidth` = 0 → `availW = -2` passava no guard `!availW` e aplicava `scale(-0.0025)`. Guard corrigido (`<= 0`) e reescala ao navegar para "Formatar".

## 🐛 Bugs corrigidos — celular (anteriores a esta etapa)
- **Documento de 2+ páginas**: só o 1º `.doc-page` era escalado e a altura do wrapper travava nele → páginas 2+ cortadas e inalcançáveis. Agora **todas** as páginas são escaladas (âncora à esquerda + compensação de margem).
- **Folha deslocada ~217px para a direita** (contrato, currículo e e-mail): `transform-origin: top center` numa caixa de 794px em tela estreita. Trocado por `top left`.
- **Botão "⬇ PDF" cortado** e overflow horizontal: "Aplicar Formatação" agora ocupa uma linha; DOCX/PDF dividem a de baixo.
- **Toast cortado** na borda direita (`white-space: nowrap`): agora quebra linha.

## 🐛 Outros
- **Destaque errado no menu**: o mapa de índices em `navigate()` estava deslocado em 1 (ex.: "Currículo" aceso em Formatar) — afetava atalhos do manifest (`?page=`), menu de presets e barra inferior. Agora localiza o item pelo próprio `onclick`.
- `canonical` agora aponta para `https://alexandretorres.com.br/docform/app.html`; metadados dos PDFs (`creator`) trocaram `docform.app` por `alexandretorres.com.br/docform`.
- Service Worker → `v6`; ícones adicionados ao pré-cache (cada item continua individual, com `catch`).

## ⚠️ Pendente / não verificado
- **Exportação PDF/DOCX não foi executada** (sem rede para carregar jsPDF/docx). Vale testar 1 contrato de 2 páginas exportando PDF e DOCX: a assinatura deve aparecer **uma vez só**.
- As meta tags `og:*`/`twitter:*` do `app.html` estão dentro de comentário HTML (desativadas). Os valores já foram deixados corretos (URL absoluta em `alexandretorres.com.br/docform/`), mas `assets/img/og.jpg` **não existe** — crie a imagem (1200×630) antes de descomentar.
- Os ícones `assets/img/icon-192.png`, `icon-512.png` e `favicon.png` (Etapa 7) não vieram no upload; confirme que estão no repositório — sem eles o Chrome não oferece instalar o PWA.
- Título duplicado no documento: o título do preset (ex.: "DOCUMENTO PARTICULAR") aparece no cabeçalho e a 1ª linha colada ("CONTRATO DE LOCAÇÃO…") continua no corpo. Comportamento do motor, não alterado.
