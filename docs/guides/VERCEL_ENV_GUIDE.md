# Vercel & `.env` Variable Splitting Guide

In order to protect secrets and prevent high-impact security vulnerabilities (such as cross-environment leaks and _source maps_ exposing internal paths/tokens in the client build), the Leadgers Platform has adopted a strict `.env` splitting policy on Vercel deployments.

## The Problem

Historically, building with a generic `.env` inside Vercel can cause build steps to embed sensitive Backend URLs (`VITE_API_URL`), internal tokens, and raw directories natively into JavaScript _source maps_. This exposes security logic to the public domain through DevTools.

## The Solution (Splitting Technique)

We separate variables rigorously inside Vercel, and use `.env.production` alongside `.env.example` in tracking:

1. **Public Safe Endpoints**: Publicly available, completely spoof-safe endpoints and toggles (`VITE_PUBLIC_URL`, feature flags) are okay to be exposed to the build step as System Variables.
2. **Private Secrets**: Keys starting with `SUPABASE_SECRET_*`, API core routing, and external tokens (Stripe Secret, etc) are scoped natively and **NEVER** prefixed with `VITE_` unless absolutely necessary for the frontend application memory footprint.
3. **No Source Maps**: In our `vite.config` and deployment settings, sourcemaps are set to `false`. Building locally inside Vercel respects this to ensure output chunks hold absolutely no trace of local directory names or logic.

## Usage Rule for Vibe Coders / Engineers

- Never check in your main `.env`.
- Keep `.env.example` fully updated with safe dummy values.
- When creating _new_ tokens, update them in the actual Vercel Dashboard directly.
- Pull them manually for local tests via:
  ```bash
  npx vercel env pull .env
  ```
- If testing a staging environment, run:
  ```bash
  npx vercel env pull .env.preview
  ```

> Note: Follow OWASP principles and the GitLeaks checking routine configured in `03_development-workflow.md`. Any false positive should be checked deeply before committing using `--no-verify`.

## `ALLOWED_ORIGINS` (CORS allowlist)

Both the Hono API (`apps/api/src/app.ts`) and the Supabase Edge Functions
(`supabase/functions/_shared/cors.ts`) read a comma-separated `ALLOWED_ORIGINS`
env var to build the CORS allowlist. **It is not a `VITE_` var** — it is
server-side only and must never be exposed to the client build.

Fallback behaviour when unset:

- Edge Functions default to the known Leadgers origins (`leadgers.com`, `www`,
  `app`, `localhost:5173`).
- The Hono API defaults to **localhost only** — so in any deployed environment
  `ALLOWED_ORIGINS` **must** be set explicitly or cross-origin browser calls
  will be rejected.

Production value (real prod app domain is `app.cogitari.com.br`, with the
`leadgers.com` marketing domains attached to the Vercel SPA project):

```
ALLOWED_ORIGINS=https://app.cogitari.com.br,https://leadgers.com,https://www.leadgers.com
```

Where to set it:

- **Supabase Edge Functions (current live backend):**
  `supabase secrets set ALLOWED_ORIGINS="https://app.cogitari.com.br,https://leadgers.com,https://www.leadgers.com" --project-ref <leadgers-ref>`
- **Hono API** — only if/when `apps/api` is deployed as its own service: set the
  same value in that service's environment (e.g. `vercel env add ALLOWED_ORIGINS production`).

The `leadgers` Vercel project is the **frontend SPA** and does not consume
`ALLOWED_ORIGINS`; setting it there has no effect.
