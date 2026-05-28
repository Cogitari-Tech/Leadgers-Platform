# Estratégia de Testes (TESTING_STRATEGY.md)

> O projeto é impiedoso com código não coberto em rotas de API.

## A Pirâmide AAA (Arrange, Act, Assert)

O código e testes acompanham o fluxo de Arrange, Act e Assert estritos.

## Testes End-to-End no Backend (Obrigatório)

Qualquer nova route Hono criada (ex: `apps/api/src/routes/nova-rota/index.ts`) EXIGE um arquivo gêmeo chamado `[rota].test.ts` usando a framework Vitest integrando com a camada Test do Hono.

```typescript
// Exemplo mandatário:
import { test, expect } from 'vitest';
import { app } from './index';

test('POST /nova-rota retorna 200 payload validado', async () => {
    const res = await app.request('/nova-rota', { method: 'POST', body: ... });
    expect(res.status).toBe(200);
});
```

_Nota Operacional para IAs:_ A pipeline CI na Vercel nega merge requests onde a pasta `apps/api` sofra commits sem seu arquivo `.test.ts` passar nos scripts (`npm run test --workspace=api`).

## Testes visuais & E2E (Frontend/Playwright)

O App Builder/Agent pode invocar os testes E2E chamando o script global em ambientes pre-release (`playwright_runner.py`). A regra vital é que os principais fluxos de criação de conta, emissão de financeiro e dashboard sejam navegáveis sem exceptions de UI.

Para components visuais simples, utilize React Testing Library nos Hooks e Componentes complexos matemáticos (ex. `Runway Calculator` state management).
