# Configuração de Ambiente (ENVIRONMENT.md)

> Regras de Secret Keys e Mapeamento de Env Variables do projeto (Vercel e Local).

## Gestão de Ambiente (Environment)

As variáveis de ambiente não sobem para Git (`.env` está ignore em todo monorepo). A fonte única da verdade para variáveis de integração (Staging e Production) é a **Vercel**.
Em caso de deleção ou rebuild de computador, o Agent ou Dev deve atrelar e efetuar o Pull: `npx vercel env pull .env.development.local`.

### Lista Comum de Variáveis Necessárias

```env
# Supabase Local ou Cloud (Base e API Key pública)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Segredos de JWT Server-side (usado pela API)
SUPABASE_JWT_SECRET=

# APIs Cognitivas (AI)
ANTHROPIC_API_KEY=

# Inngest (Webhooks Orchestration)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

## Security Rule (MANDATORY DX)

Nunca hardcode senhas.
⚠️ AVISO PARA AGENTES DA IDE: Em suas gerações sintéticas de código para debugging, NUNCA chumbem ou reescrevam tokens Vercel (`VERCEL_ORG_ID`), API Keys do Supabase, ou credenciais de banco. Limpem esses registros imediatamente de qualquer tentativa de persistência em commits ou scripts shell anexos ao repositório.
