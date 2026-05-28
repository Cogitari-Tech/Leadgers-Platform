# Projeto: Implementação Investor Relations (Data Room & Updates)

## 1. Escopo e Decisões Baseadas no PRD

A análise das perguntas no formato `/brainstorm` juntamente com o `PRD_Leadgers_v1.2.md` definiu as seguintes diretrizes:

1. **Prioridade:** Iniciar pelo **Data Room** como fundação (Supabase Storage). O módulo de Investor Updates depende de múltiplas métricas populadas; começar pelo Data Room gera valor imediato de forma independente.
2. **Access Control (Data Room):** Será feito via **Links com Expiração e Audit Logs** de acesso externo, pois o PRD (RN-02 e RN-04) exige explicitamente o compartilhamento granular com investidores e o registro auditável (view, download, IP).
3. **Trigger da IA (Updates):** O processo será **Sob-Demanda**. Diferente do Weekly Digest (que é Cron), o PRD determina que o usuário entra na tela e "clica em 'Gerar Draft com IA'", consumindo 5 créditos.

## 2. Fases de Implementação

### Fase 1: Infraestrutura de Data Room & Storage

- Setup do bucket `data_room` (Privado) no Supabase.
- Configuração das RLS (Row-Level Security) permitindo apenas acesso aos usuários do próprio tenant para gerenciamento.
- Criação dos Adapters do repositório em `@leadgers/core` para abstrair as queries do Prisma e do Storage.
- Desenvolver rotas Backend em `apps/api/src/routes/investor/documents.ts` (Listagem, Upload/Signed URLs, Exclusão).

### Fase 2: Compartilhamento Linkável e Auditoria

- Criar modelo `data_room_shares` (para armazenar o token, configuração de validade e o `document_id`).
- Rota Backend pública (mas protegida pelo hash do token) para permitir que investidores acessem o arquivo.
- Middleware para capturar o metadata do acesso (IP, Data/Hora) e disparar notificação caso seja o primeiro acesso do investidor (RN-06).

### Fase 3: Painel Frontend do Data Room

- Construir a UI completa em `apps/web/src/modules/investor`.
- Adicionar componente de Drag & Drop para upload de arquivos.
- Implementar a tabela (Shadcn UI) com classificação por Categoria (Financeiro, Jurídico, etc.).
- Modal de configuração de convites por e-mail/cliptoken.

### Fase 4: Integração de Investor Updates (IA)

- Criar rota do backend que consolida: MRR, Runway, Destaques do GitHub e Saúde.
- Chamar o "Claude Sonnet" (via `packages/ai`) com o contexto agregado.
- Salvar o output (`status: draft`) no banco de dados.
- Módulo Frontend WYSIWYG/Markdown para revisão humana e posterior envio (SMTP simulado).

## 3. Critérios de Aceite (Ao final)

- [ ] Documentos não vazam para outros tenants (via RLS).
- [ ] Links gerados retornam 403 (ou Expired) após a data limite.
- [ ] Acessos de convidados geram logs persistidos.
- [ ] A geração do Draft da IA gasta de fato o serviço de IA com o contexto preenchido.
