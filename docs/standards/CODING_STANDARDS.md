# Padrões de Código (CODING_STANDARDS)

> Normas que TODOS os agentes de IA e desenvolvedores devem seguir impreterivelmente neste Workspace.

## UI/UX Consistente

1. **Shadcn-ui Supreme Rule:** Nunca, sob hipótese alguma, recrie componentes visuais primitivos (Botões, Modais, Tabelas, Inputs, etc.) usando JSX purista ou classes arbitrárias de tailwind soltas. Sempre execute `npx shadcn-ui@latest add [component]` ou reutilize o componente que está alocado em `apps/web/src/shared/components`.
2. **Estilo Corporativo:** As cores e contrastes derivam dos tokens CSS mantidos na root do Web app. Não invente cores CSS hexadecimais aletas (`#ff00ff`) nas páginas.

## Backend API Clean Code

1. **Tenant Isolation em todo lugar:** Nenhuma Query (Prisma/Kysely/Supabase-js) pode omitir a cláusula que exige o Client ID ou Tenant ID na Where-clause, amenos que o RLS global já esteja garantido no pacote do SupabaseClient server-side instanciado com o JWT do User.
2. **Validação ZOD Obrigatória:** Nenhum payload (`req.json()`) deve ser destruturado sem antes transitar por um `validateBody(schemaZod)`. Erros devem cuspir 400 Bad Request polidos.

## Segregação de Arquivos e SOLID

Conforme ditado na arquitetura:

1. Siga o SRP: Se um endpoint crescer para mais de 100 linhas, extraia o corpo em uma Função de Casos de Uso (`usecases/`).
2. Prefira injeção de dependências ou adaptação via Interfaces (ex. `IStorageProvider`, `IAuditRepository`).
3. Proteja os dados PII e respeite restrições de **Privacy by Design** (Ex. Limpar tokens expostos em tela).
