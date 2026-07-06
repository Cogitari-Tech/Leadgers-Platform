# PRD — Leadgers Platform

---

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    LEADGERS PLATFORM                         ║
║           Sistema de Auditoria, Compliance e Finanças        ║
║                                                              ║
║                  Product Requirements Document               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
---

> 🤖 **Nota de Atualização de Vibe Coding & IA (03/04/2026):**
> Você está operando no repo `Cogitari-Tech/Leadgers-Platform` Versão 1.2.0-beta. O ecossistema Hono + Vite + Supabase está plenamente modularizado.
>
> **MANDAMENTOS PARA AGENTES DE IA NESTE PROJETO (CUMPRIMENTO OBRIGATÓRIO):**
> 1. **UX/UI Consistente:** NUNCA recrie componentes base do zero (Botão, Modal, Dropdown, Table). Siga a regra suprema de frontend: use `npx shadcn-ui@latest add [component]` com a estilização já em vigor (`@/shared/components`).
> 2. **Vercel & Configurações:** O projeto usa Vercel para todos os Deploys. Se precisar verificar ambiente ou re-sincronizar Envs, rode `npx vercel env pull`. Isso baixa o `.env` correto sob demanda em `apps/api` e `apps/web`.
> 3. **E2E Hono API:** Toda nova rota criada em `apps/api/src/routes/...` precisa de um arquivio `[rota].test.ts`. Use a framework Vitest + Hono Testing (rodar `npm run test --workspace=api`). Sem E2E Test, sua alteração não passa na esteira.
> 4. **Supabase + Inngest:** Quando criar lógicas longas como "gerar relatórios PDF" ou "Insights de IA", crie endpoints Hono que despachem webhooks para a plataforma local do Inngest (`POST /reports/generate -> 202 Queued`).

## Metadados do Documento

| Campo               | Valor                      |
| ------------------- | -------------------------- |
| **Produto**         | Leadgers                   |
| **URL**             | leadgers.com               |
| **Versão**          | 1.2.2                      |
| **Data**            | 17/04/2026                 |
| **Autor**           | Time de Produto — Cogitari |
| **Status**          | 🟢 Ativa                 |
| **Classificação**   | 🔴 Confidencial            |
| **Revisores**       | CTO, CEO, Lead Engineer    |
| **Última Revisão**  | 17/04/2026                 |
| **Próxima Revisão** | 17/05/2026                 |

---

> ⚠️ **AVISO DE CONFIDENCIALIDADE:** Este documento contém informações estratégicas e proprietárias da Cogitari. Não deve ser compartilhado fora da organização sem autorização expressa da liderança executiva.

---

## Histórico de Versões

| Versão | Data       | Autor             | Descrição                                                                                                                                                                |
| ------ | ---------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0.1.0  | 01/01/2026 | Time de Produto   | Rascunho inicial                                                                                                                                                         |
| 0.5.0  | 15/02/2026 | Time de Produto   | Adição de módulos de IA e pricing                                                                                                                                        |
| 0.9.0  | 01/03/2026 | Time de Produto   | Revisão técnica e arquitetural                                                                                                                                           |
| 1.0.0  | 20/03/2026 | Time de Produto   | Versão para revisão executiva                                                                                                                                            |
| 1.1.0  | 20/03/2026 | Revisão editorial | Correção de métricas de mercado, ajuste de datas do roadmap, expansão do modelo de dados, racional de pricing, riscos ampliados, seções de Onboarding e LGPD adicionadas |
| 1.2.0  | 07/04/2026 | Antigravity AI    | Estrutura de módulos UI e Prisma atualizados para refletir o estado de implementação. Validação dos packages e exclusão do conflito Shadcn. |
| 1.2.2  | 17/04/2026 | Antigravity AI    | Resolução do _deadlock_ de renders na Auditoria, Sanitização contra XSS nos painéis HTML, e refinamentos do módulo de finanças e integrações S3 Cloudflare. |

---

## Índice

1. [Sumário Executivo](#1-sumário-executivo)
2. [Problema e Oportunidade de Mercado](#2-problema-e-oportunidade-de-mercado)
3. [Visão e Objetivos do Produto](#3-visão-e-objetivos-do-produto)
4. [Público-Alvo e Personas](#4-público-alvo-e-personas)
5. [Proposta de Valor](#5-proposta-de-valor)
6. [Mapa de Funcionalidades](#6-mapa-de-funcionalidades-moscow)
7. [Especificações Funcionais Detalhadas](#7-especificações-funcionais-detalhadas)
8. [Requisitos Não Funcionais](#8-requisitos-não-funcionais)
9. [Arquitetura e Decisões Técnicas](#9-arquitetura-e-decisões-técnicas)
10. [Modelo de Dados Conceitual](#10-modelo-de-dados-conceitual)
11. [Integrações Externas](#11-integrações-externas)
12. [Módulo de IA](#12-módulo-de-ia)
13. [Modelo de Negócio e Pricing](#13-modelo-de-negócio-e-pricing)
14. [Roadmap de Implementação](#14-roadmap-de-implementação)
15. [Riscos e Mitigações](#15-riscos-e-mitigações)
16. [Glossário](#16-glossário)
17. [Apêndices](#17-apêndices)
18. [Onboarding e Time-to-Value](#18-onboarding-e-time-to-value)
19. [Privacidade e Proteção de Dados (LGPD)](#19-privacidade-e-proteção-de-dados-lgpd)

---

## 1. Sumário Executivo

### Visão Geral

**Leadgers** é uma plataforma SaaS all-in-one — um ERP inteligente projetado especificamente para startups tech brasileiras em estágio inicial e de crescimento (1 a 20 pessoas). O produto resolve um dos maiores problemas estruturais enfrentados por founders: a fragmentação de dados e ferramentas que impede a tomada de decisões com clareza e velocidade.

Hoje, um founder típico opera com um ecossistema caótico de 10 a 15 ferramentas desconectadas: Notion para documentação, Google Sheets para financeiro, Conta Azul ou Omie para contabilidade, GitHub para código, Trello ou Jira para produto, Slack para comunicação, e uma série de planilhas paralelas para OKRs, cap table, funil de vendas e investor relations. Nenhuma dessas ferramentas conversa com as outras. O resultado é inevitável: decisões tomadas com dados incompletos, horas perdidas consolidando informações, e a angústia permanente de não saber, de fato, qual é a saúde real da empresa.

O Leadgers foi concebido para ser o **sistema operacional da startup** — um único ambiente onde dados financeiros, de produto, de time, de vendas e de estratégia coexistem, se interconectam e se alimentam mutuamente. A plataforma opera nos três níveis de gestão:

- **Estratégico:** visão, direção de longo prazo, Business Model Canvas, OKRs corporativos, North Star Metric
- **Tático:** roadmap de produto, headcount planning, pipeline de fundraising, projeções financeiras
- **Operacional:** gestão de PRs e issues, fluxo de caixa diário, 1:1s, NPS, contratos

O grande diferencial competitivo do Leadgers é sua **camada de Inteligência Artificial transversal**, alimentada pelos modelos Claude Haiku, Sonnet e Opus da Anthropic. A IA não é um chatbot isolado — ela é contextual, conectada a todos os módulos, e entrega insights acionáveis: um Weekly Digest que resume a semana da startup em linguagem natural, alertas preditivos de runway crítico, análises automáticas de PRs, geração de Investor Updates, e muito mais. Cada função de IA é calibrada para o modelo adequado — Haiku para tarefas simples e batch, Sonnet para análises de profundidade moderada, Opus para raciocínio estratégico complexo.

### Funcionalidades Já Disponíveis

O produto já conta com as seguintes funcionalidades em produção:

- **DRE** (Demonstrativo de Resultado do Exercício) com visualização mensal e acumulada
- **Fluxo de Caixa** com projeção e categorização de receitas e despesas
- **Integração GitHub** completa: análise e gestão de issues/PRs, gestão de repositórios e organizações, gestão de riscos com alertas de scans e testes de segurança
- **Auditoria** com geração de relatórios, gestão de riscos e plano de ação
- **Matriz SWOT (FOFA)** interativa com análise assistida por IA

### Escopo deste PRD

Este documento especifica as **funcionalidades em desenvolvimento e planejadas** para 2026, organizadas em 9 módulos verticais (Financeiro, People & RH, Produto & Tecnologia, Comercial & Marketing, Investor Relations, Jurídico & Compliance, Estoque & Fornecedores, Estratégia) e uma camada horizontal de **Inteligência & IA**. O documento reflete o estado em 20/03/2026: funcionalidades da Fase 1 estão em desenvolvimento ativo; Fases 2–4 são planejadas.

### Indicadores-Chave de Sucesso (Ano 1)

| Métrica                       | Meta Q4 2026 |
| ----------------------------- | ------------ |
| Startups ativas               | 500          |
| MRR                           | R$ 50.000    |
| NPS                           | ≥ 50         |
| Churn mensal                  | < 5%         |
| DAU/MAU ratio                 | ≥ 40%        |
| Uptime                        | ≥ 99,5%      |
| Contas pagas (Growth + Scale) | ≥ 30%        |

---

## 2. Problema e Oportunidade de Mercado

### 2.1 Dor do Usuário

O problema central que o Leadgers resolve é **a fragmentação operacional das startups tech**. Quando um founder precisa tomar uma decisão crítica — como decidir se contrata um engenheiro sênior ou estende o runway — ele precisa reunir dados de múltiplas fontes: a planilha do financeiro, o Notion dos OKRs, o GitHub da produtividade técnica, o CRM de vendas, e a cabeça do CFO (que muitas vezes é ele mesmo). Esse processo leva horas, é propenso a erros, e ainda assim entrega uma visão incompleta.

As consequências práticas dessa fragmentação são:

**1. Decisões com latência:** O tempo entre "precisar de uma informação" e "ter essa informação consolidada" pode ser de dias. Numa startup, isso é eternidade.

**2. Blind spots estruturais:** Dados que ninguém olha — contratos com renovação automática, tech debt acumulado, vesting de colaboradores que já saíram — viram bombas-relógio.

**3. Custo operacional oculto:** Estima-se que founders de startups early-stage dedicam entre 8 e 12 horas semanais apenas para consolidar e organizar dados entre ferramentas. São horas que deveriam ir para produto e clientes.

**4. Dificuldade para due diligence:** Quando um investidor pede o data room, a startup leva semanas para reunir e organizar tudo. Cada dia de atraso corrói credibilidade e aumenta o risco de o deal não fechar.

**5. Comunicação ineficiente com stakeholders:** Investor updates manuais, OKRs que nunca são vistos pelos times, relatórios de auditoria que ficam em PDFs esquecidos.

### 2.2 Tamanho de Mercado

#### Mercado Global

O mercado global de software ERP para PMEs e empresas de médio porte movimentou **US$ 47 bilhões em 2024**, com crescimento projetado de **11% ao ano** até 2030, impulsionado pela migração para SaaS e pela demanda por plataformas integradas. O segmento de ferramentas específicas para startups (gestão financeira, produto e estratégia) representa um nicho crescente dentro desse mercado, com players como Mosaic (US$ 25M ARR), Runway Financial, e ChartMogul.

#### Mercado Brasileiro

O Brasil possui um dos ecossistemas de startups mais robustos da América Latina:

- **+14.000 startups ativas** (ABStartups, 2024)
- **+3.000 startups tech** com foco em SaaS B2B, Fintechs, HR Tech e EdTech
- Fragmentação de ferramentas é um problema estrutural amplamente relatado por founders — validação qualitativa via entrevistas com usuários beta e comunidades como Founders BR e Indie Hackers _(pesquisa quantitativa própria planejada para Q2 2026)_
- Mercado de software de gestão para startups no Brasil estimado em **R$ 800M/ano**

#### TAM / SAM / SOM

| Mercado | Descrição                                                           | Valor Estimado |
| ------- | ------------------------------------------------------------------- | -------------- |
| **TAM** | Todas as startups tech no Brasil (14.000)                           | R$ 800M/ano    |
| **SAM** | Startups tech 1–50 pessoas com receita ≥ R$ 5k/mês (3.500 empresas) | R$ 200M/ano    |
| **SOM** | Startups tech 1–20 pessoas alcançáveis em 24 meses (1.200 empresas) | R$ 70M/ano     |

### 2.3 Contexto Competitivo

| Plataforma        | Foco Principal             | Integração Nativa | IA Contextual | Preço Médio/mês | Para Startups? |
| ----------------- | -------------------------- | ----------------- | ------------- | --------------- | -------------- |
| **Leadgers**      | ERP all-in-one p/ startups | ✅ Nativo         | ✅ Avançada   | R$ 0–497        | ✅ Core        |
| Notion            | Docs e wikis               | ❌ Manual         | ⚠️ Limitada   | US$ 16/user     | ⚠️ Parcial     |
| Monday.com        | Gestão de projetos         | ⚠️ Parcial        | ⚠️ Básica     | US$ 24/user     | ⚠️ Parcial     |
| Conta Azul        | Contabilidade fiscal       | ❌ Isolado        | ❌ Nenhuma    | R$ 119–299      | ⚠️ Parcial     |
| Omie              | ERP PME tradicional        | ❌ Isolado        | ❌ Nenhuma    | R$ 199–599      | ❌ Não         |
| Mosaic (EUA)      | Financial planning         | ⚠️ Parcial        | ⚠️ Básica     | US$ 500+        | ✅ Sim         |
| ChartMogul        | MRR/Revenue analytics      | ❌ Isolado        | ❌ Nenhuma    | US$ 100+        | ✅ Parcial     |
| Runway Financial  | Runway e projeções         | ❌ Isolado        | ⚠️ Básica     | US$ 249+        | ✅ Parcial     |
| ERPs Tradicionais | Gestão empresarial geral   | ❌ Isolado        | ❌ Nenhuma    | R$ 500–2000+    | ❌ Não         |

**Vantagem competitiva sustentável do Leadgers:**

1. **Integração nativa entre todos os módulos:** dados financeiros conectados com produto, time e estratégia
2. **IA contextual e configurável:** não é um chatbot genérico, é IA que conhece o contexto específico de cada startup
3. **Construído para o mercado brasileiro:** compliance LGPD, integração NF-e, terminologia e moeda local
4. **Price-to-value superior:** o plano Growth substitui 6–8 ferramentas que custam juntas 3–5x mais
5. **Foco exclusivo em startups tech 1–20 pessoas:** UX e fluxos otimizados para esse perfil específico

---

## 3. Visão e Objetivos do Produto

### 3.1 Visão de Longo Prazo

> _"Ser o sistema operacional das startups tech brasileiras — o único lugar onde founders têm clareza total sobre saúde financeira, produto, time e estratégia, tomando decisões melhores em menos tempo, com suporte contínuo de inteligência artificial."_

Em 5 anos, o Leadgers aspira ser a **primeira ferramenta que toda startup tech brasileira instala** — assim como o GitHub é indispensável para o código, o Leadgers será indispensável para a gestão. Nossa visão é expandir para toda a América Latina, oferecendo localizações regionais e integrações com os ecossistemas fiscais e bancários de cada país.

### 3.2 OKRs do Produto — Ano 1 (2026)

#### Objetivo 1: Atingir Product-Market Fit Comprovado

| Key Result                         | Meta         | Prazo   |
| ---------------------------------- | ------------ | ------- |
| KR1: Startups ativas na plataforma | 500 empresas | Q4 2026 |
| KR2: Net Promoter Score (NPS)      | ≥ 50 pontos  | Q3 2026 |
| KR3: Churn mensal médio            | < 5%         | Q3 2026 |
| KR4: Retenção de 90 dias (cohort)  | ≥ 70%        | Q4 2026 |

#### Objetivo 2: Lançar Plataforma Core Completa

| Key Result                                 | Meta                     | Prazo   |
| ------------------------------------------ | ------------------------ | ------- |
| KR1: Módulos Must Have entregues           | 100%                     | Q3 2026 |
| KR2: Uptime da plataforma                  | ≥ 99,5%                  | Q2 2026 |
| KR3: Cobertura de testes críticos          | ≥ 80%                    | Q2 2026 |
| KR4: Time-to-value (primeiro insight útil) | < 10 min após onboarding | Q2 2026 |

#### Objetivo 3: Validar Monetização

| Key Result                                 | Meta       | Prazo   |
| ------------------------------------------ | ---------- | ------- |
| KR1: Contas nos planos Growth ou Scale     | ≥ 30%      | Q4 2026 |
| KR2: MRR total                             | R$ 50.000  | Q4 2026 |
| KR3: ARPU médio (Average Revenue per User) | R$ 150/mês | Q4 2026 |
| KR4: Taxa de conversão freemium → pago     | ≥ 15%      | Q3 2026 |

### 3.3 Métricas de Sucesso do Produto

| Métrica                         | Descrição                                            | Meta Ano 1   | Frequência |
| ------------------------------- | ---------------------------------------------------- | ------------ | ---------- |
| **DAU/MAU Ratio**               | % de usuários ativos diariamente vs mensalmente      | ≥ 40%        | Semanal    |
| **Time-to-Value**               | Tempo até o usuário ter o primeiro insight acionável | < 10 min     | Por cohort |
| **Feature Adoption Rate**       | % de usuários que usam ≥ 3 módulos diferentes        | ≥ 60%        | Mensal     |
| **AI Credit Consumption**       | Créditos de IA consumidos por usuário ativo          | 50+ créditos | Mensal     |
| **Revenue per User (ARPU)**     | Receita média por conta pagante                      | R$ 150       | Mensal     |
| **Session Duration**            | Tempo médio de sessão na plataforma                  | > 8 min      | Semanal    |
| **Módulos por Workspace**       | Média de módulos ativos por workspace                | ≥ 4          | Mensal     |
| **Support Ticket Rate**         | % de usuários que abrem ticket por mês               | < 5%         | Mensal     |
| **Net Revenue Retention (NRR)** | Expansão de receita de clientes existentes           | ≥ 105%       | Trimestral |
| **Payback Period**              | Meses para recuperar CAC                             | < 12 meses   | Trimestral |

---

## 4. Público-Alvo e Personas

### Persona 1: Marina — A CTO Fundadora

| Atributo        | Detalhe                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------- |
| **Nome**        | Marina Oliveira                                                                             |
| **Idade**       | 32 anos                                                                                     |
| **Cargo**       | CTO & Co-fundadora                                                                          |
| **Empresa**     | Startup SaaS B2B em early-stage (8 pessoas, Série Seed)                                     |
| **Localização** | São Paulo, SP                                                                               |
| **Educação**    | Ciência da Computação (USP)                                                                 |
| **Ferramentas** | GitHub (diário), Notion (docs técnicos), Google Sheets (planilhas avulsas), Linear (issues) |

**Jobs-to-be-done:**

- Ter visibilidade clara do tech debt acumulado e seu impacto real no negócio
- Conectar métricas técnicas (velocity, PRs abertos, bugs em produção) com métricas de negócio (runway, satisfação do cliente)
- Gerar relatórios de saúde técnica sem ter que compilar manualmente dados do GitHub
- Gerenciar o roadmap de produto de forma que toda a equipe enxergue a conexão com os OKRs da empresa

**Dores Críticas:**

- Não consegue quantificar o impacto do tech debt no runway — sabe que é crítico, mas não tem dados para defender a priorização para o CEO
- PRs abertos há semanas sem revisão, mas não tem visibilidade agregada disso
- O onboarding de novos engenheiros é lento porque não há um documento único de Definition of Done e práticas do time
- Gasta 3–4 horas por semana compilando atualizações técnicas para o CEO em formato que ele entenda

**Ganhos Esperados:**

- Dashboard técnico integrado com o dashboard de negócio — um clique para ver a correlação entre velocity e MRR
- Alertas automáticos de PRs pendentes há mais de X dias
- Relatório de saúde de engenharia gerado por IA toda semana, pronto para compartilhar
- Tech Debt com pontuação visual, tendência e impacto estimado no negócio

**Contexto de Uso:** Marina usa o Leadgers principalmente pela manhã, no início do dia de trabalho, para checar o health score técnico e os alertas. Às sextas-feiras, usa o módulo de auditoria para preparar a weekly review da engenharia.

---

### Persona 2: Rafael — O CEO Solopreneur

| Atributo        | Detalhe                                                                             |
| --------------- | ----------------------------------------------------------------------------------- |
| **Nome**        | Rafael Mendes                                                                       |
| **Idade**       | 28 anos                                                                             |
| **Cargo**       | Fundador Solo (CEO + Dev + Sales)                                                   |
| **Empresa**     | Micro-SaaS de gestão, R$ 8k MRR, 1 pessoa                                           |
| **Localização** | Florianópolis, SC                                                                   |
| **Educação**    | Sistemas de Informação (autodidata + bootcamp)                                      |
| **Ferramentas** | GitHub, Notion, Conta Azul, Stripe Dashboard, Google Analytics, Slack (comunidades) |

**Jobs-to-be-done:**

- Ter uma visão consolidada da saúde da empresa em menos de 5 minutos por dia
- Entender se o negócio está crescendo de forma saudável sem precisar ser especialista em finanças
- Tomar decisões de produto com base em dados reais (NPS, churn, feedback) e não intuição
- Preparar o terreno para buscar investimento anjo quando o MRR atingir R$ 20k

**Dores Críticas:**

- Perde de 2 a 3 horas toda segunda-feira consolidando dados de 8 ferramentas diferentes para entender "como foi a semana"
- Não tem certeza do runway real — o saldo bancário diz uma coisa, mas as despesas comprometidas dizem outra
- Esquece renovações de contratos de fornecedores e softwares por falta de alertas
- Não sabe qual canal de aquisição está realmente funcionando, mistura dados de várias fontes manualmente

**Ganhos Esperados:**

- Health Score visível na tela inicial do login — saber em 3 segundos se está tudo bem
- Weekly Digest gerado por IA toda segunda-feira às 8h, pronto no email
- Runway Calculator com três cenários (pessimista, base, otimista) sempre atualizado
- Alerta automático quando algum indicador cruza um limite crítico

**Contexto de Uso:** Rafael acessa o Leadgers pela manhã no celular (mobile first é crítico para ele) e no computador quando precisa fazer análises mais profundas. O Weekly Digest é o principal ponto de contato com a plataforma no início da semana.

---

### Persona 3: Luiza — A COO de Early-Stage

| Atributo        | Detalhe                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| **Nome**        | Luiza Ferreira                                                              |
| **Idade**       | 35 anos                                                                     |
| **Cargo**       | COO (Chief Operating Officer)                                               |
| **Empresa**     | Startup HR Tech, 15 pessoas, Série A (captou R$ 3M há 6 meses)              |
| **Localização** | Belo Horizonte, MG                                                          |
| **Educação**    | Administração (FGV) + MBA em Gestão de Startups                             |
| **Ferramentas** | Notion, Google Workspace, Gupy, Conta Azul, Slack, DocuSign, Lattice (OKRs) |

**Jobs-to-be-done:**

- Preparar o data room para a próxima rodada de investimento de forma organizada e auditável
- Gerenciar OKRs dos 4 times da empresa de forma cascateada, com visibilidade em tempo real
- Ter controle de contratos (fornecedores, clientes, NDAs) com alertas de vencimento
- Produzir investor updates mensais de alta qualidade em menos de 2 horas

**Dores Críticas:**

- Investor updates levam um dia inteiro para ser produzidos — ela coleta dados de 5 pessoas diferentes, consolida em Notion, revisa com o CEO, e envia manualmente por email
- OKRs vivem em planilha que ninguém atualiza — na última revisão trimestral, metade dos dados estava desatualizada
- Contratos de fornecedores espalhados em pastas do Drive sem nenhum sistema de alertas
- Não tem visibilidade do headcount planning integrado com o runway — precisa cruzar planilhas manualmente para responder "posso contratar agora?"

**Ganhos Esperados:**

- Data Room organizado e sempre pronto, com controle granular de quem acessa o quê
- OKRs com check-ins automáticos — a plataforma notifica os responsáveis semanalmente para atualizar
- Investor Update gerado por IA com base nos dados da plataforma, revisão de 20 minutos e envio automático
- Headcount Planning integrado com o Runway Calculator — simulação instantânea do impacto de cada contratação

**Contexto de Uso:** Luiza usa o Leadgers durante toda a jornada de trabalho. De manhã checa o dashboard de OKRs. No meio da semana faz revisão de contratos e compliance. No final do mês usa intensivamente os módulos financeiros e de investor relations.

---

## 5. Proposta de Valor

### Value Proposition Canvas

#### Para Marina (CTO Fundadora)

| Dimensão                 | Conteúdo                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| **Trabalhos do cliente** | Monitorar saúde técnica, conectar métricas técnicas ao negócio, justificar decisões de engenharia ao CEO |
| **Dores**                | Tech debt invisível, PRs acumulados, relatórios manuais, desconexão entre código e métricas de negócio   |
| **Ganhos**               | Dashboard técnico integrado, alertas automáticos, relatório semanal pronto, pontuação de tech debt       |
| **Produtos/Serviços**    | Tech Debt Tracker, GitHub Integration, Roadmap Visual, Health Score, Weekly Digest                       |
| **Aliviadores de dor**   | Alertas automáticos de PRs > X dias, análise de código por IA, integração nativa GitHub                  |
| **Criadores de ganho**   | Relatório de saúde técnica pronto toda semana, correlação automática entre velocity e MRR                |

#### Para Rafael (CEO Solopreneur)

| Dimensão                 | Conteúdo                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| **Trabalhos do cliente** | Consolidar dados da empresa diariamente, entender saúde financeira, preparar-se para captação       |
| **Dores**                | 3h toda segunda consolidando dados, runway incerto, 8 ferramentas desconectadas, esquece renovações |
| **Ganhos**               | 5 minutos por dia para entender a empresa, alertas proativos, tudo em um lugar                      |
| **Produtos/Serviços**    | Health Score, Weekly Digest, Runway Calculator, Burn Rate Dashboard, Alertas Preditivos             |
| **Aliviadores de dor**   | Substitui 8 ferramentas, Weekly Digest automático, alertas de contratos, runway em tempo real       |
| **Criadores de ganho**   | Health Score na tela de login, insights acionáveis toda semana, simulador de cenários de runway     |

#### Para Luiza (COO de Early-Stage)

| Dimensão                 | Conteúdo                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Trabalhos do cliente** | Preparar data room, gerenciar OKRs, produzir investor updates, controlar contratos                        |
| **Dores**                | Investor update leva 1 dia, OKRs em planilha desatualizada, contratos espalhados, headcount não integrado |
| **Ganhos**               | Data room sempre pronto, OKRs com check-ins automáticos, investor update com IA em 20 min                 |
| **Produtos/Serviços**    | Data Room, Investor Updates IA, OKRs Cascateados, Headcount Planning, Gestão de Contratos                 |
| **Aliviadores de dor**   | Investor update gerado por IA, notificações automáticas de OKRs, alertas de vencimento de contratos       |
| **Criadores de ganho**   | Due Diligence Readiness Score, headcount integrado com runway, OKRs visíveis para todo o time             |

### Diferencial Competitivo

O Leadgers se diferencia de qualquer alternativa existente por quatro pilares inegociáveis:

1. **Integração nativa total:** os dados de produto alimentam o financeiro, que alimenta o RH, que alimenta a estratégia. Não há necessidade de Zapier, API customizada ou planilha intermediária.
2. **IA contextual e proprietária:** diferente de chatbots genéricos, a IA do Leadgers conhece o contexto específico de cada startup — histórico financeiro, composição do time, OKRs, stage da empresa — e usa esse contexto para gerar insights relevantes.
3. **Construído para o ecossistema brasileiro:** LGPD nativo, integração NF-e via SEFAZ, terminologia em português, preços em reais, compliance com regulamentações brasileiras.
4. **Price-to-value incomparável:** o plano Growth (R$ 197/mês) substitui ferramentas que custam juntas entre R 600 e R$ 1.200/mês, enquanto entrega integração e IA que nenhuma delas oferece.

---

## 6. Mapa de Funcionalidades (MoSCoW)

### Legenda de Prioridade

| Prioridade     | Significado                                                          |
| -------------- | -------------------------------------------------------------------- |
| **M — Must**   | Essencial para o lançamento. Sem isso, o produto não funciona.       |
| **S — Should** | Importante, mas não bloqueante. Entrar no segundo ciclo de releases. |
| **C — Could**  | Desejável se houver capacidade. Não é crítico no curto prazo.        |
| **W — Won't**  | Fora do escopo desta versão. Será revisitado no futuro.              |

### Módulo: Funcionalidades Já Implementadas

| Funcionalidade                       | Descrição                                   | Status      | Prioridade |
| ------------------------------------ | ------------------------------------------- | ----------- | ---------- |
| DRE                                  | Demonstrativo de Resultado do Exercício     | ✅ Entregue | Must       |
| Fluxo de Caixa                       | Gestão de receitas e despesas com projeção  | ✅ Entregue | Must       |
| GitHub — Issues & PRs                | Análise e gestão de issues e pull requests  | ✅ Entregue | Must       |
| GitHub — Repositórios & Organizações | Gestão de repos e orgs conectadas           | ✅ Entregue | Must       |
| GitHub — Gestão de Riscos            | Alertas de scans de segurança e testes      | ✅ Entregue | Must       |
| Auditoria                            | Relatórios, gestão de risco e plano de ação | ✅ Entregue | Must       |
| Matriz SWOT (FOFA)                   | Análise estratégica com assistência de IA   | ✅ Entregue | Must       |

### Módulo: Financeiro & Contábil

| Funcionalidade                     | Descrição                                               | Prioridade |
| ---------------------------------- | ------------------------------------------------------- | ---------- |
| Runway Calculator                  | Calculadora com cenários pessimista/base/otimista       | **Must**   |
| Cap Table                          | Gestão de participação e simulação de rodadas           | **Must**   |
| Unit Economics (CAC, LTV, LTV/CAC) | Métricas de eficiência e saúde da unidade de negócio    | **Must**   |
| Burn Rate Dashboard                | Dashboard em tempo real com alertas automáticos         | **Must**   |
| Projeções Financeiras 3–5 anos     | Modelagem de cenários para pitch e planejamento         | Should     |
| Conciliação Bancária               | Integração via Open Banking para conciliação automática | Should     |
| Integração NF-e                    | Importação e gestão de notas fiscais via SEFAZ          | Should     |

### Módulo: People & RH

| Funcionalidade                   | Descrição                                        | Prioridade |
| -------------------------------- | ------------------------------------------------ | ---------- |
| Headcount Planning               | Projeção de contratações integrada ao runway     | **Must**   |
| OKRs Cascateados                 | Sistema hierárquico empresa → time → indivíduo   | **Must**   |
| Equity & Vesting Tracker         | Gestão de stock options, cliff e vesting         | **Must**   |
| 1:1s Estruturados                | Registro e acompanhamento de reuniões 1:1        | Should     |
| PDIs (Planos de Desenvolvimento) | Planos individuais de carreira e desenvolvimento | Should     |
| Org Chart Dinâmico               | Organograma com indicadores de saúde por time    | Should     |
| Gestão de Férias                 | Controle de saldos e solicitações de férias      | Could      |
| Folha Simplificada               | Cálculo básico de folha de pagamento             | Could      |

### Módulo: Produto & Tecnologia

| Funcionalidade     | Descrição                                               | Prioridade |
| ------------------ | ------------------------------------------------------- | ---------- |
| Roadmap Visual     | Kanban e timeline linkados com GitHub Issues            | **Must**   |
| Tech Debt Tracker  | Pontuação de dívida técnica com tendência e alertas     | **Must**   |
| Uptime & Incidents | Monitoramento de disponibilidade e gestão de incidentes | Should     |
| Integração Jira    | Sincronização bidirecional com Jira                     | Should     |
| Integração Linear  | Sincronização bidirecional com Linear                   | Should     |
| Definition of Done | Checklists de qualidade por tipo de entrega             | Could      |

### Módulo: Comercial & Marketing

| Funcionalidade     | Descrição                                       | Prioridade |
| ------------------ | ----------------------------------------------- | ---------- |
| Pipeline de Vendas | Funil de oportunidades simplificado             | **Must**   |
| MRR/ARR Tracker    | Rastreamento de receita com cohorts e waterfall | **Must**   |
| Funil de Aquisição | Métricas de aquisição por canal                 | Should     |
| NPS & CSAT         | Coleta e análise de satisfação do cliente       | Should     |

### Módulo: Investor Relations

| Funcionalidade          | Descrição                                      | Prioridade |
| ----------------------- | ---------------------------------------------- | ---------- |
| Data Room               | Repositório seguro para due diligence          | **Must**   |
| Investor Updates        | Templates + geração por IA + envio automático  | **Must**   |
| Pipeline de Fundraising | Gestão do processo de captação de investimento | Should     |
| KPIs de Pitch Deck      | Geração automática de KPIs para pitch          | Should     |
| Valuation Calculator    | Calculadora de valuation por múltiplos e DCF   | Could      |

### Módulo: Jurídico & Compliance

| Funcionalidade                | Descrição                                             | Prioridade |
| ----------------------------- | ----------------------------------------------------- | ---------- |
| Checklist LGPD/SOC2/ISO27001  | Checklist de conformidade com frameworks regulatórios | **Must**   |
| Due Diligence Readiness Score | Score de prontidão para due diligence                 | Should     |
| Gestão de Contratos           | Controle de vencimentos, renovações e alertas         | Should     |

### Módulo: Estoque & Fornecedores

| Funcionalidade                   | Descrição                                     | Prioridade |
| -------------------------------- | --------------------------------------------- | ---------- |
| Controle de Ativos               | Inventário de ativos da empresa               | Could      |
| Gestão de Compras e Fornecedores | Cadastro e controle de fornecedores e pedidos | Could      |

### Módulo: Estratégia

| Funcionalidade              | Descrição                                            | Prioridade |
| --------------------------- | ---------------------------------------------------- | ---------- |
| Business Model Canvas       | Canvas interativo com persistência e versionamento   | **Must**   |
| North Star Metric Dashboard | Dashboard focado na métrica norte-estrela da startup | **Must**   |
| Milestone Tracker           | Gestão de marcos estratégicos da empresa             | **Must**   |
| Competitive Intelligence    | Monitoramento e análise de concorrentes              | Should     |

### Módulo: Inteligência & IA (Camada Transversal)

| Funcionalidade                     | Descrição                                               | Prioridade |
| ---------------------------------- | ------------------------------------------------------- | ---------- |
| Health Score da Startup            | Índice composto 0–100 com sub-scores por área           | **Must**   |
| Weekly Digest Automático           | Resumo semanal gerado por IA com insights acionáveis    | **Must**   |
| Alertas Preditivos                 | Alertas antecipados de runway crítico, churn, riscos    | **Must**   |
| Configuração Granular de IA        | Toggle global e por módulo, escolha de modelo           | **Must**   |
| Análise Narrativa Financeira       | Interpretação em linguagem natural de dados financeiros | **Must**   |
| Geração de Investor Updates com IA | Draft automático de investor update                     | **Must**   |
| Análise de PRs e Issues            | Revisão automatizada de pull requests e issues          | Should     |
| Relatórios de Auditoria com IA     | Geração automática de relatórios de auditoria           | Should     |

---

## 7. Especificações Funcionais Detalhadas

### 7.1 Runway Calculator

**Descrição:** O Runway Calculator é o módulo financeiro estratégico mais crítico do Leadgers. Calcula o prazo de sobrevivência financeira da startup com base no saldo atual em caixa e no burn rate projetado, oferecendo três cenários de análise (pessimista, base e otimista). É a primeira funcionalidade que um novo usuário vê após o onboarding, pois é o indicador mais urgente de qualquer startup.

**User Stories:**

- Como **Rafael (CEO Solopreneur)**, quero visualizar o runway da minha empresa nos três cenários projetados, para tomar decisões sobre contratações e investimentos com segurança.
- Como **Luiza (COO)**, quero simular o impacto de novas contratações no runway, para planejar o headcount sem comprometer a sobrevivência da empresa.
- Como **Marina (CTO)**, quero receber um alerta automático quando o runway cair abaixo de 6 meses, para acionar o plano de contingência com antecedência suficiente.

**Regras de Negócio:**

| Regra | Descrição                                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | O saldo base é importado do Fluxo de Caixa (integração automática). Pode ser sobrescrito manualmente.                                     |
| RN-02 | O burn rate base é calculado pela média dos últimos 3 meses de despesas líquidas (saídas − entradas recorrentes).                         |
| RN-03 | Cenário pessimista: burn rate × 1,2 (20% de incremento de custos ou 20% de redução de receitas).                                          |
| RN-04 | Cenário base: burn rate atual mantido constante.                                                                                          |
| RN-05 | Cenário otimista: burn rate × 0,85 (15% de redução de custos ou 15% de aumento de receitas).                                              |
| RN-06 | Runway = Saldo Atual ÷ Burn Rate Mensal. Resultado exibido em meses e dias.                                                               |
| RN-07 | Alerta amarelo: runway < 9 meses. Alerta vermelho: runway < 6 meses. Alerta crítico: runway < 3 meses.                                    |
| RN-08 | O usuário pode adicionar eventos futuros (ex: entrada de investimento em data X, rescisão de contrato em data Y) que ajustam os cenários. |
| RN-09 | A data de esgotamento de caixa é exibida em formato de calendário, não apenas numérico.                                                   |
| RN-10 | Histórico de runway dos últimos 12 meses é exibido em gráfico de linha.                                                                   |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Runway Calculator

Cenário: Exibição do runway com três cenários
Dado que o usuário está autenticado e possui transações no Fluxo de Caixa
E o saldo atual da empresa é R$ 150.000
E o burn rate médio dos últimos 3 meses é R$ 25.000/mês
Quando o usuário acessa o Runway Calculator
Então o sistema deve exibir o cenário base com runway de 6 meses
E o cenário pessimista com runway de 5 meses (burn R$ 30.000)
E o cenário otimista com runway de 7,05 meses (burn R$ 21.250)
E a data de esgotamento de caixa para cada cenário

Cenário: Alerta automático de runway crítico
Dado que o runway calculado no cenário base é de 5 meses
Quando o sistema recalcula o runway (diariamente à meia-noite)
Então o sistema deve criar uma notificação in-app de alerta vermelho
E enviar email para os usuários com papel de Admin ou Finance
E exibir o alerta na tela inicial do Health Score

Cenário: Simulação de evento futuro
Dado que o usuário está no Runway Calculator
Quando o usuário adiciona um evento de "Entrada de investimento R$ 500.000 em 15/06/2026"
Então o sistema deve recalcular todos os três cenários considerando o evento
E exibir a nova data de esgotamento de caixa com o evento incluído
E salvar o evento no histórico de simulações

Cenário: Importação automática do saldo do Fluxo de Caixa
Dado que o usuário possui transações registradas no módulo de Fluxo de Caixa
Quando o usuário abre o Runway Calculator
Então o saldo base deve ser automaticamente populado com o saldo atual do Fluxo de Caixa
E exibir a data e hora da última sincronização

```

---

### 7.2 Cap Table

**Descrição:** Módulo de gestão da tabela de capitalização (Cap Table) da startup. Permite registrar e visualizar a distribuição de participação societária entre fundadores, investidores, colaboradores (pool de opções) e outros stakeholders. Inclui simulador de rodadas de investimento para modelar cenários de diluição.

**User Stories:**

- Como **Luiza (COO)**, quero registrar todos os sócios e investidores com suas respectivas participações, para ter uma visão clara e auditável da estrutura societária.
- Como **Rafael (CEO)**, quero simular uma rodada Série A com valuation de R$ 10M e aporte de R 2M, para entender minha diluição antes de negociar.
- Como **Marina (CTO)**, quero ver minha porcentagem de participação pós-diluição em cada cenário simulado, para tomar decisões informadas sobre equity.

**Regras de Negócio:**

| Regra | Descrição                                                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | A soma de todas as participações deve ser sempre 100%. Emissão de novas ações dilui as existentes proporcionalmente.               |
| RN-02 | Tipos de participação: Ações Ordinárias, Ações Preferenciais, Opções (ESOP), Warrants, Debêntures Conversíveis.                    |
| RN-03 | O simulador de rodadas calcula automaticamente a diluição pré-money e pós-money para cada acionista.                               |
| RN-04 | Anti-dilution provisions (broad-based weighted average) são suportadas como parâmetro opcional na simulação.                       |
| RN-05 | O pool de ESOP (Employee Stock Option Pool) deve ser rastreado separadamente, com subregistros por beneficiário.                   |
| RN-06 | Histórico de todas as rodadas e emissões é imutável — apenas novas entradas podem ser adicionadas, nunca editadas retroativamente. |
| RN-07 | Exportação em PDF e CSV para uso em due diligence.                                                                                 |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Cap Table

Cenário: Registro de participação societária
Dado que o usuário acessa o módulo Cap Table
Quando o usuário adiciona um sócio "Ana Lima" com 25% de ações ordinárias
Então o sistema deve recalcular a participação percentual de todos os sócios
E a soma total deve continuar sendo 100%
E o histórico de alterações deve registrar a entrada com timestamp e usuário responsável

Cenário: Simulação de rodada de investimento
Dado que a cap table atual tem 3 sócios com 100% das ações
E o valuation pré-money é R$ 5.000.000
Quando o usuário simula uma rodada com aporte de R$ 1.000.000 (novo investidor)
Então o sistema deve calcular valuation pós-money de R$ 6.000.000
E mostrar participação do novo investidor de 16,67%
E mostrar a diluição de cada sócio existente proporcionalmente
E a simulação não deve afetar a cap table real até ser confirmada

Cenário: Verificação de integridade da cap table
Dado que o usuário tenta registrar uma participação que faria a soma ultrapassar 100%
Quando o sistema valida a entrada
Então o sistema deve exibir erro de validação indicando o percentual disponível restante
E não deve salvar a entrada inválida

```

---

### 7.3 Unit Economics

**Descrição:** Dashboard de métricas de eficiência econômica unitária do negócio. Calcula e monitora CAC (Custo de Aquisição de Clientes), LTV (Lifetime Value), a relação LTV/CAC e o Payback Period. Emite alertas quando indicadores saem de faixas saudáveis.

**User Stories:**

- Como **Rafael (CEO)**, quero ver o meu LTV/CAC ratio atual, para saber se minha estratégia de aquisição de clientes é economicamente viável.
- Como **Luiza (COO)**, quero receber alertas quando o LTV/CAC cair abaixo de 3x, para acionar ações corretivas antes que o problema escale.

**Regras de Negócio:**

| Regra | Descrição                                                                                                        |
| ----- | ---------------------------------------------------------------------------------------------------------------- |
| RN-01 | CAC = Total de despesas de Marketing e Vendas no período ÷ Número de novos clientes adquiridos no mesmo período. |
| RN-02 | LTV = ARPU × Margem Bruta ÷ Churn Rate Mensal.                                                                   |
| RN-03 | LTV/CAC saudável: ≥ 3x (benchmark SaaS). Alerta amarelo: 2x–3x. Alerta vermelho: < 2x.                           |
| RN-04 | Payback Period = CAC ÷ (ARPU × Margem Bruta). Exibido em meses. Saudável: < 12 meses.                            |
| RN-05 | Margem Bruta é importada do DRE. Pode ser sobrescrita manualmente.                                               |
| RN-06 | O usuário pode segmentar as métricas por canal de aquisição, cohort de clientes ou plano.                        |
| RN-07 | Gráfico histórico de tendência de todos os indicadores nos últimos 12 meses.                                     |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Unit Economics

Cenário: Cálculo automático de LTV/CAC
Dado que o sistema possui dados de ARPU (R$ 200), Margem Bruta (70%), Churn (3%) e CAC (R$ 800)
Quando o usuário acessa o dashboard de Unit Economics
Então o LTV calculado deve ser R$ 200 × 70% ÷ 3% = R$ 4.667
E o LTV/CAC deve ser R$ 4.667 ÷ R$ 800 = 5,83x (indicador verde)
E o Payback Period deve ser R$ 800 ÷ (R$ 200 × 70%) = 5,7 meses

Cenário: Alerta de LTV/CAC abaixo do threshold
Dado que o LTV/CAC calculado é de 1,8x
Quando o sistema recalcula as métricas
Então deve exibir um alerta vermelho no dashboard
E enviar notificação in-app para o usuário Admin
E o Health Score da startup deve ser impactado negativamente na dimensão Comercial

```

---

### 7.4 Burn Rate Dashboard

**Descrição:** Dashboard em tempo real que mostra a taxa de queima de caixa da startup (burn rate), com projeção de esgotamento de caixa. Integrado automaticamente com o módulo de Fluxo de Caixa. Emite alertas quando o runway calculado cai abaixo de limiares configuráveis.

**User Stories:**

- Como **Rafael (CEO)**, quero ver o burn rate do mês atual comparado com os 3 meses anteriores, para identificar tendências de aumento de custos rapidamente.
- Como **Luiza (COO)**, quero configurar alertas personalizados de burn rate, para ser notificada antes de situações críticas de caixa.

**Regras de Negócio:**

| Regra | Descrição                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| RN-01 | Gross Burn = Total de saídas no mês. Net Burn = Saídas − Entradas recorrentes (MRR).                               |
| RN-02 | O dashboard exibe tanto o Gross Burn quanto o Net Burn.                                                            |
| RN-03 | Breakdown de burn por categoria (pessoas, infraestrutura, marketing, outros) em gráfico de pizza.                  |
| RN-04 | Alertas configuráveis por runway: padrão 3, 6 e 9 meses. Admin pode customizar os limiares.                        |
| RN-05 | Comparação mês a mês com delta percentual (MoM) destacado visualmente.                                             |
| RN-06 | Projeção de 6 meses futuros baseada na tendência atual (linear e com sazonalidade se houver histórico suficiente). |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Burn Rate Dashboard

Cenário: Exibição do Net Burn com breakdown por categoria
Dado que o Fluxo de Caixa do mês atual possui entradas de R$ 15.000 e saídas de R$ 45.000
Quando o usuário acessa o Burn Rate Dashboard
Então o Gross Burn deve ser exibido como R$ 45.000
E o Net Burn deve ser exibido como R$ 30.000
E um gráfico de donut deve mostrar a distribuição de saídas por categoria

Cenário: Configuração de alerta personalizado
Dado que o usuário Admin acessa as configurações de alertas do Burn Rate
Quando o usuário configura um alerta para runway < 8 meses
Então o sistema deve salvar a configuração
E passar a emitir alertas quando o runway calculado ficar abaixo de 8 meses
E o alerta personalizado deve substituir o alerta padrão de 6 meses para esse workspace

```

---

### 7.5 OKRs Cascateados

**Descrição:** Sistema hierárquico de definição e acompanhamento de Objectives and Key Results (OKRs). Permite cascatear objetivos do nível da empresa até objetivos individuais, com alinhamento visual entre os níveis. Inclui check-ins semanais e relatórios de progresso automáticos.

**User Stories:**

- Como **Luiza (COO)**, quero criar OKRs corporativos e cascateá-los para os times, para garantir que todos estão trabalhando no que realmente importa para a empresa.
- Como **Marina (CTO)**, quero registrar o progresso dos meus Key Results semanalmente, para que meu líder e o time tenham visibilidade do andamento sem reuniões desnecessárias.
- Como **Rafael (CEO)**, quero ver o progresso consolidado de todos os OKRs da empresa em um único dashboard, para identificar áreas em risco antes da revisão trimestral.

**Regras de Negócio:**

| Regra | Descrição                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------- |
| RN-01 | Hierarquia: Company OKRs → Team OKRs → Individual OKRs. Um OKR filho deve ser associado a um OKR pai.          |
| RN-02 | Cada Objective pode ter entre 2 e 5 Key Results.                                                               |
| RN-03 | Progress de Key Result: valor atual / valor alvo × 100. Exibido em barra de progresso.                         |
| RN-04 | Progress de Objective: média ponderada dos Key Results.                                                        |
| RN-05 | Status automático: 0–40% = Vermelho (At Risk), 41–70% = Amarelo (Needs Attention), 71–100% = Verde (On Track). |
| RN-06 | Check-ins semanais: sistema envia notificação toda segunda-feira para responsáveis atualizarem o progresso.    |
| RN-07 | Ciclos suportados: Trimestral (padrão), Semestral, Anual.                                                      |
| RN-08 | OKRs encerrados são arquivados com o score final e não podem ser alterados retroativamente.                    |
| RN-09 | Comentários e bloqueios (blockers) podem ser registrados em cada Key Result.                                   |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: OKRs Cascateados

Cenário: Criação de OKR corporativo e cascateamento para time
Dado que o Admin está criando o ciclo Q2 2026
Quando o Admin cria um Objective "Dobrar o MRR" com KR1 "MRR de R$ 20k para R$ 40k até 30/06"
E associa um Team OKR "Aumentar conversão do trial" ao Objective corporativo
Então o Team OKR deve aparecer como filho do OKR corporativo na visualização hierárquica
E o progress do OKR corporativo deve ser influenciado pelo progress do Team OKR

Cenário: Notificação de check-in semanal
Dado que existem OKRs ativos no ciclo Q2 2026
Quando chega a segunda-feira às 09:00 (horário configurado)
Então o sistema deve enviar notificação in-app e email para cada responsável de Key Result
E a notificação deve conter o link direto para atualização do KR

Cenário: OKR em risco identificado automaticamente
Dado que um Key Result tem progresso de 20% e restam 3 semanas para o fim do ciclo
Quando o sistema recalcula o status do OKR
Então o status deve ser alterado para "At Risk" (vermelho)
E o COO e o responsável direto devem receber alerta

```

---

### 7.6 Equity & Vesting Tracker

**Descrição:** Módulo de gestão de participação de colaboradores via stock options (ESOP — Employee Stock Option Plan). Rastreia o vesting de cada beneficiário, cliff, aceleração por evento (change of control, IPO), e o status atual do pool de opções.

**User Stories:**

- Como **Luiza (COO)**, quero registrar os stock options de cada colaborador com suas datas de grant, cliff e vesting, para ter controle total do ESOP pool.
- Como **Marina (CTO)**, quero ver meu saldo de opções vestidas e a data do próximo vesting, para planejar minhas decisões de longo prazo na empresa.

**Regras de Negócio:**

| Regra | Descrição                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------------ |
| RN-01 | Estrutura padrão: Cliff de 12 meses, vesting mensal de 1/48 das opções por mês por 48 meses.                             |
| RN-02 | Antes do cliff, nenhuma opção é vestida. Após o cliff, as opções do primeiro ano vestem todas de uma vez.                |
| RN-03 | Grant Price: valor por opção no momento do grant. Exercício: beneficiário compra a ação pelo grant price.                |
| RN-04 | Aceleração simples (single trigger): 100% das opções vestem imediatamente em evento de M&A ou IPO, se configurado.       |
| RN-05 | Aceleração dupla (double trigger): requer M&A + demissão sem justa causa dentro de 12 meses.                             |
| RN-06 | Pool de ESOP: percentual máximo reservado (ex: 10% da empresa). Dashboard mostra opções emitidas vs disponíveis no pool. |
| RN-07 | Colaboradores desligados têm prazo de exercício de 90 dias após o desligamento (configurável).                           |
| RN-08 | Timeline visual mostrando marcos de vesting para os próximos 24 meses.                                                   |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Equity & Vesting Tracker

Cenário: Registro de stock option com cliff e vesting
Dado que o Admin registra um grant para "João Silva"
Com 10.000 opções, grant date 01/01/2025, cliff 12 meses, vesting 48 meses, grant price R$ 0,10
Quando o sistema calcula o cronograma de vesting
Então João deve ter 0 opções vestidas até 31/12/2025
E em 01/01/2026 deve ter 2.500 opções vestidas (cliff + 12 meses)
E após isso deve vestirem 208,33 opções por mês
E o dashboard deve mostrar a timeline visual de vesting

Cenário: Verificação do pool de ESOP
Dado que o pool total é de 100.000 opções (10% da empresa)
E já foram emitidas 60.000 opções para 5 colaboradores
Quando o Admin acessa o Equity Tracker
Então o sistema deve mostrar 60% do pool utilizado e 40.000 opções disponíveis
E emitir alerta se o pool estiver acima de 80% de utilização

```

---

### 7.7 Roadmap Visual

**Descrição:** Visualização do roadmap de produto em dois formatos: Kanban (por status) e Timeline (por trimestre/mês). Integrado nativamente com GitHub Issues, permitindo que tarefas criadas no GitHub apareçam automaticamente no roadmap. Suporta swimlanes por time ou iniciativa estratégica.

**User Stories:**

- Como **Marina (CTO)**, quero visualizar o roadmap do produto em formato de timeline trimestral, para planejar sprints com visão de longo prazo.
- Como **Rafael (CEO)**, quero ver o roadmap linkado com os OKRs da empresa, para garantir que o time de produto está trabalhando nas iniciativas corretas.
- Como **Luiza (COO)**, quero ter visibilidade do progresso do roadmap sem precisar pedir updates ao time de engenharia.

**Regras de Negócio:**

| Regra | Descrição                                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------------- |
| RN-01 | Itens do roadmap podem ser criados manualmente ou importados de GitHub Issues (sincronização bidirecional). |
| RN-02 | Status possíveis: Backlog, Em Andamento, Em Revisão, Concluído, Cancelado.                                  |
| RN-03 | Cada item do roadmap pode ser associado a um OKR (Key Result específico).                                   |
| RN-04 | Swimlanes configuráveis: por time, por trimestre, por iniciativa estratégica.                               |
| RN-05 | Timeline mostra dependências entre itens (predecessor → sucessor) com linha visual.                         |
| RN-06 | Estimativa de esforço em pontos de story ou T-shirt sizing (P/M/G/GG).                                      |
| RN-07 | Mudanças no status de uma issue no GitHub sincronizam automaticamente com o roadmap.                        |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Roadmap Visual

Cenário: Sincronização com GitHub Issues
Dado que uma issue "Feature: Onboarding guiado" é criada no GitHub com label "roadmap"
Quando o webhook de sincronização processa o evento
Então a issue deve aparecer automaticamente no Roadmap como card no status "Backlog"
E deve exibir o número da issue, título e assignees do GitHub

Cenário: Vinculação de item do roadmap a um OKR
Dado que o usuário está editando um item do roadmap "Reduzir time-to-value"
Quando o usuário seleciona o OKR "KR2: Time-to-value < 10 min"
Então o item deve exibir o badge do OKR vinculado
E o progresso do item deve contribuir para o progresso do Key Result vinculado

```

---

### 7.8 Tech Debt Tracker

**Descrição:** Módulo de rastreamento e pontuação da dívida técnica acumulada no produto. Conectado ao GitHub para identificar issues marcadas como tech debt, PRs de refatoração, e vulnerabilidades. Calcula um score de saúde técnica com tendência histórica e impacto estimado no negócio.

**User Stories:**

- Como **Marina (CTO)**, quero ter uma pontuação de tech debt atualizada automaticamente com base nas issues e PRs do GitHub, para justificar investimento em refatoração para o CEO.
- Como **Rafael (CEO)**, quero entender o impacto do tech debt no velocity do time, para tomar decisões de priorização com base em dados.

**Regras de Negócio:**

| Regra | Descrição                                                                                                                   |
| ----- | --------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Tech Debt Score calculado de 0 (péssimo) a 100 (saudável).                                                                  |
| RN-02 | Fatores do score: issues de tech debt abertas (peso 40%), PRs abertos > 7 dias (peso 30%), alertas de segurança (peso 30%). |
| RN-03 | Issues são identificadas como tech debt pela label "tech-debt" ou "refactoring" no GitHub (configurável).                   |
| RN-04 | Tendência: comparação do score com as últimas 4 semanas. Alerta quando queda > 10 pontos em 2 semanas.                      |
| RN-05 | Impacto estimado no negócio: cálculo simplificado de horas de velocity perdidas por ponto de tech debt.                     |
| RN-06 | Sugestão de priorização automática gerada por IA (Claude Haiku): top 3 itens de tech debt mais impactantes para resolver.   |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Tech Debt Tracker

Cenário: Cálculo do Tech Debt Score
Dado que há 15 issues com label "tech-debt" abertas
E 8 PRs abertos há mais de 7 dias
E 2 alertas de segurança ativos no Dependabot
Quando o sistema calcula o Tech Debt Score
Então o score deve refletir a degradação técnica em escala de 0-100
E deve exibir breakdown por categoria (issues, PRs, segurança)
E o Health Score da startup deve ser impactado na dimensão Produto

Cenário: Alerta de degradação de tech debt
Dado que o Tech Debt Score era 72 há 2 semanas
E hoje está em 58 (queda de 14 pontos)
Quando o sistema avalia a tendência semanal
Então deve disparar alerta para Marina (CTO) informando a degradação
E deve sugerir os top 3 itens prioritários para correção

```

---

### 7.9 MRR/ARR Tracker

**Descrição:** Dashboard de receita recorrente mensal (MRR) e anual (ARR) com análise de cohorts, visualização de movimentações (novo MRR, expansão, contração, churn, reativação) em formato waterfall, e projeção de crescimento.

**User Stories:**

- Como **Rafael (CEO)**, quero visualizar o MRR waterfall do mês atual, para entender de onde vieram os ganhos e perdas de receita.
- Como **Luiza (COO)**, quero analisar cohorts de churn por mês de aquisição, para identificar padrões de cancelamento e agir preventivamente.

**Regras de Negócio:**

| Regra | Descrição                                                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RN-01 | MRR = Soma de todas as assinaturas ativas no mês (excluindo one-time payments).                                                                                                      |
| RN-02 | Componentes do MRR Waterfall: New MRR (novos clientes), Expansion MRR (upgrades), Contraction MRR (downgrades), Churned MRR (cancelamentos), Reactivation MRR (clientes reativados). |
| RN-03 | Net New MRR = New + Expansion + Reactivation − Contraction − Churned.                                                                                                                |
| RN-04 | ARR = MRR × 12 (não soma 12 meses históricos — é a projeção anualizada do MRR atual).                                                                                                |
| RN-05 | Cohort de retenção: tabela mostrando % do MRR original retido por cohort ao longo de N meses.                                                                                        |
| RN-06 | Churn Rate = Churned MRR ÷ MRR início do mês × 100.                                                                                                                                  |
| RN-07 | Net Revenue Retention (NRR) = (MRR início + Expansion − Contraction − Churn) ÷ MRR início × 100. NRR ≥ 100% é sinal de crescimento net positivo.                                     |
| RN-08 | Projeção de MRR para os próximos 6 meses baseada em taxa de crescimento média (MoM).                                                                                                 |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: MRR/ARR Tracker

Cenário: Cálculo do MRR Waterfall mensal
Dado que no mês de março o MRR inicial é R$ 10.000
E houve New MRR de R$ 2.000, Expansion de R$ 500, Churned de R$ 800, Contraction de R$ 200
Quando o sistema calcula o MRR de fechamento
Então o Net New MRR deve ser R$ 1.500
E o MRR final deve ser R$ 11.500
E o ARR deve ser R$ 138.000

Cenário: Análise de cohort de churn
Dado que existem clientes adquiridos nos últimos 6 meses
Quando o usuário acessa o relatório de cohort
Então deve ver uma tabela com cada cohort mensal como linha
E as colunas representando os meses subsequentes
E cada célula mostrando % do MRR original ainda ativo

```

---

### 7.10 Data Room

**Descrição:** Repositório seguro e organizado para armazenamento de documentos de due diligence. Permite controlar quais investidores têm acesso a quais documentos, rastrear todos os acessos com log auditável, e medir o Due Diligence Readiness Score da empresa.

**User Stories:**

- Como **Luiza (COO)**, quero organizar os documentos do data room por categorias (financeiro, jurídico, produto, time), para que o processo de due diligence seja rápido e profissional.
- Como **Rafael (CEO)**, quero saber quais documentos um investidor específico acessou e por quanto tempo, para entender seu nível de interesse.

**Regras de Negócio:**

| Regra | Descrição                                                                                                        |
| ----- | ---------------------------------------------------------------------------------------------------------------- |
| RN-01 | Categorias padrão do Data Room: Cap Table, Financeiro, Jurídico, Produto, Time, Propriedade Intelectual, Outros. |
| RN-02 | Acesso controlado por convite: o Admin gera um link único com prazo de expiração para cada investidor/auditor.   |
| RN-03 | Permissões granulares: view-only por padrão. Download pode ser habilitado por documento.                         |
| RN-04 | Log auditável: cada acesso (abertura, download, tempo de visualização) é registrado com timestamp e IP.          |
| RN-05 | Due Diligence Readiness Score: percentual de documentos essenciais já carregados vs checklist pré-configurado.   |
| RN-06 | Notificação para o Admin quando um investidor acessa o Data Room pela primeira vez.                              |
| RN-07 | Documentos podem ter versões — ao fazer upload de nova versão, a anterior é arquivada e rastreável.              |
| RN-08 | Limite de tamanho de arquivo: 50MB por arquivo, 5GB por workspace (configurável por plano).                      |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Data Room

Cenário: Convite de investidor com acesso controlado
Dado que o Admin quer dar acesso apenas à pasta "Financeiro" para o investidor "Fundo XYZ"
Quando o Admin cria um convite com permissão restrita a "Financeiro" e expiração em 30 dias
Então o investidor recebe email com link único
E ao acessar, vê apenas os documentos da pasta "Financeiro"
E qualquer tentativa de acessar outras pastas retorna erro 403

Cenário: Log de acesso auditável
Dado que o investidor "Fundo XYZ" acessa e visualiza o arquivo "DRE_2025.pdf" por 3 minutos
Quando o Admin acessa o log de atividade do Data Room
Então deve ver o registro: investidor, documento, data/hora, duração e IP de origem

Cenário: Due Diligence Readiness Score
Dado que o checklist padrão exige 20 documentos essenciais
E apenas 12 foram carregados
Quando o Admin acessa o Data Room
Então o Readiness Score deve exibir 60%
E destacar os 8 documentos faltantes com sugestão de prioridade

```

---

### 7.11 Investor Updates

**Descrição:** Módulo para geração e envio de investor updates periódicos (mensal ou trimestral). Usa dados da plataforma para gerar automaticamente um draft com IA (Claude Sonnet), baseado em template profissional. O usuário revisa, edita e envia diretamente pela plataforma.

**User Stories:**

- Como **Luiza (COO)**, quero gerar um draft de investor update mensal com base nos dados da plataforma, para reduzir o tempo de produção de 1 dia para menos de 1 hora.
- Como **Rafael (CEO)**, quero personalizar o template de investor update com o branding da minha empresa, para manter consistência nas comunicações com investidores.

**Regras de Negócio:**

| Regra | Descrição                                                                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Dados automáticos incluídos no draft: MRR do mês, variação MoM, runway, principais conquistas do produto (commits/releases), headcount atual, top 3 métricas do Health Score. |
| RN-02 | Seções do template padrão: Destaque do Mês, Métricas, Produto, Time, Financeiro, Próximos Passos, Pedido de Ajuda.                                                            |
| RN-03 | A seção "Pedido de Ajuda" é gerada por IA com base nos alertas e riscos ativos da plataforma.                                                                                 |
| RN-04 | Lista de destinatários (investidores, advisors, board) gerenciada em uma lista de contatos dentro do módulo.                                                                  |
| RN-05 | Envio via email com template HTML responsivo. Subject line personalizável.                                                                                                    |
| RN-06 | Histórico de todos os updates enviados com status de entrega e taxa de abertura.                                                                                              |
| RN-07 | Geração por IA consome 5 créditos (Claude Sonnet).                                                                                                                            |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Investor Updates

Cenário: Geração de draft com IA
Dado que o usuário acessa o módulo Investor Updates no início do mês
E os módulos de MRR, Runway, Produto e People estão populados com dados do mês anterior
Quando o usuário clica em "Gerar Draft com IA"
Então o sistema deve consumir 5 créditos de IA (Claude Sonnet)
E retornar um draft em texto rico com as seções do template preenchidas
E o usuário deve poder editar cada seção antes de enviar

Cenário: Envio de investor update para lista de contatos
Dado que o draft foi revisado e aprovado pelo CEO
E a lista de destinatários contém 5 investidores
Quando o usuário clica em "Enviar Update"
Então o sistema deve enviar o email HTML para os 5 destinatários via SMTP/SendGrid
E registrar o envio no histórico com timestamp
E notificar o usuário sobre a taxa de entrega após 1 hora

```

---

### 7.12 Health Score da Startup

**Descrição:** Índice sintético de 0 a 100 que representa a saúde geral da startup com base em dados de todos os módulos. É o principal KPI do produto — a primeira coisa que o usuário vê ao fazer login. Composto por sub-scores de 5 dimensões com pesos configuráveis.

**User Stories:**

- Como **Rafael (CEO)**, quero ver o Health Score da minha empresa na tela inicial, para ter em 3 segundos uma leitura da saúde geral do negócio.
- Como qualquer usuário, quero clicar em uma dimensão do Health Score e ver quais indicadores estão impactando negativamente, para saber exatamente onde agir.

**Regras de Negócio:**

| Regra | Descrição                                                                                                                        |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Health Score = Média ponderada dos 5 sub-scores: Financeiro (30%), Produto (25%), Time (20%), Comercial (15%), Compliance (10%). |
| RN-02 | Cada sub-score considera os indicadores do módulo correspondente (ex: Financeiro considera runway, burn rate, LTV/CAC).          |
| RN-03 | Score 80–100: Verde (Saudável). Score 60–79: Amarelo (Atenção). Score 0–59: Vermelho (Crítico).                                  |
| RN-04 | O Health Score é recalculado diariamente à meia-noite.                                                                           |
| RN-05 | Cada dimensão exibe os 3 indicadores que mais impactam positiva ou negativamente o sub-score.                                    |
| RN-06 | Gráfico de evolução do Health Score nos últimos 90 dias.                                                                         |
| RN-07 | Benchmark anônimo: comparação do score com a mediana de startups no mesmo stage (se houver dados suficientes).                   |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Health Score da Startup

Cenário: Cálculo e exibição do Health Score
Dado que os sub-scores são: Financeiro=75, Produto=68, Time=80, Comercial=55, Compliance=90
Quando o sistema calcula o Health Score
Então o score deve ser: (75×0,3) + (68×0,25) + (80×0,2) + (55×0,15) + (90×0,1) = 72,25 ≈ 72
E o indicador deve exibir status "Atenção" (amarelo)
E cada dimensão deve ter um mini-gráfico de barras com seu sub-score

Cenário: Drill-down de uma dimensão
Dado que o sub-score Comercial é 55 (vermelho)
Quando o usuário clica na dimensão Comercial
Então deve ver os 3 indicadores que mais puxam o score para baixo
E ter links diretos para os módulos correspondentes para resolver cada problema

```

---

### 7.13 Weekly Digest com IA

**Descrição:** Resumo semanal gerado automaticamente por IA (Claude Sonnet) toda segunda-feira. Consolida os principais dados de todos os módulos e entrega insights acionáveis em linguagem natural, diretamente no email e na plataforma. O Digest é personalizado pelo perfil e prioridades do usuário.

**User Stories:**

- Como **Rafael (CEO)**, quero receber toda segunda-feira às 8h um resumo da semana anterior em linguagem natural, para começar a semana com clareza sem precisar consolidar dados manualmente.
- Como **Marina (CTO)**, quero que o Weekly Digest inclua um resumo técnico (PRs mergeados, issues fechadas, alertas de segurança), para ter visibilidade do progresso da engenharia de forma rápida.

**Regras de Negócio:**

| Regra | Descrição                                                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Gerado toda segunda-feira às 08:00 (horário de Brasília) como job assíncrono.                                                                                                   |
| RN-02 | Conteúdo padrão: variação do Health Score, top 3 alertas da semana, MRR atual e variação, runway, destaque de produto (último release), OKRs em risco, insight de IA principal. |
| RN-03 | Conteúdo personalizado por perfil: CEO recebe visão de negócio, CTO recebe visão técnica, COO recebe visão operacional.                                                         |
| RN-04 | Entregue via email HTML responsivo + notificação in-app com link para versão completa.                                                                                          |
| RN-05 | Consome 5 créditos de IA por geração (Claude Sonnet).                                                                                                                           |
| RN-06 | O usuário pode configurar o horário de recebimento e os módulos incluídos no digest.                                                                                            |
| RN-07 | Se não houver dados suficientes (< 7 dias de uso), o sistema envia um digest onboarding incentivando a completar a configuração.                                                |

**Critérios de Aceite (Gherkin):**

```

Funcionalidade: Weekly Digest

Cenário: Geração e envio automático às 08h de segunda-feira
Dado que é segunda-feira às 07:55 (horário de Brasília)
E o workspace possui dados de pelo menos 7 dias
Quando o job semanal de digest é executado
Então o sistema deve consumir 5 créditos do workspace
E gerar o digest via Claude Sonnet com dados da semana anterior
E enviar por email para todos os usuários ativos com notificações habilitadas
E criar uma notificação in-app para cada destinatário

Cenário: Digest com conteúdo personalizado por perfil
Dado que o workspace tem uma CTO (Marina) e um CEO (Rafael) cadastrados
Quando o digest semanal é gerado
Então Marina deve receber uma seção "Saúde da Engenharia" com dados técnicos
E Rafael deve receber uma seção "Visão do Negócio" com dados financeiros e comerciais
E ambos devem receber as seções comuns (Health Score, alertas críticos)

```

---

## 8. Requisitos Não Funcionais

### 8.1 Performance

| Requisito                          | Especificação                           | Ferramenta de Medição         |
| ---------------------------------- | --------------------------------------- | ----------------------------- |
| **Tempo de carregamento inicial**  | LCP (Largest Contentful Paint) < 2,5s   | Vercel Analytics / Lighthouse |
| **Resposta de API (p95)**          | < 500ms para endpoints de leitura       | Datadog / Prometheus          |
| **Resposta de API (p99)**          | < 2s para endpoints de leitura          | Datadog / Prometheus          |
| **Renderização de dashboards**     | < 1s com dados em cache, < 3s sem cache | Vercel Web Vitals             |
| **Jobs de IA (Haiku)**             | < 10s para tarefas simples              | Logs internos                 |
| **Jobs de IA (Sonnet)**            | < 30s para análises                     | Logs internos                 |
| **Jobs de IA (Opus)**              | < 60s para raciocínio estratégico       | Logs internos                 |
| **Exportação de relatórios (PDF)** | < 15s para documentos de até 50 páginas | Logs internos                 |

**Estratégias de otimização:**

- Cache em nível de módulo via React Query (stale-while-revalidate para dashboards)
- Redis para cache de queries frequentes (dashboards, health score)
- Jobs pesados (IA, geração de relatórios) processados de forma assíncrona via fila de mensagens
- Paginação cursor-based para listas com muitos registros
- Lazy loading de componentes pesados (gráficos, tabelas grandes)

### 8.2 Segurança

| Requisito                  | Especificação                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Autenticação**           | Supabase Auth com Bearer token. JWT gerenciado pelo Supabase. Refresh automático via SDK.                                  |
| **Autorização**            | RBAC (Role-Based Access Control): Admin, Manager, Member, Viewer                                                           |
| **Multi-tenancy / RLS**    | Row-Level Security via SECURITY INVOKER no PostgreSQL com `search_path` bloqueado evitando SQL injections.                 |
| **Input Validation**       | Uso restrito de schemas Zod no `validateBody` em todas as rotas de escrita (POST/PATCH).                                   |
| **Database Pool**          | Prisma Client Singleton instanciado na borda prevenindo connection exhaustion e vazamentos de memória.                     |
| **Rate Limiting**          | 60 req/min global, 10 req/min por rota de IA via in-memory middleware protegendo contra Flood.                             |
| **Secrets**                | Armazenados em Vercel env vars (encrypted). Nunca expostos em logs.                                                        |
| **Dados sensíveis**        | PII, tokens e dados financeiros nunca em logs. Log sanitization obrigatório.                                               |
| **IA Server-Side**         | Todas as chamadas às APIs de LLM (Claude/Gemini) são feitas no servidor. API keys nunca expostas ao cliente. Suporte BYOK. |
| **OWASP Top 10**           | Conformidade obrigatória. Revisão em cada release major.                                                                   |
| **Prompt Injection**       | Validação e sanitização de todos os inputs antes de enviá-los a modelos de IA.                                             |
| **LGPD**                   | Consentimento explícito, direito de exclusão de dados, DPA com fornecedores.                                               |
| **Auditoria de segurança** | Log imutável de ações críticas (login, export, acesso a data room, alterações em cap table).                               |

### 8.3 Escalabilidade

| Requisito                 | Especificação                                                         |
| ------------------------- | --------------------------------------------------------------------- |
| **Tenants simultâneos**   | Suporte a 10.000 workspaces sem degradação                            |
| **Usuários por tenant**   | Até 500 usuários por workspace (plano Enterprise futuro)              |
| **Volume de transações**  | 1M transações financeiras por tenant/ano                              |
| **Arquitetura stateless** | Backend sem estado — escala horizontal                                |
| **Background Jobs**       | Filas com retry automático e dead letter queue                        |
| **Banco de dados**        | Connection pooling via PgBouncer. Read replicas para queries pesadas. |
| **Storage de arquivos**   | Object storage (S3-compatible) para documentos do Data Room           |

### 8.4 Acessibilidade e UX

| Requisito                     | Especificação                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| **WCAG**                      | Conformidade com WCAG 2.1 nível AA                                                      |
| **Mobile First**              | Design responsivo com breakpoints: mobile (≤768px), tablet (≤1024px), desktop (>1024px) |
| **Dark Mode**                 | Suporte nativo a dark mode via Tailwind + prefers-color-scheme                          |
| **Internacionalização**       | Estrutura preparada para i18n (pt-BR como padrão)                                       |
| **Acessibilidade de teclado** | Todos os fluxos principais navegáveis por teclado                                       |
| **ARIA Labels**               | Componentes interativos com labels ARIA apropriados                                     |

### 8.5 Disponibilidade e Recuperação

| Requisito                | Especificação                                 |
| ------------------------ | --------------------------------------------- |
| **SLA de Uptime**        | 99,5% (equivale a ~3,65h de downtime/mês)     |
| **RTO (Recovery Time)**  | ≤ 4 horas após incidente crítico              |
| **RPO (Recovery Point)** | ≤ 1 hora (máximo de perda de dados aceita)    |
| **Backup automático**    | Diário às 03:00 UTC, retido por 30 dias       |
| **Health checks**        | Endpoint /health respondendo a cada 30s       |
| **Circuit breaker**      | Para integrações externas (GitHub, Anthropic) |

---

## 9. Arquitetura e Decisões Técnicas

### 9.1 Stack Técnica

| Camada              | Tecnologia             | Justificativa                                                                               |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| **Frontend**        | Vite + React (SPA)     | Dashboard autenticado = SPA. HMR instantâneo, bundle estático para CDN, menor custo hosting |
| **Linguagem**       | TypeScript             | Tipagem estática, menos bugs em runtime, DX superior                                        |
| **Estilização**     | Tailwind CSS           | Utilitário, design system consistente, dark mode nativo                                     |
| **Backend**         | Node.js + Hono         | Edge-native (~14KB), Web Standards, cold starts mínimos no Vercel serverless                |
| **ORM**             | Prisma                 | Type-safety, migrations automáticas, excelente DX                                           |
| **Banco de Dados**  | PostgreSQL (Supabase)  | ACID, RLS nativo, extensões ricas (JSONB, FTS), Auth integrado                              |
| **Autenticação**    | Supabase Auth          | Integração nativa com RLS, JWT gerenciado, social logins, MFA disponível                    |
| **Monorepo**        | npm workspaces         | Zero-config nativo. Migração para pnpm+Turborepo planejada para escala (>3 devs)            |
| **Deploy**          | Vercel (unificado)     | Plataforma única (front+back), auto-scaling, preview deploys por PR, free tier generoso     |
| **Cache**           | Redis (Upstash)        | Serverless Redis, per-request billing, HTTP API para edge, integração Vercel Marketplace    |
| **Background Jobs** | Inngest                | Step functions duráveis, event-driven, serverless-compatible, sem workers dedicados         |
| **IA**              | Multi-LLM (Adapter)    | Claude (narrativa) + Gemini (dados). Adapter pattern em `packages/ai`. Suporte a BYOK       |
| **Testes**          | Vitest + Playwright    | Vitest para unitários/integração, Playwright para E2E (roadmap)                             |
| **IDE/Dev**         | Google Antigravity IDE | Vibe coding com agentes de IA, produtividade acelerada                                      |

### 9.2 Arquitetura Hexagonal (Ports & Adapters)

A arquitetura do Leadgers segue o padrão **Hexagonal (Ports & Adapters)** combinado com princípios de **Clean Architecture**. Essa escolha garante que a lógica de negócio (domínio) seja completamente isolada de detalhes de infraestrutura (banco de dados, APIs externas, frameworks).

**Camadas da arquitetura:**

```

┌─────────────────────────────────────────────────────┐
│ DOMÍNIO │
│ Entidades, Value Objects, Regras de Negócio │
│ (sem dependências externas) │
└─────────────────────┬───────────────────────────────┘
│ Ports (Interfaces)
┌─────────────────────▼───────────────────────────────┐
│ APLICAÇÃO │
│ Use Cases, Application Services, Command Handlers │
│ (orquestra o domínio, usa ports) │
└─────────────────────┬───────────────────────────────┘
│ Adapters
┌─────────────────────▼───────────────────────────────┐
│ INFRAESTRUTURA │
│ Prisma (DB), GitHub API, Anthropic API, │
│ SMTP, Open Banking, NF-e │
└─────────────────────────────────────────────────────┘

```

**Bounded Contexts (DDD):**

| Bounded Context       | Módulos                                            | Responsabilidade                      |
| --------------------- | -------------------------------------------------- | ------------------------------------- |
| **Financial**         | DRE, Fluxo de Caixa, Runway, Burn Rate, Unit Econ. | Gestão financeira e métricas de caixa |
| **CapitalStructure**  | Cap Table, Equity & Vesting                        | Estrutura societária e participação   |
| **Product**           | Roadmap, Tech Debt, GitHub Integration             | Gestão de produto e engenharia        |
| **People**            | OKRs, Headcount, 1:1s, Org Chart, PDIs             | Gestão de times e pessoas             |
| **Revenue**           | MRR/ARR, Pipeline de Vendas, NPS, Funil            | Receita e relacionamento com clientes |
| **InvestorRelations** | Data Room, Investor Updates, Fundraising           | Relações com investidores             |
| **Legal**             | Compliance, Contratos, Due Diligence               | Jurídico e conformidade               |
| **Strategy**          | SWOT, BMC, OKRs Corp., North Star, Milestones      | Visão estratégica                     |
| **Intelligence**      | Health Score, Weekly Digest, Alertas, IA Config    | Inteligência transversal e IA         |
| **Identity**          | Autenticação, Autorização, Multi-tenancy           | Segurança e identidade                |

### 9.3 Multi-tenancy com Row-Level Security

O isolamento de dados entre tenants é implementado via **Row-Level Security (RLS) do PostgreSQL**, garantindo que mesmo em caso de bug na aplicação, queries de um tenant nunca retornem dados de outro.

**Implementação:**

1. Todas as tabelas principais possuem coluna `organization_id` (FK para `organizations`)
2. RLS Policy aplicada em cada tabela: `USING (organization_id = current_setting('app.organization_id')::uuid)`
3. Middleware de autenticação seta o parâmetro de sessão: `SET app.organization_id = '...'` antes de qualquer query
4. Prisma middleware garante que todas as queries incluam o `organization_id` do tenant autenticado

### 9.4 ADRs (Architecture Decision Records)

#### ADR-001: Vite + React SPA para Dashboard Autenticado

**Contexto:** Necessidade de frontend performático para dashboard multi-módulo autenticado (ERP/CRM/BI unificado).
**Decisão:** Adotar Vite + React SPA ao invés de Next.js SSR/SSG.
**Razão:** O Leadgers é 95% dashboard autenticado — SEO é irrelevante. Vite oferece HMR instantâneo (<300ms), bundle estático servido via CDN (custo mínimo), e menor complexidade arquitetural. Next.js seria over-engineering para um SPA autenticado. O consenso da indústria em 2026 confirma: Vite para dashboards, Next.js para sites públicos com SEO.
**Consequências:** Necessidade de React Router para roteamento (vs file-system routing do Next.js). Sem SSR — mitigado pelo fato de que nenhuma página precisa de indexação.

#### ADR-002: PostgreSQL com RLS para Multi-tenancy

**Contexto:** Necessidade de isolamento total de dados entre tenants com simplicidade operacional.
**Decisão:** Usar Row-Level Security nativo do PostgreSQL (Supabase) ao invés de banco separado por tenant ou schema separado.
**Consequências:** Operação simplificada (1 banco), custo reduzido, isolamento garantido a nível de banco. Requer disciplina no Prisma para sempre incluir organization_id. Todas as functions e views usam SECURITY INVOKER com search_path bloqueado.

#### ADR-003: Multi-LLM via Adapter Pattern com BYOK

**Contexto:** Escolha de LLM para funcionalidades de IA transversal, com possibilidade de clientes trazerem suas próprias chaves.
**Decisão:** Implementar padrão Adapter (Port `IAIService` + Adapters `AnthropicAdapter`, `GoogleAdapter`) para suportar múltiplos provedores. Suporte a BYOK (Bring Your Own Key) para clientes que desejam usar suas próprias chaves de API.
**Provedores:** Claude (análise narrativa, investor updates) + Gemini (processamento de dados tabulares, classificação).
**BYOK:** Chaves do cliente são criptografadas (AES-256) e armazenadas por tenant no Supabase. Descriptografia just-in-time no momento da chamada à API do LLM. Dashboard de uso por chave BYOK para transparência.
**Consequências:** Flexibilidade total de provedores. Clientes enterprise podem usar suas próprias cotas e modelos. Routing inteligente entre provedores baseado no tipo de tarefa.

#### ADR-004: Arquitetura Hexagonal + Clean Architecture

**Contexto:** Necessidade de testabilidade, manutenibilidade e independência de frameworks.
**Decisão:** Adotar Hexagonal Architecture com DDD leve (Bounded Contexts).
**Consequências:** Código mais verbose no início, mas lógica de negócio 100% testável sem mocks de infraestrutura. Time precisa de onboarding na arquitetura.

#### ADR-005: npm workspaces para Monorepo

**Contexto:** Múltiplos packages compartilhados (core, ai) e apps (web, api).
**Decisão:** Monorepo com npm workspaces nativo ao invés de Turborepo.
**Razão:** Para o tamanho atual do projeto (2 apps + 2 packages, equipe 1-3 devs), npm workspaces oferece zero overhead de configuração com funcionalidade adequada. A complexidade do Turborepo não se justifica nesta fase.
**Migração planejada:** Quando o time crescer para >3 devs ou o monorepo exceder 5 packages, migrar para pnpm + Turborepo para build caching e prevenção de phantom dependencies.
**Consequências:** Sem build caching nativo (mitigado pelo tamanho pequeno do projeto). Sem phantom dependency prevention (mitigado por disciplina de equipe).

#### ADR-006: SpecDD para Especificação de Features

**Contexto:** Necessidade de processo estruturado para desenvolvimento de features com agentes de IA.
**Decisão:** Adotar Specification-Driven Development (SpecDD): especificação detalhada em Markdown antes de qualquer linha de código.
**Consequências:** Features mais bem definidas, menos retrabalho, integração natural com Google Antigravity IDE para geração de código via agentes.

#### ADR-007: Hono como Framework Backend (Edge-native)

**Contexto:** Necessidade de framework HTTP performático para API serverless no Vercel.
**Decisão:** Adotar Hono ao invés de Fastify ou Express.
**Razão:** Hono é construído sobre Web Standards (Request/Response), tem bundle de ~14KB (vs ~500KB+ do Fastify), e oferece cold starts significativamente menores em ambientes serverless. TypeScript-first com capacidades RPC. Perfeito para deploy no Vercel.
**Consequências:** Ecossistema menor que Express/Fastify (em crescimento rápido). Menor throughput bruto que Fastify em long-running processes (irrelevante para serverless).

#### ADR-008: Inngest para Background Jobs

**Contexto:** Necessidade de processamento assíncrono (weekly-digest, health-score, alertas preditivos) em ambiente serverless.
**Decisão:** Adotar Inngest para background jobs ao invés de BullMQ ou Trigger.dev.
**Razão:** Inngest usa step functions duráveis que funcionam nativamente com Vercel serverless (sem workers dedicados). O código vive no seu projeto, não em infraestrutura terceira. Event-driven com retry automático e dead letter queues.
**Consequências:** Dependência do serviço Inngest (mitigado: alternativa Trigger.dev disponível). Jobs existentes: `weekly-digest`, `health-score`.

#### ADR-009: Vercel como Plataforma Unificada de Deploy

**Contexto:** Necessidade de deploy simples e escalável para frontend e backend.
**Decisão:** Usar Vercel como plataforma única para frontend (static SPA) e backend (Hono serverless functions), eliminando necessidade de Railway ou infra separada.
**Razão:** Plataforma única = menor complexidade operacional. Preview deploys automáticos por PR. Auto-scaling built-in. Free tier generoso para early-stage. Hono é otimizado para Vercel.
**Consequências:** Limitação de timeout em serverless functions (mitigado por Inngest para jobs longos). Se a plataforma atingir escala que torne serverless mais caro que dedicated servers, Railway/Fly.io será avaliado (Fase 5+).

#### ADR-010: Supabase Auth para Autenticação

**Contexto:** Necessidade de autenticação segura com integração nativa ao banco de dados e RLS multi-tenant.
**Decisão:** Adotar Supabase Auth ao invés de JWT customizado, Clerk, ou Keycloak.
**Razão:** Supabase Auth é bundled com o banco (custo zero adicional), integra nativamente com RLS (token contém `user_id` usado nas policies), suporta social logins, magic links e MFA. Clerk seria um vendor adicional com custos por organização (~$1/org/mês após 100 orgs). Keycloak exigiria self-hosting (Java, infra separada). JWT customizado é risco de segurança sem equipe dedicada.
**Migração planejada:** Se clientes enterprise demandarem SAML/SCIM SSO (Fase 5+), avaliar Clerk ou WorkOS como complemento — não substituição — do Supabase Auth.
**Consequências:** Dependência do ecossistema Supabase (mitigado: Supabase é open-source, portável para self-hosted). Auth flow via Bearer token + `supabase.auth.getUser()`.

---

## 10. Modelo de Dados Conceitual

### 10.1 Entidades Principais

| Entidade               | Descrição                                                                         | Módulo            |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------- |
| `Organization`         | Tenant principal — cada startup é uma organização                                 | Identity          |
| `User`                 | Usuário da plataforma com papel e permissões                                      | Identity          |
| `FinancialTransaction` | Transação financeira (receita ou despesa)                                         | Financial         |
| `FinancialStatement`   | DRE ou Fluxo de Caixa consolidado por período                                     | Financial         |
| `CapTableEntry`        | Linha da cap table (sócio, investidor, ESOP)                                      | CapitalStructure  |
| `StockOption`          | Grant de stock option para um colaborador                                         | CapitalStructure  |
| `OKR`                  | Objetivo com seu nível (Company/Team/Individual)                                  | People            |
| `KeyResult`            | Resultado-chave vinculado a um OKR                                                | People            |
| `OKRCheckIn`           | Atualização de progresso de um Key Result                                         | People            |
| `Repository`           | Repositório GitHub sincronizado                                                   | Product           |
| `Issue`                | Issue do GitHub                                                                   | Product           |
| `PullRequest`          | Pull Request do GitHub                                                            | Product           |
| `RoadmapItem`          | Item do roadmap de produto                                                        | Product           |
| `MRRRecord`            | Snapshot mensal de MRR com breakdown de componentes                               | Revenue           |
| `Pipeline`             | Oportunidade de venda no pipeline                                                 | Revenue           |
| `DataRoomDocument`     | Documento no data room com metadados e versões                                    | InvestorRelations |
| `InvestorUpdate`       | Update enviado a investidores                                                     | InvestorRelations |
| `Contract`             | Contrato com fornecedor, cliente ou colaborador                                   | Legal             |
| `ComplianceItem`       | Item de checklist de conformidade                                                 | Legal             |
| `AIJob`                | Job de IA executado (tipo, modelo, créditos consumidos)                           | Intelligence      |
| `HealthScore`          | Snapshot diário do Health Score e sub-scores                                      | Intelligence      |
| `Alert`                | Alerta gerado pelo sistema (preditivo ou reativo)                                 | Intelligence      |
| `Employee`             | Colaborador da empresa (diferente de User — pode existir sem acesso à plataforma) | People            |
| `VestingSchedule`      | Cronograma de vesting vinculado a um StockOption                                  | CapitalStructure  |
| `FundraisingRound`     | Rodada de investimento (passada ou em andamento) com valuation e investidores     | InvestorRelations |
| `Notification`         | Notificação in-app ou email gerada por alerta ou evento do sistema                | Intelligence      |
| `AuditLog`             | Registro imutável de ações críticas na plataforma (quem fez o quê e quando)       | Identity          |

### 10.2 Relacionamentos Principais

```

Organization (1) ──── (N) User
Organization (1) ──── (N) FinancialTransaction
Organization (1) ──── (N) CapTableEntry
Organization (1) ──── (N) OKR
Organization (1) ──── (N) Repository
Organization (1) ──── (N) MRRRecord
Organization (1) ──── (N) DataRoomDocument
Organization (1) ──── (N) HealthScore

OKR (1) ──── (N) KeyResult
OKR (1) ──── (0..1) OKR [parent]
KeyResult (1) ──── (N) OKRCheckIn

Repository (1) ──── (N) Issue
Repository (1) ──── (N) PullRequest
RoadmapItem (0..1) ──── (1) Issue [linked_issue]
RoadmapItem (0..1) ──── (1) KeyResult [linked_okr]

CapTableEntry (0..N) ──── (1) User [optional]
StockOption (1) ──── (1) User [beneficiary]

DataRoomDocument (1) ──── (N) DataRoomDocumentVersion
AIJob (N) ──── (1) Organization
AIJob (1) ──── (1) User [triggered_by]

Employee (N) ──── (1) Organization
Employee (0..1) ──── (1) User [optional — colaborador com acesso]
StockOption (1) ──── (1) VestingSchedule
FundraisingRound (N) ──── (1) Organization
FundraisingRound (N) ──── (N) CapTableEntry [investors in round]
AuditLog (N) ──── (1) Organization
AuditLog (N) ──── (1) User [actor]
Notification (N) ──── (1) Alert [origin]
Notification (N) ──── (1) User [recipient]

```

---

## 11. Integrações Externas

| Integração           | Tipo              | Finalidade                                                  | Status          | Autenticação          |
| -------------------- | ----------------- | ----------------------------------------------------------- | --------------- | --------------------- |
| **GitHub**           | OAuth 2.0 + REST  | Issues, PRs, repositórios, scans de segurança               | ✅ Implementada | OAuth App             |
| **Anthropic Claude** | API Key (server)  | IA em todos os módulos (Haiku/Sonnet/Opus)                  | ✅ Parcial      | API Key (server-side) |
| **Open Banking**     | OAuth 2.0 + API   | Conciliação bancária automática                             | 🔵 Planejada    | Open Finance BR       |
| **SEFAZ / NF-e**     | SOAP/REST + Cert  | Importação de notas fiscais, consulta de NF-e               | 🔵 Planejada    | Certificado Digital   |
| **Jira**             | OAuth 2.0 + REST  | Sincronização bidirecional de issues com o roadmap          | 🔵 Planejada    | OAuth 3LO             |
| **Linear**           | OAuth 2.0 + API   | Sincronização bidirecional de issues com o roadmap          | 🔵 Planejada    | OAuth                 |
| **SendGrid / SMTP**  | API Key           | Envio de Investor Updates, Weekly Digest, alertas por email | 🔵 Planejada    | API Key               |
| **Stripe**           | API Key + Webhook | Gestão de assinaturas e cobrança dos planos do Leadgers     | 🔵 Planejada    | API Key + Webhook     |
| **Slack**            | OAuth             | Notificações de alertas críticos no Slack do workspace      | 🔵 Planejada    | OAuth Bot             |
| **Google Workspace** | OAuth 2.0         | Autenticação SSO para usuários corporativos                 | 🔵 Planejada    | OAuth 2.0             |

### 11.1 Integração GitHub — Detalhamento

A integração com GitHub é a mais crítica e já está implementada. Os eventos são recebidos via **Webhooks** e processados assincronamente.

**Eventos suportados:**

- `push` — commits novos, análise de mudanças
- `pull_request` — abertura, fechamento, review, merge
- `issues` — criação, fechamento, labels, assignment
- `check_run` e `check_suite` — resultados de CI/CD e scans
- `security_advisory` — alertas do Dependabot e Code Scanning

**Fluxo de webhook:**

1. GitHub envia evento para endpoint `/webhooks/github` (autenticado por HMAC-SHA256)
2. Endpoint valida a assinatura e enfileira o evento
3. Worker processa o evento, atualiza o banco e verifica se deve disparar alertas
4. Se necessário, agenda job de IA (ex: análise de PR com Claude Haiku)

### 11.2 Integração Anthropic Claude — Detalhamento

**Princípios de segurança:**

- API keys armazenadas em Vercel env vars (encrypted). BYOK keys criptografadas (AES-256) no Supabase por tenant
- Todas as chamadas feitas server-side (nunca client-side)
- Inputs sanitizados antes de enviar ao modelo (proteção contra prompt injection)
- Outputs validados antes de exibir ao usuário
- Timeout de 90s para requests à API Anthropic

**Seleção de modelo por contexto:**

| Tarefa                     | Modelo | Motivo                             |
| -------------------------- | ------ | ---------------------------------- |
| Alertas simples, batch     | Haiku  | Baixo custo, alta velocidade       |
| Análise de PR/Issue        | Haiku  | Tarefa estruturada e repetitiva    |
| Narrativa financeira       | Sonnet | Requer nuance e contexto           |
| Weekly Digest              | Sonnet | Análise multi-dimensional moderada |
| Investor Update            | Sonnet | Escrita de qualidade profissional  |
| Análise estratégica (SWOT) | Opus   | Raciocínio estratégico profundo    |
| Business Model Canvas      | Opus   | Análise complexa e interconectada  |

---

## 12. Módulo de IA

### 12.1 Visão Geral

A IA no Leadgers não é uma feature isolada — é uma **camada transversal** que permeia todos os módulos. Diferente de chatbots genéricos, a IA do Leadgers tem contexto proprietário: conhece o histórico financeiro da startup, a composição do time, os OKRs, o stage e os dados de todos os módulos. Isso permite que os insights gerados sejam específicos, relevantes e acionáveis.

### 12.2 Casos de Uso de IA por Módulo

| Caso de Uso                           | Módulo               | Modelo | Créditos | Trigger          |
| ------------------------------------- | -------------------- | ------ | -------- | ---------------- |
| Weekly Digest completo                | Intelligence         | Sonnet | 5        | Automático (seg) |
| Health Score computation              | Intelligence         | Haiku  | 1        | Diário           |
| Análise preditiva de runway           | Financeiro           | Haiku  | 1        | Diário           |
| Narrativa financeira do mês           | DRE / Fluxo de Caixa | Sonnet | 5        | Manual / Mensal  |
| Análise de Pull Request               | GitHub               | Haiku  | 1        | Por PR           |
| Análise de issues críticas            | GitHub               | Haiku  | 1        | Por issue        |
| Draft de Investor Update              | Investor Relations   | Sonnet | 5        | Manual           |
| Sugestão de plano de ação (Auditoria) | Auditoria            | Sonnet | 5        | Manual           |
| Análise estratégica SWOT              | Estratégia           | Opus   | 20       | Manual           |
| Business Model Canvas insights        | Estratégia           | Opus   | 20       | Manual           |
| Sugestão de tech debt prioritário     | Tech Debt            | Haiku  | 1        | Semanal          |
| Análise de churn patterns             | Revenue              | Sonnet | 5        | Mensal           |
| Geração de checklist de compliance    | Jurídico             | Haiku  | 1        | Manual           |

### 12.3 Configuração Granular por Usuário

A IA pode ser configurada em três níveis:

1. **Global:** toggle para desabilitar toda a IA do workspace (reduz consumo de créditos a zero)
2. **Por módulo:** cada módulo tem seu próprio toggle de IA
3. **Por função:** dentro de um módulo, funções específicas podem ser habilitadas/desabilitadas
4. **Por modelo:** Admin pode forçar um modelo mais econômico em substituição ao padrão

**Tela de configuração de IA (AI Settings):**

```

AI Settings
────────────────────────────────────────
🔵 IA Global: [HABILITADO] Créditos disponíveis: 450/500

Por módulo:
[✓] Financeiro Modelo: Haiku (1 crédito) [Alterar modelo ▼]
[✓] OKRs Modelo: Haiku (1 crédito) [Alterar modelo ▼]
[✓] GitHub Modelo: Haiku (1 crédito) [Alterar modelo ▼]
[✓] Weekly Digest Modelo: Sonnet (5 créditos) [Alterar modelo ▼]
[ ] Estratégia Modelo: Opus (20 créditos) DESABILITADO
[✓] Investor Rel. Modelo: Sonnet (5 créditos) [Alterar modelo ▼]
────────────────────────────────────────
Histórico de consumo: [Ver extrato completo]

```

### 12.4 Estratégia de Custo e Créditos

**Tabela de créditos por modelo:**

| Modelo        | Créditos/chamada | Custo real estimado | Caso de uso ideal               |
| ------------- | ---------------- | ------------------- | ------------------------------- |
| Claude Haiku  | 1 crédito        | ~US$ 0,005          | Tarefas simples, batch, alertas |
| Claude Sonnet | 5 créditos       | ~US$ 0,025          | Análises, narrativas, updates   |
| Claude Opus   | 20 créditos      | ~US$ 0,10           | Estratégia, raciocínio profundo |

**Proteções contra overspend:**

- Alertas quando 80% dos créditos mensais são consumidos
- Bloqueio de novas jobs de IA ao atingir 100% (planos Growth e Starter)
- Upgrade in-app sugerido quando cota está esgotada
- Relatório detalhado de consumo com breakdown por módulo e usuário

### 12.5 Segurança e Privacidade em IA

- **Prompt Engineering seguro:** templates de prompt auditados e versionados em código (nunca editáveis pelo usuário final)
- **Sanitização de inputs:** todos os dados dinâmicos inseridos nos prompts são sanitizados e escapados
- **Isolamento de contexto:** cada chamada à IA inclui APENAS os dados do tenant autenticado
- **Sem treinamento com dados do usuário:** dados dos workspaces não são usados para treinar modelos (conforme ToS da Anthropic)
- **Outputs revisados:** para funções críticas (ex: relatórios enviados externamente), sistema recomenda revisão humana antes do envio

---

## 13. Modelo de Negócio e Pricing

### 13.1 Planos de Assinatura

| Característica            | Starter                                | Growth               | Scale                |
| ------------------------- | -------------------------------------- | -------------------- | -------------------- |
| **Preço mensal**          | Grátis                                 | R$ 197/mês           | R$ 497/mês           |
| **Preço anual (por mês)** | Grátis                                 | R$ 157/mês (–20%)    | R$ 397/mês (–20%)    |
| **Usuários incluídos**    | 2                                      | 10                   | Ilimitado            |
| **Créditos de IA/mês**    | 0 (sem IA)                             | 500 créditos         | Ilimitado            |
| **Módulos disponíveis**   | Core (Financeiro básico, OKRs, GitHub) | Todos os módulos     | Todos + early access |
| **Data Room**             | ❌                                     | ✅ (2GB)             | ✅ (50GB)            |
| **Integrações externas**  | GitHub only                            | GitHub, Jira, Linear | Todas                |
| **Suporte**               | Community                              | Email (48h SLA)      | Prioritário (4h SLA) |
| **Export de dados**       | ❌                                     | CSV/PDF              | CSV/PDF/API          |
| **SSO / SAML**            | ❌                                     | ❌                   | ✅                   |
| **White-label**           | ❌                                     | ❌                   | ✅ (futuro)          |
| **Histórico de dados**    | 3 meses                                | 24 meses             | Ilimitado            |

**Racional de precificação:**

O Growth em R$ 197/mês foi definido considerando três vetores: (1) **benchmarking competitivo** — ferramentas equivalentes separadas (Conta Azul ~R$150 + Lattice ~US$11/user + ChartMogul ~US$100 + Notion Pro ~US$16/user) totalizam R$ 600–900/mês para uma startup de 5 pessoas; o Leadgers entrega mais integração por menos de um terço do custo; (2) **sensibilidade de preço do ICP** — founders solo e equipes de até 5 pessoas em early-stage têm budget de R$ 150–250/mês para ferramentas de gestão, tornando R$ 197 o teto psicológico adequado; (3) **margem sobre custo de IA** — com consumo médio estimado de 300 créditos/mês por workspace Growth, o custo de IA gira em torno de R$ 8–12/mês, garantindo margem de contribuição saudável. O Scale em R$ 497/mês segue o mesmo racional, posicionado para startups em Série A+ com time de 10–20 pessoas onde o valor de features como SSO, Data Room 50GB e créditos ilimitados justifica o ticket maior.

### 13.2 Estratégia de Monetização

O Leadgers adota uma estratégia **Product-Led Growth (PLG)** combinada com **Sales-Assisted** para contas maiores:

1. **Freemium (Starter):** entrada sem fricção, cobre as necessidades básicas de uma startup solo. O objetivo é gerar tração, dados de uso e casos de sucesso.
2. **Upgrade por necessidade natural:** usuário cresce no Starter e atinge limites naturais (mais de 2 usuários, necessidade de IA, Data Room). O upgrade é contextual — sugerido no momento da necessidade.
3. **IA como motor de conversão:** a IA (Weekly Digest, Health Score, Investor Update) é o principal motivador de upgrade do Starter para Growth. Usuários que experimentam IA têm 3× mais chance de converter.
4. **Expansão por usuário:** empresas que crescem (de 5 para 15 pessoas) expandem naturalmente o número de usuários, gerando expansão de receita sem necessidade de novo ciclo de venda.

### 13.3 Estratégia de Go-to-Market

| Fase               | Período                  | Ação Principal                                            | Meta                       |
| ------------------ | ------------------------ | --------------------------------------------------------- | -------------------------- |
| **Fase 0: Beta**   | Q1 2026 _(em andamento)_ | Beta fechado com 50 startups selecionadas de aceleradoras | Validar PMF, coletar NPS   |
| **Fase 1: Launch** | Q2 2026                  | Product Hunt, comunidades de founders, content marketing  | 200 workspaces criados     |
| **Fase 2: Tração** | Q3 2026                  | Parcerias com aceleradoras (Startup Farm, ACE, MESC)      | 350 workspaces ativos      |
| **Fase 3: Escala** | Q4 2026                  | Programa de afiliados, webinars para founders             | 500 workspaces, R$ 50k MRR |

**Canais de aquisição prioritários:**

1. **SEO de conteúdo:** artigos sobre runway, unit economics, cap table, OKRs para founders
2. **Comunidades:** Indie Hackers, Founders BR, comunidades de Discord de dev/founders
3. **Product Hunt:** lançamento formal com sequência de upvotes
4. **Parcerias com aceleradoras:** acesso a cohorts de startups pré-selecionadas
5. **GitHub Marketplace:** distribuição via marketplace para devs-founders

---

## 14. Roadmap de Implementação

### 14.1 Fases de Desenvolvimento

> **Nota de status (20/03/2026):** A Fase 1 está em desenvolvimento ativo. Os itens marcados com ✅ estão entregues (DRE, Fluxo de Caixa, GitHub, Auditoria, SWOT); os demais estão em progresso. As Fases 2–4 são planejadas.

#### Fase 1 — MVP Core Expandido (Q1 2026 — Em andamento)

**Objetivo:** Consolidar funcionalidades financeiras e estratégicas core, lançar beta fechado.

| Feature                  | Prioridade | Esforço | Impacto | Semanas |
| ------------------------ | ---------- | ------- | ------- | ------- |
| Runway Calculator        | Must       | M       | Alto    | 2       |
| Burn Rate Dashboard      | Must       | M       | Alto    | 1       |
| Unit Economics           | Must       | M       | Alto    | 2       |
| OKRs Cascateados         | Must       | G       | Alto    | 3       |
| Equity & Vesting Tracker | Must       | G       | Médio   | 2       |
| Roadmap Visual           | Must       | G       | Alto    | 3       |
| Business Model Canvas    | Must       | M       | Médio   | 2       |
| North Star Metric        | Must       | P       | Alto    | 1       |

**Marco:** Beta fechado com 50 startups. Meta: NPS > 40.

#### Fase 2 — Monetização e Tração (Q2 2026 — Abr a Jun)

**Objetivo:** Lançar funcionalidades de IA e investor relations, iniciar monetização.

| Feature               | Prioridade | Esforço | Impacto | Semanas |
| --------------------- | ---------- | ------- | ------- | ------- |
| MRR/ARR Tracker       | Must       | M       | Alto    | 2       |
| Health Score          | Must       | G       | Alto    | 3       |
| Weekly Digest (IA)    | Must       | M       | Alto    | 2       |
| Alertas Preditivos    | Must       | M       | Alto    | 2       |
| Data Room             | Must       | G       | Alto    | 3       |
| Investor Updates (IA) | Must       | M       | Alto    | 2       |
| Cap Table             | Must       | G       | Médio   | 3       |
| Stripe (billing)      | Must       | M       | Alto    | 2       |

**Marco:** Product Hunt launch. Meta: 200 workspaces, R$ 15k MRR.

#### Fase 3 — Expansão Operacional (Q3 2026 — Jul a Set)

**Objetivo:** Completar módulos de People, Produto avançado e Comercial.

| Feature                | Prioridade | Esforço | Impacto | Semanas |
| ---------------------- | ---------- | ------- | ------- | ------- |
| Headcount Planning     | Must       | M       | Alto    | 2       |
| Tech Debt Tracker      | Must       | M       | Médio   | 2       |
| Pipeline de Vendas     | Must       | M       | Médio   | 2       |
| NPS & CSAT             | Should     | M       | Médio   | 2       |
| Uptime & Incidents     | Should     | M       | Médio   | 2       |
| 1:1s e PDIs            | Should     | M       | Médio   | 2       |
| Gestão de Contratos    | Should     | M       | Médio   | 2       |
| Integração Jira/Linear | Should     | G       | Médio   | 3       |

**Marco:** 350 workspaces, parcerias com aceleradoras.

#### Fase 4 — Escala e Integrações (Q4 2026 — Out a Dez)

**Objetivo:** Completar integrações bancárias, NF-e e funcionalidades avançadas.

| Feature                    | Prioridade | Esforço | Impacto | Semanas |
| -------------------------- | ---------- | ------- | ------- | ------- |
| Conciliação Bancária       | Should     | GG      | Alto    | 4       |
| Integração NF-e            | Should     | GG      | Médio   | 4       |
| Competitive Intelligence   | Should     | G       | Médio   | 3       |
| Valuation Calculator       | Could      | M       | Médio   | 2       |
| Org Chart Dinâmico         | Should     | M       | Baixo   | 2       |
| Pipeline de Fundraising    | Should     | M       | Médio   | 2       |
| Projeções Financeiras 3-5a | Should     | G       | Médio   | 3       |

**Marco:** 500 workspaces, R$ 50k MRR, NPS ≥ 50.

### 14.2 Matriz de Priorização (Impacto × Complexidade)

```

ALTA COMPLEXIDADE
│
Alto │ Conciliação Bancária │ Health Score
Impacto │ Cap Table │ OKRs Cascateados
│ NF-e Integration │ Weekly Digest (IA)
├────────────────────────┼────────────────────
Baixo │ Org Chart │ Runway Calculator
Impacto │ Gestão de Férias │ Burn Rate Dashboard
│ Definition of Done │ North Star Metric
│
BAIXA COMPLEXIDADE

```

---

## 15. Riscos e Mitigações

### 15.1 Riscos Técnicos

| Risco                                                             | Probabilidade | Impacto   | Mitigação                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------- | ------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vazamento de dados entre tenants                                  | Baixa         | Crítico   | RLS no PostgreSQL + testes de isolamento automatizados em CI/CD + audit regular                                                                                                                                                                                        |
| Indisponibilidade da API Anthropic                                | Média         | Alto      | Circuit breaker, fallback gracioso (desabilitar IA sem afetar módulos core), múltiplos alertas                                                                                                                                                                         |
| **Dependência de fornecedor único de IA (vendor lock-in)**        | **Média**     | **Alto**  | **Abstrair chamadas de IA via Port na arquitetura hexagonal — troca de Claude por outro LLM deve ser configuração, não reescrita. Monitorar alternativas (OpenAI, Gemini) como fallback.**                                                                             |
| Performance degradada com escala de tenants                       | Média         | Médio     | Connection pooling (PgBouncer), índices otimizados, read replicas, cache Redis                                                                                                                                                                                         |
| Sincronização inconsistente com GitHub                            | Média         | Médio     | Webhook idempotente, reconciliação periódica via polling, dead letter queue para eventos                                                                                                                                                                               |
| **Instabilidade da integração SEFAZ/NF-e**                        | **Alta**      | **Médio** | **A API da SEFAZ tem histórico de instabilidade e mudanças sem aviso. Usar biblioteca intermediária mantida pela comunidade (ex: nfephp), implementar circuit breaker e filas de retry, e tratar NF-e como feature assíncrona — nunca bloquear o fluxo principal.**    |
| Custo de IA acima do planejado                                    | Média         | Médio     | Hard limits por plano, alertas de consumo, modelo econômico como padrão                                                                                                                                                                                                |
| Vulnerabilidade de prompt injection                               | Baixa         | Alto      | Sanitização obrigatória de inputs, templates de prompt em código, revisão de segurança                                                                                                                                                                                 |
| Breach de dados via token comprometido                            | Baixa         | Crítico   | Rotação automática de tokens, alertas de uso anômalo, JWTs de vida curta (15min)                                                                                                                                                                                       |
| **Regressões introduzidas por geração de código via vibe coding** | **Média**     | **Alto**  | **Todo código gerado por agente (Antigravity) passa por revisão humana antes do merge. Testes automatizados em regras de negócio críticas (financeiro, multi-tenancy) são pré-requisito para deploy. CI/CD bloqueia merge sem cobertura mínima nas funções críticas.** |

### 15.2 Riscos de Negócio

| Risco                                                                | Probabilidade | Impacto  | Mitigação                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------- | ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Churn alto por complexidade de onboarding                            | Alta          | Alto     | Onboarding guiado (wizard), templates pré-configurados por tipo de startup, time-to-value < 10 min                                                                                                                                                                                                                                      |
| **Player grande lança feature equivalente (Linear, Notion, GitHub)** | **Média**     | **Alto** | **Diferencial não está em features isoladas, mas na integração entre módulos e no contexto proprietário da IA. Um player horizontal que adiciona runway calculator não tem acesso ao histórico de OKRs, PRs e equipe para gerar o mesmo nível de insight. Manter ritmo de lançamento e construir switching cost via dados históricos.** |
| Concorrência de player maior genérico (ex: Notion IA)                | Média         | Médio    | Foco em integrações nativas e IA contextual que players horizontais não replicam facilmente                                                                                                                                                                                                                                             |
| Dificuldade de captação de clientes no início                        | Alta          | Médio    | PLG com freemium, parcerias com aceleradoras, conteúdo técnico de alta qualidade                                                                                                                                                                                                                                                        |
| Resistência de founders a migrar ferramentas                         | Média         | Médio    | Importadores de dados (CSV, API), onboarding sem necessidade de abandonar ferramentas antigas                                                                                                                                                                                                                                           |
| Custo de aquisição (CAC) muito alto                                  | Média         | Médio    | Foco em canais orgânicos (SEO, comunidades), programa de referral entre founders                                                                                                                                                                                                                                                        |
| **Escopo excessivo compromete qualidade e velocidade de entrega**    | **Alta**      | **Alto** | **9 módulos é um escopo ambicioso para time enxuto. Mitigação: roadmap faseado com releases incrementais, SpecDD rigoroso antes de cada feature, métricas de adoção por módulo guiam priorização — cortar ou adiar features com baixa adoção.**                                                                                         |
| Regulatório: mudanças no Open Finance BR                             | Baixa         | Médio    | Abstração da integração bancária via adapter (troca de provedor sem mudança no domínio)                                                                                                                                                                                                                                                 |

### 15.3 Riscos de Segurança

| Risco                                     | Probabilidade | Impacto | Mitigação                                                                             |
| ----------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------- |
| Dados sensíveis em logs                   | Média         | Alto    | Log sanitizer obrigatório em todos os serviços, auditoria de logs em CI               |
| Secrets expostos em código                | Baixa         | Crítico | Pré-commit hooks com secret scanning (git-secrets, GitGuardian), vault obrigatório    |
| Ataques de força bruta em login           | Alta          | Médio   | Rate limiting, CAPTCHA após N tentativas, lockout temporário                          |
| Injeção via dados de terceiros (webhooks) | Média         | Alto    | Validação HMAC de webhooks, sanitização de todos os payloads externos                 |
| Acesso não autorizado ao Data Room        | Baixa         | Crítico | Links com expiração, MFA para acessos externos, log auditável de cada acesso          |
| Escalada de privilégio entre módulos      | Baixa         | Alto    | RBAC rigoroso, testes de autorização automatizados, revisão de permissões por release |

---

## 16. Glossário

| Termo                      | Definição                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| **ARR**                    | Annual Recurring Revenue — receita recorrente anualizada (MRR × 12)                                       |
| **MRR**                    | Monthly Recurring Revenue — receita recorrente mensal de assinaturas ativas                               |
| **Burn Rate**              | Taxa mensal de consumo de caixa. Gross Burn = total de saídas. Net Burn = saídas − receitas recorrentes.  |
| **Runway**                 | Prazo de sobrevivência financeira da startup. Runway = Caixa ÷ Net Burn Rate.                             |
| **Churn**                  | Taxa de cancelamento de clientes ou receita em um período                                                 |
| **Cohort**                 | Grupo de clientes ou usuários adquiridos no mesmo período, analisados juntos ao longo do tempo            |
| **CAC**                    | Customer Acquisition Cost — custo total para adquirir um novo cliente                                     |
| **LTV**                    | Lifetime Value — receita total esperada de um cliente durante toda sua vida no produto                    |
| **LTV/CAC**                | Relação entre valor gerado pelo cliente e custo de aquisição. Saudável ≥ 3x.                              |
| **Payback Period**         | Tempo necessário para recuperar o CAC com a receita gerada pelo cliente. Saudável < 12 meses.             |
| **Cap Table**              | Capitalization Table — tabela que mostra a estrutura de participação societária de uma empresa            |
| **Vesting**                | Processo de aquisição gradual de participação/opções por colaboradores ao longo do tempo                  |
| **Cliff**                  | Período mínimo de permanência antes de qualquer opção vestir. Padrão: 12 meses.                           |
| **ESOP**                   | Employee Stock Option Plan — pool de ações reservado para remuneração variável de colaboradores           |
| **NPS**                    | Net Promoter Score — métrica de satisfação e lealdade de clientes (–100 a +100)                           |
| **CSAT**                   | Customer Satisfaction Score — pontuação de satisfação em interações específicas                           |
| **OKR**                    | Objectives and Key Results — framework de definição e acompanhamento de metas                             |
| **KPI**                    | Key Performance Indicator — métrica quantitativa de desempenho                                            |
| **PDI**                    | Plano de Desenvolvimento Individual — plano estruturado de crescimento profissional                       |
| **Data Room**              | Repositório organizado e seguro de documentos para due diligence em processos de investimento             |
| **Due Diligence**          | Processo de investigação detalhada de uma empresa antes de um investimento ou aquisição                   |
| **Tech Debt**              | Dívida técnica — atalhos e simplificações no código que reduzem qualidade e geram custo futuro            |
| **Health Score**           | Índice composto (0–100) que representa a saúde geral de uma startup baseado em múltiplos indicadores      |
| **Multi-tenancy**          | Arquitetura onde múltiplos clientes (tenants) compartilham a mesma infraestrutura com isolamento de dados |
| **RLS**                    | Row-Level Security — mecanismo do PostgreSQL para isolar dados por tenant no banco de dados               |
| **Bounded Context**        | Conceito de DDD: delimitação clara de um domínio com seu modelo, linguagem e responsabilidade             |
| **DDD**                    | Domain-Driven Design — abordagem de design de software centrada no domínio do negócio                     |
| **Hexagonal Architecture** | Padrão arquitetural que isola o núcleo de negócio de detalhes de infraestrutura via Ports & Adapters      |
| **ADR**                    | Architecture Decision Record — documento que registra decisões arquiteturais com contexto e justificativa |
| **SpecDD**                 | Specification-Driven Development — processo onde especificação detalhada precede a implementação          |
| **PLG**                    | Product-Led Growth — estratégia onde o próprio produto é o principal canal de aquisição e expansão        |
| **PMF**                    | Product-Market Fit — estado em que o produto satisfaz genuinamente a demanda do mercado-alvo              |
| **NRR**                    | Net Revenue Retention — % da receita de um cohort retida após expansões e cancelamentos                   |
| **ARPU**                   | Average Revenue Per User — receita média por usuário/conta pagante                                        |
| **LGPD**                   | Lei Geral de Proteção de Dados — legislação brasileira de privacidade de dados (similar ao GDPR europeu)  |
| **SOC 2**                  | Service Organization Control 2 — framework de auditoria de segurança para empresas SaaS                   |
| **OWASP Top 10**           | Lista das 10 vulnerabilidades de segurança web mais críticas, publicada pela OWASP Foundation             |
| **RBAC**                   | Role-Based Access Control — controle de acesso baseado em papéis (Admin, Manager, Member, Viewer)         |
| **JWT**                    | JSON Web Token — padrão de token para autenticação stateless em APIs                                      |
| **Webhook**                | Mecanismo de callback HTTP para notificação de eventos em tempo real entre sistemas                       |
| **DRE**                    | Demonstrativo de Resultado do Exercício — relatório financeiro que mostra receitas, custos e lucro        |
| **SWOT / FOFA**            | Strengths, Weaknesses, Opportunities, Threats (Forças, Oportunidades, Fraquezas, Ameaças)                 |
| **BMC**                    | Business Model Canvas — framework visual para descrever modelos de negócio                                |
| **North Star Metric**      | A métrica única mais importante que captura o valor central entregue pelo produto                         |

---

## 17. Apêndices

### Apêndice A — Diagrama de Arquitetura do Sistema

graph TB
subgraph "Cliente"
B[Browser / Mobile]
end
subgraph "Frontend - Vercel CDN"
VR[Vite + React SPA]
RR[React Router]
ZS[Zustand State]
VR --> RR
VR --> ZS
end
subgraph "Backend - Vercel Serverless"
H[Hono API]
subgraph "Middleware"
AU[Auth Middleware]
TN[Tenancy Middleware]
RL[Rate Limiter]
VL[Zod Validation]
end
subgraph "Aplicação"
UC[Use Cases]
DS[Domain Services]
end
subgraph "Infraestrutura"
PG[PostgreSQL + Prisma]
RD[Redis Cache - Upstash]
IG[Inngest Jobs]
end
H --> AU
AU --> TN
TN --> VL
VL --> UC
UC --> DS
UC --> PG
UC --> RD
UC --> IG
end
subgraph "Auth - Supabase"
SA[Supabase Auth]
SA --> PG
end
subgraph "Serviços Externos"
GH[GitHub API]
AN[Anthropic Claude API]
GM[Google Gemini API]
OB[Open Banking]
SG[SendGrid]
ST[Stripe]
end
B --> VR
VR --> H
VR --> SA
IG --> AN
IG --> GH
H --> GH
H --> OB
H --> SG
H --> ST
H --> AN
H --> GM

### Apêndice B — Diagrama de Entidades (ER Simplificado)

erDiagram
ORGANIZATION ||--o{ USER : "has"
ORGANIZATION ||--o{ FINANCIAL_TRANSACTION : "owns"
ORGANIZATION ||--o{ CAP_TABLE_ENTRY : "owns"
ORGANIZATION ||--o{ OKR : "has"
ORGANIZATION ||--o{ REPOSITORY : "has"
ORGANIZATION ||--o{ MRR_RECORD : "has"
ORGANIZATION ||--o{ HEALTH_SCORE : "has"
ORGANIZATION ||--o{ ALERT : "has"
ORGANIZATION ||--o{ AI_JOB : "consumes"
OKR ||--o{ KEY_RESULT : "has"
OKR ||--o| OKR : "parent"
KEY_RESULT ||--o{ OKR_CHECKIN : "has"
REPOSITORY ||--o{ ISSUE : "has"
REPOSITORY ||--o{ PULL_REQUEST : "has"
ROADMAP_ITEM ||--o| ISSUE : "linked_to"
ROADMAP_ITEM ||--o| KEY_RESULT : "linked_to"
CAP_TABLE_ENTRY ||--o{ STOCK_OPTION : "grants"
STOCK_OPTION ||--|| USER : "for"
DATA_ROOM_DOCUMENT ||--o{ DOCUMENT_VERSION : "has"
DATA_ROOM_DOCUMENT ||--o{ ACCESS_LOG : "tracks"
USER {
uuid id
string email
string name
string role
uuid organization_id
}
ORGANIZATION {
uuid id
string name
string slug
string plan
int ai_credits_used
int ai_credits_limit
}
OKR {
uuid id
string title
string level
string status
float progress
uuid parent_okr_id
uuid organization_id
}

### Apêndice C — Fluxo de Autenticação (Supabase Auth)

sequenceDiagram
participant U as Usuário
participant FE as React SPA (Vite)
participant SA as Supabase Auth
participant BE as Hono API (Vercel)
participant DB as PostgreSQL (Supabase)
U->>FE: Login (email + senha / social login)
FE->>SA: supabase.auth.signInWithPassword()
SA->>SA: Verifica credenciais
SA-->>FE: Session (access_token JWT + refresh_token)
FE->>FE: supabase.auth.onAuthStateChange() armazena sessão
Note over U,DB: Fluxo de Request Autenticado
U->>FE: Navega para dashboard
FE->>BE: GET /api/dashboard (Bearer: access_token)
BE->>SA: supabase.auth.getUser(token) — valida JWT
SA-->>BE: User { id, email }
BE->>BE: authMiddleware seta c.set('user', user)
BE->>BE: tenancyMiddleware busca tenant_members via x-tenant-id
BE->>DB: Query com tenant_id isolado (RLS via WHERE)
DB->>DB: RLS Policy aplica filtro automático
DB-->>BE: Dados somente desse tenant
BE-->>FE: Response com dados do tenant
FE-->>U: Dashboard renderizado
Note over U,DB: Refresh de Token (automático)
FE->>SA: supabase.auth.refreshSession() (auto via SDK)
SA-->>FE: Nova Session com access_token atualizado
FE->>BE: Retry da requisição com novo token

### Apêndice D — Fluxo de Consumo de IA

flowchart TD
A[Usuário aciona função de IA] --> B{IA habilitada no módulo?}
B -- Não --> C[Exibe mensagem: IA desabilitada neste módulo]
B -- Sim --> D{Créditos suficientes?}
D -- Não --> E[Exibe alerta de cota esgotada + opção de upgrade]
D -- Sim --> F[Seleciona modelo baseado na configuração do módulo]
F --> G[Sanitiza inputs do usuário/contexto]
G --> H[Monta prompt com template versionado + contexto do tenant]
H --> I[Envia request para Anthropic API server-side]
I --> J{Response recebida?}
J -- Erro/Timeout --> K[Fallback gracioso: exibe mensagem de erro + retry]
J -- Sucesso --> L[Valida e sanitiza output da IA]
L --> M[Desconta créditos do workspace]
M --> N[Registra AIJob no banco com modelo, créditos e resultado]
N --> O[Retorna resultado para o usuário]
O --> P{Resultado requer revisão humana?}
P -- Sim --> Q[Exibe indicador: Gerado por IA - revisar antes de enviar]
P -- Não --> R[Exibe resultado diretamente]

### Apêndice E — Checklist de Launch (Pré-Beta)

#### Funcionalidades Core

- DRE e Fluxo de Caixa estáveis e testados
- Runway Calculator com 3 cenários funcionando
- OKRs criação, cascateamento e check-ins
- GitHub Integration com webhooks validados
- Health Score calculado e exibido no dashboard
- Weekly Digest gerado e entregue por email
- Alertas preditivos ativos (runway, LTV/CAC)

#### Segurança

- RLS testado com usuários de tenants diferentes
- JWT com expiração de 15 minutos configurado
- Rate limiting ativo em todos os endpoints públicos
- Secrets em vault (nenhuma variável hardcoded)
- Log sanitizer ativo (nenhum dado sensível em logs)
- OWASP checklist revisado e aprovado

#### Infraestrutura

- Backup automático diário configurado
- Health check endpoint respondendo
- Alertas de uptime configurados (Uptime Robot ou similar)
- Domínio app.leadgers.com com HTTPS
- CORS configurado corretamente para produção

#### Produto

- Onboarding guiado (wizard de 5 passos) implementado
- Template de startup pré-configurado disponível
- Documentação básica de uso (help center ou tooltip)
- Feedback in-app habilitado

#### Legal / Compliance

- Termos de Serviço publicados
- Política de Privacidade (LGPD) publicada
- Consentimento de cookies implementado
- DPA com Anthropic e outros subprocessadores assinado

#### Métricas

- Analytics de produto configurado (PostHog ou Mixpanel)
- Error tracking ativo (Sentry)
- Dashboard de métricas de negócio (MRR, churn, DAU)

### Apêndice F — Referências

| Referência                                        | URL / Fonte                                      |
| ------------------------------------------------- | ------------------------------------------------ |
| ABStartups — Panorama do Ecossistema de Startups  | abstartups.com.br                                |
| Anthropic Claude API Documentation                | docs.anthropic.com                               |
| Google Gemini API Documentation                   | ai.google.dev/docs                               |
| Hono Web Framework Documentation                  | hono.dev                                         |
| Vite Build Tool Documentation                     | vite.dev                                         |
| React Documentation                               | react.dev                                        |
| Supabase Documentation                            | supabase.com/docs                                |
| Supabase Auth Documentation                       | supabase.com/docs/guides/auth                    |
| Inngest Documentation                             | inngest.com/docs                                 |
| OWASP Top 10 (2023)                               | owasp.org/www-project-top-ten                    |
| PostgreSQL Row-Level Security                     | postgresql.org/docs/current/ddl-rowsecurity.html |
| Prisma Documentation                              | prisma.io/docs                                   |
| Upstash Redis Documentation                       | upstash.com/docs/redis                           |
| Open Finance Brasil                               | openfinancebrasil.org.br                         |
| LGPD — Lei 13.709/2018                            | lgpd-brasil.info                                 |
| SaaS Metrics Benchmarks (KeyBanc Capital Markets) | keybanc.com/saas-survey                          |
| Domain-Driven Design — Eric Evans                 | Livro: DDD by Eric Evans (Addison-Wesley)        |
| Hexagonal Architecture — Alistair Cockburn        | alistair.cockburn.us/hexagonal-architecture      |
| Vercel Documentation                              | vercel.com/docs                                  |
| WCAG 2.1 Guidelines                               | w3.org/TR/WCAG21                                 |
| Vitest Documentation                              | vitest.dev                                       |
| Playwright Documentation                          | playwright.dev                                   |
| Tailwind CSS Documentation                        | tailwindcss.com/docs                             |

---

## 18. Onboarding e Time-to-Value

### 18.1 Princípio central

O Leadgers tem 9 módulos e dezenas de funcionalidades. Sem um onboarding cuidadoso, o usuário chega na tela inicial, se depara com um sistema vazio e abandona antes de criar qualquer valor. A meta é: **menos de 10 minutos entre o cadastro e o primeiro insight acionável**.

### 18.2 Fluxo de Onboarding (Wizard de 5 Passos)

```

Passo 1 — Perfil da startup (2 min)
Nome, segmento, estágio (idea / pre-revenue / revenue / funded)
Número de pessoas no time
→ Adapta os módulos sugeridos ao perfil

Passo 2 — Financeiro inicial (3 min)
Saldo atual em caixa
Burn rate médio estimado (ou importação de CSV do banco)
→ Gera o primeiro Runway Calculator imediatamente

Passo 3 — Conectar GitHub (opcional, 1 min)
OAuth com um clique
Selecionar repositórios a monitorar
→ Puxa issues e PRs em background

Passo 4 — Definir North Star Metric (1 min)
Escolher a métrica mais importante agora (MRR, usuários ativos, NPS, ARR)
Inserir valor atual
→ Exibe o primeiro dashboard com o indicador principal

Passo 5 — Primeiro Health Score
Sistema calcula Health Score inicial com os dados inseridos
Exibe os 3 principais alertas/oportunidades da startup
→ "Seu runway atual é de X meses. Veja o que fazer."

````

### 18.3 Templates por Perfil

Para reduzir o tempo de setup, o sistema oferece templates pré-configurados:

| Template                       | Para quem                              | O que pré-carrega                                           |
| ------------------------------ | -------------------------------------- | ----------------------------------------------------------- |
| **Micro-SaaS Solo**            | Founder solo, < R$ 20k MRR             | Runway, MRR tracker, GitHub básico, SWOT                    |
| **Early-Stage (2–5 pessoas)**  | Seed / pré-seed                        | Financeiro completo, OKRs, Roadmap, GitHub                  |
| **Crescimento (6–15 pessoas)** | Série A / Seed avançado                | Todos os módulos, OKRs cascateados, Data Room, Cap Table    |
| **Prep para captação**         | Qualquer estágio buscando investimento | Data Room, Cap Table, Investor Updates, Due Diligence Score |

### 18.4 Progressive Disclosure

Módulos avançados (Cap Table, Projeções, Compliance) ficam visíveis mas com estado "não configurado" e um CTA claro: _"Configure em 5 minutos quando precisar"_. O usuário não é forçado a preencher tudo antes de ver valor — o sistema entrega insights com o mínimo de dados e vai enriquecendo conforme mais dados são adicionados.

### 18.5 Critérios de Aceite do Onboarding

```gherkin
Funcionalidade: Onboarding de novo usuário

Cenário: Primeiro acesso com template Micro-SaaS Solo
  Dado que o usuário criou uma conta e selecionou o template "Micro-SaaS Solo"
  E inseriu saldo de R$ 50.000 e burn rate de R$ 10.000/mês
  Quando completa o wizard (passos 1 a 5)
  Então o sistema deve exibir o Runway Calculator com os 3 cenários
  E exibir o Health Score inicial com pelo menos 1 alerta acionável
  E o tempo total do passo 1 ao Health Score deve ser inferior a 10 minutos

Cenário: Usuário abandona onboarding no passo 2
  Dado que o usuário completou apenas os passos 1 e 2
  Quando retorna à plataforma no dia seguinte
  Então o sistema deve continuar o wizard do passo 3
  E exibir o Runway Calculator com os dados já inseridos
````

---

## 19. Privacidade e Proteção de Dados (LGPD)

### 19.1 Classificação dos dados processados

O Leadgers processa categorias sensíveis de dados que exigem atenção especial:

| Categoria                    | Exemplos                           | Sensibilidade | Base Legal (LGPD)             |
| ---------------------------- | ---------------------------------- | ------------- | ----------------------------- |
| Dados financeiros da empresa | Transações, DRE, saldos, burn rate | Alta          | Execução de contrato          |
| Dados de colaboradores       | Nome, cargo, vesting, PDI, 1:1s    | Alta          | Legítimo interesse / Contrato |
| Dados societários            | Cap table, participações, rodadas  | Muito alta    | Execução de contrato          |
| Dados de clientes da startup | NPS, pipeline de vendas            | Média         | Legítimo interesse            |
| Dados técnicos (GitHub)      | Código, commits, issues            | Média         | Execução de contrato          |
| Dados de uso da plataforma   | Logs de acesso, sessões            | Baixa         | Legítimo interesse            |

### 19.2 Direitos dos Titulares

O Leadgers implementa os 9 direitos previstos no Art. 18 da LGPD:

- **Confirmação e acesso:** usuário pode exportar todos os seus dados a qualquer momento (CSV/JSON)
- **Correção:** dados editáveis diretamente na plataforma
- **Anonimização / bloqueio / eliminação:** disponível via painel de conta — prazo de execução: até 15 dias úteis
- **Portabilidade:** exportação completa em formato estruturado (JSON)
- **Informação sobre compartilhamento:** política de privacidade lista todos os subprocessadores
- **Revogação de consentimento:** opt-out granular por categoria de dado e finalidade
- **Oposição:** canal direto: privacidade@cogitari.com.br

### 19.3 Subprocessadores e Transferências

| Subprocessador  | Finalidade                    | Localização dos dados            | DPA assinado                      |
| --------------- | ----------------------------- | -------------------------------- | --------------------------------- |
| Vercel          | Hospedagem frontend + backend | EUA (edge global)                | ✅                                |
| Supabase        | Banco de dados + Auth         | Brasil (quando disponível) / EUA | ✅                                |
| Anthropic       | Processamento de IA (Claude)  | EUA                              | ✅ (obrigatório antes do go-live) |
| Google AI       | Processamento de IA (Gemini)  | EUA                              | ✅                                |
| Inngest         | Background jobs               | EUA                              | ✅                                |
| SendGrid        | Envio de emails               | EUA                              | ✅                                |
| Stripe          | Processamento de pagamentos   | EUA                              | ✅                                |
| Upstash (Redis) | Cache                         | EUA / multi-região               | ✅                                |

> ⚠️ **Atenção:** Para transferências internacionais, o Leadgers aplica cláusulas contratuais padrão (SCCs) ou verifica adequação de acordo com o Art. 33 da LGPD. O DPA com a Anthropic é pré-requisito para o go-live da funcionalidade de IA.

### 19.4 Medidas Técnicas e Organizacionais

- Criptografia em trânsito: TLS 1.3 obrigatório em todas as conexões
- Criptografia em repouso: AES-256 para dados financeiros e societários no banco
- Retenção de dados: dados de workspaces cancelados são mantidos por 90 dias e então deletados permanentemente (exceto quando requerido por lei)
- AuditLog imutável de todas as operações críticas (quem acessou, editou ou deletou dados sensíveis)
- Nenhum dado de usuário é usado para treinar modelos de IA (conforme ToS da Anthropic API)
- Encarregado de Dados (DPO): a ser designado antes do go-live público

---

_Documento revisado em 02/04/2026 — Versão 1.2.0_  
_© 2026 Cogitari Tech. Produto: Leadgers Platform. Todos os direitos reservados. Documento confidencial._
