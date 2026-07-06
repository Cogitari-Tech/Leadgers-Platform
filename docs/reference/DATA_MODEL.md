# Esquema do Banco de Dados (DATA MODEL)

> A fonte da verdade das regras DDL da aplicação multi-tenant via Supabase/PostgreSQL.

## Abordagem de Tenancy e DDL

Toda tabela vinculada aos clientes precisa ser acompanhada do RLS (Row Level Security) garantindo o isolamento da Startup:
`USING (tenant_id = (select auth.jwt() ->> 'user_metadata' -> 'tenant_id'))`

_(Nota: Na Fase 1 o campo `tenant_id` atua como chave isoladora ou em alguns escopos fechados a chave é `created_by` quando as tasks são User-bound)_

## Tabelas Centrais (Esboço Phase 1)

### `audits` e `findings` (Módulo Auditoria)

- **audits:** `id`, `doc_id`, `client_name`, `start_date`, `end_date`, `created_by`. (Check de exclusividade às Segundas).
- **findings:** `audit_id` (FK), `title`, `risk_level` (Crítico, Alto, Médio, Baixo), `status`.

### `accounts` e `transactions` (Módulo Financeiro)

- **accounts:** `id`, `code` (unique: 1.1.01), `name`, `type` (Ativo/Passivo/Receita/Despesa), `parent_id` (suporte a árvore), `is_analytical`.
- **transactions:** `id`, `date`, `amount`, `account_debit` (FK), `account_credit` (FK). O amount nunca pode ser <= 0 (`CHECK amount > 0`).

### `swot_analyses` (Módulo Estratégico)

- `id`, `company_name`, `analysis_date`, arrays textuais: `strengths[]`, `weaknesses[]`, `opportunities[]`, `threats[]`.

### Modelos Planejados (PRD v1.2 para Implementação)

- `esop_pool`, `stock_options_grants`
- `okrs`, `key_results`
- `alerts`, `weekly_digests`
- `investor_updates`

### 🛡️ Autenticação e Segurança (Security DDL)

- **invitations** e **invite_links:** Regras estritas de RLS impedem acessos deslogados (Não contornáveis com `.select()`). O resgate seguro é feito por `SECURITY DEFINER RPC` isolada para proteção do Hash.
- **rpc_rate_limits:** `ip_address`, `endpoint`, `request_count`, `window_start`. (Responsável por controlar o Rate Limiting ativo dentro do DB via _Sliding Windows_ barrando requisições abusivas em endpoints nativos baseados em headers `x-forwarded-for`).

As migrations reais residem em `supabase/migrations/`. Qualquer manipulação de Modelos DDL deve invariavelmente gerar um script correspondente neste caminho, respeitando as referidas constraints de Check.
