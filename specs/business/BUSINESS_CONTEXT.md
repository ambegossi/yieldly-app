# Business Context: Yieldly

**Owner:** [A DEFINIR]
**Last Updated:** 2026-01-07
**Status:** MVP / Do Zero
**Configuration:** Lite + Complete

> **Note:** Este documento foi gerado para um projeto em estágio inicial (do zero). Todas as informações marcadas como [HIPÓTESE] devem ser validadas com usuários reais antes de serem consideradas fatos.

---

## 📋 Índice

1. [Visão de Produto](#visão-de-produto)
2. [Contexto de Operações (Product)](#contexto-de-operações-product)
3. [Contexto de Engenharia (Engineering)](#contexto-de-engenharia-engineering)
4. [Diretrizes para IA](#diretrizes-para-ia)

---

## Visão de Produto

### O que é Yieldly

**Yieldly é uma plataforma mobile para encontrar e comparar oportunidades de rendimento (yield) em DeFi.**

O produto resolve o problema de **investidores casuais em cripto** que já usam algumas DEXs e querem mais rendimento, mas ficam perdidos na complexidade de comparar pools em múltiplas plataformas, entender riscos e encontrar as melhores oportunidades sem passar horas pesquisando.

### Problema Central

**Dor específica:** Investidores casuais em cripto perdem tempo e oportunidades porque:
- Precisam visitar múltiplos sites/protocolos para comparar APYs
- Não sabem avaliar riscos de pools diferentes
- Sentem-se inseguros com jargões técnicos e falta de clareza
- Perdem oportunidades porque não monitoram pools constantemente

**Por que isso é um problema:**
- Tempo desperdiçado que poderia ser usado investindo
- FOMO (medo de perder oportunidades melhores)
- Decisões baseadas em informações incompletas ou desatualizadas
- Barreiras de entrada para quem quer diversificar em DeFi

### Usuário Principal (Persona)

**Perfil:** Investidor casual em cripto

**Características [HIPÓTESE]:**
- Já possui alguma experiência com DEXs (ex: Uniswap, PancakeSwap)
- Entende conceitos básicos de cripto (wallets, swap, staking básico)
- Quer rendimento passivo sem complexidade de farming avançado
- Não é trader profissional, mas quer melhor retorno que poupança/renda fixa
- Tem portfolio pequeno-médio (alguns milhares de dólares)
- Tempo limitado para pesquisar (30 min - 1h por semana)
- Prefere segurança a máximos retornos arriscados

**Contexto de uso [HIPÓTESE]:**
- Acessa mobile durante tempo livre (transporte, almoço, noite)
- Quer decisões rápidas e informadas
- Busca simplicidade sem perder controle

**Objetivo principal:** Encontrar pools de stablecoins com melhor APY/risco sem precisar visitar 10 sites diferentes.

### Proposta de Valor

**Diferencial [HIPÓTESE]:**
- **Mobile-first:** Outras ferramentas são desktop/web complexas
- **Foco em clareza:** Informações simplificadas sem perder precisão
- **Stablecoins primeiro:** Reduz complexidade e risco para começar
- **Comparação unificada:** Vê todas opções em um só lugar

**Como resolvem hoje (alternativas):**
- Visitam manualmente sites de protocolos (Aave, Compound, Curve, etc.)
- Usam planilhas para comparar manualmente
- Seguem influencers no Twitter/Discord (informação não estruturada)
- Ficam em um protocolo por inércia (não exploram melhores opções)
- **Não fazem nada** (deixam em wallet sem render)

### Tom e Comunicação

**Como a marca deve soar:** Simples e acessível

**Diretrizes:**
- Linguagem clara, evita jargão DeFi desnecessário
- Quando usar termos técnicos, explicar de forma simples
- Tom encorajador mas realista sobre riscos
- Transparente sobre limitações e dados
- Visual limpo, informações diretas
- Tooltips/ajudas contextuais onde necessário

**Exemplos [HIPÓTESE]:**
- ✅ "APY: retorno anual se você reinvestir ganhos"
- ❌ "Compounded annual yield with auto-harvesting"
- ✅ "Este pool tem risco baixo porque usa apenas USDC/USDT"
- ❌ "Low IL exposure due to stablecoin correlation"

---

## Contexto de Operações (Product)

> Esta seção orienta a IA em como criar, refinar e priorizar tasks.

### Escopo do MVP

**Funcionalidade CORE:** Listar pools de stablecoins com informações essenciais (APY, TVL, protocolo, chain)

**Incluso no MVP:**
- Listagem de pools com dados atualizados (APY, TVL, nome do protocolo)
- Filtros básicos (por protocolo, por APY mínimo, por chain)
- Detalhes de cada pool (histórico de APY, descrição, riscos básicos)
- Fluxo de descoberta e análise (sem transações)

**FORA do escopo MVP:**
- ❌ Integração com wallet (conectar, ver posições reais, fazer transações)
- ❌ Pools complexos (apenas stablecoins: USDC, USDT, DAI, USDC.e, etc.)
- ❌ Impermanent Loss (não aplicável a pools de stablecoins)
- ❌ Alertas/notificações push
- ❌ Múltiplas chains (definir chain principal no MVP)

**Regra de ouro:** Se não ajuda o usuário a **descobrir e comparar pools de stablecoins**, não está no MVP.

### Governança da IA

**O que a IA PODE fazer:**
- Refinar tasks existentes com detalhes técnicos e critérios de aceitação
- Sugerir priorização baseada nos critérios abaixo
- Expandir user stories com casos de uso e edge cases
- Propor melhorias incrementais dentro do escopo MVP
- Criar tasks de bugs/refatorações técnicas

**O que a IA NÃO PODE fazer (precisa escalar):**
- Adicionar features fora do escopo MVP definido
- Mudar priorização de temas principais sem aprovação
- Remover funcionalidades core do MVP
- Fazer decisões de design de produto (UX/UI flows)
- Comprometer-se com prazos ou estimativas

**Quando escalar:**
- Task envolve mudança de escopo significativa
- Há conflito entre priorização de duas áreas
- Precisa de decisão de trade-off (tempo vs. qualidade vs. features)
- Usuário reportou problema grave que exige mudança de estratégia

### Framework de Priorização

**Critério principal:** Impacto no usuário (investidor casual)

**Como aplicar:**
1. Pergunte: "Isso melhora diretamente a capacidade do usuário de encontrar/comparar pools?"
2. Se sim: prioridade alta
3. Se melhora experiência mas não é bloqueante: prioridade média
4. Se é nice-to-have ou otimização interna: prioridade baixa

**Exemplos de aplicação [HIPÓTESE]:**
- **Alta:** Exibir APY atualizado (core value)
- **Alta:** Filtrar por protocolo (usabilidade essencial)
- **Média:** Histórico de APY em gráfico (melhora decisão, mas listagem já funciona)
- **Média:** Ordenar por TVL (útil mas não essencial)
- **Baixa:** Animações de transição (polimento)
- **Baixa:** Cache agressivo se dados já carregam rápido

**Exceções à regra:**
- Bugs críticos sempre têm prioridade máxima (quebra a experiência)
- Débito técnico que bloqueia features prioritárias sobe de prioridade
- Segurança sempre prioritária (mesmo que não visível ao usuário)

### Templates de Tasks

#### User Story Template

```markdown
## [Título descritivo da perspectiva do usuário]

**Como** [tipo de usuário]
**Quero** [objetivo/ação]
**Para** [benefício/valor]

### Contexto
[Por que isso é importante? Qual problema resolve?]

### Critérios de Aceitação
- [ ] Critério 1 (mensurável, testável)
- [ ] Critério 2
- [ ] Critério 3

### Fora de Escopo
- ❌ [O que NÃO deve ser feito nesta task]

### Notas Técnicas
[Informações técnicas relevantes, APIs, dependências]

### Definição de Pronto
- [ ] Funciona em iOS e Android
- [ ] Dados carregam corretamente
- [ ] Tratamento de erro implementado
- [ ] Código revisado
```

#### Bug Template

```markdown
## [BUG] [Descrição curta do problema]

**Severidade:** [Crítico / Alto / Médio / Baixo]

### Comportamento Atual
[O que acontece]

### Comportamento Esperado
[O que deveria acontecer]

### Passos para Reproduzir
1. [Passo 1]
2. [Passo 2]
3. [Erro ocorre]

### Impacto no Usuário
[Quantos usuários afeta? Qual a consequência?]

### Contexto Técnico
[Erro logs, ambiente, versão]
```

### Temas e Focos Atuais [HIPÓTESE - MVP]

1. **Listagem de pools funcionando**
   - Integração com fonte de dados (ex: DefiLlama API)
   - Exibição clara de APY, TVL, protocolo
   - Performance (carregamento rápido)

2. **Experiência de descoberta**
   - Filtros úteis e intuitivos
   - Ordenação por critérios relevantes
   - Facilidade de comparar visualmente

3. **Detalhes de pool**
   - Informações suficientes para decisão informada
   - Contexto de risco simplificado
   - Link para protocolo original (call-to-action)

---

## Contexto de Engenharia (Engineering)

> Esta seção explica regras de negócio, domínio e fluxos para devs.

### Regras de Negócio

#### 1. Filtro de Pools: Apenas Stablecoins no MVP

**O quê:** Yieldly exibe APENAS pools de stablecoins na primeira versão.

**Por quê:** Simplificar UX, reduzir risco para usuário casual, evitar complexidade de Impermanent Loss.

**Como implementar:**
- Filtrar pools onde TODOS os assets sejam stablecoins reconhecidas
- Stablecoins aceitas: USDC, USDT, DAI, USDC.e, FRAX, LUSD [HIPÓTESE - expandir conforme necessário]
- Se pool tem ETH, BTC, ou qualquer token volátil → não exibir

**Exemplo:**
- ✅ USDC-USDT LP (ambos stablecoins)
- ✅ DAI single-sided vault (stablecoin)
- ❌ USDC-ETH LP (ETH não é stablecoin)
- ❌ WBTC vault (não é stablecoin)

**Edge cases:**
- Stablecoins algorítmicas (ex: UST pré-crash): [A DEFINIR - critério de confiança]
- Stablecoins novas/desconhecidas: lista de allow-list, não aceitar automaticamente

---

#### 2. Exibição de APY

**O quê:** APY (Annual Percentage Yield) é a métrica principal de rendimento.

**Por quê:** Usuário quer saber "quanto vou ganhar em um ano se deixar investido".

**Como calcular/exibir:**
- Usar APY, não APR (APY já considera juros compostos)
- Se fonte de dados fornece APR, converter: `APY = (1 + APR/n)^n - 1` onde n = períodos de composição
- Exibir com 2 casas decimais: "8.45%"
- Se APY > 100%, exibir em vermelho/alerta: "Alto retorno = alto risco [HIPÓTESE]"

**Fonte de dados:**
- [A DEFINIR - usar DefiLlama API, protocolo direto, ou agregador?]
- Cachear APY com TTL de [A DEFINIR - 15 min? 1 hora?]

**Edge cases:**
- APY negativo: pode acontecer? [A DEFINIR - se sim, exibir como "0%" ou mostrar negativo?]
- APY = 0: exibir "0%" ou ocultar pool?
- APY desatualizado há >24h: marcar como "stale" e alertar usuário [HIPÓTESE]

---

#### 3. Total Value Locked (TVL)

**O quê:** TVL indica quanto capital está depositado no pool (proxy de confiança/liquidez).

**Por quê:** Pools com TVL muito baixo podem ter risco de liquidez ou serem novos/não testados.

**Como usar:**
- Exibir TVL em USD: "$1.2M" (formato abreviado: K, M, B)
- [HIPÓTESE] Filtro de TVL mínimo: apenas pools com TVL > $100K (usuário casual quer segurança)
- Ordenar por TVL como opção (padrão pode ser APY)

**Edge cases:**
- TVL < threshold: ocultar ou mostrar com warning? [A DEFINIR]
- TVL caiu drasticamente (>50% em 24h): alerta de risco [HIPÓTESE - futuro]

---

#### 4. Classificação de Risco [HIPÓTESE - futuro]

**O quê:** Categorizar pools em Low / Medium / High risk.

**Por quê:** Usuário casual precisa entender risco de forma simples, não quer estudar smart contracts.

**Como classificar [A DEFINIR - critérios específicos]:**
- **Low risk:** Protocolo auditado, TVL > $10M, stablecoins conhecidas, sem histórico de exploit
- **Medium risk:** Protocolo auditado OU TVL alto, stablecoins menos conhecidas
- **High risk:** Protocolo novo, TVL baixo, sem auditoria, stablecoins experimentais

**Implementação:**
- MVP: talvez não classificar (só mostrar protocolo e deixar usuário decidir)
- Versão futura: adicionar badge de risco visual

---

### Glossário de Domínio

Termos específicos do contexto Yieldly e como devem ser entendidos no código.

| Termo           | Definição                                                                                          | Contexto no Código                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Pool**        | Contrato inteligente onde usuários depositam criptomoedas para gerar rendimento                   | Entidade principal. Cada pool tem: id, protocol, assets, apy, tvl, chain                  |
| **Vault**       | Sinônimo de Pool (alguns protocolos chamam de vault, ex: Yearn)                                    | Tratar como Pool no código (normalizar nomenclatura)                                       |
| **APY**         | Annual Percentage Yield - rendimento anualizado com juros compostos                                | Tipo: number (porcentagem). Ex: 8.45 = 8.45%                                              |
| **APR**         | Annual Percentage Rate - rendimento anualizado SEM juros compostos (menor que APY)                 | Se API retorna APR, converter para APY antes de exibir                                    |
| **TVL**         | Total Value Locked - valor total depositado no pool (em USD)                                       | Tipo: number (USD). Ex: 1200000 = $1.2M. Exibir formatado                                 |
| **Protocol**    | Plataforma DeFi que oferece o pool (ex: Aave, Compound, Curve)                                     | String. Exibir logo + nome. Usado em filtros                                               |
| **Chain**       | Blockchain onde o pool existe (ex: Ethereum, Polygon, Arbitrum)                                    | String. MVP: apenas uma chain [A DEFINIR]. Futuro: filtrar por chain                      |
| **Stablecoin**  | Criptomoeda atrelada a moeda fiat (geralmente $1 USD)                                              | Lista de stablecoins aceitas hardcoded (USDC, USDT, DAI, etc). Validar assets contra lista |
| **Asset/Token** | Criptomoeda específica dentro de um pool (ex: pool pode ter 2 assets: USDC e USDT)                | Array de strings. Ex: ["USDC", "USDT"]. Validar todos são stablecoins                     |
| **IL**          | Impermanent Loss - perda temporária em pools AMM por variação de preço entre assets               | NÃO aplicável no MVP (só stablecoins). Não calcular. Mencionar em docs "por isso só stable" |
| **Reward Token** | Token adicional dado como incentivo além do yield base (ex: protocolo dá seu token como bônus)    | [A DEFINIR se MVP considera] Pode inflar APY. Se considerar, deixar claro na UI           |

---

### Fluxos Principais

#### Fluxo 1: Descoberta de Pools

**Objetivo:** Usuário encontra pools relevantes através de busca/filtros.

**Atores:** Investidor casual

**Passos:**
1. Usuário abre app → tela inicial carrega lista de pools (ordenada por APY desc [HIPÓTESE])
2. Usuário aplica filtros:
   - Por protocolo (ex: "apenas Aave")
   - Por APY mínimo (ex: "acima de 5%")
   - Por chain (futuro, MVP = apenas uma chain)
3. Lista atualiza em tempo real (frontend filtra ou fetch novo?)
4. Usuário vê cards de pool com: nome, protocolo, APY, TVL
5. Usuário clica em um pool → vai para Fluxo 2

**Regras aplicadas:**
- Apenas pools de stablecoins exibidos (filtro backend ou frontend)
- APY exibido com 2 casas decimais
- TVL formatado em K/M/B
- Loading state enquanto carrega
- Error state se API falha

**Edge cases:**
- Nenhum pool corresponde ao filtro → mensagem "Nenhum pool encontrado. Tente outros filtros."
- API retorna erro → mensagem "Erro ao carregar pools. Tente novamente." + botão retry
- Dados desatualizados → [A DEFINIR - exibir timestamp "atualizado há X min"?]

**Notas técnicas:**
- Usar React Query para cache e refetch
- Implementar pull-to-refresh (mobile)
- Paginação ou scroll infinito? [A DEFINIR - depende de quantos pools]

---

#### Fluxo 2: Análise de Pool

**Objetivo:** Usuário vê detalhes completos de um pool específico para decidir se vale a pena investir.

**Atores:** Investidor casual

**Passos:**
1. Usuário clica em pool na listagem → navega para tela de detalhes
2. Tela carrega informações detalhadas:
   - Nome do pool e protocolo (com logo)
   - APY atual (destaque visual)
   - TVL
   - Assets envolvidos (ex: "USDC + USDT")
   - Descrição do pool [HIPÓTESE - de onde vem? API ou manual?]
   - Histórico de APY (gráfico últimos 30 dias) [HIPÓTESE - se disponível]
   - Link para protocolo original ("Investir no Aave" → abre site externo)
3. Usuário lê informações e decide:
   - Clica "Investir no [Protocolo]" → abre protocolo em browser (MVP: apenas link externo)
   - Volta para listagem

**Regras aplicadas:**
- Mesmo pool pode ter APY variável (histórico mostra isso)
- Dados devem ser consistentes com listagem (mesma fonte)
- Link externo deve abrir página específica do pool (não homepage genérica) [A DEFINIR - como construir URL?]

**Edge cases:**
- Histórico de APY não disponível → não exibir gráfico, apenas APY atual
- Descrição não disponível → texto genérico: "Pool de [assets] no protocolo [nome]"
- Link para protocolo quebrado → fallback para homepage [A DEFINIR]

**Notas técnicas:**
- Usar deep linking se possível (abrir app do protocolo se instalado)
- Exibir loading skeleton enquanto carrega detalhes
- Considerar fazer fetch incremental (dados básicos → detalhes → histórico)

---

### Edge Cases e Situações Especiais

#### 1. Fonte de Dados Indisponível

**Cenário:** API de pools (ex: DefiLlama) está fora do ar ou retorna erro 500.

**Comportamento esperado:**
- Primeira tentativa: retry automático após 2s
- Se falha novamente: exibir mensagem ao usuário
- Se há dados em cache: exibir com aviso "Dados podem estar desatualizados"
- Se não há cache: tela vazia com botão "Tentar novamente"

**Não fazer:** Crashar o app ou tela infinitamente carregando.

---

#### 2. Pool Desaparece da API

**Cenário:** Usuário está vendo detalhes de um pool que é removido da fonte de dados (protocolo descontinuou).

**Comportamento esperado [HIPÓTESE]:**
- Se usuário está em tela de detalhes: mostrar alerta "Este pool não está mais disponível"
- Remover da listagem no próximo refresh
- [FUTURO] Se usuário tinha esse pool favoritado: notificar

---

#### 3. APY Muda Drasticamente

**Cenário:** APY de um pool cai de 15% para 2% em poucas horas.

**Comportamento esperado:**
- Exibir APY atualizado (sempre mostrar dado mais recente)
- [FUTURO] Se usuário está "assistindo" esse pool: enviar notificação
- MVP: sem notificações, usuário vê mudança na próxima visita

---

#### 4. Stablecoin Perde Peg

**Cenário:** Uma stablecoin (ex: USDC) temporariamente vale $0.95 em vez de $1.

**Comportamento esperado [A DEFINIR]:**
- Opção 1: Continuar exibindo normalmente (APY é do protocolo, não do peg)
- Opção 2: Adicionar warning visual "Stablecoin fora do peg"
- Opção 3: Remover pools dessa stablecoin até peg normalizar

**Decisão depende de:** filosofia do produto (proteger usuário vs. informar e deixar decidir)

---

#### 5. Novo Protocolo/Pool Surge

**Cenário:** Nova plataforma DeFi lança pool de stablecoins com APY muito alto (ex: 50%).

**Comportamento esperado:**
- Aparecer na listagem automaticamente (se fonte de dados inclui)
- [HIPÓTESE] Se APY > threshold (ex: 30%), marcar como "Alto risco - verificar protocolo"
- Não bloquear exibição (deixar usuário decidir)

---

## Diretrizes para IA

> Instruções específicas para a IA que usa este contexto.

### Como a IA Deve Usar Este Documento

Este documento serve para:
1. **Criar tasks bem estruturadas** usando os templates de Product Operations
2. **Refinar tasks existentes** com contexto de negócio e regras aplicáveis
3. **Explicar "o porquê"** de decisões técnicas para devs
4. **Priorizar trabalho** baseado no framework definido
5. **Manter consistência** com a visão e escopo do produto

### Modo de Operação: Complete

A IA está autorizada a:
- ✅ Criar e refinar tasks de produto
- ✅ Sugerir priorização baseada em "impacto no usuário"
- ✅ Explicar regras de negócio e contexto técnico
- ✅ Expandir user stories com critérios de aceitação
- ✅ Identificar edge cases e situações especiais
- ✅ Propor melhorias dentro do escopo MVP

A IA deve **SEMPRE** escalar para humano:
- ❌ Adicionar features fora do escopo MVP
- ❌ Mudar critérios de priorização
- ❌ Tomar decisões de design de produto (UX flows)
- ❌ Comprometer-se com prazos ou estimativas
- ❌ Decisões que afetam segurança ou privacidade do usuário

### Workflow Recomendado

#### Quando Criar uma Nova Task:

1. **Contextualize:** Qual fluxo do usuário essa task afeta? (Descoberta ou Análise de pool)
2. **Valide escopo:** Está dentro do MVP definido? Se não, marcar como [FUTURO]
3. **Aplique template:** User Story ou Bug template
4. **Adicione regras:** Quais regras de negócio se aplicam? (seção Engineering)
5. **Identifique edge cases:** Consultar seção de Edge Cases
6. **Sugira prioridade:** Usar framework "impacto no usuário"
7. **Revise tom:** Linguagem está simples e acessível?

#### Quando Refinar uma Task Existente:

1. **Leia a task:** Entenda o que está sendo pedido
2. **Adicione contexto:** Por que isso é importante para o investidor casual?
3. **Expanda critérios:** O que define "pronto"? Como testar?
4. **Mencione regras:** Quais regras de negócio aplicam? (ex: apenas stablecoins)
5. **Alerte edge cases:** Situações especiais que dev deve considerar
6. **Valide tom:** Descrições na UI devem ser simples/acessíveis?

#### Quando Priorizar:

1. **Pergunta-chave:** "Isso melhora a capacidade do usuário de encontrar/comparar pools?"
2. **Se sim:** Prioridade alta (core value)
3. **Se melhora UX mas não bloqueia:** Média
4. **Se é polimento/otimização:** Baixa
5. **Exceção:** Bugs críticos sempre no topo

#### Quando Explicar uma Regra:

1. **O quê:** Descreva a regra objetivamente
2. **Por quê:** Explique o motivo de negócio (não técnico)
3. **Como:** Oriente implementação
4. **Exemplos:** Casos concretos (✅ / ❌)
5. **Edge cases:** Situações não-óbvias

### Exemplos de Aplicação

#### Exemplo 1: Criar Task de Feature

**Input do usuário:** "Quero ordenar pools por TVL"

**Output da IA:**

```markdown
## Permitir ordenação de pools por TVL

**Como** investidor casual
**Quero** ordenar a lista de pools por TVL (maior para menor)
**Para** ver quais pools têm mais capital depositado (proxy de confiança/liquidez)

### Contexto
Usuários podem preferir pools com maior TVL como indicador de segurança/popularidade.
Atualmente a lista ordena por APY (padrão), mas alguns usuários priorizarão TVL.

### Critérios de Aceitação
- [ ] Botão/dropdown de ordenação na tela de listagem
- [ ] Opções: "APY (maior)" [padrão], "TVL (maior)", "Nome (A-Z)"
- [ ] Lista reordena imediatamente ao selecionar
- [ ] Seleção persiste durante a sessão (se usuário navega e volta)

### Fora de Escopo
- ❌ Ordenação por múltiplos critérios simultâneos (ex: TVL + APY)
- ❌ Salvar preferência de ordenação entre sessões (pode ser futuro)

### Regras de Negócio Aplicáveis
- TVL exibido em formato abreviado: $1.2M (ver Glossário)
- Apenas pools de stablecoins na lista (regra já aplicada no backend/filtro)

### Notas Técnicas
- TVL já vem da API, não precisa calcular
- Ordenação pode ser client-side (performance ok para <100 pools)
- Se lista crescer muito, considerar backend sorting

### Definição de Pronto
- [ ] Funciona em iOS e Android
- [ ] Ordenação visual está correta
- [ ] Performance ok (sem lag perceptível)
- [ ] Código revisado

**Prioridade sugerida:** Média (melhora UX mas não bloqueia core value)
```

---

#### Exemplo 2: Refinar Task Existente

**Input do usuário (task existente):**
"Adicionar gráfico de histórico de APY na tela de detalhes do pool"

**Output da IA:**

```markdown
[Task original mantida, IA adiciona seções:]

### Contexto de Negócio Adicionado
Esta feature permite o investidor casual ver se o APY de um pool é estável ou volátil.
Pools com APY muito variável podem ser mais arriscados ou oportunistas.
Auxilia na decisão: "esse APY de 15% é comum ou é pico temporário?"

### Regras de Negócio Aplicáveis
- APY exibido com 2 casas decimais (consistente com listagem)
- Período padrão: últimos 30 dias [HIPÓTESE]
- Se dados históricos não disponíveis: não crashar, ocultar gráfico

### Edge Cases a Considerar
1. **API não retorna histórico:** Não exibir gráfico, apenas APY atual
2. **Histórico parcial (ex: só 7 dias):** Exibir com label "Dados de X dias"
3. **APY ficou negativo em algum momento:** [A DEFINIR - é possível?]
4. **Pool é muito novo (<7 dias):** Talvez não vale mostrar gráfico

### Notas de UX (Tom simples/acessível)
- Título do gráfico: "Histórico de APY" (não "APY time-series")
- Eixo Y: "APY (%)"
- Eixo X: Datas em formato curto (ex: "01 Jan")
- Tooltip ao tocar: "X% em DD/MM"

**Prioridade sugerida:** Média (melhora decisão do usuário, mas listagem já funciona)
```

---

#### Exemplo 3: Explicar Regra para Dev

**Input do dev:** "Por que só aceitar pools de stablecoins?"

**Output da IA:**

```markdown
### Por Que Apenas Stablecoins no MVP?

**Motivo de negócio:**
O Yieldly foca em investidores casuais que querem rendimento SEM risco de volatilidade.
Pools com tokens voláteis (ETH, BTC, altcoins) introduzem:
- Impermanent Loss (complexo de explicar)
- Variação de preço do principal (usuário pode perder mais do que ganha em yield)
- Necessidade de entender correlação de ativos

Começar com stablecoins simplifica:
- Risco menor e mais previsível
- Usuário entende: "1 USDC hoje = 1 USDC amanhã (aproximadamente)"
- Foco total em comparar APY, não em gerenciar risco de preço

**Como isso afeta o código:**
- Filtrar no backend (ou frontend) para incluir APENAS pools onde todos os assets são stablecoins
- Lista de stablecoins aceitas: USDC, USDT, DAI, USDC.e, FRAX, LUSD [atualizar conforme necessário]
- Exemplo:
  - ✅ Pool "USDC-USDT LP" → OK
  - ❌ Pool "USDC-ETH LP" → REJEITAR (ETH não é stablecoin)

**Futuro:**
Quando usuários estiverem confortáveis e pedirem, podemos adicionar pools com risco médio/alto.
Mas MVP = só stables.
```

---

### Validação de Hipóteses

Como este documento foi gerado para projeto "do zero", muitas informações são hipóteses.

**A IA deve:**
- Identificar `[HIPÓTESE]` ao usar informações não validadas
- Sugerir testes/validações quando relevante (ex: "testar com 5 usuários se ordenação por TVL é útil")
- Atualizar este documento quando hipóteses forem confirmadas/refutadas

**Próximos passos de validação sugeridos:**
1. **Após MVP funcional:** Testar com 10-20 investidores casuais reais
2. **Validar:** Tom de comunicação ressoa? Filtros são úteis? Falta algo crítico?
3. **Iterar:** Ajustar priorização e features baseado em feedback real
4. **Atualizar doc:** Remover `[HIPÓTESE]` e adicionar `[VALIDADO]` onde aplicável

---

## Próximos Passos

Este documento está em estágio **MVP / Do Zero**. Próximas ações recomendadas:

### Validações Pendentes
- [ ] Confirmar chain principal do MVP (Ethereum? Polygon? Arbitrum?)
- [ ] Definir fonte de dados (DefiLlama API? Outra?)
- [ ] Validar lista de stablecoins aceitas com stakeholders
- [ ] Testar protótipo com 5 usuários do perfil target
- [ ] Definir threshold de TVL mínimo (sugestão: $100K)

### Expansões Futuras (Pós-MVP)
- [ ] Adicionar modo Engineering detalhado se time crescer
- [ ] Documentar fluxos de wallet integration (fora do MVP atual)
- [ ] Criar seção de Roadmap quando prioridades estiverem claras
- [ ] Expandir para Tier Standard quando produto tiver usuários reais

### Manutenção deste Documento
- **Owner:** [A DEFINIR - quem mantém atualizado?]
- **Frequência:** Revisar a cada sprint ou quando MVP pivotar
- **Versionamento:** Considerar usar git para trackear mudanças

---

**Última atualização:** 2026-01-07
**Versão:** 1.0 (MVP inicial)
**Status:** Draft - Aguardando validação com usuários reais
