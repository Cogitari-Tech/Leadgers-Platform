# ARCHITECTURE.md

> Visão Macro e hub de referências arquiteturais do Leadgers Platform.

## 🏛️ Topologia do Sistema

A Leadgers Platform é um ecossistema **SaaS B2B Multi-Tenant** que roda integralmente em Serverless.

- **Frontend:** Single Page Application (SPA) em [Vite + React], utilizando Padrão Modular (Plugin System). Deploy nativo na Edge Network (Vercel).
- **Backend API:** Desenvolvido em [Hono.js + Node], super leve. Validação end-to-end com Zod (RPC/OpenAPI). Roteamento protegido com `x-tenant-id` garantindo isolamento.
- **Database:** Postgres via [Supabase] utilizando rígido Row-Level Security (RLS) amarrado às claims JWT do Auth GoTrue.
- **Background Jobs:** Rotinas assíncronas, Machine Learning Tasks e Cron Jobs (como o Weekly Digest) são orquestrados e enfileirados pelo [Inngest].
- **AI/ML Layer:** Integração no pacote `@leadgers/ai` consumindo a família Claude 3.5/3.7 da Anthropic.

## 📚 Mapas de Referência

- [Estrutura do Projeto](./01_project-structure.md)
- [Arquitetura de Sistema e Auth](./02_system-architecture.md)
- [Modelo de Dados (DB)](../reference/DATA_MODEL.md)
- [Padrões de Código e Registry](../standards/PATTERNS.md)
- [Contrato de API](../standards/API_CONTRACT.md)

## 📌 Decisões Chave

As decisões históricas que forjaram a arquitetura estão na pasta `../adrs/`.

- **Supabase para RLS:** Isola clientes por banco, removendo falhas lógicas multilocatário da camada da API.
- **Hono invés de Express/Nest:** Baixa complexidade e edge-ready.
- **Vite invés de Next.js Web:** Performance extrema para o painel de administrador focado em Client-side rendering de gráficos pesados.
