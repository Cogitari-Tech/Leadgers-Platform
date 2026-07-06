# CLAUDE.md — Leadgers Governance Platform

> Instruções de memória persistente para o agente Claude Code. Este arquivo é a fonte da verdade sobre como operar neste projeto.

Veja @README.md para visão geral e @package.json para comandos npm disponíveis.

---

## Identidade do Projeto

- **Produto**: Leadgers Governance — Plataforma SaaS de auditoria, compliance e gestão financeira para startups e empresas de capital fechado.
- **Empresa desenvolvedora**: Cogitari Tech (CNPJ 64.460.886/0001-39).
- **Marca do produto**: **Leadgers** (NÃO "Cogitari" — Cogitari é a empresa, Leadgers é o SaaS).
- **Stack Principal**: TypeScript, React 18, Vite 5, Tailwind CSS 3, Supabase (Auth + DB + Edge Functions), Zustand, Framer Motion.
- **Node**: >=20.0.0 | **npm**: >=10.0.0.

---

## Arquitetura

Este projeto segue **Clean Architecture (Hexagonal/Ports & Adapters)** com princípios de **Domain-Driven Design**.

### Monorepo (npm workspaces)

```
leadgers-platform/
├── packages/core/         # Domínio puro (entidades, VOs, use cases, interfaces)
├── apps/web/              # SPA React (infraestrutura, UI, adapters Supabase)
├── supabase/              # Migrations, Edge Functions, config
├── prisma/                # Schema Prisma (sync com Supabase)
├── scripts/               # Utilitários e testes E2E
├── docs/                  # Documentação técnica (Ver docs/developer-experience.md)
└── tools/mcp/             # Infraestrutura estável para MCPs
```

### Camadas

1. **Domain Layer** (`packages/core/src/`): Entidades, Value Objects, Repository Interfaces (Ports), Use Cases, Domain Events, Domain Errors. **ZERO dependências externas.**
2. **Application Layer** (`apps/web/src/modules/*/hooks/`): Hooks customizados que funcionam como Controllers/Presenters. Orquestram Use Cases e Repositories.
3. **Infrastructure Layer** (`apps/web/src/modules/*/repositories/`): Adapters Supabase que implementam interfaces do core.
4. **Presentation Layer** (`apps/web/src/modules/*/pages/`, `*/components/`): React components. Consomem apenas hooks — NUNCA acessam Supabase diretamente.

### Regra de Dependência

```
Presentation → Application (hooks) → Domain (core)
                    ↓
            Infrastructure (adapters)
```

A camada de domínio (`packages/core`) NÃO pode importar nada de `apps/web` ou de bibliotecas de infraestrutura.

---

## Comandos Essenciais

```bash
npm run dev            # Inicia servidor de desenvolvimento (Vite)
npm run build          # Build de produção (tsc + vite build)
npm run typecheck      # Verificação de tipos (tsc --noEmit)
npm run lint           # ESLint
npm run format         # Prettier --write
npm run test           # Vitest
npm run security-check # Scan de segurança antes de commit
npm run mcp:setup      # Instalação estável de MCPs locais
```

Antes de qualquer commit, execute `npm run build` para garantir que o TypeScript compila sem erros.

---

## Padrões de Código Obrigatórios

Regras detalhadas disponíveis em `.claude/rules/`:

- @.claude/rules/clean-code.md — Estilo de código, naming, imports
- @.claude/rules/architecture.md — SOLID, Clean Arch, DDD
- @.claude/rules/security.md — Segurança, autenticação, secrets
- @.claude/rules/design-system.md — Cores, fontes, UI/UX, mobile-first
- @.claude/rules/testing.md — Testes, TDD, coverage
- @.claude/rules/git-workflow.md — Branches, commits, PRs

---

## Skills, Subagents e Frameworks Registrados

Instalados globalmente (`~/.claude/skills/`, `~/.claude/plugins/`) — aplicam-se a este projeto automaticamente, sem cópia local necessária.

**Uso obrigatório (regra principal para todas as atividades):**

| Skill | Quando usar |
| :--- | :--- |
| **Caveman** (`caveman:*`) | Modo de comunicação padrão da sessão — sempre ativo salvo "stop caveman". |
| **GSD — Get Shit Done** (`gsd-*`) | Todo trabalho spec-driven multi-sessão: planejar fase, executar fase, verificar, debug sistemático. Preferir `/gsd-quick` ou `/gsd-fast` para tarefas triviais, `/gsd-plan-phase` + `/gsd-execute-phase` para features. |
| **UI-UX-Pro-Max** (`ui-ux-pro-max:*`) | Qualquer trabalho de UI/UX neste projeto (componentes, páginas, design system) — usar antes de `impeccable` ou `huashu-design` quando o pedido for genérico. |

**Suporte (usar quando o contexto pedir):**

| Skill | Propósito |
| :--- | :--- |
| **ECC — Everything Claude Code** (`ecc:*`) | Reviewers por linguagem, build-fix, security-review, TDD, etc. |
| **Huashu Design** (`huashu-design`) | Protótipos HTML de alta fidelidade, demos interativos, exploração de variantes visuais. |
| **Impeccable** (`impeccable`) | Crítica/polish de UI existente, auditoria de acessibilidade e hierarquia visual. |
| **Awesome Design MD** (`awesome-design-md`) | Referência de design tokens reais de marcas (Apple, Linear, Airbnb...) — consultar ao pedir "estilo tipo X"; nunca sobrepõe `.claude/rules/design-system.md`. |

Validado em 2026-07-04: todos os 7 confirmados instalados e funcionais (global, escopo `user`) via `~/.claude/plugins/installed_plugins.json` e `~/.claude/skills/`.

---

## Estrutura de Módulos

Cada módulo em `apps/web/src/modules/` segue esta convenção:

```
module-name/
├── components/          # Componentes React do módulo
├── hooks/               # Hooks customizados (controllers)
├── pages/               # Páginas/views (um export default por arquivo)
├── repositories/        # Adapters de infraestrutura (Supabase)
├── types/               # Tipos e interfaces locais
├── utils/               # Utilitários do módulo
└── module.config.tsx    # Registro do módulo (rotas, nav, permissions)
```

Módulos se registram em `apps/web/src/modules/registry.ts` via `ModuleRegistry`. Lazy loading é obrigatório para todas as pages.

---

## Domínios Ativos

| Módulo          | Caminho                     | Responsabilidade                                         |
| :-------------- | :-------------------------- | :------------------------------------------------------- |
| `audit`         | `/dashboard/audit/*`        | Programas, Findings, Action Plans, Relatórios, Analytics |
| `finance`       | `/dashboard/finance/*`      | Transações, DRE, Balancete, Burn Rate, Cap Table         |
| `compliance`    | `/dashboard/compliance/*`   | Frameworks, Controles, Risk Matrix                       |
| `github`        | `/dashboard/github/*`       | Governança de repos, Issues/PRs, Security Alerts         |
| `admin`         | `/dashboard/admin/*`        | Tenant Settings, Team, Roles, Onboarding Wizard          |
| `projects`      | `/dashboard/projects/*`     | Gestão de projetos e ciclo de vida                       |
| `auth`          | `/login`, `/register`, etc. | Auth, SSO, MFA, Convites                                 |
| `sales`         | `/dashboard/sales/*`        | CRM Comercial & Marketing                                |
| `public`        | `/`, `/termos`, etc.        | Landing Page, Termos, Privacidade, Disclaimer            |
| `profile`       | `/dashboard/profile`        | Perfil de usuário                                        |
| `notifications` | -                           | Hook de notificações                                     |
| `dashboard`     | `/dashboard`                | Executive Dashboard                                      |

---

## Restrições Críticas

1. **NUNCA** importe Supabase diretamente em pages ou components. Use hooks.
2. **NUNCA** coloque lógica de negócio em components React. Use o domínio (`packages/core`).
3. **NUNCA** use `any` sem justificativa documentada no código.
4. **NUNCA** exponha secrets, API keys ou tokens em código client-side.
5. **NUNCA** commite arquivos `.env` — use `.env.example`.
6. **SEMPRE** execute `npm run build` antes de push para garantir zero erros TypeScript.
7. **SEMPRE** passe pelo pre-commit hook (husky + lint-staged + security-scan).
