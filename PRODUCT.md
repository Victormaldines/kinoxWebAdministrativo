# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Administradores do cinema **Kinox** operando em ambiente desktop web durante o expediente de gestão (programação de cartaz, cadastro de filmes e gêneros, manutenção de salas e assentos, abertura e controle de sessões, auditoria de compras/ingressos e gestão de clientes e administradores).

## Product Purpose

Central administrativa web que consome a **Kinox Cinema API** (`https://kinoxapi.onrender.com`) para gerir toda a operação interna do cinema — do catálogo de filmes e taxonomia de gêneros até infraestrutura de salas/assentos, grade de sessões, mapa de ocupação e bilheteria. O sucesso significa acesso imediato e inequívoco às operações críticas sem perder o rigor editorial e a identidade cinematográfica da marca.

## Positioning

Um back-office cinematográfico autoral que une a atmosfera tátil de arquivo 35mm e sala de projeção (preto profundo, branco editorial e sépia arquivístico) com a precisão funcional de uma central de operações desktop.

## Operating Context

- Aplicação desktop-first em Angular v22+ (standalone components, Signals, controle de fluxo nativo, `NgOptimizedImage`).
- Fluxo de validação em etapas: primeiro prototipar e lapidar a página **Home Administrativa** como âncora visual (Hero cinematográfica inspirada na constelação orbital da referência + painel de operações abaixo da dobra), para depois documentar (`DESIGN.md`) e replicar o sistema visual nas telas dedicadas de cada recurso da API.

## Capabilities and Constraints

Escopo administrativo mapeado diretamente da OpenAPI da **Kinox Cinema API**:

- **Filmes** (`/filmes`, `/filmes/{id}`): listar, cadastrar, editar e remover filmes (título, diretor, duração, sinopse, classificação indicativa, pôster, gêneros).
- **Sessões & Ocupação** (`/sessoes`, `/sessoes/{id}`, `/sessoes_assentos/{id}`): criar/remover sessões (filme, sala, data, horário, legendado/dublado, disponibilidade) e alterar manualmente a ocupação de assentos.
- **Salas & Assentos** (`/salas`, `/salas/{id}`, `/assentos`, `/assentos/{id}`): cadastrar e atualizar salas (número, preço do ingresso, quantidade de assentos, 3D, IMAX, disponibilidade) e gerenciar assentos físicos.
- **Gêneros** (`/generos`, `/generos/{id}`): listar, cadastrar e remover gêneros cinematográficos.
- **Compras & Ingressos** (`/compras`, `/compras/{id}`, `/ingressos`, `/ingressos/{id}`): auditar compras e ingressos emitidos, consultar por cliente e cancelar pedidos/ingressos liberando assentos.
- **Clientes** (`/clientes`, `/clientes/{id}`): listar, cadastrar, editar e remover clientes.
- **Administradores & Autenticação** (`/administradores`, `/administradores/{id}`, `/auth/login`): gerenciar contas administrativas e autenticação JWT (`bearerAuth`).

Restrição atual: nesta primeira fase, prototipar exclusivamente a página Home Administrativa como referência visual mestre (sem implementar ainda as telas CRUD completas de cada endpoint).

## Brand Commitments

- **Nome:** Kinox
- **Paleta vinculante:** Preto, branco e sépia.
- **Linguagem estética vinculante:** Film grain, mono data callouts, film-strip ticks, serif display, halftone texture e dashed grid rules.
- **Experiência da Hero (vinculante):** Inspirada na constelação orbital de `cipher.tv` (`references/1_referencia_home.png` e `references/2_referencia_home.png.png`) — quadros de filmes girando em órbita ao redor de um eixo central; ao passar o mouse sobre um filme, o quadro em foco se destaca em cor/contraste enquanto todos os demais descolorem para monocromático. Ao rolar a página para baixo, revelam-se as opções do painel administrativo.

## Evidence on Hand

- OpenAPI da Kinox Cinema API (`https://kinoxapi.onrender.com/v3/api-docs`), com 11 tags e 41 operações mapeadas.
- Filme real cadastrado na API no momento do mapeamento: *V de Vingança* (James McTeigue, 120 min, 12+, Suspense / Ficção Científica).
- Referências visuais do usuário em `references/1_referencia_home.png` e `references/2_referencia_home.png.png`.
- Demais filmes exibidos no protótipo da constelação e contadores operacionais são dados ilustrativos (rotulados como protótipo) até a integração completa com JWT/API.

## Product Principles

1. **Atmosfera na chegada, precisão na operação:** A Hero honra a magia da projeção cinematográfica; abaixo da dobra, cada módulo administrativo é direto, escaneável e orientado à tarefa.
2. **Hierarquia sem ruído:** Tipografia serifada de cartaz combinada com dados monoespaçados tabulares e réguas tracejadas estruturam a informação sem ornamentos gratuitos.
3. **Interação com intenção:** O destaque cromático sob hover na constelação e os estados claros de foco/hover nos módulos administrativos guiam o olhar imediatamente.
4. **Fidelidade ao domínio real da API:** Toda entrada de navegação, atalho e indicador reflete os recursos reais da Kinox Cinema API.

## Accessibility & Inclusion

Conformidade WCAG AA (contraste mínimo 4.5:1 em textos, foco visível por teclado, navegação acessível, respeito a `prefers-reduced-motion` pausando a órbita automática quando solicitado pelo sistema).
