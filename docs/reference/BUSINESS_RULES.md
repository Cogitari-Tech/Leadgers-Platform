# Modelo de Regras de Negócio (BUSINESS RULES)

> Catálogo de regras (RN) estritas extraídas do Product Requirements Document v1.2, que devem ser cobertas pela camada de infra/API do sistema (uso no backend e testes).

## Módulo: Runway Calculator

| RN        | Descrição                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------- |
| **RN-01** | O saldo base é importado do Fluxo de Caixa. Pode ser manual.                                          |
| **RN-02** | O burn rate base é a média dos últimos 3 meses de despesas líquidas (saídas − entradas recorrentes).  |
| **RN-03** | Cenário pessimista: burn rate × 1,2                                                                   |
| **RN-04** | Cenário base: burn rate atual.                                                                        |
| **RN-05** | Cenário otimista: burn rate × 0,85                                                                    |
| **RN-06** | Runway = Saldo Atual ÷ Burn Rate Mensal (O esgotamento de caixa deve aparecer em formato calendário). |
| **RN-07** | Alerta Amarelo: Runway < 9m. Vermelho: < 6m. Crítico: < 3m.                                           |

## Módulo: Cap Table

| RN        | Descrição                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------- |
| **RN-01** | Soma de participações = 100%. Emissão dilui as antigas proporcionalmente.                               |
| **RN-02** | Tipos aceitos: Ações Ordinárias, Preferenciais, Opções (ESOP), Warrants, Debêntures.                    |
| **RN-06** | O Histórico de Cap Table **NUNCA DEVE SER EDITADO**, apenas anexadas Novas Entradas mantendo auditoria. |

## Módulo: Unit Economics

| RN        | Descrição                                                                  |
| --------- | -------------------------------------------------------------------------- |
| **RN-01** | CAC = Marketing & Vendas Despesas ÷ Novos Clientes no Período.             |
| **RN-02** | LTV = ARPU × Margem Bruta ÷ Churn Mensal.                                  |
| **RN-04** | Payback Period = CAC ÷ (ARPU × Margem Bruta) - Alarme Saudável < 12 meses. |

## Módulo: OKRs

| RN             | Descrição                                              |
| -------------- | ------------------------------------------------------ |
| **RN-01 a 02** | Child vincula-se ao pai. 1 Objective tem de 2 a 5 KRs. |
| **RN-05**      | Vermelho (0-40%), Amarelo (41-70%), Verde (71-100%).   |
| **RN-08**      | OKRs arquivados são read-only.                         |

## Módulo: Equity Tracker

| RN             | Descrição                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| **RN-02**      | Antes do cliff = Zero Vesting. Pós Cliff = O gap de 12 meses bate de uma vez de forma retroativa (burst). |
| **RN-04 & 05** | Single Trigger (Aceleração M&A imediata) e Double Trigger suportados e rastreáveis na timeline 24m.       |

## Módulo: Auth & Security (Onboarding)

| RN        | Descrição                                                                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN-01** | Tokens de convite (`invite_links` e `invitations`) não devem ser legíveis globalmente para prevenir vazamentos. Listagem direta via RLS é proibida.                          |
| **RN-02** | A validação do link por usuários anônimos na tela de Aceite atua sob _SECURITY DEFINER_ estrito cruzando o token gerado com hash SHA-256.                                    |
| **RN-03** | Endpoints de convites públicos e APIs expostas são controladas por _Rate Limiting Sliding Window_ nativo baseadas no IP (`x-forwarded-for`), limitando a 20 requisições/min. |
