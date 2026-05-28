# ADR-0001: Uso do Hono.js em Runtime Edge (Serverless)

## Data

2026-04-10

## Status

**Aceito**

## Contexto

O Leadgers Platform foi projetado para ser um SaaS B2B "all-in-one" rápido, onde as requisições primárias são cálculos de gráficos, leitura de dados financeiros e integrações com OAuth.
Tradicionalmente, a stack Node.js (via Express ou NestJS) em containers Docker seria a escolha padrão. Porém, contêineres exigem orquestração complexa, cold starts severos e manutenção contínua, contrariando o princípio de "Developer Experience" e setup rápido exigido pela arquitetura atual.

## Decisão

Decidimos utilizar o framework **Hono.js** para construir nossas APIs e rodar inteiramente no ambiente de **Edge Functions** (Vercel Edge / Cloudflare Workers compatíveis).
Adicionalmente, acoplaremos o Zod Validator middleware do Hono para obter **Type Safety Full-Stack** através do protocolo RPC, consumindo direto no client Vite (React).

## Consequências

**Positivas:**

- Boot extremamente rápido (cold starts próximos a 0ms globais).
- Curva de aprendizado baixa.
- Compatibilidade intrínseca com os padrões `Request/Response` nativos do Node/Web.
- Compartilhamento nativo exato de tipagens Typescript (RPC) no repositório monorepo sem setups pesados de codegen.

**Negativas:**

- Algumas bibliotecas Node legadas (que dependem de módulos severos de OS como `fs` e `crypto` legados) não rodam no Runtime Edge sem polyfills. Teremos de escolher bibliotecas "Edge-ready".
- Debuggar falhas complexas de I/O em Edge pode ser mais abstrato que num servidor Docker local.
