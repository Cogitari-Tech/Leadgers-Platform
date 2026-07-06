# ADR-0004: Jobs e Operações em Background (Inngest)

## Data

2026-04-10

## Status

**Aceito**

## Contexto

O produto integra-se com APIs da Anthropic e da API do Github (Gerando Webhooks longos, varrendo repositórios ou chamando Modelos de Linguagem pesados no Weekly Digest).
Sistemas rodando em Edge Functions e Serverless como a Vercel possuem rígidos tempos de _Timeout_ (Ex: 10s no Free e 60s no Pro). Manter o cliente travado com um loading aguardando uma AI pensar por 40 segundos e montar um relatório leva a "Timeout Errors" massivos e péssima UX.

## Decisão

Adotamos o provedor assíncrono **Inngest** invés de construir um serviço de Fila SQS da AWS com Docker Workers próprio.
O Inngest utiliza a lógica Serverless, se acoplando via webhooks seguros nos controllers da API Hono.

1. A API Hono engatilha a demanda: `inngest.send({ name: 'ai/generate-digest', data: { workspaceId } })`
2. Retorna `HTTP 202 Accepted` imediato para o Cliente, que começa a desenhar loaders otimistas.
3. O Inngest invoca a rotina local, rodando sem limites massivos por trás dos panos. Com suporte nativo as etapas pesadas usando `step.run`.

## Consequências

**Positivas:**

- Elimina falhas catastróficas por causa de limite de Timeout da Vercel.
- Mantém o ecossistema 100% Serverless, tirando a necessidade de gerenciar filas de RabbitMQ na nuvem.
- Suporta Retries (Re-tentativas Automáticas de falhas de Rede) e Cron Jobs out-of-the-box.

**Negativas:**

- O ambiente local precisa rodar o servidor simulador do inngest (`npx inngest-cli@latest dev`).
- Uma nova ferramenta atrelada na Stack do desenvolvedor limitando e engessando a interoperabilidade (Vendor Lock-in de nível médio-alto).
