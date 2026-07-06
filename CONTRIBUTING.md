# Guia de Contribuição - Leadgers Platform

Obrigado por ajudar a manter as ferramentas da **Cogitari Tech** (CNPJ: 64.460.886/0001-39).

Este guia cobre o básico para começar. Para detalhes avançados de CI/CD e testes, consulte [Workflow de Desenvolvimento](docs/03_development-workflow.md).

---

## 💻 Configuração do Ambiente

**Pré-requisitos:** Node.js v20+ e npm v10+.

```bash
# 1. Clone o Repositório
git clone https://github.com/Cogitari-Tech/Leadgers-Platform.git
cd Leadgers-Platform

# 2. Instale Dependências (Monorepo)
npm install

# 3. Configure Ambiente
cp .env.example .env
# Preencha com credenciais do Supabase (Beta)
```

---

## 🚀 Execução Local

```bash
# Rodar Frontend (Web)
npm run dev

# Rodar Backend (API Hono)
npm run dev:api

# Rodar Frontend + Backend simultaneamente
npm run dev:all
```

---

## 🛠️ Fluxo de Branches (Gitflow)

Siga este fluxo rigorosamente:

1.  **Develop** (`develop`): Branch base para integração.
2.  **Beta** (`beta`): Branch de homologação (Deploy automático para staging).
3.  **Main** (`main`): Branch de produção (Deploy manual/promote).

### Criando uma Feature

```bash
git checkout develop
git pull
git checkout -b feature/minha-nova-funcionalidade

# ... desenvolvimento ...

# O Husky validará seus commits (segurança e lint)
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/minha-nova-funcionalidade
```

Abra um **Pull Request** para a branch `develop`.

---

## 🔑 Usuários de Teste

Para facilitar os testes locais e E2E, utilize as seguintes credenciais de teste (ambientes Beta/Local):

| Usuário                       | Senha               | Tipo              | Comportamento                      |
| :---------------------------- | :------------------ | :---------------- | :--------------------------------- |
| `teste@leadgers.com`          | `Cogitari@2026!Dev` | Admin (Auditoria) | Persistente                        |
| `qa_vibe_test@leadgers.com`   | `Cogitari@2026!Dev` | Novo Registro     | **Auto-Removível** (Limpa ao Sair) |
| `test_removivel@leadgers.com` | `Cogitari@2026!Dev` | Teste de Cadastro | **Auto-Removível** (Limpa ao Sair) |

> 💡 **Dica:** Use `qa_vibe_test@leadgers.com` para testar fluxos de registro e onboarding do zero. O sistema apaga os dados deste usuário e organização ao clicar em "Sair".

---

## 📝 Padrões de Código

- **Commits**: Utilizamos [Conventional Commits](https://www.conventionalcommits.org/).
- **Linting**: O projeto usa ESLint + Prettier. Rode `npm run lint` para verificar.
- **Testes**: Novas funcionalidades devem incluir testes unitários (`npm test`).

---

## 🔒 Segurança

- 🚫 **Nunca commite chaves de API ou segredos.**
- 🚫 **Nunca commite arquivos .env.**

O pre-commit hook bloqueará tentativas de commit inseguro.

---

## 🐛 Reportar Bugs

Use as [Issues do GitHub](https://github.com/Cogitari-Tech/Leadgers-Platform/issues) para reportar problemas, anexando passos para reprodução.

---

Cogitari Tech — Leadgers Governance Platform 🚀
