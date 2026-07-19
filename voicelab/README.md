# 🎙️ VoiceLab — Processador de Locução Gratuito

> Microfone de celular não precisa soar como microfone de celular.  
> *Com os filtros certos, qualquer voz pode soar como estúdio.*

[![Licença](https://img.shields.io/badge/licença-gratuito-brightgreen)](#licença)
[![Tamanho](https://img.shields.io/badge/tamanho-~80KB-blue)](#distribuição)
[![Offline](https://img.shields.io/badge/offline-100%25-teal)](#privacidade)
[![Zero dependências](https://img.shields.io/badge/dependências-zero-orange)](#tecnologia)

---

## 📌 Visão Geral

O **VoiceLab** é um processador de áudio para locução que roda inteiramente no navegador — sem instalação, sem conta, sem assinatura. Um único arquivo `.html` que utiliza a **Web Audio API** nativa para processar sua voz com qualidade de estúdio, 100% localmente.

Ideal para **criadores de conteúdo**, **locutores**, **professores de EAD**, **podcasters** e qualquer pessoa que grave voz com equipamento simples e queira um resultado profissional.

---

## ✨ Funcionalidades

| Módulo | Descrição |
|---|---|
| 🎚️ **Equalizador (EQ)** | Ajuste de frequências para moldar o timbre da voz |
| 🗜️ **Compressor** | Reduz a diferença entre os picos e vales da fala |
| 🔇 **De-esser** | Remove sibilâncias excessivas (sons de "s" e "ch" metálicos) |
| 🔒 **Limiter** | Garante que o áudio exportado nunca ultrapasse o teto digital |
| ⚡ **Controle de Velocidade** | Altera a duração sem modificar o pitch (algoritmo WSOLA) |
| 🎛️ **Presets** | Configurações pré-definidas para diferentes cenários de locução |
| 📤 **Exportação WAV** | Saída em WAV PCM 16-bit, lossless e universalmente compatível |

### Presets disponíveis
- **Podcast** — equilíbrio entre presença e warmth
- **Narração EAD** — clareza e inteligibilidade maximizadas
- **YouTube** — brilho e projeção para câmeras e ambientes domésticos
- **Estúdio** — configuração neutra para pós-produção externa

---

## 🚀 Como usar

Não há nada para instalar.

1. **Baixe** o arquivo `VoiceLab.html`
2. **Abra** no seu navegador
3. **Importe** seu arquivo de áudio
4. **Ajuste** os parâmetros ou selecione um preset
5. **Exporte** o resultado em WAV

```
Formatos de entrada suportados:
MP3 · WAV · OGG · M4A · WEBM
(e qualquer formato decodificável pelo codec do navegador)
```

---

## 🌐 Compatibilidade de Navegadores

| Navegador | Versão mínima | Status |
|---|---|---|
| Google Chrome | v66+ | ✅ Recomendado |
| Microsoft Edge | v79+ | ✅ Recomendado |
| Mozilla Firefox | v76+ | ✅ Suportado |
| Safari | v14+ | ✅ Suportado |
| Internet Explorer | — | ❌ Não suportado |

> Para melhor experiência, recomenda-se **Chrome** ou **Edge**.

---

## 🔒 Privacidade

**Seu áudio nunca sai do seu dispositivo.**

- Todo o processamento é feito localmente via **Web Audio API**
- Nenhum dado é enviado a servidores
- Funciona completamente **offline** após o primeiro carregamento
- Não há telemetria, rastreamento ou coleta de dados

---

## 📦 Distribuição

```
Arquivo único · ~80KB · zero dependências de runtime · zero npm
```

O VoiceLab é distribuído como um único arquivo HTML autocontido, sem bibliotecas externas de runtime. A única dependência de rede é o carregamento das fontes via Google Fonts — necessário apenas na primeira abertura online.

---

## 🛠️ Tecnologia

Construído inteiramente com tecnologias nativas da web:

- **Web Audio API** — processamento de áudio em tempo real no navegador
- **WSOLA** *(Waveform Similarity Overlap-Add)* — alteração de velocidade sem modificação de pitch
- **HTML5 · CSS3 · JavaScript vanilla** — sem frameworks, sem dependências

---

## 🎬 Compatibilidade de Exportação

O arquivo exportado é **WAV PCM 16-bit (lossless)** e funciona nativamente em:

- Camtasia · DaVinci Resolve · Adobe Premiere
- Final Cut Pro · CapCut · Audacity
- Qualquer editor de áudio ou vídeo

---

## ❓ FAQ

<details>
<summary><strong>O controle de velocidade altera o pitch da voz?</strong></summary>

Não. O VoiceLab usa o algoritmo **WSOLA**, que altera a duração do áudio sem modificar o pitch. Você pode acelerar a 1.5× ou 2× e a voz continua com o mesmo tom — sem "efeito de esquilo".
</details>

<details>
<summary><strong>Qual é o limite de tamanho de arquivo?</strong></summary>

Não existe limite imposto pelo VoiceLab. O limite prático é a memória disponível no seu dispositivo. Em geral, arquivos de até 500MB funcionam sem problemas.
</details>

<details>
<summary><strong>Posso usar em produções comerciais?</strong></summary>

Sim. O VoiceLab é completamente gratuito para uso pessoal, educacional e comercial. Não há restrições de licença sobre o áudio processado.
</details>

<details>
<summary><strong>Preciso de internet para usar?</strong></summary>

Após o primeiro carregamento (necessário para as fontes), o VoiceLab funciona completamente offline.
</details>

---

## 📄 Licença

Distribuído gratuitamente para criadores de conteúdo.  
Livre para uso **pessoal, educacional e comercial**.

---

## 👤 Autor

Criado por **Alexandre Torres**

[![Instagram](https://img.shields.io/badge/@aletordev-E4405F?style=flat&logo=instagram&logoColor=white)](https://instagram.com/aletordev)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=flat&logo=youtube&logoColor=white)](https://www.youtube.com/@aletordev)
[![Site](https://img.shields.io/badge/alexandretorres.com.br-000?style=flat&logo=google-chrome&logoColor=white)](https://alexandretorres.com.br)

---

> *CNPJ 54.806.916/0001-62 · © Alexandre Torres · Todos os direitos reservados*
