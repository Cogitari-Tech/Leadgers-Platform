# 🔄 Procedimento de Rotação de Chaves e Segredos

Este documento descreve o procedimento operacional padrão para a rotação de chaves de API, segredos e tokens de acesso na plataforma Leadgers.

## 📅 Quando Rotacionar

1.  **Rotina**: A cada 90 dias (recomendado).
2.  **Saída de Colaborador**: Imediatamente após o desligamento de qualquer membro com acesso às chaves.
3.  **Comprometimento**: Imediatamente se houver suspeita de vazamento (ex: commit acidental em histórico Git).
4.  **Alerta de Segurança**: Se o GitHub Gitleaks ou Supabase Advisor disparar um alerta.

---

## 🛠️ Procedimentos por Provedor

### 1. Supabase

#### A. Project API Keys (Anon & Service Role)

1. Acesse o **Dashboard do Supabase** > **Settings** > **API**.
2. Clique em **"Roll Key"** para a `anon` key ou `service_role` key.
3. **Impacto**:
   - `anon`: Requer atualização imediata em `apps/web/.env` e redeploy do frontend.
   - `service_role`: Requer atualização imediata em `apps/api/.env` e restart do backend.

#### B. Access Tokens (sbp\_...)

1. Acesse **Account Settings** > **Access Tokens**.
2. Delete o token antigo e gere um novo.
3. Atualize em `apps/api/.env` (`SUPABASE_ACCESS_TOKEN`).
4. **Impacto**: Afeta ferramentas de CLI e automações de migração.

#### C. Database Password

1. Acesse **Settings** > **Database** > **Database Settings**.
2. Clique em **"Reset Database Password"**.
3. **Impacto**: Requer atualização imediata da `DATABASE_URL` e `DIRECT_URL` em `apps/api/.env`.

---

### 2. Stripe

1. Acesse o **Dashboard do Stripe** > **Developers** > **API Keys**.
2. Para a **Secret Key**: Clique no ícone de "relojoaria" (Roll key). Escolha o tempo de expiração da chave antiga (ex: "Now" ou "In 24 hours").
3. Para o **Webhook Secret**: Vá em **Webhooks**, selecione o endpoint e clique em **"Reveal"** sob "Signing secret", depois use a opção de "Roll secret".
4. Atualize `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` em `apps/api/.env`.

---

### 3. GitHub (OAuth & Tokens)

1. **GitHub App / OAuth**:
   - Acesse **GitHub Settings** > **Developer Settings** > **OAuth Apps**.
   - Clique em **"Generate a new client secret"**.
   - Remova o antigo após atualizar o sistema.
2. **Personal Access Tokens (PAT)**:
   - Acesse **Settings** > **Developer Settings** > **Personal Access Tokens**.
   - Gere um novo e revogue o antigo.
3. Atualize `GITHUB_TOKEN`, `GITHUB_CLIENT_SECRET` em `.env` e segredos do GitHub Actions.

---

## 🧹 Limpando o Histórico Git (Vazamentos)

Se uma chave foi commitada e está no histórico do Git:

1. **Rotacione a chave imediatamente** (conforme acima). A chave antiga deve ser considerada morta.
2. Utilize o **BFG Repo-Cleaner** ou `git filter-repo` para remover o segredo do histórico:
   ```bash
   git filter-repo --invert-paths --path apps/api/.env
   ```
3. Realize um force-push para todas as branches protegidas.
4. Notifique todos os desenvolvedores para fazerem um re-clone do repositório.

---

## 📋 Checklist de Atualização

- [ ] Atualizar `.env` local.
- [ ] Atualizar segredos na **Vercel** (Dashboard > Settings > Environment Variables).
- [ ] Atualizar segredos no **GitHub Actions** (Settings > Secrets and variables > Actions).
- [ ] Verificar logs do Sentry/Cloudwatch para erros de 401/403 após a rotação.
