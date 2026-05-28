# ADR-0003: Padrão Module Registry no Frontend SPA

## Data

2026-04-10

## Status

**Aceito**

## Contexto

O Frontend (React + Vite) tem uma taxa de expansão grande ao acomodar mais de dez módulos críticos descritos pelo PRD (Financeiro, Recursos Humanos, Estratégia, Github, Configurações).
Padrões React de roteamento comum costumam centralizar as rotas no "App.tsx", transformando-o num gargalo monumental de merge conflicts, onde todos os desenvolvedores modificam esse único ponto. Além disso, componentes globais como os de Navegação ou Sidebar precisam saber de todo o roteamento explicitamente.

## Decisão

Decidimos quebrar as áreas de negócio através do padrão **Plugin System / Module Registry**.
A aplicação mestre exporta um registro global (`modules/registry.ts`) e o `App.tsx` apenas consome as rotas renderizando-as de modo Lazy-Loaded baseando-se no registro mapeado por cada classe importada.

## Consequências

**Positivas:**

- Extensibilidade. Adicionar o módulo "People / RH" exige apenas criar uma pasta autônoma `people/` sem ferir ou re-estruturar `finance/` ou refazer o `App.tsx`.
- Sidebars / Menus são calculados dinamicamente mapeando os arquivos exportados.
- Baixo acoplamento e separação estrita por Contextos Limitados (Bounded Contexts).

**Negativas:**

- Para desenvolvedores mais "Júniors" ou estritamente habituados à magia silenciosa do File-Based Routing do Next.js, entender a amarração do Registry pode exigir leitura inicial do manual arquitetural.
- É necessário um esforço extra para o compartilhamento de lógicas transacionais (quando um módulo quer renderizar o _Card_ do outro módulo). Adoção de `shared/components` é necessária.
