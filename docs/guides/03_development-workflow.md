# Development Workflow & CI/CD Guide

This document outlines the automated workflows, security checks, and deployment strategies for the Leadgers Platform project.

## 1. Security & Pre-commit Hooks

We use **Husky** and **Lint-Staged** to enforce security and code quality _before_ every commit.

### Automated Checks (Pre-commit)

When you run `git commit`, the following checks execute automatically:

1.  **Secret Scanning**: Scans staged files for potential secrets using **GitLeaks** preventing API APIs/Keys exposure.
2.  **Lint-staged**: Runs **ESLint** and Prettier exclusively on staged files enforcing clean code protocols for `apps/web`.
3.  `.env` leak prevention hooks verifying split configurations.

**❌ If any check fails, the commit is blocked.**

### Assurance Checks (Pre-push & Post-merge)

Prior to any `git push`, the following occurs (via `pre-push` hook):

1. **Typechecking**: `tsc --noEmit` validates Typescript structures.
2. **Tests**: `npm run test` executes Vitest suites ensuring no regressions exist.
3. **Security Audit**: High and critical vulnerabilities check.

(Additionally, `post-merge` and `post-checkout` hooks automate `npm install` when dependencies change).

### Manual Override (Emergency Only)

If you must bypass these checks (e.g., false positive), use:

```bash
git commit -m "msg" --no-verify
```

---

## 2. CI Pipelines (GitHub Actions)

Our Continuous Integration (CI) pipeline runs on GitHub Actions to verify code integrity.

### Triggers/Rules

The pipeline runs on:

- **Pull Requests** targeting `develop` (Feature merge).
- **Pull Requests** targeting `beta` (Hotfixes).

---

## 3. Continuous Deployment (CD) Strategy

We follow a Gitflow-based deployment strategy targeting **Vercel**.

| Environment        | Branch    | URL (Example)       | Deployment Trigger               | Purpose                                  |
| :----------------- | :-------- | :------------------ | :------------------------------- | :--------------------------------------- |
| **Development**    | `develop` | `dev.leadgers.com`  | **Automatic** (Merge to develop) | Integration testing, internal review.    |
| **Beta (Staging)** | `beta`    | `beta.leadgers.com` | **Automatic** (PR/Merge to beta) | User Acceptance Testing (UAT), Hotfixes. |
| **Production**     | `main`    | `leadgers.com`      | **Manual** (Promotion)           | Stable release for end-users.            |

### Configuration Requirements

- **Vercel Project**: Connect to the GitHub repository `Leadgers-Platform`.
- **Build Command**: `npm run build`.
- **Environment Variables**: Must be configured in Vercel Project Settings for each environment.

---

## 4. Local Verification Commands

You can run these checks locally without committing:

```bash
# Run Security Scan
npm run security-check

# Run Full Test Suite
npm run test

# Run Build
npm run build
```

## 5. E2E Testing (Playwright) & Bypasses

When running automated End-to-End tests via Playwright:

1. Use the **Dummy Site Key** in `.env`: `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA`.
2. Ensure you have test tenant accounts mapped correctly.
3. If necessary, inject `leadgers_session_type` in the browser context `localStorage` to bypass MFA timeout.
