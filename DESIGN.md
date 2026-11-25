---
name: Kinox Admin
description: Central administrativa desktop em estética de arquivo 35mm (preto obsidiana, branco editorial e sépia) para operação completa da Kinox Cinema API.
colors:
  sepia-primary: "#c19a6b"
  sepia-bright: "#e0c39c"
  sepia-deep: "#8c6a43"
  void-black: "#050504"
  obsidian-surface: "#0a0908"
  carbon-panel: "#11100e"
  elevated-surface: "#181613"
  hover-surface: "#201c17"
  pure-white: "#ffffff"
  archival-bone: "#f4efe6"
  warm-paper: "#e6dfd3"
  muted-ink: "#b3aa9c"
  dim-ink: "#8a8173"
  status-ok: "#b7c9a6"
  status-warn: "#e0c39c"
  status-danger: "#d98276"
typography:
  logo:
    fontFamily: "Bodoni Moda, Georgia, Times New Roman, serif"
    fontSize: "2.05rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.03em"
  display:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: "3.6rem"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: "1.8rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: "1.45rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.7rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  none: "0px"
  xs: "2px"
  sm: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.sepia-primary}"
    textColor: "{colors.void-black}"
    rounded: "{rounded.xs}"
    padding: "9px 18px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.sepia-bright}"
    textColor: "{colors.void-black}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.archival-bone}"
    rounded: "{rounded.xs}"
    padding: "9px 18px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.hover-surface}"
    textColor: "{colors.sepia-bright}"
  input-search:
    backgroundColor: "{colors.carbon-panel}"
    textColor: "{colors.archival-bone}"
    rounded: "{rounded.none}"
    padding: "9px 14px"
    height: "42px"
  tab-active:
    backgroundColor: "{colors.sepia-primary}"
    textColor: "{colors.void-black}"
    rounded: "{rounded.none}"
    padding: "6px 14px"
    height: "38px"
  console-panel:
    backgroundColor: "{colors.carbon-panel}"
    textColor: "{colors.archival-bone}"
    rounded: "{rounded.none}"
    padding: "32px"
  inspector-drawer:
    backgroundColor: "{colors.obsidian-surface}"
    textColor: "{colors.archival-bone}"
    rounded: "{rounded.none}"
    width: "500px"
---

# Design System: Kinox Admin

## Overview

**Creative North Star: "A Cabine de Projeção 35mm"**

O sistema visual do **Kinox Admin** combina a atmosfera tátil de um arquivo cinematográfico 35mm com a precisão operacional de uma central administrativa desktop. A superfície escura em camadas de obsidiana e carvão absorve o ruído visual e devolve protagonismo a duas coisas: o cinema (quadros em cor plena sob foco na constelação) e os dados operacionais (tipografia serifada editorial, réguas tracejadas, números monoespaçados tabulares e acentos contidos em sépia).

Todas as telas integradas à Kinox Cinema API — cadastro e edição de filmes, grade de sessões e mapa de ocupação de assentos, salas e assentos físicos, gêneros, compras/ingressos, clientes e administradores — herdam exatamente esta gramática. Superfícies administrativas não decoram com ornamentos vazios; elas operam sobre grades tracejadas precisas, estados semânticos inequívocos e densidade controlada.

**Key Characteristics:**
- Paleta estritamente disciplinada em preto obsidiana, branco editorial aquecido e sépia arquivístico.
- Texturas materiais discretas do universo analógico: *film grain* sutil em tela cheia, perfurações *film-strip* de 35mm como divisores estruturais, matriz *halftone* pontilhada em áreas técnicas e réguas tracejadas (`1px dashed`) em vez de caixas genéricas.
- Separação clara de vozes tipográficas: serifada de alto contraste reservada exclusivamente à marca, serifada editorial de alta legibilidade para títulos, sans-serif neutra para corpo/formulários e monoespaçada tabular para códigos, rotas e métricas.
- Interações cirúrgicas e responsivas (180–420ms em `cubic-bezier(0.16, 1, 0.3, 1)`), com respeito integral a `prefers-reduced-motion` e acessibilidade WCAG AA.

## Colors

Uma paleta monocromática quente em preto e branco estruturada em camadas tonais sutis, pontuada por um único acento em sépia celuloide e sinais semânticos harmonizados para estados operacionais.

### Primary
- **Celluloid Sepia (`sepia-primary`)**: Acento principal do sistema. Usado em botões de ação primária, abas ativas, barras de ocupação de sessão, seleção de texto e bordas de foco.
- **Lit Sepia (`sepia-bright`)**: Estado de hover de ações primárias, rótulos de destaque monoespaçados, anéis de foco (`:focus-visible`), emblema ativo e rotas da API.
- **Deep Bronze Sepia (`sepia-deep`)**: Trilha e polegar da barra de rolagem personalizada e divisórias secundárias em sépia.

### Neutral
- **Void Black (`void-black`)**: Fundo absoluto da Hero Constelação, cortina da sequência de abertura e rodapé.
- **Obsidian Surface (`obsidian-surface`)**: Fundo base das páginas administrativas e do drawer lateral de inspeção.
- **Carbon Panel (`carbon-panel`)**: Superfície de consoles operacionais, barras de ambiente, campos de busca/formulário e cabeçalhos de tabelas.
- **Elevated Surface (`elevated-surface`)** e **Hover Surface (`hover-surface`)**: Camadas sutis de resposta ao ponteiro em linhas de tabela, listas e drawers.
- **Pure White (`pure-white`)**: Títulos de seção, valores numéricos principais e nomes de filmes em foco.
- **Archival Bone (`archival-bone`)**: Texto principal padrão de interface e rótulos de controles.
- **Warm Paper (`warm-paper`)**: Links de navegação, notas técnicas e tags secundárias.
- **Muted Ink (`muted-ink`)**: Descrições, legendas de tabela e metadados secundários (garantindo contraste WCAG AA ≥ 4.5:1 sobre obsidiana e carvão).
- **Dim Ink (`dim-ink`)**: Placeholders de inputs e indicadores terciários não críticos.

### Semantic
- **Status OK (`status-ok`)**: Indicadores de operação normal, disponibilidade ativa ou confirmação de envio.
- **Status Warn (`status-warn`)**: Alertas operacionais e avisos de atenção em harmonização com o sépia luminoso.
- **Status Danger (`status-danger`)**: Métodos `DELETE`, salas em manutenção (`MANUT.`), sessões lotadas (`100%`) e ações destrutivas (cancelamento de compra/ingresso ou remoção de registro).

### Named Rules
**The Celluloid Restraint Rule.** O sépia (`sepia-primary` / `sepia-bright`) ocupa no máximo ~10% da área visível de qualquer tela administrativa. Sua função é sinalizar ação primária, seleção ativa, foco de teclado ou dado crítico — nunca colorir grandes blocos decorativos.

**The Monochrome Spotlight Rule.** Quando um elemento fotográfico de cinema recebe foco em galerias ou constelações, somente o item focado permanece em cor plena com filete sépia; os demais recuam para monocromático escuro (`grayscale(100%) brightness(0.42)`).

## Typography

**Logo Font:** `Bodoni Moda` (fallback: Georgia, Times New Roman, serif) — uso exclusivo na marca `kīnox`.
**Display & Section Font:** `Source Serif 4` (fallback: Georgia, Times New Roman, serif) — títulos principais, títulos de módulos, cabeçalhos de drawers e estados vazios.
**Body Font:** `Archivo` (fallback: system sans-serif) — descrições, células textuais de tabela, textos de formulário e mensagens de validação.
**Label / Mono Font:** `JetBrains Mono` (fallback: ui-monospace, Menlo, monospace) — dados numéricos tabulares, horários, duração, códigos de sala/rolo, badges HTTP, rotas da API e ações de barra.

**Character:** O contraste dramático da Didone (`Bodoni Moda`) ancora a identidade cinematográfica no logotipo sem comprometer a legibilidade operacional, enquanto a `Source Serif 4` sustenta títulos nítidos em fundo escuro, amparada pela precisão técnica da `JetBrains Mono` (`font-variant-numeric: tabular-nums`) e pela neutralidade limpa da `Archivo`.

### Hierarchy
- **Logo** (weight `500`, `clamp(1.55rem, 2.2vw, 2.05rem)` na barra / `clamp(3.4rem, 7vw, 5.8rem)` na abertura, line-height `1`, tracking `-0.03em`): Exclusivo para o wordmark `kīnox`.
- **Display** (weight `500`, `clamp(2.25rem, 4.2vw, 3.6rem)`, line-height `1.04`, tracking `-0.015em`): Título principal `<h1>` de cada página administrativa (sem eyebrow/kicker acima).
- **Headline** (weight `500`, `1.8rem`, line-height `1.1`, tracking `-0.015em`): Títulos de módulos principais e cabeçalhos de painéis/drawers.
- **Title** (weight `500`, `1.45rem`, line-height `1.15`): Títulos de linhas de ledger, subseções e modais de confirmação.
- **Body** (weight `400`, `0.88rem–0.98rem`, line-height `1.6`, medida máxima `64–66ch`): Subtítulos descritivos, sinopses e textos de ajuda.
- **Label / Mono Callout** (weight `500–600`, `0.62rem–0.78rem`, tracking `0.08em–0.16em`, uppercase quando rótulo): Navegação superior, cabeçalhos de tabela, verbos HTTP, caminhos de rota, botões e contadores tabulares.

### Named Rules
**The Logo-Only Didone Rule.** `Bodoni Moda` nunca é aplicada em títulos de seção, tabelas, botões ou labels administrativos; seus traços finos pertencem exclusivamente à marca `kīnox`. Todo título operacional usa `Source Serif 4`.

**The Tabular Callout Rule.** Todo dado mensurável — preços (`R$ 48,00`), horários (`19:30`), capacidade (`112/140`), duração (`120 MIN`), IDs e códigos (`001`, `MOD-FLM`) — usa `JetBrains Mono` com `font-variant-numeric: tabular-nums`.

## Layout

O layout desktop ancora-se em um contêiner central de largura máxima `1440px` com calhas laterais fluidas (`clamp(1.25rem, 3vw, 2.75rem)`). A arquitetura evita o padrão genérico de grade uniforme de cards idênticos e organiza as telas por faixas horizontais delimitadas por **réguas tracejadas (`1px dashed`)** e divisórias **film-strip 35mm** (`22px` de altura) acompanhadas de réguas milimétricas (`10px`).

- **Ritmo de página administrativa:** Barra superior fixa (`TopBar` em grid `1fr auto 1fr`) → Faixa de contexto/ambiente ou breadcrumb → Cabeçalho da página (`<h1>` + descrição + ações primárias à direita) → Ledger de resumo operacional em 4 colunas tracejadas (quando aplicável) → Barra de busca e filtros por abas → Área principal de trabalho (tabelas densas, matriz assimétrica ou mapa de assentos) → Rodapé arquivístico com faixa film-strip.
- **Breakpoints estruturais:**
  - `≤ 1080px`: faixas multi-coluna (2 colunas ou assimétricas `1.55fr / 1fr`), ledger de 4 colunas (vai para 2 colunas) e linhas horizontais de ledger colapsam para empilhamento vertical limpo.
  - `≤ 960px`: barra inferior da Hero empilha centralizada e trilhos laterais de perfuração 35mm são ocultados.
  - `≤ 820px`: navegação superior reorganiza-se em 2 colunas (`auto 1fr`).
  - `≤ 640px`: ledger passa para 1 coluna e grades internas de salas passam de 3 para 2 colunas.

## Elevation & Depth

O sistema é **plano por camadas tonais** em repouso. Hierarquia espacial nasce do contraste controlado entre superfícies (`void-black` → `obsidian-surface` → `carbon-panel` → `hover-surface`) e das divisórias tracejadas `1px dashed`, nunca de sombras difusas espalhadas em cards estáticos. Sombras profundas aparecem exclusivamente quando um elemento se destaca fisicamente da superfície (quadro de filme sob foco na constelação ou drawer lateral sobreposto).

### Shadow Vocabulary
- **Spotlight Focus Shadow** (`box-shadow: 0 24px 64px rgba(0, 0, 0, 0.88), 0 0 0 1px rgba(224, 195, 156, 0.45)`): Aplicada apenas ao quadro de filme em hover/foco na constelação.
- **Overlay Drawer Shadow** (`box-shadow: -24px 0 64px rgba(0, 0, 0, 0.85)`): Aplicada à borda esquerda do painel lateral deslizante sobre backdrop escurecido (`rgba(5, 5, 4, 0.72)` + `backdrop-filter: blur(4px)`).

### Named Rules
**The Flat-By-Default Rule.** Superfícies administrativas em repouso nunca usam `box-shadow`. Elevação em repouso é comunicada por degrau tonal (`#0a0908` vs `#11100e`) e fronteira `1px dashed`.

## Shapes

A geometria é **arquitetônica e cortada a fio**, inspirada em janelas de câmera e fotogramas 35mm:

- **Cantos vivos:** Contêineres, tabelas, drawers, abas e inputs usam `0px` (`none`); botões e badges HTTP usam micro-chanfro de `2px` (`xs`), no máximo `4px` (`sm`). Cartões arredondados (`12px+`) ou pílulas cheias (`999px`) não pertencem a este sistema.
- **Gramática de borda tracejada → sólida:** Elementos interativos e campos em repouso usam borda `1px dashed` (`rgba(244, 239, 230, 0.16–0.32)`). Ao receber hover ou foco, a borda transita para `1px solid` em sépia (`#c19a6b`), comunicando engajamento imediato.
- **Texturas estruturais:** *Film grain* fixo sobre o viewport (`opacity: 0.042`, `mix-blend-mode: overlay`), *halftone* pontilhado em sépia/branco para zonas técnicas secundárias e perfurações *film-strip* nos limiares entre grandes seções.

## Components

Os controles são **precisos, contidos e táteis**: todo elemento interativo mantém altura mínima acessível (`38px–42px`), rótulo claro em caixa alta monoespaçada para ações/filtros e transições rápidas (`180ms`).

### Buttons
- **Shape:** Micro-chanfro arquitetônico (`2px` radius), altura mínima `40px`, padding `9px 18px`, tipografia `JetBrains Mono` `0.75rem`, uppercase, tracking `0.08em`.
- **Primary:** Fundo `sepia-primary`, texto `void-black`, borda sólida `1px` `sepia-bright`. No hover, ilumina para `sepia-bright`; no `:active`, afunda `1px` (`translateY(1px)`).
- **Ghost / Secondary:** Fundo transparente, texto `archival-bone`, borda `1px dashed` forte. No hover, a borda torna-se sólida em `sepia-primary`, texto em `sepia-bright` e fundo `rgba(193, 154, 107, 0.12)`.
- **Destructive (próximas telas CRUD):** Segue a estrutura Ghost com borda e texto em `status-danger` (`#d98276`) e fundo `rgba(217, 130, 118, 0.14)` no hover.

### Chips, Filter Tabs & HTTP Badges
- **Filter Tabs:** Altura `38px`, cantos retos (`0px`), borda `1px dashed` em repouso; estado ativo em fundo sólido `sepia-primary` com texto `void-black` e peso `600`.
- **Route Chips & Genre Tags:** Fundo escuro translúcido ou `sepia-wash`, borda `1px dashed` em sépia (`rgba(193, 154, 107, 0.36)`), texto monoespaçado `0.7rem`.
- **HTTP Verb Badges:** Micro-badges `2px` (`0.65rem` peso `600`): `GET` neutro em bone/transparente; `POST` / `PUT` / `PATCH` em sépia; `DELETE` em `status-danger`.

### Containers, Consoles & Tables
- **Corner Style:** Reto (`0px`), sem cards aninhados.
- **Background:** `carbon-panel` sobre fundo `obsidian-surface`, separados por bordas internas `1px dashed` sem sombra.
- **Internal Padding:** `32px` em consoles principais; linhas de tabela e ledger com padding vertical `12px–24px` e separador inferior `1px dashed`.
- **Estados obrigatórios nas telas CRUD:** Skeleton loading em blocos tonais escuros (sem spinners genéricos), empty state com borda tracejada e botão de recuperação, estado de erro com mensagem clara e ação de retentativa.

### Inputs & Form Fields
- **Style:** Fundo `carbon-panel`, borda `1px dashed` forte, altura mínima `42px`, cantos retos (`0px`), caret em `sepia-bright`, fonte `JetBrains Mono` (`0.78rem`) para filtros/códigos e `Archivo` (`0.9rem`) para textos longos e sinopses.
- **Focus:** Transição de borda tracejada para `1px solid` `sepia-primary` + anel `:focus-visible` de `2px solid` `sepia-bright` com `3px` de offset.
- **Error / Disabled:** Borda sólida `status-danger` com mensagem de erro diretamente abaixo do campo; campos desabilitados em `obsidian-surface` com borda `1px dashed` atenuada e `cursor: not-allowed`.

### Navigation
- **Top Bar:** Fixa no topo (`1fr auto 1fr`), marca `kīnox` + tag `ADMIN` à esquerda, atalho principal centralizado e módulos administrativos à direita em `JetBrains Mono` `0.72rem` uppercase com sublinhado animado em `sepia-bright` da esquerda para a direita. Transita para fundo escuro translúcido (`rgba(8, 8, 7, 0.94)` + `blur(8px)`) e borda inferior tracejada ao rolar.

### Inspector & Form Drawer
- **Overlay:** Painel lateral fixo à direita (`min(500px, 100vw)`), borda esquerda `1px dashed` em sépia, cabeçalho fixo com código do contexto e botão `ESC · FECHAR`, corpo rolável e fechamento obrigatório por `Escape` ou clique no backdrop. Padrão adotado para formulários rápidos de criação/edição e inspeções detalhadas sem abandonar a listagem.

### Signature Component: Constelação Orbital & Abertura Kinox
- **Abertura (Home):** Sequência cronometrada em 4 fases (`logo` isolada em fundo preto → dissolução para o olho central → emersão escalonada dos quadros em órbita elipsoide → liberação das barras e rolagem), ignorada instantaneamente sob `prefers-reduced-motion` ou clique.
- **Constelação:** 10 quadros widescreen `16:9` em elipsoide horizontal sobreposto; hover pausa suavemente a órbita, eleva a escala (`1.22×`), mantém o último filme focado no topo da pilha (`stackOrder` dentro de `isolation: isolate`), destaca-o em cor plena e descolore os demais quadros para monocromático escuro.

## Do's and Don'ts

### Do:
- **Do** manter a paleta estritamente dentro da família preto obsidiana, branco editorial aquecido e sépia, recorrendo a cores semânticas apenas para estados reais (`ativo`, `manutenção`, `lotado`, `erro`/`DELETE`).
- **Do** usar `Source Serif 4` nos títulos de página/seção, `Archivo` em textos/formulários e `JetBrains Mono` tabular em números, horários, preços, rotas e badges.
- **Do** estruturar todas as novas telas CRUD (Filmes, Sessões, Salas, Assentos, Gêneros, Compras/Ingressos, Clientes e Administradores) com réguas tracejadas (`1px dashed`), divisórias `film-strip` e drawers laterais para formulários contextuais.
- **Do** garantir contraste WCAG AA (≥ 4.5:1) em todos os textos, labels, placeholders críticos e estados de manutenção/erro, incluindo navegação completa por teclado e `prefers-reduced-motion`.
- **Do** manter os títulos `<h1>` e `<h2>` diretos e limpos, sem eyebrows ou kickers acima deles.

### Don't:
- **Don't** aplicar `Bodoni Moda` fora do logotipo `kīnox` — traços Didone perdem legibilidade em títulos administrativos médios sobre fundo escuro.
- **Don't** usar cantos muito arredondados (`border-radius > 4px`), cards aninhados, sombras em repouso ou gradientes coloridos/violetas.
- **Don't** substituir a densidade tabular operacional por grades genéricas de cards idênticos de ícone + título + parágrafo.
- **Don't** criar animações bloqueantes em telas internas de CRUD — a coreografia de abertura pertence exclusivamente à Home; telas operacionais carregam imediatamente para a tarefa.
- **Don't** omitir estados de carregamento (skeleton), vazio, erro ou validação por campo ao integrar os formulários com a Kinox API.
