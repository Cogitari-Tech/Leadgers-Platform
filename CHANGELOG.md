# 📋 Changelog - Leadgers Platform

**Repositório:** https://github.com/Cogitari-Tech/Leadgers-Platform

---

## 🚀 v1.2.2 — Core Stability & Security Patches (Abril 2026)

### 📊 Finance & Export (Dashboard)

- ✅ **Conversão Excel e Formatação:** Correção da métrica financeira no pipeline de exports via biblioteca `xlsx`, substituindo dependências obsoletas e formatando dados complexos que quebravam em loop em Object arrays (`InvoiceCard.tsx` + `Dashboard.tsx`).
- ✅ **Sanitização Financeira:** Tratamento de verificações `NaN` severas nas pipelines de Billing via `useBilling.ts` ao renderizar o Pending MRR.

### ⚙️ Integração Storage (Configurações)

- ✅ **Cloudflare S3 Wrapper Integrado:** Implementação do client de Storage focado no R2 da Cloudflare com suporte direto as variáveis de ambiente base (`VITE_R2_ACCESS_KEY_ID`, `VITE_R2_SECRET_ACCESS_KEY`), mitigando erros no wrapper `useCloudflareStorage.ts`.
- ✅ **Correções de Scope/Context:** Refatoração de hierarquia de Providers (`useTenant`) da tela de configurações para não colapsar com layouts limitados globalmente e reescrita de toasts da UI.

### 🛡️ Auditoria, Perfomance & Anti-XSS (Audit Framework)

- ✅ **Performance de Render Loop (React Purity):** Identificação e correção cirúrgica de um _deadlock_ render vs state loop na engine do `AuditReportForm/ReportBuilder`. As chamadas síncronas de gravação local foram refatoradas e movidas de dentro de setters funcionais de React para um modelo Observer / `useEffect` focado exclusivamente em gerenciar auto-save através do LocalStorage sem vazar _side-effects_ para a Virtual DOM.
- ✅ **Limites de Segurança do Frontend (XSS Control):** Introdução de sanitização hard/soft em painéis expostos via input HTML. Atuação forte nos hiperlinks e "Links de Evidências" da matriz 5W2H implementando Regex Filters contra tentativas nativas de XSS via protocolos arbitrários (`javascript:`, `vbscript:`, `data:`). Correção aplicada rigorosamente a tela `ReportFindingCard.tsx` e injetada no Blur Lifecycle.

### 🎨 Refatoração UI/UX e Estrutural (Layout & Preview)

- ✅ **Nova Modal de Report Preview:** Reconstrução visual completa do `ReportPreviewModal` sob o ecosistema _Shadcn_, implementando estética macOS-like, badges dinâmicas de status/risco e layout limpo.
- ✅ **Reestruturação Global de Navegação (Sidebar):** Transição do Avatar de usuário e workspace para o Header da aplicação e ancoragem do `ThemeToggle` junto aos controles nativos do footer da sidebar.
- ✅ **Sanitização de Interface Inativa:** Limpeza da `TenantSettings`, camuflando componentes dependentes de APIs ainda não prontas (AI Config, Notificações) sob a label inativa e segura "Em breve".

### 🔒 Segurança, Hardening & DX

- ✅ **Supressão de Vazamento de Código (Vercel):** Eliminação de _Source Maps_ expostos na build de produção e mitigação pesada de _Hardcoded URLs_ que apareciam explodidas nos bundles.
- ✅ **Padronização e Linting (DX):** Bootstrapping de `.eslintrc.cjs` para a workspace `/apps/web` com enforcing de regras ECMAScript para erradicação de débitos técnicos.
- ✅ **Virtual Scrolling:** Integração mandatória de `@tanstack/react-virtual` no componente de Report Finding Card, executando offload e ganhos altíssimos de framerate ao popular relatórios volumosos.

---

## 🚀 v1.2.1 — Security & Infra Fixes (Abril 2026)

### 🎨 UI/UX & Autenticação (Onboarding & Auth)

- ✅ **Refatoração Auth:** Novo layout split-screen para LoginPage e RegisterPage (Desktop/Mobile), garantindo consistência visual Enterprise e remoção de bugs envolvendo dimensões e scrolls da tela.
- ✅ **Integração GitHub Explicita:** Substituição do emoji antigo pelo ícone oficial do GitHub no Onboarding Wizard, permitindo OAuth com Supabase e conexão imediata da etapa "Integrações".
- ✅ **Convites de Equipe (Onboarding):** Funcionalidade completa para engatilhar `send-invite` (Edge Function) direto via tela de Setup.
- ✅ **Compliance & Sec:** Teste em profundidade via puppeteer e devtools certificando que o fluxo não permite loop, travamento nem vazamento de dados críticos via DOM/Console (Padrão OWASP testado via subagents).

### 🛡️ Segurança e Auditoria

- ✅ **Histórico Git Limpo:** Remoção de tokens Vercel e chaves de Deploy _hardcoded_ (`mcp-github` operations) em branches remotos para prevenir sec-leaks.
- ✅ **Rate Limit Nativo & Bypass Seguro (RPC):** Implementação de limitador de requisições nativo no PostgreSQL via _Sliding Window_ (`rpc_rate_limits`) e encapsulamento de validação de convites públicos via `check_invite_token` (SECURITY DEFINER), contornando limitações do RLS atestando segurança anti-bruteforce no banco `leadgers-beta`.
- ✅ **Vercel Deployments Eliminados:** Antigos deployments que expunham as envs vulneráveis e maps também foram deletados da infra da Vercel.
- ✅ **Auditoria UX/SEO Resolvida:** Resolução de falsos-positivos na varredura de `seo_checker.py` e customização para tolerância em arquivos `.config.tsx`.

### ⚡ Vercel Cloud Native

- ✅ **Analytics & Telemetria:** Instalação e integração profunda de `@vercel/analytics` e `@vercel/speed-insights` no entry point do projeto Vite (`main.tsx`).
- ✅ **Background CRON:** Configuração de agendadores automáticos via `vercel.json` na rota `/api/health` para evitar cold starts excessivos do backend Serverless.

---

## 🚀 v1.2.0 — Sprint 3 Completa (Abril 2026)

### 📈 Core & Módulos

- ✅ **Sales & MRR:** Novos models do Prisma (`Sales`, `MRR`) e frontend para pipeline de vendas e painel de assinaturas
- ✅ **Roadmap Estratégico:** Novo model `Roadmap` para tracking estratégico de features
- ✅ **Stripe (Fase de Planejamento):** Definição arquitetural para Stripe Hosted Checkout com modelo híbrido (Flat Fee + Per-Seat)

### 🛠️ Correções e Git Hygiene

- ✅ Resolução definitiva de erros de _Hoisting_ no Vitest v4 em `cap-table.test.ts` e `milestones.test.ts` (`vi.hoisted()`)
- ✅ Mock retificado para tabelas como `headcount_plans` no _PrismaClient_
- ✅ Compatibilidade multi-plataforma no comando **ESLint** (Windows `cmd.exe`)
- ✅ Todos os 95 testes (API + Core) operacionais em CI/CD

### 📚 Documentação e Infraestrutura

- ✅ Atualização da base documental (PRD 1.2.0 e novos ADRs: 005-010)
- ✅ Confirmação oficial da stack frontend+backend com React+Vite e Hono rodando no Vercel Edge
- ✅ Adoção integrada do framework de autenticação nativa do Supabase (GoTrue) no lugar de custom JWT

---

## 🚀 v1.1.0 — Fase 1 Completa (Março 2026)

### ⚡ Backend API (Novo)

- ✅ **Hono API** (`apps/api/`) — Backend leve com Node.js e Hono framework
- ✅ **Prisma ORM** — Schema multiSchema (public + auth) com 16 models
- ✅ **Inngest** — Background jobs (Health Score, Weekly Digest, Queue)
- ✅ **Railway** — Deploy do backend em produção (`railway.toml`)
- ✅ **Middlewares** — `authMiddleware` + `tenancyMiddleware` para isolamento multi-tenant

### 📦 Pacote `@leadgers/ai` (Novo)

- ✅ Abstração de LLMs (Google Gemini 2.0 / OpenAI via adaptadores)
- ✅ Interface `IAIService` para injeção de dependência
- ✅ Weekly Digest gerado por IA

### 📊 Dashboard Executivo (Novo Módulo)

- ✅ `ExecutiveDashboard.tsx` — Visão holística do negócio
- ✅ `HealthScoreDashboard.tsx` — Score de resiliência 0-100 (5 dimensões ponderadas)
- ✅ `OkrsPage.tsx` — Objectives & Key Results com progress tracking
- ✅ `MilestonesPage.tsx` — Rastreamento de marcos estratégicos
- ✅ `NorthStarMetric.tsx` — Métrica norte-estrela configurável
- ✅ `BusinessModelCanvas.tsx` — Canvas de modelo de negócio (9 quadrantes)
- ✅ 8 hooks especializados (useHealthScore, useOkrs, useMilestones, useNorthStar, useBMC, useWeeklyDigest, useExecutiveDashboard, useProjectRiskScores)

### 💰 Finance (Expandido)

- ✅ `BurnRate.tsx` — Análise de taxa de queima de caixa
- ✅ `RunwayCalculator.tsx` — Calculadora de runway com projeções
- ✅ `CapTable.tsx` — Tabela de capitalização (Rounds + Shareholders)
- ✅ `FinancialProjections.tsx` — Projeções financeiras
- ✅ `HeadcountPlanning.tsx` — Planejamento de quadro de pessoal
- ✅ `UnitEconomics.tsx` — Métricas unitárias (CAC, LTV, etc.)
- ✅ API Routes: `burn-rate.ts`, `runway.ts`, `cap-table.ts`, `unit-economics.ts`
- ✅ Testes: `burn-rate.test.ts`, `runway.test.ts`, `cap-table.test.ts`, `unit-economics.test.ts`

### 🔗 GitHub Integration (Novo Módulo)

- ✅ Módulo `github/` no frontend
- ✅ 8 tabelas Supabase (installations, organizations, repositories, pull_requests, issues, security_alerts, governance_events, governance_snapshots)

### 📈 Sales Pipeline (Novo Módulo)

- ✅ Módulo `sales/` no frontend
- ✅ API Route: `deals.ts`
- ✅ Tabelas: `sales_opportunities`, `mrr_snapshots`

### 👥 People (Novo Módulo)

- ✅ API Route: `headcount.ts`
- ✅ Tabela: `headcount_plans`

### 🏗️ Infraestrutura

- ✅ Rebrand: `Audit-Tool` → `Leadgers-Platform`
- ✅ Supabase projects renomeados: `leadgers-beta` / `leadgers-prod`
- ✅ 43 tabelas no Supabase (todas com RLS habilitado)
- ✅ Módulos registrados via `registry.ts`: audit, finance, compliance, admin, github

### 🔐 Segurança & Multi-Tenant

- ✅ Autenticação JWT + Supabase GoTrue
- ✅ RLS em 100% das tabelas
- ✅ Header `x-tenant-id` obrigatório em todas as rotas
- ✅ RBAC: Owner, Admin, Manager, Auditor, Viewer

---

## 🎉 v1.0.0 — Setup Inicial (Fevereiro 2026)

### ✅ Mudanças Implementadas

### 1. Stack 100% Gratuita

#### ❌ REMOVIDO (Custos/Complexidade)

- ~~Turborepo~~ (substituído por npm workspaces)
- ~~Sentry pago~~ (mantido opcional no free tier: 5k eventos/mês)

#### ✅ MANTIDO (Free Tier)

- **Supabase Free:** 500MB DB, 1GB storage, 2GB bandwidth/mês
- **Vercel Free:** Projetos ilimitados
- **GitHub Actions Free:** 2000 minutos/mês
- **npm workspaces:** Monorepo nativo, sem custo adicional

### 2. Gerenciador de Pacotes

**Antes:** pnpm  
**Depois:** npm (nativo do Node.js, sem instalação extra)

**Comandos atualizados:**

```bash
# Antes
pnpm install
pnpm dev
pnpm test

# Depois
npm install
npm run dev
npm test
```

### 3. Fluxo de Branches

**Novo fluxo implementado:**

```
<nickname> (local/remota) → develop → beta → main
                                        ↑
                                     hotfix
```

**Detalhamento:**

1. **<nickname>:** Branch pessoal para desenvolvimento
   - Local: `git checkout -b joao`
   - Remota: `git push origin joao`

2. **develop:** Integração e testes automáticos (CI)
   - PR: `joao → develop`
   - GitHub Actions roda: lint, typecheck, tests, build

3. **beta:** Homologação e testes manuais
   - PR: `develop → beta`
   - Deploy automático: `https://beta-audit-tool.vercel.app`
   - QA realiza testes manuais

4. **hotfix:** Correções urgentes em beta
   - PR: `hotfix/bug-123 → beta`
   - Após merge, deletar branch hotfix

5. **main:** Produção
   - PR: `beta → main`
   - Deploy automático: `https://app.leadgers.com`
   - Aprovação obrigatória do Tech Lead
   - Tag de release criada automaticamente

### 4. Repositório

**URL oficial:** https://github.com/Cogitari-Tech/Audit-Tool

Todos os comandos git foram atualizados para apontar para este repositório.

---

## 📦 Novos Arquivos Criados

### 1. `package.json` (root)

Configuração do monorepo com npm workspaces:

```json
{
  "name": "cogitari-platform",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev --workspace=apps/web",
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present"
  }
}
```

### 2. `.env.example`

Template de variáveis de ambiente com:

- Configurações do Supabase Free Tier
- Limites e URLs documentados
- Google Drive API (opcional)
- Feature flags

### 3. `github-actions-free.md`

Documentação completa do CI/CD:

- Workflows para ci, deploy-beta, deploy-prod
- Uso de 2000 minutos/mês (GitHub Actions Free)
- Secrets necessários (Vercel, Supabase)
- Estimativa de consumo: ~190 min/mês (bem abaixo do limite)

---

## 📖 Arquivos Atualizados

### 1. `README.md`

- ✅ Stack gratuita documentada
- ✅ npm ao invés de pnpm
- ✅ Novo fluxo de branches completo
- ✅ Comandos git atualizados
- ✅ Limites do Free Tier documentados
- ✅ URLs corretas (GitHub, Vercel)
- ✅ Equipe atualizada (emails corretos)

### 2. `migration-guide.md`

- ✅ Setup com npm workspaces
- ✅ Comandos npm em todos os exemplos
- ✅ Fluxo de trabalho integrado com branches
- ✅ Checklist atualizado com PRs

### 3. `architecture-decision-record.md`

- ✅ Stack gratuita justificada
- ✅ npm workspaces ao invés de Turborepo
- ✅ Limites do Free Tier documentados

### 4. `project-structure.md`

- ✅ Estrutura com npm workspaces
- ✅ Repositório correto
- ✅ Comentários sobre limites do Supabase

---

## 💰 Análise de Custos

### Custos Mensais: R$ 0,00

| Serviço        | Tier    | Custo     | Limites                              |
| -------------- | ------- | --------- | ------------------------------------ |
| Supabase       | Free    | R$ 0      | 500MB DB, 1GB storage, 2GB bandwidth |
| Vercel         | Free    | R$ 0      | Projetos ilimitados, 100GB bandwidth |
| GitHub Actions | Free    | R$ 0      | 2000 min/mês (suficiente)            |
| npm            | Free    | R$ 0      | Ilimitado                            |
| Domínio        | Próprio | R$ 40/ano | leadgers.com.br                      |

**Total MVP:** R$ 0/mês + R$ 40/ano (domínio)

### Quando Escalar (Pago)

**Supabase Pro** (US$ 25/mês):

- 8GB Database
- 100GB Storage
- 250GB Bandwidth
- Backups diários

**Trigger:** Quando ultrapassar 500MB de dados ou 50k usuários ativos.

---

## 🚀 Quick Start (5 minutos)

```bash
# 1. Clonar
git clone https://github.com/Cogitari-Tech/Audit-Tool.git
cd Audit-Tool

# 2. Instalar
npm install

# 3. Configurar .env
cp .env.example .env
# Editar com suas credenciais Supabase

# 4. Supabase local
npx supabase start

# 5. Rodar
npm run dev

# 6. Criar sua branch
git checkout -b <seu-nickname>
```

---

## 📊 Comparação: Antes vs Depois

### Antes (Primeira Versão)

- ❌ pnpm (precisa instalar)
- ❌ Turborepo (complexidade extra)
- ❌ Sentry pago
- ❌ Fluxo de branches genérico
- ❌ Repositório genérico

### Depois (Atualizado)

- ✅ npm (nativo)
- ✅ npm workspaces (simples)
- ✅ Sentry opcional (free tier)
- ✅ Fluxo de branches específico e documentado
- ✅ Repositório real: Cogitari-Tech/Audit-Tool

---

## 🎯 Próximos Passos

### Semana 1: Setup

```bash
# 1. Criar repositório local
npm init -y
# Editar package.json com workspaces

# 2. Configurar Supabase
npx supabase init
npx supabase login

# 3. Criar branch pessoal
git checkout -b <seu-nickname>

# 4. Primeiro commit
git add .
git commit -m "chore: setup inicial"
git push origin <seu-nickname>
```

### Semana 2-3: Migração Auditoria

- Refatorar código legado
- Criar entidades de domínio
- Implementar casos de uso
- Escrever testes
- Abrir PR para develop

### Semana 4-5: Módulo Financeiro

- Implementar controle de caixa
- Criar componentes UI
- Testes E2E
- PR para develop

### Semana 6+: Compliance, SWOT, etc.

---

## 🆘 Troubleshooting

### npm install falhou

```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Supabase não conecta

```bash
# Verificar status
npx supabase status

# Reiniciar
npx supabase stop
npx supabase start
```

### GitHub Actions não rodou

1. Verificar se workflow está em `.github/workflows/`
2. Verificar se secrets estão configurados
3. Ver logs em: `https://github.com/Cogitari-Tech/Audit-Tool/actions`

---

## 📚 Documentação Completa

Todos os arquivos foram atualizados para refletir:

- ✅ MVP 100% gratuito
- ✅ npm ao invés de pnpm
- ✅ Fluxo de branches específico
- ✅ Repositório correto

**Arquivos principais:**

1. `README.md` - Índice e quick start
2. `architecture-decision-record.md` - Decisões técnicas
3. `project-structure.md` - Organização do código
4. `migration-guide.md` - Passo a passo
5. `github-actions-free.md` - CI/CD gratuito
6. `package.json` - Configuração npm workspaces
7. `.env.example` - Template de configuração

---

**Cogitari Tech** - MVP gratuito e profissional! 🚀

_Atualizado em: 16 de Fevereiro de 2026_
