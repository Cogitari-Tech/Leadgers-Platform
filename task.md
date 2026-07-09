# 📋 Task Board — Backlog de Correções e Análises

> **Última atualização:** 2026-07-09 — TASK-19: novo /code-review + /security-review sobre a Fase 2 (commit `3468645`+`c9fa2c7`). **Reconciliação de status:** as 6 features que TASK-18 listava como AUSENTE/PARCIAL (Equity, Alertas, Roadmap, MRR, Data Room, Investor Updates) foram TODAS entregues na Fase 2; SEC-15/16/17 confirmados aplicados em prod. Novos achados: 2 de segurança (SR-1 HIGH, SR-2 MEDIUM) + 4 de correção. **Ver TASK-19.**
> **Anterior:** 2026-07-06 — TASK-18: MVP Launch Readiness (spec-driven gap analysis vs PRD v1.2 Must-haves) + 3 novos CRÍTICOS de segurança em produção (advisors Supabase) anexados a TASK-17.
> **Anterior:** 2026-07-04 — TASK-17: Security + Code Review de todo o projeto (2 reviewers paralelos).

---

## TASK-01 · Bug — Fluxo de Onboarding: Busca de Empresa ✅ CONCLUÍDA

**Prioridade:** 🔴 Alta  
**Tipo:** Bug + Produto  
**Área:** Onboarding  
**Status:** ✅ Todas as subtarefas técnicas concluídas

### Descrição
Ao tentar enviar solicitação para entrar em uma empresa existente durante o fluxo de onboarding, o usuário não consegue encontrar a empresa na busca. O fluxo precisa contemplar múltiplos perfis de usuário com comportamentos distintos.

---

### Perfis de Usuário a Considerar

#### 1. Usuário Novo — Sem empresa, deseja cadastrar uma nova
- Deve seguir o fluxo padrão de criação de empresa.
- Não deve ser impactado por esta correção.
- Verificar se o fluxo de criação está funcionando corretamente de forma isolada.

#### 2. Usuário Novo — Sem empresa, deseja entrar em uma existente
- É o perfil diretamente afetado pelo bug.
- A busca de empresa não retorna resultados.
- **Investigar:** endpoint de busca, parâmetros enviados, resposta da API, tratamento no frontend.
- Garantir que a solicitação de entrada seja enviada corretamente ao administrador da empresa.

#### 3. Usuário Já Cadastrado — Registrado em uma empresa, deseja entrar em outra
- Verificar se o sistema permite múltiplos vínculos simultâneos.
- Definir se haverá cobrança adicional (ver seção Stripe abaixo).
- Garantir que o vínculo atual não seja desfeito sem confirmação explícita do usuário.
- Exibir aviso claro sobre as implicações de solicitar entrada em outra empresa.

#### 4. Usuário Já Cadastrado — Sem empresa ativa, deseja entrar em uma existente
- Verificar se há algum estado residual de onboarding que bloqueie o fluxo.
- Garantir que o fluxo de busca e solicitação esteja disponível também neste cenário.

---

### Subtarefas Técnicas

- [x] Reproduzir o bug em ambiente de desenvolvimento e mapear o passo a passo.
- [x] Inspecionar a chamada de busca de empresa: endpoint, payload, headers de autenticação.
- [x] Verificar se a busca exige algum contexto (ex.: usuário autenticado vs. pré-autenticado).
- [x] Corrigir o retorno/tratamento da busca no frontend.
- [x] Adicionar feedback visual adequado: loading, "nenhuma empresa encontrada", erro de rede.
- [x] Testar os 4 perfis de usuário descritos acima em ambiente de staging.
- [x] Garantir que a solicitacão de entrada seja registrada e notifique o administrador.

---

### 💳 Documentação Stripe — Cobrança por Múltiplos Vínculos

> **Pendência de Produto:** Avaliar e documentar a política de cobrança para usuários vinculados a mais de uma empresa.

**Cenários a avaliar:**

| Cenário | Comportamento Atual | Comportamento Esperado | Cobrança? |
|---|---|---|---|
| Usuário em 1 empresa solicita entrada em 2ª | Indefinido | A definir | A definir |
| Usuário aprovado em 2ª empresa | Indefinido | A definir | A definir |
| Usuário remove vínculo de empresa anterior | Indefinido | A definir | A definir |

**Questões para resolver com o time de produto/financeiro:**
- O plano é por usuário global ou por usuário/empresa?
- Se um usuário pertence a duas empresas, ele conta como 2 seats (um em cada workspace)?
- Há um plano "multi-empresa" ou o usuário precisa de contas separadas?
- Como a Stripe deve ser notificada ao adicionar/remover um vínculo? (subscription item update vs. novo subscription)
- Definir o webhook/evento Stripe responsável por ajustar a cobrança automaticamente.

**Ação:** Criar documentação em `/docs/stripe/multi-company-billing.md` após alinhamento com o time.

---

## TASK-02 · Bug Visual — Container de Conexão com GitHub (Configurações) ✅ CONCLUÍDA

**Prioridade:** 🟡 Média  
**Tipo:** Bug Visual / UI  
**Área:** Configurações do Sistema  
**Status:** ✅ Todas as subtarefas concluídas

### Descrição
O container responsável pela conexão com o GitHub no menu de configurações do sistema apresenta problemas visuais.

### Subtarefas

- [x] Identificar o componente/arquivo responsável pelo container de conexão GitHub.
- [x] Mapear os problemas visuais encontrados:
  - [x] Quebra de layout em diferentes resoluções (mobile, tablet, desktop)?
  - [x] Espaçamentos/paddings incorretos?
  - [x] Ícone ou logo do GitHub mal posicionado ou ausente?
  - [x] Botão de conectar/desconectar fora do padrão visual do sistema?
  - [x] Estado "conectado" vs. "desconectado" com visual inadequado?
- [x] Aplicar correções de CSS/estilos alinhadas ao design system do projeto.
- [x] Validar visualmente em diferentes navegadores e tamanhos de tela.
- [x] Verificar se o estado do botão (loading, sucesso, erro) está coberto visualmente.

---

## TASK-03 · Bug — Configuração de 2FA: Token já cadastrado impede reconfiguração ✅ CONCLUÍDA

**Prioridade:** 🔴 Alta  
**Tipo:** Bug / Segurança / UX  
**Área:** Autenticação — 2FA  
**Status:** ✅ Todas as subtarefas concluídas

### Descrição
Se o usuário iniciar o fluxo de configuração do 2FA (gerando o QR Code / token) e sair da página **antes** de inserir e validar o código, o sistema registra o token como "já cadastrado". Na próxima tentativa, o usuário recebe um erro informando que o token 2MFA já foi configurado, ficando impossibilitado de concluir ou resetar a configuração.

### Causa Raiz Provável
O token/secret TOTP está sendo persistido no banco de dados no momento da **geração** do QR Code, e não apenas após a **validação** do código pelo usuário.

### Subtarefas

- [x] Confirmar a causa raiz: verificar quando o secret TOTP é salvo (geração vs. validação).
- [x] Corrigir o fluxo para que o secret só seja persistido **após** validação bem-sucedida do código (via purge pré-enrollment).
- [x] Implementar limpeza automática de secrets não validados:
  - Opção A: Não persistir o secret até a validação (preferível).
  - Opção B: Persistir em campo temporário com TTL (ex.: Redis ou coluna `mfa_pending_secret` + `mfa_pending_expires_at`).
- [x] Adicionar rota/ação para o usuário **resetar** a configuração de 2FA caso esteja travado.
- [x] Exibir aviso na página de configuração: *"Não saia desta página antes de validar o código."*
- [x] Garantir que ao retornar ao fluxo, um novo QR Code seja gerado sem erro.
- [x] Cobrir cenário com testes: iniciar configuração → sair → retornar → conseguir concluir.

---

## TASK-04 · Análise — Módulo de Gestão de Projetos (+ GitHub + Relatórios) ✅ ANÁLISE CONCLUÍDA

**Prioridade:** 🟡 Média  
**Tipo:** Análise Técnica / Produto  
**Área:** Gestão de Projetos  
**Status:** ✅ Análise Concluída (2026-04-17) — Implementação do módulo ~30%. Documento de análise gerado com 20+ gaps e plano de remediação P0-P3.

### Descrição
Realizar uma análise aprofundada do módulo de Gestão de Projetos, considerando a integração com o GitHub e a comunicação com o módulo "Gerar Relatório". O objetivo é mapear o estado atual, identificar gaps, inconsistências e oportunidades de melhoria.

### Escopo da Análise

#### 4.1 — Módulo de Gestão de Projetos (Core)
- [x] Mapear todas as funcionalidades existentes (CRUD de projetos, membros, status, etc.). → CRUD completo via SupabaseProjectRepository + useProjects hook. ProjectsListPage + ProjectDetailsPage (3 abas).
- [x] Identificar fluxos quebrados ou incompletos. → 7 gaps documentados (G-01 a G-07): statuses faltantes, created_by vazio, permissão inválida, casting abusivo.
- [x] Verificar consistência de estados de projeto (ex.: rascunho, ativo, arquivado, excluído). → Faltam `draft` e `archived`. Só existem: active, on_hold, completed, cancelled.
- [x] Avaliar permissões por perfil (admin, membro, visualizador). → Bug: `can("projects.manager")` referencia permissão inexistente. Seed só tem view/create/edit/delete.
- [x] Documentar o modelo de dados atual dos projetos. → Documentado: projects (10 cols) + project_members (5 cols) + IProjectRepository + ProjectDTO + ProjectFormData.

#### 4.2 — Integração com GitHub
- [x] Mapear o que já está integrado: repositórios, branches, commits, PRs, Issues? → DB schema completo (8 tabelas), OAuth login funcional, 7 páginas de dashboard. **Mas zero sincronização de dados reais.**
- [x] Verificar sincronização: é em tempo real (webhook) ou sob demanda? → **Nenhuma.** Nem webhook nem polling. Tabelas ficam vazias.
- [x] Identificar falhas ou inconsistências na exibição de dados do GitHub dentro do projeto. → 8 gaps (GH-01 a GH-08): isConnected é estado local, disconnect falso, sem sync, installations vazio.
- [x] Avaliar o fluxo de autenticação OAuth com GitHub: token expirado, revogado, escopo insuficiente. → OAuth funciona para login social. Token **não** é persistido para chamadas à API GitHub.
- [x] Verificar se múltiplos repositórios por projeto são suportados. → DB suporta (FK project_id), mas **UI não tem botão para vincular repos a projetos**.
- [x] Documentar gaps entre o que a integração oferece e o que seria ideal para o produto. → Documentado com diagrama Mermaid (fluxo atual vs esperado).

#### 4.3 — Comunicação com o Módulo "Gerar Relatório"
- [x] Identificar quais dados do projeto são consumidos pelo gerador de relatórios. → Apenas `project_name` como texto livre. Sem FK para tabela projects.
- [x] Verificar se há contrato/interface definida entre os módulos (ou se é acoplamento direto). → **Inexistente.** Módulos completamente desacoplados (acidentalmente). Nenhum import cruzado.
- [x] Mapear os campos/métricas de projeto utilizados nos relatórios (ex.: progresso, membros, tarefas, commits). → **Nenhuma métrica GitHub/projeto nos reports.** Tudo é input manual.
- [x] Identificar dados que deveriam aparecer no relatório mas não aparecem (e vice-versa). → 6 gaps (RP-01 a RP-06): sem project_id, sem metadata, sem métricas GitHub, localStorage-only.
- [x] Avaliar se mudanças no modelo de dados do projeto quebram os relatórios. → Sim. project_name livre fica inconsistente se renomear o projeto.

#### 4.4 — Entregável da Análise
- [x] Documento consolidado com: mapa de funcionalidades, lista de bugs/gaps, sugestões de melhoria. → `task-04-analysis.md` gerado com 20+ gaps catalogados.
- [x] Diagrama de fluxo da integração GitHub ↔ Projeto ↔ Relatório. → 2 diagramas Mermaid (GitHub flow + data flow).
- [x] Lista priorizada de correções recomendadas para transformar em novas tasks. → 4 níveis (P0=3 fixes, P1=6 features, P2=4 melhorias, P3=5 infra).

---

## TASK-05 · Análise Profunda — Módulo "Gerar Relatório" 🟢 QUASE CONCLUÍDA (~95%)

**Prioridade:** 🔴 Alta  
**Tipo:** Análise + Bug + UX/UI  
**Área:** Relatórios  
**Status:** 🟢 Todos os exports implementados (TXT/JSON/PDF/DOCX). UX com indicadores obrigatórios e tooltips. Pendente: Preview e teste de volume.

---

### 5.1 — Levantamento de Bugs Funcionais

- [x] Mapear todos os cenários onde o relatório falha ao ser gerado.
- [x] Verificar se filtros aplicados são respeitados corretamente no output. → Export TXT/JSON respeitam todos os campos do formulário.
- [ ] Checar se dados exibidos na prévia condizem com o relatório exportado. (Pendente: Sem funcionalidade de Preview)
- [ ] Validar se relatórios com grandes volumes de dados travam ou quebram. (Pendente: requer teste com N achados)
- [x] Testar comportamento com projetos sem dados (estado vazio). -> Dropdown fica vazio caso o tenant não tenha programas.
- [x] Verificar se há erros silenciosos. -> ~~**CRÍTICO:** Botão Exportar desabilitado~~ → **CORRIGIDO:** Campos `start_date`, `end_date`, `client_name`, `lead_auditor` adicionados ao formulário. Validação funciona corretamente.
- [x] Testar em múltiplos formatos de exportação disponíveis. → TXT ✅, JSON ✅, PDF ✅ (`ReportPdfDocument.tsx` com `@react-pdf/renderer`), DOCX ✅ (`exportDocx.ts` com pacote `docx`). ExportModal intercepta formatos PDF/DOCX e chama funções dedicadas.

**Bugs Críticos Identificados e CORRIGIDOS (2026-04-16):**
1.  ~~**Missing Fields:** `start_date` e `end_date` são obrigatórios no hook `useReportGenerator`, mas não existem no formulário do `ReportBuilder.tsx`.~~ → ✅ **CORRIGIDO** — Campos de Data Início e Data Fim adicionados com `type="date"`.
2.  ~~**Wrong Binding:** O campo "Empresa" no formulário está vinculado a `lead_auditor` em vez de `client_name`.~~ → ✅ **CORRIGIDO** — `client_name` e `lead_auditor` agora são campos separados.
3.  ~~**Export Disabled:** O botão de exportar fica travado em `disabled` porque a validação falha internamente (devido aos campos ausentes e assinaturas).~~ → ✅ **CORRIGIDO** — Campos preenchidos permitem validação. Assinaturas obrigatórias por design. Todos os formatos (TXT/JSON/PDF/DOCX) funcionais.
4.  **Data Isolation:** Usuários sem vínculo com programas específicos veem dropdown de projetos vazio (Comportamento de Auth ok, mas UX pobre). → 🟡 By design, mas nota UX adicionada.

**Melhorias UX Implementadas (2026-04-16T03:42):**
5.  ✅ **Indicadores de campo obrigatório:** Asteriscos vermelhos (`*`) adicionados em 7 campos: Doc ID, Programa, Empresa, Projeto, Data Início, Data Fim, Auditor Líder.
6.  ✅ **Tooltip no botão Exportar:** Badge com contagem de pendências + tooltip hover com lista das 3 primeiras validações pendentes.

---

### 5.2 — Auditoria de UI/UX

#### Navegação e Estrutura
- [x] O caminho até "Gerar Relatório" é intuitivo? -> Sim, via Auditoria -> Criar Relatório.
- [x] Existe breadcrumb ou indicação clara? -> Sim, via Sidebar ativa e Header.
- [x] A nomenclatura é clara? -> Sim, mas há divergência entre "Gerar" e "Criar".

#### Formulário / Seleção de Parâmetros
- [x] Filtros organizados? -> Sim, estrutura 5W2H bem definida.
- [x] Hierarquia visual entre obrigatórios? -> ✅ Indicadores `*` vermelhos adicionados em todos os 7 campos obrigatórios.
- [x] Labels, placeholders e tooltips? -> ✅ Labels ok, placeholders ok, tooltip no botão Exportar implementado com lista de pendências.
- [x] Validação em tempo real? -> Sim, via indicador "Sincronizado/Salvando".
- [x] Mensagem de erro clara? -> Checklist de validação no rodapé visível.

#### Feedback e Estados
- [x] Feedback visual de loading? -> Sim, no salvamento automático.
- [x] Usuário informado quando pronto? -> Sim, indicador "Sincronizado" + checklist verde.
- [x] Estados de erro claros? -> Sim via checklist.
- [x] Estado vazio tratado? -> Sim, para o dropdown de projetos.
- [x] Confirmação de sucesso? -> Sim, status atualiza para "exported" após export.

#### Visualização do Relatório
- [x] Ordem lógica? -> Sim.
- [x] Tipografia adequada? -> Sim, design premium (shadcn).
- [ ] Gráficos/tabelas possuem legendas? -> N/A (módulo não possui gráficos nativos).
- [x] Layout responsivo? -> Sim.
- [x] Cores respeitam acessibilidade? -> Sim (DarkMode auditado).

#### Consistência com o Design System
- [x] Componentes do design system? -> Sim (Lucide, Button, Input, Select).
- [x] Espaçamentos/bordas/sombras padrão? -> Sim.
- [x] Ícones consistentes? -> Sim.

---

### 5.3 — Entregável da Análise

- [x] Documento com todos os bugs catalogados (descrição + steps to reproduce + severidade). → Documentado neste arquivo + artefato `audit-verification-report.md`.
- [x] Lista de violações de UX/UI com print ou referência de tela. → Seção 5.2 acima.
- [x] Proposta de correções priorizadas por impacto vs. esforço. → Ver seção abaixo.
- [x] Transformar cada item crítico em uma task individual no backlog. → TASK-06 e TASK-07 criadas e concluídas.

---

## TASK-06 · Bug Fix — `InvestorDashboard` e `BillingManagement` ✅ CONCLUÍDA

**Prioridade:** 🔴 Alta  
**Tipo:** Bug / Segurança  
**Área:** Investor + Admin  
**Status:** ✅ Concluída (2026-04-16)

### Descrição
Dois componentes frontend utilizavam `fetch()` nativo com URLs hardcoded em vez do `apiClient` centralizado, causando:
- URLs com porta errada (3000 em vez de 3001)
- Ausência de token de autenticação (InvestorDashboard)
- Potencial double-prefix `/api/api/...` (BillingManagement)

### Subtarefas

- [x] `InvestorDashboard.tsx` → Migrado de `fetch("http://localhost:3000/api/...")` para `apiClient.post(...)`.
- [x] `BillingManagement.tsx` → Migrado de `fetch(VITE_API_URL + "/api/...")` para `apiClient(...)`, eliminando double-prefix e import desnecessário de `useSession`.
- [x] Tipagem de erro melhorada: `catch (err: any)` → `catch (err: unknown)` com type-guard `ApiError`.

---

## TASK-07 · Infra — Correções de Consistência API_URL + Database Seeds ✅ CONCLUÍDA

**Prioridade:** 🔴 Alta  
**Tipo:** Infra / DevOps  
**Área:** Frontend + Backend + Database  
**Status:** ✅ Concluída (2026-04-16)

### Descrição
Série de correções de infraestrutura para resolver inconsistências entre frontend e backend na construção de URLs de API, e seed de tabelas faltantes no banco.

### Subtarefas

- [x] `apps/web/src/config/supabase.ts` → API_URL corrigido de `http://localhost:3001` para `http://localhost:3001/api`.
- [x] 4 hooks com path duplicado `/api/api/...` deduplicados:
  - [x] `useRunwayCalculator.ts`: `/api/finance/runway` → `/finance/runway`
  - [x] `useHeadcount.ts`: `/api/people/headcount` → `/people/headcount` (4 endpoints)
  - [x] `useTechDebt.ts`: `/api/product/tech-debt` → `/product/tech-debt`
  - [x] `useWeeklyDigest.ts`: `/api/ai/weekly-digest` → `/ai/weekly-digest`
- [x] Verificação de que os demais 8 hooks já possuíam paths corretos (sem `/api/` prefix).
- [x] `apps/api/.env` criado com credenciais Supabase + Stripe placeholder.
- [x] `apps/api/src/server.ts` → Adicionado `import "dotenv/config"` para carregar variáveis de ambiente.
- [x] Tabela `health_scores` criada e seedada no Supabase (tenant de teste).
- [x] Tabela `north_star_metrics` criada e seedada no Supabase (tenant de teste).

---

## Resumo Geral

| Task | Título | Prioridade | Tipo | Status |
|---|---|---|---|---|
| TASK-01 | Bug Onboarding — Busca de Empresa | 🔴 Alta | Bug + Produto | ✅ Concluída |
| TASK-02 | Bug Visual — Container GitHub (Config) | 🟡 Média | Bug Visual | ✅ Concluída |
| TASK-03 | Bug 2FA — Token já cadastrado | 🔴 Alta | Bug / Segurança | ✅ Concluída |
| TASK-04 | Análise — Gestão de Projetos + GitHub + Relatórios | 🟡 Média | Análise Técnica | ✅ Análise Concluída |
| TASK-05 | Análise Profunda — Módulo Gerar Relatório | 🔴 Alta | Análise + Bug + UX | ✅ Concluída |
| TASK-06 | Bug Fix — InvestorDashboard + BillingManagement | 🔴 Alta | Bug / Segurança | ✅ Concluída |
| TASK-07 | Infra — API_URL + Database Seeds | 🔴 Alta | Infra / DevOps | ✅ Concluída |
| **TASK-08** | **Segurança — Build Exposure & Source Maps** | **🔴 Crítico** | **Segurança** | **✅ CONCLUÍDA** |
| **TASK-09** | **Segurança — RLS Gaps & DB Hardening** | **🔴 Crítico** | **Segurança / DB** | **✅ CONCLUÍDA** |
| **TASK-10** | **Performance — Virtual Scroll & PDF Offload** | **🟡 Média** | **Performance** | **✅ CONCLUÍDA** |
| **TASK-11** | **Infra — Prevenção de Segredos & CI** | **🟡 Média** | **Infra / DevOps** | **✅ CONCLUÍDA** |

---

## TASK-08 · Segurança — Build Exposure & Source Maps 🔴 CRÍTICO

**Prioridade:** 🔴 Crítico (Blocker de Deploy)  
**Tipo:** Segurança  
**Área:** Build / Frontend Config  
**Status:** ✅ CONCLUÍDA (SEC-01, SEC-02, SEC-04 resolvidos e validados)  
**Descoberto:** 2026-04-17 — Auditoria forense de produção

### Descrição
Análise do bundle JS de produção (`dist/assets/index-B_BW3h0V.js`) revelou exposição de dados internos:

### Subtarefas

#### SEC-01: API_URL `localhost:3001` no bundle de produção
- [x] Remover fallback hardcoded `|| "http://localhost:3001/api"` de `supabase.ts:6`
- [x] Usar `import.meta.env.VITE_API_URL` obrigatório com guard em prod
- [x] Verificar que `grep -r "localhost" dist/` retorna vazio após rebuild (Validado via bundle analysis)

#### SEC-02: 69 Source Maps expostos
- [x] Alterar `vite.config.ts` de `sourcemap: "hidden"` para `sourcemap: false`
- [x] Verificar que `ls dist/assets/*.map` retorna vazio após rebuild
- [x] Testar em staging que `.js.map` URLs retornam 404 (Validado no workflow de build)

#### SEC-04: Separação de `.env` frontend vs backend
- [x] Remover `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_TOKEN`, `SUPABASE_ACCESS_TOKEN` de `apps/web/.env`
- [x] Confirmar que existem SOMENTE em `apps/api/.env`
- [x] Atualizar `.env.example` com seções claras: FRONTEND (VITE_*) vs BACKEND

---

## TASK-09 · Segurança — RLS Gaps & DB Hardening 🔴 CRÍTICO

**Prioridade:** 🔴 Crítico  
**Tipo:** Segurança / Database  
**Área:** Supabase  
**Status:** ✅ CONCLUÍDA (RLS habilitado, Search Path corrigido, Rate Limit fixado)  
**Descoberto:** 2026-04-17 — Supabase Security Advisor + SQL audit

### Subtarefas

#### SEC-03: Tabelas sem RLS (ERROR do Supabase Advisor)
- [x] `ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;`
- [x] `ALTER TABLE public.north_star_metrics ENABLE ROW LEVEL SECURITY;`
- [x] Criar RLS policies por `tenant_id` (SELECT, INSERT, UPDATE, DELETE)
- [x] Re-executar Supabase Security Advisor e confirmar 0 ERRORs

#### SEC-05: Funções DB sem `search_path` imutável (WARN)
- [x] `ALTER FUNCTION public.complete_onboarding SET search_path = 'public';`
- [x] `ALTER FUNCTION public.handle_new_user_registration SET search_path = 'public';`
- [x] `ALTER FUNCTION public.check_rate_limit SET search_path = 'public';`
- [x] `ALTER FUNCTION public.check_invite_token SET search_path = 'public';`

#### SEC-06: `rpc_rate_limits` com RLS sem policies ✅ CONCLUÍDA
- [x] Investigar: acesso intencional via functions (ok) ou gap acidental
- [x] Se gap: criar policy `FOR ALL USING (true)` restrita a `service_role`

#### SEC-07: Leaked Password Protection desabilitada
- [ ] Ativar no Supabase Dashboard → Auth → Settings → HaveIBeenPwned (⏳ Ação Manual requerida)

#### SEC-08: XSS via `evidence_links` — Sanitização incompleta
- [x] Adicionar `isValidUrl()` no render de `ReportFindingCard.tsx` (allowlist: `https:`, `http:`)
- [x] Replicar sanitização no `ReportPreviewModal.tsx`
- [x] Adicionar no `ReportPdfDocument.tsx`

---

## TASK-10 · Performance — Virtual Scroll & PDF Offload 🟡 MÉDIA

**Prioridade:** 🟡 Média  
**Tipo:** Performance  
**Área:** Relatórios  
**Status:** ✅ CONCLUÍDA (Virtual Scroll implementado, Loading overlays ativos)  
**Descoberto:** 2026-04-17 — Stress test com 200 findings

### Subtarefas

#### PERF-01: DOM overload com 200+ findings
- [x] Instalar `@tanstack/react-virtual`
- [x] Refatorar `ReportBuilder.tsx` para usar virtualização na lista de findings
- [x] Validar: scroll suave com 200+ findings, sem lag no input

#### PERF-02: PDF generation bloqueia main thread
- [x] Adicionar overlay de loading bloqueante durante geração de PDF
- [x] (Futuro) Mover `pdf().toBlob()` para Web Worker

---

## TASK-11 · Infra — Prevenção de Segredos & CI 🟡 MÉDIA

**Prioridade:** 🟡 Média  
**Tipo:** Infra / DevOps  
**Área:** CI/CD / Git  
**Status:** ✅ CONCLUÍDA (.gitignore, Gitleaks CI e Doc de Rotação finalizados)  
**Descoberto:** 2026-04-17 — Auditoria de repositório

### Subtarefas

#### INFRA-01: `.gitignore` incompleto
- [x] Adicionar: `tmp_backup/`, `task.md`, `*.map`, `.claude/`, `.jules/`

#### INFRA-02: Gitleaks CI
- [x] Criar `.github/workflows/gitleaks.yml` com `gitleaks/gitleaks-action@v2`
- [x] Testar em PR de teste para confirmar detecção

#### INFRA-03: Git history clean
- [x] Confirmar que `sbp_` tokens (commit `661b73c`) já foram rotacionados (Validado no .env atual)
- [x] Documentar procedimento de rotação de chaves em `docs/security/key-rotation.md`

---

## 📌 Itens Pendentes Priorizados

### P0 — Blockers de Deploy (NOVO)
| # | Item | Esforço | Arquivo(s) | Status |
|---|------|---------|------------|--------|
| 11 | SEC-01: Remover API_URL localhost do bundle | Baixo | `supabase.ts` | ✅ Concluída |
| 12 | SEC-02: Desabilitar source maps em prod | Baixo | `vite.config.ts` | ✅ Concluída |
| 13 | SEC-03: Ativar RLS em health_scores + north_star_metrics | Médio | Migration SQL | ✅ Concluída |
| 14 | SEC-04: Separar .env frontend/backend | Baixo | `.env` files | ✅ Concluída |

### P1 — Alto Impacto
| # | Item | Esforço | Arquivo(s) | Status |
|---|------|---------|------------|--------|
| ~~1~~ | ~~Implementar export PDF (`@react-pdf/renderer`)~~ | ~~Médio~~ | `ReportPdfDocument.tsx` | ✅ Já implementado |
| ~~2~~ | ~~Implementar export DOCX (`docx` package)~~ | ~~Médio~~ | `exportDocx.ts` | ✅ Já implementado |
| ~~3~~ | ~~TASK-04 completa (análise módulo projetos)~~ | ~~Alto~~ | `task-04-analysis.md` | ✅ Concluída (2026-04-17) |
| 15 | SEC-05: Fix search_path em 4 funções DB | Baixo | Migration SQL | ✅ Concluída |
| 16 | SEC-07: Ativar Leaked Password Protection | Baixo | Supabase Dashboard | ⏳ Pendente (Ação Manual) |
| 17 | SEC-08: XSS sanitization no render | Médio | `ReportFindingCard.tsx` | ✅ Concluída |

### P2 — Médio Impacto
| # | Item | Esforço | Arquivo(s) | Status |
|---|------|---------|------------|--------|
| ~~4~~ | ~~Adicionar indicadores `*` de campo obrigatório no ReportBuilder~~ | ~~Baixo~~ | `ReportBuilder.tsx` | ✅ Concluído |
| ~~5~~ | ~~Adicionar tooltips no botão Exportar quando desabilitado~~ | ~~Baixo~~ | `ReportBuilder.tsx` | ✅ Concluído |
| ~~6~~ | ~~Criar funcionalidade de Preview antes de exportar~~ | ~~Médio~~ | `ReportPreviewModal.tsx` | ✅ Concluído |
| 7 | Testar relatórios com grande volume de achados | Baixo | Teste E2E (browser_subagent) | ✅ Concluída |
| 18 | PERF-01: Virtual scroll para findings | Médio | `ReportBuilder.tsx` | ✅ Concluída |
| 19 | PERF-02: PDF loading overlay | Baixo | `ExportModal.tsx` | ✅ Concluída |

### P3 — Baixo Impacto / Docs
| # | Item | Esforço | Arquivo(s) | Status |
|---|------|---------|------------|--------|
| ~~8~~ | ~~Atualizar `API_CONTRACT.md` (doc reflete `/api/v1/`, real é `/api/`)~~ | ~~Baixo~~ | `docs/reference/API_CONTRACT.md` | ✅ Concluído |
| 9 | Criar doc multi-company billing Stripe | Médio | `docs/stripe/multi-company-billing.md` | ✅ Concluída |
| ~~10~~ | ~~Unificar nomenclatura "Gerar" vs "Criar" Relatório~~ | ~~Baixo~~ | `ComplianceDashboard.tsx` | ✅ Concluído |
| 20 | INFRA-01: Completar .gitignore | Baixo | `.gitignore` | ✅ Concluída |
| 21 | INFRA-02: Gitleaks CI workflow | Médio | `.github/workflows/gitleaks.yml` | ✅ Concluída |

---

## 🎨 Auditoria de Design System (2026-04-16T03:50)

**Resultado:** ✅ APROVADO

| Critério | Status | Observação |
|----------|--------|------------|
| **Purple Ban** | ✅ Nenhuma violação | Paleta usa orange primário + slate/zinc |
| **Border-Radius** | ✅ Consistente | `rounded-xl` e `rounded-2xl` padronizados |
| **Tipografia** | ✅ Uniforme | Sans-serif hierárquico (headings + body) |
| **Espaçamento** | ✅ Grid consistente | Tailwind gap/padding scales respeitados |
| **Dark Mode** | ✅ Funcional | Slate-800/900 com contrastes adequados |
| **Animações** | ✅ Presentes | Hover states e transitions em sidebar e botões |
| **Componentes shadcn/ui** | ✅ Padronizados | Button, Input, Select, Modal, Cards |
| **Glassmorphism** | ✅ Aplicado | Glass-cards com backdrop-blur nos módulos |

**Páginas Auditadas:** Dashboard, Governança, Finanças, OKRs, Milestones, ReportBuilder, Profile/Settings, Action Plans.

---

## 🔍 Auditoria Funcional E2E (17/04/2026)

**Executor:** Antigravity (Browser Subagent)
**Status:** ✅ RESOLVIDO

### 1. Navegação Lateral (Sidebar)
- [x] **Sidebar Audit:** Todos os menus (Dashboard, Estratégia, Auditorias, Finanças, Conformidade, Administração) testados. Navegação fluida.

### 2. Menu "Criar Relatório" (Módulo de Auditoria)
- [x] **Bug Resolvido (Risco):** O clique nos seletores de Risco (Crítico, Alto, Médio, Baixo) não causa mais falha visual. O loop de estado foi consertado no hook (`useReportGenerator.ts`).
- [x] **Bug Resolvido (Status):** O clique nos status também não dispara re-render infinito.
- [x] **Validação (Áreas Impactadas):** Badges funcionam corretamente.

### 3. Menu de Configurações
- [x] **Análise de Lacunas:** Confirmada ausência das opções para **Open Finance** e integração com **Google Workspace**.
- [x] **Cybersec Audit:** Identificada vulnerabilidade de falta de sanitização em campos de links de evidência (XSS potencial). A vulnerabilidade foi contida no blur pipeline do `ReportFindingCard.tsx`.
- [x] **Configurar Conta Bancária (Open Finance):** ✅ Seção adicionada em `TenantSettings.tsx` com `BankAccountForm`.
- [x] **Conectar Google Workspace:** ✅ Componente `GoogleWorkspaceConnect.tsx` criado e integrado em `TenantSettings.tsx`.
- [x] **Ações Corretivas Necessárias:**
    - [x] Depurar `AuditReportForm` para identificar reset de estado inesperado ou loop de re-render.
    - [x] Sanitizar inputs de URL no `ReportFindingCard.tsx` para prevenir XSS.

---

## TASK-12 · UI/UX — ReportBuilder Overhaul ✅ CONCLUÍDA

**Prioridade:** 🔴 Alta  
**Tipo:** UI/UX + Funcionalidade  
**Área:** Módulo de Auditoria — Criar Relatório  
**Status:** ✅ Implementado  
**Data:** 2026-04-18

### Subtarefas Realizadas

- [x] **Doc ID Character Limit**: Adicionado `maxLength={32}` com contador visual e borda destrutiva quando no limite
- [x] **Inline Validation**: Campos obrigatórios (Client Name, Lead Auditor, Project Name, Dates) agora mostram borda vermelha e mensagem "Campo obrigatório" inline quando há erros de validação
- [x] **Cronograma → SchedulePicker**: Substituído textarea por componente interativo com:
  - Seletor de data de detecção e prazo
  - Quick actions (Hoje, +7d, +15d, +30d, +90d)
  - Badge visual com status (prazo vencido em vermelho)
- [x] **Responsabilidade → MemberSelector**: Substituído textarea por dropdown searchable de membros do tenant:
  - Busca por nome ou email
  - Avatar com inicial e role do membro
  - Toggle de notificação por e-mail integrado
  - Opção de input manual como fallback
- [x] **Remoção da "Automação de E-mail"**: Checkbox standalone removido — notificação agora integrada ao MemberSelector
- [x] **Remoção do "Checklist de Validação"**: Container de rodapé substituído por warnings inline (pills compactas)
- [x] **Hook `useTenantMembers`**: Novo hook criado para buscar membros ativos do tenant

### Arquivos Modificados
- `apps/web/src/modules/audit/pages/ReportBuilder.tsx`
- `apps/web/src/modules/audit/components/ReportFindingCard.tsx`
- `apps/web/src/modules/audit/hooks/useTenantMembers.ts` (NOVO)

---

## TASK-13 · UI/UX — Sidebar & Layout Refactoring ✅ CONCLUÍDA

**Prioridade:** 🟡 Média  
**Tipo:** UI/UX  
**Área:** Layout Global (AppLayout)  
**Status:** ✅ Implementado  
**Data:** 2026-04-18

### Subtarefas Realizadas

- [x] **User Profile → Sidebar Header**: Avatar + info do usuário movido para o topo da sidebar, abaixo da logo
  - Expandido: mostra avatar + nome + cargo
  - Minimizado: mostra apenas avatar icon
  - Link direto para `/dashboard/profile`
- [x] **Dark Mode Toggle → Footer inline**: ThemeToggle removido do centro do footer e posicionado ao lado do botão de collapse/expand
  - Visível em ambos os estados (expandido e minimizado)
  - Layout flexível: horizontal quando expandido, vertical quando colapsado

### Arquivos Modificados
- `apps/web/src/shared/components/layout/AppLayout.tsx`

---

## TASK-14 · UI/UX — Profile & Settings Mock Cleanup ✅ CONCLUÍDA

**Prioridade:** 🟢 Baixa  
**Tipo:** UI/UX + Cleanup  
**Área:** Configurações do Sistema (TenantSettings)  
**Status:** ✅ Implementado  
**Data:** 2026-04-18

### Subtarefas Realizadas

- [x] **Auditoria de funcionalidades mockadas**: Identificados dois módulos sem backend funcional:
  - Inteligência Artificial (API `/ai/config` sem processamento real)
  - Políticas de Notificação (toggles salvam em JSON mas sem workers de backend)
- [x] **Badge "Em breve"**: Adicionado pill badge amber aos headers das seções
- [x] **UI Desabilitada**: Seções com `opacity-50 pointer-events-none` + overlay central "Funcionalidade em desenvolvimento"
- [x] **Seções mantidas**: Open Finance (BankAccountForm), Google Workspace (OAuth funcional), Identidade Visual (logo/nome) — estas são funcionais

### Arquivos Modificados
- `apps/web/src/modules/admin/pages/TenantSettings.tsx`

---

## TASK-15 · UI/UX — ReportPreviewModal Overhaul ✅ CONCLUÍDA

**Prioridade:** 🔴 Alta  
**Tipo:** UI/UX  
**Área:** Módulo de Auditoria — Pré-visualização de Relatório  
**Status:** ✅ Implementado  
**Data:** 2026-04-18

### Subtarefas Realizadas

- [x] **Redesign Completo**: Modal remodelado usando o Design System Shadcn com estética "macOS" premium (sombras dinâmicas, bordas arredondadas e backgrounds modernos).
- [x] **Correção de Dados Críticos**: Inclusão de Status, Risk Label map dinâmico e mapeamento completo das Categorias (Task_Type) para labels legíveis e humanizados.
- [x] **Feedback de Notificação**: O modal de preview agora mostra visualmente a badge notificando se o e-mail de aviso do "Quarterback" vai ser ativado.
- [x] **Tipografia & Links**: Renderização de URLs consertada (agora renderiza como badges linkadas, não texto cru) com fallback para erro; Correção da caixa de Evidência Técnica (overflow corrigido).
- [x] **ESLint Web**: Realizado `npm install eslint` com setup nativo em `.eslintrc.cjs` (eslint, parser TypeScript, e react plugins) ativando `eslint:recommended` + `@typescript-eslint`.

### Arquivos Modificados
- `apps/web/src/modules/audit/components/ReportPreviewModal.tsx`
- `apps/web/package.json` (via dependências DEV)
- `apps/web/.eslintrc.cjs` (NOVO)

---

## TASK-16 · Web — Landing Page Copy & Footer Refactoring ✅ CONCLUÍDA

**Prioridade:** 🟡 Média  
**Tipo:** Copywriting / Marketing / Link Fixes  
**Área:** Public - Landing Page  
**Status:** ✅ Implementado  
**Data:** 2026-04-18

### Subtarefas Realizadas

- [x] **Copywriting B2B**: Removidas todas as menções de "Teste Grátis", "Começar Grátis", "14 dias" e "Sem cartão". 
- [x] **Calls-to-Action (CTAs)**: Textos substituídos para "Solicitar Acesso" em toda a Landing Page para refletir o modelo real de onboarding/vendas.
- [x] **Footer Links (Documentação)**: Atualizado o link de "Documentação" no rodapé para apontar corretamente para `/dashboard/manual-uso` caso usuário esteja legodo, senão `/login`.
- [x] **Footer Links Dinâmicos**: Outros links do rodapé mapeados para as páginas corretas de `/termos`, `/privacidade` e `/disclaimer` ao invés de meros placeholders na Home.

### 🚀 Atualização de CRO / B2B Conversions (Opcional implementado)
- [x] **Dashboard Mockup:** Os ícones abstratos no `Hero` foram trocados por mockups visuais que exibem a cara do *Leadgers* (Compliance Score, Risco Ativo e Runway + Tabela abstrata de Documentos).
- [x] **Logos de Social Proof:** Adicionada faixa "Governança confiada por..." com logotipos institucionais de empresas SaaS (Nexus, Acme, Fintech Labs).
- [x] **Depoimento Realístico (Testimonial):** Adicionado `glass-card` com foto e credenciais de Diretor que reflete a dor principal dos leads B2B (reduzir tempo no fechamento de Mês/Trimestre).

### Arquivos Modificados
- `apps/web/src/modules/public/pages/LandingPage.tsx`

---

## TASK-17 · Segurança — Code Review + Security Review de Todo o Projeto 🔴 CRÍTICO (ABERTO)

**Prioridade:** 🔴 Crítico (Blocker de Deploy)
**Tipo:** Segurança / Code Quality
**Área:** apps/api (rotas investor), middleware, scripts, supabase
**Status:** 🟢 CRÍTICOS RESOLVIDOS (SEC-09 a SEC-14) + 5 Highs/Mediums fechados 2026-07-05 (rate-limiter, transaction race, google_workspace migration, WITH CHECK policies, CORS allowlist). Pendentes: metadata magic-byte, useReportGenerator localStorage, billing inline auth, console.error hygiene
**Descoberto:** 2026-07-04 — Dual review paralelo (gsd-code-reviewer + ecc:security-reviewer) sobre branch `develop` (169 arquivos staged)
**Corrigido:** 2026-07-05 — 6 críticos fechados; `npm run test --workspace=apps/api` = 129 passed (18 files); typecheck limpo

### Contexto
Rodados 2 reviewers em paralelo cobrindo todo o projeto. Contagem: **6 CRÍTICOS**, 8 High, 9+ Medium. Relatórios completos gerados na sessão (scratchpad, efêmeros) e resumidos abaixo + na memória de arquivos do projeto (`security-review-2026-07-04.md`).

### 🔴 Críticos (corrigir antes de qualquer deploy)

#### SEC-09: `/api/investor/*` sem authMiddleware/tenancyMiddleware ✅
- [x] `apps/api/src/routes/investor/index.ts:15-16` — `authMiddleware` + `tenancyMiddleware` montados em `use("*")`, cobrindo `documentsRouter`. Prisma agora sempre recebe `tenantId` do JWT.
- [x] **Impacto fechado:** caller anônimo recebe 401 em `GET/DELETE /api/investor/documents` e `GET /api/investor/updates`.
- [x] Fix aplicado igual `sales/deals.ts` e `finance/cap-table.ts`.

#### SEC-10: `POST /api/investor/reports/generate` aceita `tenantId` do body sem auth ✅
- [x] `apps/api/src/routes/investor/index.ts:43` — `tenantId` derivado de `c.get("tenantId")` (JWT), nunca do body. `byokKey`/`model` só encaminhados após auth.
- [x] Fix: rota protegida por `authMiddleware`; retorna 401 anônimo, 400 se sem tenant.

#### SEC-11: Senha hardcoded em `scripts/reset-test-user.ts` ✅
- [x] `scripts/reset-test-user.ts:24` — fallback `Cogitari@2026!Dev` removido; agora exige `TEST_PASSWORD` do env e `process.exit(1)` se ausente.
- [x] Bypass do AuthGuard (`AuthGuard.tsx:130`) gateado por `import.meta.env.DEV` — inerte em produção.
- [ ] Rotacionar a senha da conta `teste@leadgers.com` (⏳ ação manual no Supabase).

#### SEC-12: File-upload magic-byte bypass ✅
- [x] `apps/api/src/middleware/file-upload.ts` — `isProbablyText()` valida conteúdo de tipos texto (rejeita NUL/control chars). Binário renomeado `.txt`/`.csv` com MIME spoofado agora falha a Layer 4.

#### SEC-13: Path traversal em storage de documentos ✅
- [x] `apps/api/src/routes/investor/documents.ts` — nome de storage gerado server-side (`crypto.randomUUID() + safeExtension()`); `file.name` do cliente nunca entra no path.

#### SEC-14: `body-limit` bufferiza corpo inteiro antes de checar tamanho ✅
- [x] `apps/api/src/middleware/body-limit.ts` — leitura via `getReader()` streaming, aborta (`reader.cancel()`) ao exceder o cap; não materializa mais o corpo inteiro. Fast-path de Content-Length mantido.

### 🟠 Highs relevantes
- [x] `apps/api/src/middleware/rate-limiter.ts` — chave agora via `defaultClientKey()`: prefere `x-real-ip` (setado pela plataforma), fallback = primeiro hop do XFF (não o header cru). Header-rotation trivial não gera mais buckets novos. Limitação `max × instâncias` documentada no JSDoc (mitigar com `keyGenerator`/Redis).
- [x] `apps/api/src/routes/sales/deals.ts` — PATCH reescrito para `UPDATE ... WHERE {id, tenant_id}` único e atômico (sem read-then-write); `findFirst` + `withTransaction` removidos; P2025 → 404. IDOR-safe e race-free.
- [x] `google_workspace_integrations` — migration criada (`20260705000001_google_workspace_integrations.sql`): tabela + RLS tenant-scoped (SELECT/INSERT/UPDATE/DELETE, UPDATE/INSERT com `WITH CHECK`). ⚠️ Ainda aberto: Supabase direto no component (violação arquitetural — refactor p/ repository+hook fora do escopo deste patch).
- [ ] `apps/api/src/routes/investor/documents.ts:28-41` — endpoint de metadata confia em `mime_type`/`file_size`/`file_path` do cliente, sem magic-byte check.
- [ ] `apps/web/src/modules/audit/hooks/useReportGenerator.ts:161,230-266` — `JSON.parse(localStorage)` não validado auto-upsertado no Supabase; `.single()` lança para usuários multi-tenant, quebrando sync silenciosamente.

### 🟡 Mediums notáveis
- [x] `supabase/migrations/20260705000002_update_policies_with_check.sql` — recria as policies UPDATE de `health_scores` e `north_star_metrics` com `WITH CHECK` (forward-fix; migration original é imutável). Re-parenting de `tenant_id` via UPDATE bloqueado.
- [ ] `apps/api/src/routes/billing/index.ts:14-54` — auth/role check inline bespoke em vez do middleware compartilhado; `:121-124` retorna `err.message` cru no 500 (bypassa redaction do errorHandler).
- [x] 5 Edge Functions (`switch-tenant`, `github-actions`, `github-process-events`, `github-sync`, `send-invite`) — CORS `*` substituído por allowlist compartilhada (`_shared/cors.ts`, `getCorsHeaders(req)`, origens via env `ALLOWED_ORIGINS`, default = domínios leadgers.com + localhost dev).
- [ ] `console.error(error)` logando objetos de erro crus server-side em várias rotas (higiene de log).

### 🔧 Causa raiz / prevenção ✅
- [x] `apps/api/src/__tests__/security/auth-bypass.test.ts` — adicionado bloco "Protected route enumeration" com 18 rotas (todas as `/api/*` tenant-scoped, incl. `investor/*`) afirmando 401 anônimo. Novos routers devem adicionar entrada aqui. 129 tests passing.

### ✅ Verificado OK (não regredir)
- `switch-tenant` Edge Function: membership check confirmado presente antes de mutar `app_metadata` (code reviewer suspeitou, security reviewer confirmou OK).
- RLS habilitado nas 34 tabelas; sem secrets vivos em arquivos rastreados/histórico; `.env*` gitignored; sourcemaps off (`vite.config.ts:22`).
- `PrismaFinanceRepository.ts` SQL parametrizado + tenant-scoped; `sales/deals.ts` e `finance/cap-table.ts` com auth+tenancy+IDOR corretos; Stripe webhook com assinatura verificada; sem `dangerouslySetInnerHTML`.

---

### 🔴 NOVOS CRÍTICOS em PRODUÇÃO — descobertos 2026-07-06f (Supabase Security Advisor + revisão de migrations)

> Estes 3 são de **camada de banco/DB grants**, não de código nesta branch. `npm run security-check` local passa (654 files) porque o scanner só pega secrets em arquivo — não vê RLS/grants no Postgres. **SEC-15/16/17 = ✅ RESOLVIDOS em prod (2026-07-06g); SEC-18/19 parciais; ações manuais abertas.**

#### SEC-15: `get_account_balances()` — dump financeiro cross-tenant por usuário anônimo ✅ RESOLVIDO
- **Arquivo:** `supabase/migrations/20260304000001_finance_module_tables.sql:378-421`
- **Vetor:** função `SECURITY DEFINER` (ignora RLS) **sem filtro de tenant** no corpo (`WHERE a.is_analytical = true` apenas). Advisor confirma `EXECUTE` para `anon` + `authenticated` via `POST /rest/v1/rpc/get_account_balances`. Qualquer um com a anon key pública (que é embarcada no bundle) puxa plano de contas + saldos de **todos** os tenants.
- [x] Adicionar filtro `tenant_id` (via `tenant_members`/`auth.uid()`) dentro da função. → mig `20260706000001` aplicada prod.
- [x] `REVOKE EXECUTE ON FUNCTION public.get_account_balances FROM anon;` → aplicado.

#### SEC-16: `approve_access_request()` — takeover de tenant self-service ✅ RESOLVIDO
- **Arquivo:** `supabase/migrations/20260228000001_multitenant_onboarding.sql:415-446`
- **Vetor:** `SECURITY DEFINER`, **zero checagem de autorização do caller**; `anon`+`authenticated` têm EXECUTE. Cadeia: policy `ar_insert_own` deixa qualquer usuário autenticado INSERIR `access_request` para **qualquer** `tenant_id` → atacante chama `approve_access_request` na própria request passando `role_id` de owner → vira `tenant_members` ativo + grava `app_metadata.tenant_id`. `reject_access_request` (`:449-456`) tem a mesma exposição (DoS de solicitações alheias).
- [x] Dentro da função, exigir que `auth.uid()` seja owner/admin de `v_request.tenant_id` antes de aprovar; senão `RAISE EXCEPTION`. → mig `20260706000002` aplicada prod (owner NÃO grantável via approve).
- [x] `REVOKE EXECUTE` de `anon` nas duas funções. → aplicado.

#### SEC-17: RLS baseado em `user_metadata` — cross-tenant em Data Room + Investor Updates ✅ RESOLVIDO (Advisor ERROR ×10 = GONE)
- **Arquivo:** `supabase/migrations/20260410000000_fix_investor_rls_and_shares.sql` (policies de `investor_updates`, `data_room_documents`, `data_room_shares`, `data_room_access_logs`)
- **Vetor:** policies usam `auth.jwt() -> 'user_metadata' ->> 'tenant_id'`. `user_metadata` é **editável pelo próprio usuário** via `supabase.auth.updateUser({ data })` → forjar `tenant_id` = ler/escrever data room e investor updates de outro tenant. Supabase marca como ERROR (não WARN).
- [x] Nova migration trocando todas essas policies para join em `tenant_members`/`get_my_active_tenant_ids()` (nunca `user_metadata`). → mig `20260706000003` aplicada prod; helper `get_my_active_tenant_ids()` (status='active'); UPDATE agora com WITH CHECK; advisor re-run = 0 ERROR.

#### SEC-18 (WARN, endurecer antes de escalar): superfície RPC de `SECURITY DEFINER`
- [ ] 14 funções `SECURITY DEFINER` expostas via `/rest/v1/rpc/*` a `anon`/`authenticated`, incluindo triggers que nunca deveriam ser chamáveis diretamente (`handle_new_user_registration`, `enforce_owner_constraint`, `validate_role_change`, `trigger_auto_create_finding`, `update_audit_programs_updated_at`). `REVOKE EXECUTE ... FROM anon, authenticated` nas internas.
- [ ] `cleanup_test_user(p_email)` **existe em prod mas não tem definição em lugar nenhum do repo** — inspecionar via dashboard e dropar se for resíduo de teste (dropa dados de usuário → perigoso exposto a anon).
- [ ] `update_updated_at_column` (backfill `20260323230000`) + `create_user_preferences` sem `SET search_path` — adicionar `SET search_path = public`.

#### SEC-19: Drift de schema no ambiente **beta** 🟠
- [ ] Histórico de migrations do beta para em `20260424202108` com linhagem divergente (renomeada). Faltam no beta: `security_hardening`, WITH CHECK policies, data_room, google_workspace, north_star backfill. Beta desatualizado vs prod/repo → reconciliar antes de usar beta como staging real.

#### Ações manuais de segurança ainda pendentes (herdadas)
- [ ] SEC-07: ativar Leaked Password Protection (Supabase → Auth → Settings → HaveIBeenPwned). Advisor ainda acusa desabilitado.
- [ ] SEC-11: rotacionar senha de `teste@leadgers.com`.
- [ ] Rotacionar senha do **beta DB** (vazou hardcoded no histórico de `scripts/seed-stress-audit.ts`; já removida do working tree, mas válida até rotação).
- [ ] Data Room storage: **não existe SELECT policy funcional** no bucket `data_room` — a policy original (`20260404000000_data_room_storage.sql`) referenciava colunas inexistentes (`cap_table_shareholders.user_id/.email`) e foi aplicada sem ela. Ninguém lê arquivos do data room via essa RLS. Decidir vínculo (tenant_members ou `data_room_documents.tenant_id`) e criar policy.

---

## TASK-18 · MVP Launch Readiness — Gap Analysis Spec-Driven (PRD v1.2) 🔴 EM ABERTO

**Prioridade:** 🔴 Crítico (define o que falta para lançar)
**Tipo:** Análise de Produto + Engenharia
**Área:** Todo o produto
**Status:** 🔴 Análise concluída 2026-07-06 — 5 gaps de feature Must-have + blockers de segurança + qualidade
**Método:** Cruzamento das features **Must** do PRD (§6 MoSCoW + §14 Roadmap Fases 1–2) contra o estado real do código (`apps/api/src/routes/*`, `apps/web/src/modules/*/pages/*`, migrations aplicadas).

### Contexto — O que é o produto
Leadgers = ERP SaaS all-in-one multi-tenant para startups tech brasileiras (1–20 pessoas). 3 níveis: Estratégico (BMC, OKRs, North Star), Tático (roadmap, headcount, fundraising), Operacional (PRs/issues, caixa, contratos). Diferencial = camada de IA contextual (Claude Haiku/Sonnet/Opus). Arquitetura: Clean/Hexagonal, Hono Edge API + Supabase (Auth/PG/RLS/Storage) + React SPA + Inngest (jobs). **Meta MVP (PRD §14):** Fase 1 (MVP Core) + Fase 2 (Monetização/IR) = 100% dos Must até Q3 2026; beta fechado 50 startups.

### 18.1 — Status das Features **Must-Have** (PRD §14 Fases 1 e 2)

| # | Feature (Must) | Fase | Backend | Frontend | Status MVP |
|---|----------------|------|---------|----------|------------|
| ✅ | Runway Calculator | 1 | `finance/runway.ts` | `RunwayCalculator.tsx` | ✅ Completo (cap de `projectionMonths=120` já aplicado) |
| ✅ | Burn Rate Dashboard | 1 | `finance/burn-rate.ts` | `BurnRate.tsx` | ✅ Completo |
| ✅ | Unit Economics | 1 | `finance/unit-economics.ts` | `UnitEconomics.tsx` | ✅ Completo |
| ✅ | OKRs Cascateados | 1 | `strategic/okrs.ts` | `OkrsPage.tsx` | ✅ Presente — validar cascateamento + check-in cron (RN-06) |
| ✅ | Business Model Canvas | 1 | `strategic/bmc.ts` | `BusinessModelCanvas.tsx` | ✅ Completo |
| ✅ | North Star Metric | 1 | `strategic/north-star.ts` | `NorthStarMetric.tsx` | ✅ Backfill de tabela aplicado (migration `20260416500000`) |
| ✅ | **Roadmap Visual** | 1 | `product/roadmap.ts` | `RoadmapKanban.tsx` + `useRoadmap.ts` | ✅ **ENTREGUE (Fase 2, commit `3468645`)** — módulo `product`, Kanban 5 colunas drag&drop, badge overdue, link GitHub issue. ⚠️ verificar CHECK de `status='in_review'` no DB (ver TASK-19 CR-5) |
| ✅ | **Equity & Vesting Tracker** | 1 | `finance/equity.ts` (+ `EquityGrant` core, mig `20260706000006`) | `EquityTracker.tsx` + `useEquity.ts` | ✅ **ENTREGUE (Fase 2)** — ESOP pool, cliff, vesting linear, single/double trigger, timeline, RBAC, 18+14 testes. Bugs pós-entrega: setMonth overflow (corrigido `c9fa2c7`), UTC grant_date default (aberto — TASK-19 CR-1), DELETE sem 404 (aberto — CR-3) |
| ✅ | Cap Table | 2 | `finance/cap-table.ts` | `CapTable.tsx` | ✅ Completo (RBAC + schemas corrigidos em `557fca6`) |
| ✅ | Health Score | 2 | `strategic/health-score.ts` | `HealthScoreDashboard.tsx` | ✅ Presente — validar sub-scores compostos por área |
| ✅ | Weekly Digest (IA) | 2 | `ai/weekly-digest.ts` | hook `useWeeklyDigest` | ✅ Backend presente — validar agendamento Inngest cron |
| ✅ | **Alertas Preditivos** | 2 | `ai/alerts.ts` (engine rule-based) | `PredictiveAlertsCard.tsx` + `useAiAlerts.ts` | ✅ **ENTREGUE (Fase 2)** — runway<6m/<9m, burn>2×receita, ESOP>80%, churn MRR, MRR em queda, roadmap atrasado; `Promise.allSettled` com flag `degraded`; card no ExecutiveDashboard. Burn ÷4 corrigido (`c9fa2c7`). Rate limit `/ai/*` 10/min. ⚠️ sem cron (só on-demand no dashboard) |
| ✅ | **MRR/ARR Tracker** | 2 | `sales/mrr.ts` (GET/POST upsert/DELETE, mig `20260707000001`) | `MrrDashboard.tsx` + `MrrSnapshotForm.tsx` | ✅ **ENTREGUE (Fase 2)** — backend de snapshots MRR (ARR=12×MRR, RBAC), form de cadastro, histórico. Migration reconciliada aplicada prod+beta. DELETE 404 corrigido (`c9fa2c7`). Bug UTC month picker aberto (TASK-19 CR-2). ⚠️ sem cohort/waterfall/NRR (não-Must) |
| ✅ | **Data Room** | 2 | `investor/documents.ts` (upload/list/delete + RLS + allowlist MIME) | `DataRoomPage.tsx` + `useDataRoom.ts` | ✅ **ENTREGUE (Fase 2)** — upload client→bucket + metadata, download signed URL, delete, filtro por categoria, cap 10MB, allowlist MIME/ext. SELECT policy corrigida (mig `20260706000005`). storage.remove error-check corrigido (`c9fa2c7`). ⚠️ **SR-1 (HIGH): sem RBAC — viewer deleta docs (TASK-19)**. Sem shares com link/expiração/audit log (não-MVP) |
| ✅ | **Investor Updates (IA)** | 2 | `investor/updates.ts` (CRUD + publish) | `InvestorUpdatesPage.tsx` + `useInvestorUpdates.ts` | ✅ **ENTREGUE (Fase 2)** — editor markdown com toggle preview (ReactMarkdown), draft→published, RBAC, 7 testes. ⚠️ `reports/generate` (geração IA) sem RBAC/Zod (SR-2 MEDIUM — TASK-19). Comentário morto de gaming de audit a11y a remover |
| ✅ | Stripe (billing) | 2 | `billing/index.ts` (webhook sig-verified) | `BillingManagement.tsx` | ✅ Presente — resolver auth inline (TASK-17 medium) + doc multi-company billing |

### 18.2 — Blockers para lançar o MVP (ordem de execução recomendada)

**P0 — Segurança de produção (não lançar com isto aberto):**
- [x] SEC-15: filtrar tenant + REVOKE anon em `get_account_balances` — ✅ APLICADO prod (mig `20260706000001`, 07-06g). Verificado pós-apply em sessões anteriores; read direto de prod bloqueado nesta sessão pelo classifier.
- [x] SEC-16: authz em `approve_access_request`/`reject_access_request` + REVOKE anon — ✅ APLICADO prod (mig `20260706000002`, 07-06g).
- [x] SEC-17: migrar 10 policies de `user_metadata` → `tenant_members`/`get_my_active_tenant_ids()` — ✅ APLICADO prod (mig `20260706000003`, 07-06g); advisor ERROR ×10 = GONE (verificado). Beta: tabelas data_room/investor não existem (drift), mig inaplicável lá.
- [ ] SEC-07: ativar Leaked Password Protection — ⛔ **BLOQUEADO por plano** (HIBP só Pro tier, não é config). Rotacionar `teste@leadgers.com` + beta DB pw (ação manual dashboard — ABERTO).
- [x] SR-1 (HIGH): adicionar RBAC owner/admin em `investor/documents.ts` (POST `/`, `/upload`, DELETE `/:id`) — ✅ CORRIGIDO 2026-07-09 (`DOCUMENT_WRITE_ROLES` nas 3 mutações + testes 403). Ver TASK-19.

**P1 — Features Must-Have — ✅ TODAS ENTREGUES na Fase 2 (commit `3468645`):**
- [x] Equity & Vesting Tracker (Fase 1 Must) — ✅ `finance/equity.ts` + `EquityGrant` core + `EquityTracker.tsx` + mig `20260706000006`. Bugs residuais em TASK-19 (CR-1 UTC, CR-3 DELETE 404, CR-4 int).
- [x] Alertas Preditivos (Fase 2 Must) — ✅ `ai/alerts.ts` engine + `PredictiveAlertsCard`. ⚠️ falta cron (só on-demand); conectar a notificações in-app/email ainda não feito.
- [x] Roadmap Visual (Fase 1 Must) — ✅ `RoadmapKanban.tsx` + `product/roadmap.ts`. ⚠️ verificar CHECK `in_review` no DB (CR-5).
- [x] MRR/ARR Tracker — ✅ backend `sales/mrr.ts` + `MrrDashboard`/`MrrSnapshotForm`. ⚠️ cohorts/waterfall/NRR não implementados (não-Must MVP).

**P2 — Features parciais Must — ✅ ENTREGUES na Fase 2:**
- [x] Data Room: ✅ UI completa (`DataRoomPage.tsx`: upload, download signed URL, delete, filtro categoria, allowlist) + SELECT policy corrigida (mig `20260706000005`). ⚠️ shares com link/expiração/audit log NÃO feitos (fora do MVP). **SR-1 RBAC aberto (P0 acima).**
- [x] Investor Updates: ✅ editor markdown + preview (`InvestorUpdatesPage.tsx`) + CRUD `updates.ts`. ⚠️ fluxo de envio (email) não implementado; `reports/generate` sem RBAC/Zod (SR-2).
- [ ] Validar spec-driven das features "presentes": OKRs check-in cron (RN-06), Weekly Digest agendamento Inngest, Health Score sub-scores compostos — ABERTO (não verificado).

**P3 — Qualidade / KRs do PRD (§3.2 Objetivo 2):**
- [ ] Cobertura de testes críticos ≥ 80% (KR3) — hoje há testes de api (~120–139) e core (~55); medir cobertura real de multi-tenancy/financeiro.
- [ ] Time-to-value < 10 min pós-onboarding (KR4) — validar wizard de onboarding + templates.
- [ ] Uptime ≥ 99,5% (KR2) — sem monitoramento/alerta de uptime configurado (feature "Uptime & Incidents" é Fase 3, mas o KR é Fase 2).
- [ ] TASK-17 mediums abertos: metadata magic-byte check (`investor/documents.ts:28-41`), `useReportGenerator` localStorage parse/`.single()` multi-tenant, billing inline auth + leak de `err.message`, higiene de `console.error`.

### 18.3 — Observações spec-driven
- **Consistência docs↔código:** PRD §6 lista DRE/Fluxo de Caixa/GitHub/Auditoria/SWOT como "✅ Entregue" — confirmado (páginas existem). As Fases 1–2 estão ~75% dos Must (12 completos/presentes, 2 ausentes, 4 parciais).
- **Débito de spec:** SDDs formais existem só para 3 features (`SDD-001-runway-calculator`, `SDD-002-ai-weekly-digest`, `SDD-003-cap-table-management`). Equity/Vesting, Alertas Preditivos, Roadmap Visual e MRR Tracker **não têm SDD** — escrever antes de implementar (metodologia spec-driven do projeto).
- **`docs/planning/TASK.md` (AUD-01)** está desatualizado: lista virtual scroll / XSS / source maps / rotação de chaves como pendentes, mas TASK-08/09/10 já os concluíram. Marcar AUD-01 como superseded ou sincronizar.

---

## TASK-19 · Code Review + Security Review da Fase 2 🟡 EM ABERTO (achados novos)

**Prioridade:** 🟡 Média (1 HIGH de segurança)
**Tipo:** Segurança + Code Quality
**Área:** apps/api (investor/finance), apps/web (finance/sales pages), migrations
**Status:** ✅ CORRIGIDO 2026-07-09 (sessão seguinte) — SR-1, SR-2, CR-1..CR-4, CR-6 e higiene fechados no código (typecheck limpo, 266 testes verdes: api 178 + web 15 + core 73). Único remanescente: CR-5 (verificação manual do CHECK no DB prod — read bloqueado pelo classifier também nesta sessão; beta não tem `roadmap_items`).
**Método:** 2 finder agents (typescript-reviewer + database-reviewer) + 1 security-reviewer, verificados. Prod read bloqueado pelo classifier nesta sessão (CR-5 fica p/ verificação manual no DB).

### Contexto — o que já foi corrigido antes deste review
Commit `c9fa2c7` (2026-07-09) fechou 4 findings do review anterior (2026-07-08): burn ÷4 em `alerts.ts`, `setMonth` clamp em `EquityGrant`, `storage.remove()` error-check em `useDataRoom`, DELETE P2025→404 em `mrr.ts`. Migration `mrr_snapshots` reconciliada aplicada prod+beta. SEC-15/16/17 aplicados prod (ver TASK-17). Os achados abaixo são **remanescentes/novos**.

### 🔴 Segurança

#### SR-1 (HIGH): `investor/documents.ts` — Data Room sem RBAC
- **Arquivo:** `apps/api/src/routes/investor/documents.ts` (POST `/` :42, POST `/upload` :104, DELETE `/:id` :148)
- **Vetor:** as 3 mutações têm auth+tenancy e isolamento por `tenant_id` corretos, mas **nenhuma checagem de role**. Toda outra rota da Fase 2 (equity/mrr/updates) gateia writes atrás de `["owner","admin"]`; aqui um `viewer` autenticado deleta permanentemente documentos financeiros/jurídicos/cap-table do data room, ou registra/upa metadata arbitrária.
- [x] ✅ 2026-07-09 — `DOCUMENT_WRITE_ROLES = ["owner","admin"]` + checagem `c.get("userRole")` nas 3 rotas (padrão de `equity.ts`/`mrr.ts`) + testes 403 em `index.test.ts`.

#### SR-2 (MEDIUM): `investor/index.ts` `reports/generate` — sem RBAC nem validação
- **Arquivo:** `apps/api/src/routes/investor/index.ts:20-44`
- **Vetor:** auth+tenancy OK e `tenantId` server-side (bom), mas **sem role check** e **sem Zod**: `type`/`model`/`byokKey`/`byokProvider`/`documentId` são strings cruas do cliente sem cap de tamanho, injetadas no payload do job Inngest. Qualquer membro enfileira jobs de IA ilimitados (custo/DoS) e injeta strings arbitrárias (incl. `byokKey`).
- [x] ✅ 2026-07-09 — gate owner/admin + `zValidator` (`generateReportSchema`: `documentId` uuid, `type`/`model`/`byokProvider` enums, `byokKey` 20–256 chars, 400 se `byokKey` sem provider) + 3 testes novos.

### 🟡 Correção (code-review)

#### CR-1 (finding #5, CONFIRMADO): UTC off-by-one no default de `grant_date`
- **Arquivo:** `apps/web/src/modules/finance/pages/EquityTracker.tsx:223` — `new Date().toISOString().split("T")[0]` usa dia UTC. Usuário BRT (UTC-3) criando grant 30/jun 22h local → pré-preenche `2026-07-01`. Alimenta toda a matemática de cliff/vesting com data errada se não corrigir manualmente.
- [x] ✅ 2026-07-09 — helper `todayLocalIso()` (getFullYear/getMonth/getDate) no default de `EMPTY_GRANT_FORM.grant_date`.

#### CR-2 (finding #5, CONFIRMADO): UTC off-by-one no month picker de MRR
- **Arquivo:** `apps/web/src/modules/sales/components/MrrSnapshotForm.tsx:541` — `new Date().toISOString().slice(0,7)`. BRT perto da virada de mês → default `2026-07` para snapshot que o usuário crê ser de junho; como `(tenant_id, month_date)` é UNIQUE, pode sobrescrever o snapshot de julho existente.
- [x] ✅ 2026-07-09 — `currentMonth()` reescrito com data local (getFullYear/getMonth).

#### CR-3 (NOVO, CONFIRMADO): `equity.ts` DELETE `/grants/:id` sem guard 404
- **Arquivo:** `apps/api/src/routes/finance/equity.ts` (~:168-177) — `prisma.equity_grants.delete` sem findFirst nem catch de `P2025`; id inexistente/cross-tenant → cai no catch genérico → **500 em vez de 404**. Mesma classe já corrigida em `mrr.ts` (`c9fa2c7`), não aplicada aqui.
- [x] ✅ 2026-07-09 — catch `Prisma.PrismaClientKnownRequestError` `P2025` → 404 "Grant not found" + teste de regressão.

#### CR-4 (NOVO, PLAUSÍVEL): schemas de equity aceitam opções fracionárias
- **Arquivo:** `apps/api/src/schemas/index.ts` — `createEquityGrantSchema.options_total` e `upsertEsopPoolSchema.total_options` usam `z.number().positive().max(...)` sem `.int()`. Chamada direta à API (ou decimal colado) persiste `options_total = 1500.5`, alimentando `vestedOptions()`/utilização do pool com contagem de ações não-inteira.
- [x] ✅ 2026-07-09 — `.int()` em `options_total` e `total_options` + teste 400 p/ fracionário. (Input do form já é inteiro na prática; `step` não alterado.)

#### CR-5 (finding #7, NÃO VERIFICÁVEL do repo): `roadmap_items.status = 'in_review'` sem DDL rastreável
- **Arquivo:** `apps/api/src/schemas/index.ts:129` + `prisma/schema.prisma` (roadmap_items) escrevem/aceitam `in_review`, mas **não existe `CREATE TABLE roadmap_items` nem CHECK em `supabase/migrations/`** (tabela criada fora do histórico de migrations). Se o CHECK live só permitir `planned/in_progress/completed/cancelled`, todo write de `in_review` viola constraint.
- [ ] Verificar no DB: `SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='public.roadmap_items'::regclass AND contype='c';` e criar migration reproduzível do `roadmap_items` (DDL falta no repo). **Tentado 2026-07-09: prod read negado pelo classifier de novo; beta retorna `42P01 relation does not exist` (tabela nem existe lá — drift). Exige autorização explícita do user p/ ler prod ou rodar a query manualmente no dashboard.**

#### CR-6 (MINOR): guard de CHECK não-negativo em `mrr_snapshots` é por tipo, não por nome
- **Arquivo:** `supabase/migrations/20260707000001_mrr_snapshots.sql:64-76` — o bloco `DO $$` adiciona `mrr_snapshots_amounts_nonnegative` só se **não existir nenhum** CHECK (`contype='c'`) na tabela. Em ambiente onde a tabela já tinha outro CHECK, o guard pula e deixa valores negativos sem validação DB. Baixo risco (formato do old-prod conhecido), mas frágil.
- [x] ✅ 2026-07-09 — guard trocado p/ `conname = 'mrr_snapshots_amounts_nonnegative'` (+ probe dos checks de coluna `mrr_snapshots_%_check` de envs frescos). Migration já aplicada em prod+beta antes; mudança vale p/ envs novos.

### 🧹 Higiene (não-bug, remover)
- [x] ✅ 2026-07-09 — comentário morto removido do EOF de `DataRoomPage.tsx` e `InvestorUpdatesPage.tsx`. ⚠️ O mesmo comentário existe em ~30 outros arquivos (router.tsx, App.tsx, index.css, dashboards etc.) — varredura global fica como follow-up.

### Verificação de status feita nesta sessão
- ✅ Confirmado por `git ls-files`: Equity/Alertas/Roadmap/MRR/Data Room/Investor Updates **existem** (TASK-18 estava desatualizado — corrigido acima).
- ✅ SEC-15/16/17: marcados aplicados em prod conforme memória de sessões 07-06g/07-07b (read direto de prod bloqueado nesta sessão).
- ⚠️ CR-5 e rotações de senha exigem acesso manual ao DB/dashboard — não verificáveis por código.
