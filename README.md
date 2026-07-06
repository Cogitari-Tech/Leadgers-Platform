# 🏗️ Cogitari Platform - Documentação Completa de Arquitetura

**Sistema de Auditoria, Compliance e Gestão Financeira**  
**Cogitari Tech** (CNPJ: 64.460.886/0001-39)
**Versão Atual:** 1.2.2-stable

---

## 📚 Índice de Documentação

Este repositório contém toda a especificação técnica para evolução da plataforma Leadgers de um SPA monolítico para uma arquitetura modular empresarial.

### 📖 Documentos Principais

| Documento                              | Descrição                                                        | Arquivo                                   |
| -------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------- |
| **ADR (Architecture Decision Record)** | Decisões arquiteturais finais, stack aprovada, MCPs necessários  | `docs/00_architecture-decision-record.md` |
| **Estrutura do Projeto**               | Organização completa de pastas, módulos e pacotes                | `docs/01_project-structure.md`            |
| **System Architecture**                | Documentação profunda de Engenharia e Regras de Negócio (Fase 1) | `docs/02_system-architecture.md`          |
| **Workflow de Desenvolvimento**        | CI/CD, Testes e Segurança (Pre-commit)                           | `docs/03_development-workflow.md`         |
| **Guia de Migração**                   | Passo a passo para migrar do sistema legado                      | `docs/04_migration-guide.md`              |
| **Developer Experience (DX)**          | Usuários de teste, bypasses e shortcuts de Vibe Coding           | `docs/05_developer-experience.md`         |

---

## 🎯 Stack Tecnológica (100% Gratuita para MVP)

### Frontend

- React 18 + TypeScript
- Vite 5 (build tool)
- TailwindCSS v4 + **shadcn/ui** (Uso obrigatório: não crie componentes do zero se houver um bloco no Shadcn)
- Zustand (estado local)
- React Query (server state)
- React Router v6 (roteamento)
- Recharts (gráficos)

### Backend (Free Tier)

- Hono.js rodando em Edge Functions (Supabase)
- Validações Zod estritas
- Supabase Free Tier (Auth, PostgreSQL, RLS, Storage)
- Inngest para Background Jobs (Investimentos, Relatórios)

### DevOps (Free)

- npm workspaces (monorepo root)
- Vitest para Hono API (E2E Obrigatório)
- Playwright (E2E Frontend)
- Deploy automático na **Vercel**

---

## 🔌 Integração de Agentes IA e MCPs (Model Context Protocol)

**🚨 ATENÇÃO - Estratégia de Configuração (DX Otimizado):**
Para garantir a melhor experiência de desenvolvimento e evitar conflitos de portas ou instâncias zumbis, centralizamos nossa configuração de MCPs:

1. **Configuração Única e Global (Recomendado):**
   - **Local:** Arquivo de extensão da IDE (ex: `C:\Users\morek\AppData\Roaming\Antigravity\User\mcp.json`).
   - **Finalidade:** Manter todos os servidores em uma única camada global, com variáveis injetadas via `env`, rodando através de binários globais `.cmd` em substituição ao `npx` (ex. para `filesystem`, `github`, `supabase`).
   - **MCPs Utilizados:** `github`, `context7`, `memory`, `sequential-thinking`, `vercel`, `filesystem`, `supabase`, `shadcn` e `stitch`.
   - **Deprecated:** A abordagem de múltiplos arquivos `.antigravity/mcp.json` na raiz dos projetos está **descontinuada** por gerar conflitos de escopo. O MCP `brasil` também foi removido do stack Leadgers por ociosidade do MVP atual.

### 📝 Regras de "Vibe Coding" para Agentes

- **Regra 1 (UI/UX):** Nunca escreva um componente base (`Button`, `Dialog`, `Input`, `Form`) do zero. DEVE rodar `npx shadcn-ui@latest add [component]` com a estilização atual do projeto (`@/shared/components`).
- **Regra 2 (Testes E2E):** Todo endpoint Hono criado em `apps/api/src/routes` DEVE ter um correspondente `*.test.ts` usando a framework testing nativa do Hono/Vitest. Ex: `npm run test --workspace=api`.
- **Regra 3 (Variáveis de Ambiente):** Use a CLI da vercel `npx vercel env pull` para debugar configurações ou baixar novas envs para `.env` local.
- **Regra 4 (Documentações Opcionais):** Sinta-se livre para ler e modificar os `.md` dentro de `/docs` periodicamente em caso de refatoração para garantir clareza à arquitetura. Devs humanos e IAs devem consultar o guia detalhado em `/docs/06_mcp_onboarding_guide.md` para gerenciamento de MCPs e troubleshooting.

---

## 🚀 Quick Start (5 minutos)

```bash
# 1. Clonar repositório
git clone https://github.com/Cogitari-Tech/Leadgers-Platform.git
cd Leadgers-Platform

# 2. Instalar dependências e baixar Envs
npm install
npx vercel env pull .env

# 3. Rodar desenvolvimento e Testes
npm run test:integration
npm run dev:all
```

---

## 🗺️ Roadmap & Progresso

### ✅ Q1 2026 (Fundação e Fase 1)

- [x] Monorepo npm workspaces, Supabase, Hono Edge API
- [x] Autenticação Multi-Tenant, Sistema de Permissões (RBAC) e Billing HUB (#189)
- [x] Estrutura Inicial do Módulo Financeiro, Compliance, Auditoria e Configuração de Vercel Infrastructure
- [x] Setup do Toolchain de IA (Shadcn configurado, utilitário `cn`, Vitest passando a 100% E2E)

### 🔄 Q2 2026 (Expansão Fase 2)

- [x] Criação Rota Base `/api/investor` (Issue #188 via Hono, Migration CTE)
- [x] Refatoração de UI/UX (Split-screen Enterprise) para Fluxos de Autenticação e Onboarding
- [x] Padronização pesada de UI (Report Builder e Modal) via Shadcn + Virtual Scrolling e offload JS
- [x] Integração de ESLint e Segurança de Runtime (remoção de source_maps e vazamento de `.env`)
- [ ] Concluir o Data Room e Investor Updates via Inteligência Artificial (Inngest + AnthropicAdapter)
- [ ] Módulo completo de Folha de Pagamento e Integração Bancária

---

**Cogitari Tech** - Construindo o futuro da auditoria e gestão empresarial. 🚀
_Última atualização: 18 de Abril de 2026_
