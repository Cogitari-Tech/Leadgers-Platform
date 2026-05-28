# Domain Model (Modelo de Domínio Funcional)

> O mapeamento conceitual das entidades de negócio contidas no PRD v1.2 do repositório de governança.

## 🏢 Core Entities

### 1. Workspace / Tenant

A raiz de todo dado. Representa a "Startup". Tudo abaixo pertence a ele.

- **Relações:** Tem Membros (Users), tem Contas, tem Transações, tem Roadmaps.

### 2. Membros e Permissões (Identity)

- **Roles:** `Owner`, `Admin`, `Manager`, `Auditor`, `Viewer`.
- Regras rígidas de RBAC aplicadas via API Middleware e propagadas pro RLS.

### 3. Entidades Financeiras

- **Account (Plano de Contas):** Sintéticas ou Analíticas (Ativo, Passivo, Receita, Despesa).
- **Transaction:** Entrada ou Saída com data, atrelada a Accounts.
- **BurnRate / Runway (Calculados):** Entidades na memória virtual ou armazenamentos analíticos gerados no job cron, baseados nas `Transactions`.

### 4. Entidades Equity (Investor Relations)

- **CapTable Snapshot:** O status das ações e valuations.
- **ESOP Grants:** Registro que um colaborador (beneficiário) recebeu $X$ opções de ação. Possui atributos `Grant Date`, `Cliff Date`, `Vesting Months`, e `Accelerators`.

### 5. Entidades Estratégicas

- **Objective (OKR):** A meta abstrata "pai". Ex: Dobrar MRR.
- **Key Result (KR):** Medida tangível com `target_value` e `current_value`.
- **Milestone:** Marco do roadmap da empresa, com cronograma.
- **SWOT Analysis:** Conjunto (Forças, Fraquezas, Oportunidades, Ameaças) associado a uma data de Snapshot.

### 6. Entidades de Tecnologia (Integração)

- **Roadmap Item (Issue/PR):** Espelhado do GitHub. Possui status `backlog|in_progress|review|completed`.

### 7. AI & Insights Entities

- **Weekly Digest:** O resumo persistido e lido asincronamente.
- **Predictive Alerts:** Notificações in-app contendo `risk_level` (Critical, Warning) criadas mecanicamente pelo Inngest.
