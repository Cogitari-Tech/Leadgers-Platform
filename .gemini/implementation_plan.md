# Goal Description

Este documento destrincha o comportamento interno da Leadgers em processos delicados de autenticação e escalabilidade multi-tenant, mapeando edge cases e gaps atuais na transição entre registros e sessões. Além disso, traz o guia arquitetural para faturamento inteligente (Cobrança) via Stripe baseado no escopo e no schema Supabase já implantado.

## 1. Análise do Fluxo de Cadastro e Seus Edge Cases

As _migrations_ de banco, atreladas a triggers (como as vistas na `robust_registration` e `multitenant_onboarding`), bem como o `SessionContext` e `TenantContext` governam a distribuição de inquilinos.

### 1.1 Novos usuários cadastrando empresa própria (`create` mode)

- **Como funciona:** Usuário se inscreve preenchendo _Company Name_. Entra na Supabase, a trigger intercepta `signup_mode='create'`, cria o registro do `tenant` e atrela o `user` como `owner`. Embala o `tenant_id` no campo `raw_app_meta_data`, consolidando esse id primário no JWT token gerado pela sessão.
- **Edge cases alert:** Se houver um gargalo no banco (Unique constraint de slug no banco maltratado, etc), a robustez implementada usa fallback `AFTER UPDATE` caso haja resync da auth table, mas ainda carece de uma visualização para o usuário (ex: uma tela de _Resume Onboarding_ forçada pelo frontend, na impossibilidade técnica do script do supabase não ter finalizado).

### 1.2 Novos usuários ativados via link de convite (`invite_link` mode)

- **Como funciona:** Os Links (`invite_links`) utilizam _tokens_ em `sha256` para checagem rápida no backend. O novo usuário que aceita o Link via `AcceptInvitePage`, faz _Signup_, e a mesma Trigger intercepta injetando-o ativamente como membro através de `tenant_members` utilizando a Role do link limitando seus níveis. O JWT do usuário atualiza o atributo global apontando que sua casa inicial é a deste _Tenant_.
- **Edge cases alert:** Se o limite máximo do Link for atingido (ou este for apagado pelo owner) durantes os 45 segundos nos quais o usuário está digitando sua senha, a Trigger pifará de maneira invisível. O usuário ingressará no Auth sem vinculação na empresa. O Dashboard _precisa_ redirecionar usuários logados mas sem _Tenant_ para a página "Procurar Empresa" (Página "Join"), evitando do usuário cair numa página branca de Erro 404.

### 1.3 Novos usuários a partir de busca e "Join" manual (`join` mode)

- **Como funciona:** Encontram a empresa pública (buscam no backend os `tenants` não privados que vazam RLS com `is_private = false`). Fazem a conta e logo pedem na fila pela inserção de `access_requests` como _pending_.
- **Edge cases alert:** Usuários aguardando no Limbo (status _pending_). Se eles entrarem no portal amanhã, o backend tem que proibir ações mas mostrar pacificamente uma sala de espera ("Aguardando o Owner da Empresa X aprovar seu ingresso").

### 1.4 Usuários conectados em Múltiplas Empresas (Multi-Tenant Switch)

- **Como funciona (Hoje):** O banco de dados Suporte `tenant_members` como N:N de forma fantástica, mas **O front-end (`TenantContext.tsx`) assume o primeiro `limit(1)` vindo atrelado de metadado como o principal e imutável**.
- **Edge cases alert:** A ausência de um "Tenant Switcher". No presente momento um usuário atrelado à Empresa XYZ e Empresa ABC operará na ABC (se for seu JWT meta base), mas não trocará à XYZ (faltando UI de navegação/botão dropdown).
- **Proposta Arquitetural:** O Backend criará Edge Functions que interceptam um pedido de switch (`POST /auth/switch-tenant`), validarão se o usuário tem `status='active'` na empresa requistada via RLS e atualizarão via AdminSDK seu `raw_app_meta_data -> tenant_id`. Em cascata, o frontend roda um token-refresh silencioso.

---

## 2. Integração com Stripe e o Modelo de Cobrança

Encontram-se no schema já as colunas chaves da entidade `tenants`:
`plan`, `plan_status`, `plan_expires_at`, e `stripe_customer_id`. As páginas do Front referenciam links estáticos provisórios, mas não há um serviço operante de transações financeiras.

### A Filosofia de Cobrança Exigida para este Projeto

1. **Cobrador:** Será a "Leadgers" faturando do Banco ou Startup subalterna.
2. **Entidade Cobrada:** Sempre o `tenant_id` e não o `user_id`. (Stripe Customer atado ao ID do `tenants` - B2B Business).

### Proposta Técnica de Assinaturas (Subscriptions Stripe)

#### Fase A: Checkout Engine Backend (API)

Implementação de módulo financeiro em `apps/api/src/routes/billing`.

1. Endpoint: `POST /billing/checkout-session`.
   - Lê JWT `tenant_id` atrelado no Request.
   - Pede à API Stripe uma `Checkout Session`.
   - Recupera da tabela `tenants` o StripeCustomer associado. Se não existir, faz criá-lo passando e-mail base do Owner ou o CPNJ da tabela Tenants e salva provisoriamente via Prisma.
   - Retorna URL do redirecionador Stripe para o cliente em Next.js.

#### Fase B: Receber Webhooks com Segurança (Edge ou API)

Endpoint local Webhook: `POST /billing/webhook`.

- Monitora 3 eventos primordiais do Stripe de forma idempotencial:
  - `checkout.session.completed`: Grava que a sessão obteve sucesso, assina as datas de expiração (`plan_expires_at`) na base de inquilinos.
  - `customer.subscription.updated` / `.deleted`: Controla o downgrade, cancelamentos e pagamentos atrasados modificando imediatamente as tags do `plan_status` no banco.
  - `invoice.payment_failed` para jogar `plan_status = 'past_due'`.

#### Fase C: Gaps Visuais e Operacionais (Frontend)

- **Paywall / Gatekeeper:** Empregar restrições no acesso se o `tenant.plan_status = past_due` em toda hierarquia (Bloquear RLS para write mode apenas limitando a views e cobrando pagamento perante os administradores).
- **Billing Portal Portal Session:** Uso de API da Stripe focada no `createBillingPortalSession` – criando uma página Self-Service dentro do App da Leadgers para clientes puxarem Notas Fiscais e trocarem Cartões de Crédito sozinhos.

## User Review Required

> [!WARNING]
> Precisamos validar a decisão do **Tenant Switcher**, se deseja que implementemos agora a infraestrutura onde o `TenantContext` terá suporte a Dropdown de múltiplas contas do usuário e implementaremos a Edge Function para trocar tokens.
> Adicionalmente, sobre a integração com a **Stripe**: o backend da Stripe será rodado nos servers da nossa aplicação Express Node.js (`apps/api`) ou em Supabase Edge Functions separadas para alta disponibilidade do webhook? Recomenda-se via nossa própria infra "apps/api" uma vez que todas instâncias estarão conteinerizadas.

## Verification Plan

1. Analisar se Edge Cases descritos alinham-se ao escopo exigido de negócios.
2. Obter input oficial se Stripe transitará de imediato no Backend/API.
3. Re-geração de código de Switcher de Multi-Accounts.
