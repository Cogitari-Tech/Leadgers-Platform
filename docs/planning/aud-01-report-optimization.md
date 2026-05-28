# Task: [AUD-01] - Stress Test e Otimização do Gerador de Relatórios

## 📝 Descrição

Identificamos um gargalo crítico na renderização do "Gerador de Relatórios" ao lidar com auditorias de grande porte (200+ achados). O formulário tenta renderizar todos os itens simultaneamente e o preview do PDF congela a UI.

## 🎯 Objetivos

- [ ] Implementar **Virtual Scrolling** (ex: via `tanstack-virtual` ou `react-window`) na lista de achados do gerador.
- [ ] Otimizar o componente `ReportPreviewModal` para não bloquear a UI durante a geração do blob do PDF.
- [ ] Garantir que o export de PDF funcione mesmo com 500+ achados.

## 🛠️ Detalhes Técnicos

- **Localização:** `apps/web/src/modules/audit/components/ReportBuilder.tsx` (provável nome)
- **Preview:** `apps/web/src/modules/audit/components/ReportPreviewModal.tsx`
- **Biblioteca PDF:** `@react-pdf/renderer`

## 📊 Métricas de Sucesso

- Renderização inicial da página com 200 findings em < 2s.
- Scroll sem "jank" (60fps).
- Exportação de PDF iniciada em < 5s após clique.

## 📅 Log de Atividades

- **2026-04-17:** Seed de 200 findings realizado. Diagnosticado timeout no subagent durante clique de impressão. Constatado que o DOM fica pesado demais para interação fluida.
