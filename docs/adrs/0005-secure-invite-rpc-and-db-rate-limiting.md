# ADR 0005: Validação Segura de Convites e Rate Limiting DB-Native

**Status:** Accept / Implementado  
**Data:** 17 de Abril de 2026  
**Contexto:** Core Auth / Tenant Onboarding

## Contexto e Problema

O fluxo de Onboarding via convites de time envolvia que usuários não autenticados (ou em meio a uma sessão neutra recém cridada) clicassem em um link com formato `/accept-invite/:token`. No React (Frontend), o hook de montagem disparava uma requisição de leitura explícita no Supabase: `.from('invite_links').select(...)` para verificar o _hash_ do token e exibir os detalhes (Tenant e Role) a que o usuário estava sendo convidado.

**O Problema RLS:** As tabelas `invite_links` e `invitations` estipulavam devidamente políticas de bloqueio estrito onde o leitor já deve possuir o JWT compatível com o `tenant_id` atrelado ao registro, ocasionando bloqueios RLS (Row Level Security) e barrando a consulta do client. Por consequência, a página de convite sempre alertava erro de "Inválido ou Expirado". O RLS atua corretamente bloqueando acessos não autorizados por usuários deslogados.

## Decisão

1. **SECURITY DEFINER (Bypass de Leitura via RPC):**  
   Não flexibilizamos as regras de leitura pública (via `USING (true)`) para as tabelas inteiras, pois isso exporia a coleção completa de convites a potenciais vazamentos (data leaks).  
   Ao invés disso, optamos pelo Padrão Backend de criar uma RPC PostgreSQL `check_invite_token(raw_token TEXT)` configurada como **SECURITY DEFINER**. Esse contêiner de execução tem privilégio para inspecionar e devolver apenas o payload formatado e seguro daquele hash exato que o requisitante informou, bloqueando listagens laterais.
2. **Postgres-Native Rate Limiting (O Problema do Abuso RPC):**  
   Ao externalizar uma ponte pública no Supabase (que expõe a RPC em `/rest/v1/rpc/...`), abrimos oportunidade de ataques do tipo DDoS na camada da API (brute force repetitivo visando causar oneração ao PostgreSQL).
   A Supabase não possui Rate-Limiter customizado por IP gratuito a nível de PostgREST para RPCs públicas nativamente que se diferencie da quota global da API.
   Para blindar a RPC de ataques de adivinhação aleatória e stress local, inserimos um mecanismo de Limite Nativo nas migrações:
   A função `check_rate_limit()` manipula o IP de origem usando a leitura do log `request.headers->'x-forwarded-for'` injetado pelo API Gateway, e executa logs contra a tabela rastreadora local `rpc_rate_limits`.

## Consequências Positivas

- **Segurança da Informação Preservada:** Os hashes de convites e links permenecem 100% confidenciais sem precisar abrir exceção no RLS via políticas permissivas;
- **Defesa Edge/Database Resiliente:** Através de _Sliding Windows_ no Database, o controle penaliza ativamente endereços maliciosos com erro forçado protegendo o Load médio do sistema sem depender de implementações complexas atreladas a Cache Servers ou Vercel Middlewares.
- **Isolamento e Latência:** A lógica toda corre no cluster C do banco rodando uma única request contra a camada `leadgers-beta`, sem saltar e escalar roteamentos desnecessários pelo servidor Node da aplicação Hono.

## Alternativas Rejeitadas

- **Hono API Endpoint (`apps/api`):** Em teoria, teríamos um Rate Limiter grátis. Contudo, exigiria migrar a injeção do `@supabase/supabase-js` pro Backend ou abrir um novo fluxo de tipagem desnecessário em cima de um escopo puramente resolvido por SQL nativo.
- **Edge Functions Supabase:** Funções de limite de acesso em Edge gerariam custos atrelados à CPU ou exigiriamos bibliotecas em Redis incompatíveis com a infra free descrita neste projeto (Supabase Free tier only).

## Autores

- Antigravity AI (Implementação Cirúrgica em Pareamento)
