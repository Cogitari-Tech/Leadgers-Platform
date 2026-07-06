# Tech Stack do Projeto (STACK.md)

> Mapeamento de todas as tecnologias pilares e ferramentas mantidas no repositório.

## Frontend (apps/web)

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling UI:** Tailwind CSS + [Shadcn-UI] para padronização atômica inadiável.
- **Gráficos:** Recharts (utilizado profundamente no Board Cashflow e Runway).
- **State/Hooks:** Custom Hooks modulares + Context API para Tenant tracking.

## Backend (apps/api)

- **Runtime / Framework:** Node.js + [Hono.js]
- **Validation (Type Safety):** Zod + OpenAPI via `@hono/zod-openapi`
- **Deploy Target:** Edge Functions na Vercel (garantindo boot rápido e baixa latência B2B).
- **Testes:** Vitest + Hono Testing Module.

## Background & Operações (packages/ & services)

- **Database:** Supabase (PostgreSQL 15+).
- **Job Orchestrator:** Inngest (Rodando webhooks serverless contatados pelas APIs, responsável por rotinas assíncronas como relatórios PDF e IA semanal).
- **AI/ML Layer:** Anthropic Claude Models (Haiku para batch/rápido, Sonnet para intermediário, Opus para raciocínio executivo e estratégico). Configurado sob `$ANTHROPIC_API_KEY`.
- **Ferramentas de Auditoria/Lint:** ESLint e Prettier configurados estritamente na workspace base para UI, em sintonia com ferramentas de Continuous Security (GitLeaks) para evitar commits de segredos.
