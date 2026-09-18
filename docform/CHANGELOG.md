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
