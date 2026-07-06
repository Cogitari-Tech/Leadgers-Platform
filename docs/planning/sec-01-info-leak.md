# Tarefa: [SEC-01] Remediação de Vazamento de Segredos e Source Maps

## 🔴 CRÍTICO: Vulnerabilidades Detectadas

Durante a auditoria de segurança (`cybersec subagent`), foram identificados vazamentos graves no ambiente de frontend:

1. **Exposição de Chaves de Admin:** O arquivo `apps/web/.env` contém a `SUPABASE_SERVICE_ROLE_KEY`. Esta chave ignora todas as políticas de RLS e permite acesso total ao banco de dados.
2. **Exposição de Tokens Pessoais:** `GITHUB_TOKEN` e `SUPABASE_ACCESS_TOKEN` de desenvolvedor estão expostos no arquivo local.
3. **Exposição de Código Fonte:** Arquivos `.map` (Source Maps) estão sendo gerados na pasta de produção, permitindo a leitura de 100% do código fonte original via navegador.

## 📋 Plano de Ação

### Fase 1: Estancamento (Imediato)

- [ ] **Rotação de Chaves:** Resetar imediatamente a `SUPABASE_SERVICE_ROLE_KEY` e o `GITHUB_TOKEN` no painel do Supabase e GitHub.
- [ ] **Limpeza de Git:** Usar `BFG Repo-Cleaner` ou `git-filter-repo` para remover as versões históricas do `.env` se ele tiver sido commitado (parece estar trackeado).
- [ ] **Gitignore:** Garantir que `**/.env` e `**/.env.local` estejam explicitamente no `.gitignore`.

### Fase 2: Endurecimento de Build

- [ ] **Vite Config:** Alterar `sourcemap: "hidden"` para `sourcemap: false` no `apps/web/vite.config.ts`.
- [ ] **Secret Management:** Mover todas as chaves privadas para as variáveis de ambiente do **Vercel** ou **GitHub Actions**, nunca mantendo no repositório.

### Fase 3: Auditoria Automatizada

- [ ] **Gitleaks:** Integrar a ferramenta `gitleaks` no pipeline de CI para bloquear commits que contenham padrões de segredos.
- [ ] **TruffleHog:** Rodar scan em todo o histórico de branch para garantir que nenhuma outra chave antiga permaneça ativa.

---

> [!CAUTION]
> **NÃO PROSSIGA** com deploys de produção até que as chaves sejam rotacionadas. A exposição da `service_role` compromete toda a integridade dos dados dos inquilinos (Tenants).
