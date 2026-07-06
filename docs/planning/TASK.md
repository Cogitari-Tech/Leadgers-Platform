# Controle de Tarefa e Entregável (TASK)

> Arquivo dinâmico para acompanhamento estendido de features, também utilizado pelos AI Agents na interpretação local.

## Task ID: [AUD-01] - Stress Test e Otimização do Gerador de Relatórios
**Data:** 2026-04-17
**Status:** In Progress

## 1. Escopo a Ser Implementado
Testar e validar a escalabilidade do gerador de relatórios de auditoria sob alta carga (200+ achados).

- [x] Seed de dados de estresse (200 findings)
- [x] Teste de E2E manual via subagent (Login -> Report Builder -> Preview)
- [ ] Implementar Virtual Scrolling no formulário de Achados do Relatório (`tanstack-virtual`)
- [ ] Otimizar renderização do Preview PDF para grandes volumes (Chunking ou Async)
- [ ] Implementar sanitização robusta de links de evidência (Anti-XSS)
- [ ] Adicionar feedback visual (Loading skeleton) ao processar previews pesados
- [ ] **[URGENTE]** Rotacionar chaves Supabase e GitHub (Vazamento detectado em `.env`)
- [ ] Remover segredos do console client-side e `.env` (Mover para Secret Management)
- [ ] Desabilitar geração de Source Maps (`.map`) em produção no `vite.config.ts`

## 2. Gaps e Dependências
- **Performance:** @react-pdf/renderer bloqueia a Main Thread com listas gigantes no preview.
- **Frontend:** Renderização síncrona de inputs 5W2H para todos os findings em uma única lista causa lag crítico.

## 3. Checklist Contínuo de Práticas e Auditabilidade
- [ ] Testes End-to-End da Subtarefa Escritos?
- [ ] ZOD Payload Schema escrito caso haja Request Nova?
- [ ] Validações Shadcn-Ui integradas? (Form Error Labels)

## 4. Evidências de Validação
- Seed executado: 200 findings inseridos no tenant `a7645451-4321-4b8b-bc55-5251639939b2`.
- Timeout observado no subagent ao tentar exportar PDF com 200 itens (Diagnostic V1).
- Dashboards de listagem normais (paginados) funcionam perfeitamente.
