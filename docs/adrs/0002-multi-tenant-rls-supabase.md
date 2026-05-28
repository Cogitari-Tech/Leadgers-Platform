# ADR-0002: Gestão Multi-Tenant via Row-Level Security (RLS) PostgreSQL

## Data

2026-04-10

## Status

**Aceito**

## Contexto

O ecossistema atende múltiplas empresas (Tenants/Workspaces). O dado da Startup A jamais pode e deve se materializar na requisição da Startup B, sob risco legal.
Geralmente o Multi-tenancy é gerido no código do servidor da API (inserindo de forma estrita `WHERE tenant_id = XYZ` no Prisma/TypeORM) ou através de Databases Físicos isolados.
A Database isolada custa muito mais infraestrutura do que viável agora. Já a solução via Middleware API exige perfeita coesão (onde cada desenvolvedor pode acabar esquecendo um WHERE e vazar dados).

## Decisão

Adotaremos **Supabase (PostgreSQL 15+)** e elegeremos as regras de **Row-Level Security (RLS)** nativas do banco como Guardião Primário dos dados.

## Consequências

**Positivas:**

- Falhas na aplicação (API) não resultam em um vazamento cruzado entre tenants se a autenticação correta estiver assinada pelo Supabase Auth.
- Os SQL Policies declarativos amarram os dados nativos à tag JWT vinda do cliente `auth.jwt() ->> 'tenant_id'`.
- Menos boilerplate repetitivo nas consultas CRUD da aplicação Node.

**Negativas:**

- Exige proficiência razoável em comandos DDL (Migrations) e syntax do PSQL, o que difere de desenvolvedores acostumados a depender puramente de ORMs como Prima.
- Todas as execuções de Background Jobs (que não tem um contexto de usuário navegador vivo) deverão ter o role de "Bypass RLS" utilizando uma Service Role Key, ou teremos que simular uma autenticação para acessar os dados restritos.
