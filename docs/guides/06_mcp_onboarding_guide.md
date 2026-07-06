# Guia de Onboarding e DX (Developer Experience) - MCPs e Agentes

Este documento descreve como configurar o ecossistema local e global de MCPs (Model Context Protocol) para maximizar a produtividade tanto de desenvolvedores humanos quanto de agentes de IA na Leadgers.

## 🚀 Filosofia de Configuração (Local vs Global)

Para evitar duplicidade de processos na máquina, conflito de portas e carga desnecessária de memória, dividimos nossos MCPs em duas camadas:

### 1. Camada Global (Ferramentas Genéricas)

**Local:** Arquivo de configuração da IDE (ex: `C:\Users\morek\AppData\Roaming\Antigravity\User\mcp.json`).
Não utilize mais configs distribuídos em `.agent/mcp_config.json` e similares se usar o Antigravity IDE para evitar conflitos de escopo. Todos os servidores operam na camada global para múltiplos projetos.

- `github`: Interações com sistema de versionamento e pull requests.
- `context7`: Busca na documentação atualizada de frameworks (React, Tailwind, Hono).
- `memory` / `sequential-thinking`: Base vetorial ou grafo de conhecimento interconectado para reter contexto de longo prazo.
- `vercel`: Integração com serviços de hospedagem Vercel para monitoramento de deployments e environment variables.
- `filesystem`: Limitado a pastas de projetos (ex: `E:\Dev`, `D:\ai-game-factory`, `C:\Users\morek`) para isolamento e segurança.
- `stitch`: Integração de GCP para IA Google Cloud.

> [!TIP]
> **Performance e Timeout:** Para evitar timeouts constantes nas inicializações do npx, **INSTALE GLOBALMENTE** os servidores MCP críticos no Node e aponte para o executável `.cmd`. Ex: `npm install -g @modelcontextprotocol/server-filesystem` e use o caminho `E:\cache\npm-global\mcp-server-filesystem.cmd` em `command`. Apenas servidores dinâmicos/remotos como `vercel` e `sequential-thinking` devem usar o `npx.cmd`.

### 2. Camada Local (Contexto Específico - Workspace)

Não recomendamos o uso de `.antigravity/mcp.json` na raiz do projeto (cria conflitos).

- `shadcn`: Integração de UI. Essencial para invocar comandos de scaffold do projeto de design-system sem travar os agentes pedindo input.
- `supabase`: Acesso direto ao DB PostgreSQL da firma. É alimentado com um token do Supabase atrelado à organização. Recomenda-se adicionar na config Global também (com binário `.cmd`).

---

## 🛠️ Configuração e Autenticação de MCPs

Abaixo estão as instruções de como setar os tokens principais:

### Supabase (`supabase` - GLOBAL/Projeto)

- **Onde:** `AppData\Roaming\Antigravity\User\mcp.json`
- **Autenticação:** `--access-token <TOKEN>` nos args (gerado no Supabase Dashboard).

### Context7 (`context7` - GLOBAL)

- **Onde:** `AppData\Roaming\Antigravity\User\mcp.json` (usar nó de `env` de injection).
- **Variáveis de Ambiente:** injete `CONTEXT7_API_KEY` dentro do array de properties de `env`.

### Stitch (`stitch` - GLOBAL)

- **Onde:** `AppData\Roaming\Antigravity\User\mcp.json` (usar nó de `env` de injection).
- **Variáveis de Ambiente Recomendadas:**
  - `GOOGLE_CLOUD_PROJECT`: ID do projeto (ex: `gen-lang-client-XXXXX`)
  - `CLOUDSDK_PYTHON`: Caminho absoluto para instalação do Python (ex: `C:\Users\morek\AppData\Local\Programs\Python\Python312\python.exe`). Isso previne falhas no módulo do Python bundlado com o gcloud CLI ao requisitar access tokens.
- **Autenticação (Importante):** O Stitch community requer auth ativa via gcloud. Garanta que vocẽ executou `gcloud auth login` e `gcloud auth application-default login`.

### GitHub (`github` - GLOBAL)

- **Onde:** `AppData\Roaming\Antigravity\User\mcp.json`
- **Autenticação:** Injete a variavel de `env` `GITHUB_PERSONAL_ACCESS_TOKEN` no JSON.

---

## 🔑 Gerenciamento de Segredos e Refresh

> [!IMPORTANT]
> **Refresh no Antigravity IDE:** Para qualquer mudança na configuração de MCPs surtir efeito, você DEVE ir na aba "MCP Servers -> Manage MCP Servers" da sua IDE e clicar manualmente em **Refresh**. Os MCPs vão iniciar no backend.

### Como Pedir ao Agente para Configurar seu Ambiente

No início de um setup na sua máquina, valide suas portas:

> "Verifique meu `mcp_config.example.json`. Baseando-se nele, verifique se a minha config de OS global em `AppData\Roaming\Antigravity\User\mcp.json` está utilizando arquivos `.cmd` globais ao invés de `npx` onde possível para evitar timeouts."

## 🤖 Agentes, Skills e Workflows (Arquitetura Otimizada)

A Leadgers Platform não roda apenas Modelos Brutos, utilizamos nosso ecossistema de Agentes no VS Code. Conheça a base para guiar a IA de maneira otimizada:

- **Agents:** (`orchestrator`, `frontend-specialist`, `backend-specialist`, etc). O núcleo da persona e limites.
- **Skills:** (`brainstorming`, `clean-code`). O "cinto de ferramentas" atrelado às personas com práticas puras.
- **Workflows:** Comandos base `/brainstorm`, `/deploy`, `/test` para não ter que ditar grandes instruções verbosamente.

Toda essa orquestração reside em arquivos markdown limpos dentro de `.agent/` ou na respectiva pasta que você encontra no `ARCHITECTURE.md`.
Leia o `ARCHITECTURE.md` para visualizar as capacidades da equipe digital do time de desenvolvimento.
