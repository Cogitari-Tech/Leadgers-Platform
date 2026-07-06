# Diretrizes de Cobrança Multi-Empresa (Stripe)

Este documento descreve a política de billing e procedimentos a serem implementados via Stripe caso um usuário da plataforma tenha vínculos com mais de um Workspace/Empresa.

## 1. Visão Geral do Produto e Cobrança

Em softwares B2B SaaS, o modelo padrão de cobrança é **"Billing-by-Workspace"** em vez de "Billing-by-User-Global".
Isso significa que cada `Tenant` (Empresa/Workspace) possui sua própria Assinatura (_Stripe Subscription_). O usuário é apenas o _Seat_ da assinatura atrelada à empresa, não o dono inerente da subscription principal.

### Decisões do Time de Produto / Financeiro

- **O plano é por usuário global ou por usuário/empresa?**
  **Resposta Definida:** O plano deve ser cobrado na modelagem `Por Usuário / Por Empresa` (_Seat-based per Workspace_).
- **Se um usuário pertence a duas empresas, ele conta como 2 seats?**
  **Resposta Definida:** Sim. O e-mail `user@example.com` no Banco de Dados ocupa 1 "Seat" no Tenant A, e ocupa 1 "Seat" também no Tenant B, gerando cobranças distintas aos seus respectivos métodos de pagamento.
- **Há um plano multi-empresa?**
  **Resposta Definida:** Não no momento. Empresas gigantes que exigem conglomerados utilizarão "Empresas Matriz/Filial" com consolidação financeira manual através de `Customer` unificado sob demanda.

---

## 2. Modelagem do Cenário e Comportamentos

| Cenário                                         | Comportamento Esperado (Atualizado)                                                | Cobrança?                                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Usuário em 1 empresa solicita entrada na 2ª** | O Request de Join fica em estado `pending_approval` na tabela de convites.         | **Não** (Ainda não é membro ativo).                                                                         |
| **Aprovado na 2ª empresa (Manager aceita)**     | Um novo seat é adicionado à assinatura da Empresa 2 via webhook do convite aceito. | **Sim.** Acréscimo marginal (prorata) na fatura da Empresa 2 via _metered billing_ ou _quantity increment_. |
| **Usuário sai ou é removido da empresa**        | Acesso revogado imediatamente. Seat count reduzido -1 no fim da request.           | **Sim (Devolução em créditos).** O valor não usado será descontado na próxima fatura da empresa afetada.    |

---

## 3. Workflow API do Stripe (Implementação)

### 3.1 Adicionar um novo Membro

Sempre que o usuário for aprovado em `api/workspaces/members/approve`:

1. Recuperar o `stripe_subscription_item_id` atrelado ao plano da empresa em questão.
2. Aumentar a `quantity` no SubscriptionItem do Stripe via API do Backend.
3. Isso garante que a empresa que aceitou o usuário paga o prorata. O usuário não paga nada "do seu próprio bolso".

**Código Esperado no Backend:**

```typescript
await stripe.subscriptionItems.update(dbEntity.subscription_item_id, {
  quantity: currentQuantity + 1,
});
```

### 3.2 Webhook Responsável

Para eventuais disputas ou resync (por exemplo: um usuário foi deletado diretamente via Supabase Dashboard Dashboard sem disparar o backend), o endpoint do webhook a escutar será `customer.subscription.updated`.
Sempre comparar os limites no Payload da Stripe com os `active_members_count` locais no banco de dados.

## 4. O que falta?

Para finalizar o roadmap P2 de Pagamentos, as subscrições dependem da implementação do Módulo de Gerenciamento de Plano e Faturas no painel de administração da própria empresa em `BusinessSettings`.
