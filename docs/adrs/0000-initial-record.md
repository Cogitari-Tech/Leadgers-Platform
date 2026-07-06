# Architecture Decision Record (ADR)

## 001. Monorepo Structure

**Status:** Accepted
**Date:** 2026-02-17
**Context:** We need to separate business logic from UI to support future expansion (mobile app, API).
**Decision:** Use npm workspaces with `apps/web` (Vite+React), `apps/api` (Hono backend) and `packages/core` (TypeScript). Turborepo abandoned in favor of native npm orchestration.
**Consequences:** Improved maintainability, clear separation of concerns.

## 002. Environment Management

**Status:** Accepted
**Date:** 2026-02-17
**Context:** Need to manage credentials for multiple environments securely.
**Decision:**

- Use `.env.beta` and `.env.production` as master templates.
- Local development (`.env`, `apps/web/.env`) always mirrors Beta.
- GitHub Actions handles secrets for CI/CD.

## 003. MVP Persistence & Export Strategy

**Status:** Accepted
**Date:** 2026-02-17
**Context:** Need a simple, robust way to save and export audits without external dependencies (Google Drive deferred).
**Decision:**

1.  **Persistence Layer 1 (Drafts):** Browser LocalStorage (Auto-save).
2.  **Persistence Layer 2 (Final):** Supabase Database (Manual save/Sync).
3.  **Export:** Client-side PDF generation (`html2pdf.js`) and JSON export for local backup.
    ** Consequences:**

- Removes dependency on Google Cloud for MVP.
- Simplifies authentication flow.
- "Phase 2" will re-evaluate Excel/CSV export and Cloud Drive integration.

## 004. Security Hardening & Input Validation

**Status:** Accepted
**Date:** 2026-03-30
**Context:** Protect endpoints against NoSQL/SQL injection, structure anomalies, and brute-force via API abuse. Ensure database RLS is correctly enforced.
**Decision:**

1. **Zod Schemas**: Mandate strict runtime type-checking on all POST/PATCH/PUT actions.
2. **Rate Limiting**: Enforce global (60/min) and AI (10/min) rate limiting.
3. **Supabase Functions**: Transition all views and functions interacting with RLS from SECURITY DEFINER to SECURITY INVOKER and lock `search_path`.
4. **Connection pooling**: Centralize Prisma Client into a singleton to ban memory leaks.
   **Consequences:** Guaranteed type-safety, strong guardrails against enumeration and mass assignment, optimal scaling without database exhaustion.

## 005. Vite + React SPA for Authenticated Dashboard

**Status:** Accepted
**Date:** 2026-03-30
**Context:** The PRD originally specified Next.js 14 with App Router. However, the Leadgers platform is 95% authenticated dashboard — zero public pages requiring SEO indexation.
**Decision:** Use Vite + React SPA instead of Next.js SSR/SSG.
**Rationale:** Vite provides instant HMR (<300ms), static bundle served via CDN (minimal hosting cost), and lower architectural complexity. Next.js Server Components, SSR, and hydration overhead are unnecessary for an authenticated SPA. Industry consensus in 2026: Vite for dashboards, Next.js for public SEO-critical sites.
**Consequences:** React Router required for routing (vs Next.js file-system routing). No SSR — acceptable since no pages need indexation. Client-side state via Zustand.

## 006. Hono as Backend Framework (Edge-native)

**Status:** Accepted
**Date:** 2026-03-30
**Context:** Need a performant HTTP framework for API serverless functions on Vercel.
**Decision:** Use Hono instead of Fastify or Express.
**Rationale:** Hono is built on Web Standards (Request/Response), has a ~14KB bundle (vs ~500KB+ for Fastify), and offers significantly lower cold starts in serverless environments. TypeScript-first with RPC capabilities. Optimized for Vercel deployment.
**Consequences:** Smaller ecosystem than Express/Fastify (growing rapidly). Lower raw throughput than Fastify in long-running processes (irrelevant for serverless).

## 007. Inngest for Background Jobs

**Status:** Accepted
**Date:** 2026-03-30
**Context:** Need asynchronous processing (weekly-digest, health-score, predictive alerts) in a serverless environment without dedicated workers.
**Decision:** Use Inngest for background jobs instead of BullMQ or Trigger.dev.
**Rationale:** Inngest uses durable step functions that work natively with Vercel serverless. Code lives in your project, not in third-party infrastructure. Event-driven with automatic retry and dead letter queues.
**Consequences:** Dependency on Inngest service (mitigated: Trigger.dev available as alternative). Active jobs: `weekly-digest`, `health-score`.

## 008. Vercel as Unified Deploy Platform

**Status:** Accepted
**Date:** 2026-03-30
**Context:** PRD originally specified Railway for backend, Vercel for frontend. This creates operational complexity with two platforms.
**Decision:** Use Vercel as the single platform for frontend (static SPA) and backend (Hono serverless functions).
**Rationale:** Single platform = lower operational complexity. Automatic preview deploys per PR. Built-in auto-scaling. Generous free tier for early-stage. Hono is optimized for Vercel.
**Consequences:** Serverless function timeout limitations (mitigated by Inngest for long jobs). If scale makes serverless more expensive than dedicated servers, Railway/Fly.io will be evaluated (Phase 5+).

## 009. Multi-LLM via Adapter Pattern with BYOK

**Status:** Accepted
**Date:** 2026-04-02
**Context:** PRD originally specified Anthropic Claude as the sole AI provider. The codebase already implements adapters for both Claude and Gemini. Enterprise customers may want to use their own API keys.
**Decision:** Implement Adapter pattern (Port `IAIService` + `AnthropicAdapter`, `GoogleAdapter`) supporting multiple providers. Add BYOK (Bring Your Own Key) support.
**Providers:** Claude (narrative analysis, investor updates) + Gemini (tabular data processing, classification).
**BYOK Architecture:** Customer keys encrypted (AES-256) stored per-tenant in Supabase. Just-in-time decryption at LLM API call time. Usage dashboard per BYOK key for transparency.
**Consequences:** Full provider flexibility. Enterprise customers can use their own quotas and models. Intelligent routing between providers based on task type.

## 010. Supabase Auth for Authentication

**Status:** Accepted
**Date:** 2026-04-02
**Context:** Need secure authentication with native database integration and RLS multi-tenant enforcement. Evaluated: JWT custom, Clerk, Keycloak, Supabase Auth.
**Decision:** Use Supabase Auth instead of custom JWT, Clerk, or Keycloak.
**Rationale:**

- **vs JWT Custom:** Building auth from scratch is a security risk without a dedicated security engineer.
- **vs Clerk:** Additional vendor with per-organization costs (~$1/org/month after 100 orgs, ~$75/SSO connection). Adds dependency beyond Supabase.
- **vs Keycloak:** Requires self-hosting Java infrastructure — doesn't fit the Node.js/TypeScript/serverless stack.
- **Supabase Auth wins:** Bundled with database (zero additional cost), natively integrated with RLS (token contains `user_id` used in policies), supports social logins, magic links, and MFA.
  **Migration path:** If enterprise customers require SAML/SCIM SSO (Phase 5+), evaluate Clerk or WorkOS as a complement — not replacement — of Supabase Auth.
  **Consequences:** Dependency on Supabase ecosystem (mitigated: Supabase is open-source, portable to self-hosted). Auth flow via Bearer token + `supabase.auth.getUser()`.
