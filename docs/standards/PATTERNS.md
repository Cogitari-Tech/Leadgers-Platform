# Padrões de Projeto (PATTERNS.md)

> Arquitetura Tática: Os design patterns impostos ao redor do projeto.

## 1. Plugin System / Module Registry (SPA)

**Ref: `apps/web/src/modules/registry.ts`**
Para que a Single Page Application seja extensível sem gerar conflitos de branch e acoplamento, funcionalidades não podem chumbar dependências no `/src/App.tsx`.
Toda Feature Nova (ex: O Módulo `finance`) deve exportar um objeto de Configuração do Módulo com rotas encapsuladas para si. O React-Router aplicará um _Lazy Load_ de renderização sob demanda, baseando-se no que for injetado no map global `moduleRegistry.set()`.

## 2. Dependency Inversion / Ports and Adapters (Core)

O backend evita se acoplar estritamente aos bancos / terceiros na regra de domínio:

- Interfaces Polimórficas (Ports) controlam as Entradas e Saídas (Ex: `IRepository`, `IPDFGenerator`).
- Implementações Concretas (Adapters) são instanciadas externamente (ex. `SupabaseRepository`).
- **Regra Prática:** Nos Casos de uso (`Usecases/`), importar `supabase.xyz` diretamente na lógica condicional do negócio é proibido.

## 3. Worker-Based Webhooks Pattern (Event-Driven Async)

O front-end **nunca** deve aguardar pendurado numa porta em atividades que levem mais que 3 segundos.

- Exemplo Geração de Relatório de Investidor: O front aciona o Hono `POST /investors/reports`.
- O Hono responde _HTTP 202 Accepted_ com um Request ID na hora, enquanto repassa um disparador Evento via HTTP pro Servidor do Inngest.
- O Inngest gasta o tempo que precisar chamando a API do Claude, compilando e ao finalizar atira num WebSocket via Realtime (Supabase) devoltando ao usuário.
