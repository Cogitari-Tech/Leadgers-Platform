# Leadgers Platform - Codebase & Dependencies Guide

This document maps out the core architecture of the Leadgers Platform, focusing specifically on how the shared `@leadgers/core` package interacts with the application layer (`apps/api` and `apps/web`).

## Architecture Overview

The codebase is structured as a monorepo (using Turborepo/npm workspaces), adhering to the principles of **Clean Architecture** and **Domain-Driven Design (DDD)**.

The most critical rule of the architecture is the **Dependency Rule**:
`apps` depend on `packages/core`, but `packages/core` **never** depends on the `apps` or external infrastructure libraries (like Prisma or Supabase).

```mermaid
graph TD
    classDef core fill:#2d7d9a,stroke:#333,stroke-width:2px,color:#fff;
    classDef app fill:#e06666,stroke:#333,stroke-width:2px,color:#fff;

    C[@leadgers/core\n(Domain, Use Cases, Interfaces)]:::core
    W[apps/web\n(React frontend)]:::app
    A[apps/api\n(Hono backend)]:::app

    W -->|Implements Interfaces & Uses Types| C
    A -->|Implements Interfaces & Uses Types| C
```

---

## 📦 `packages/core` (The Domain)

This package contains the absolute core business logic of the platform. It is agnostic to whether the code will run in a browser or a Node.js server.

**What it contains:**

- **Entities**: Pure business objects (`AuditProgram`, `AuditFinding`, `Transaction`).
- **Value Objects**: Encapsulated primitives (`RiskLevel`, `ComplianceScore`).
- **Repository Interfaces**: Contracts for data access (`IFinanceRepository`, `IAuditRepository`).
- **Use Cases**: Application business rules (`RecordTransaction`, `CreateAuditProgram`).
- **Domain Events & Errors**: Shared domain vocabulary.

**What it DOES NOT contain:**

- Database clients (Prisma, Supabase).
- UI Frameworks (React).
- HTTP Frameworks (Hono, Express).

---

## 📱 `apps` (The Infrastructure & UI Layer)

The applications in the `apps` folder are the outer layers of the architecture. They import the core domain and adapt it to the specific environment.

### `apps/web` (Frontend - React / Vite)

The frontend application imports `@leadgers/core` to guarantee type safety and implement local/remote data syncing using the interfaces.

**Dependency flow:**

1. **Repositories**: Implements core interfaces using the Supabase client.
   - _Example:_ `src/modules/audit/repositories/SupabaseAuditRepository.ts` implements `IAuditRepository`.
2. **State & Hooks**: Local state management (Zustand, React hooks) relies on core entities.
   - _Example:_ `useFinance.ts` and `financeStore.ts` handle `Transaction` and `Account` entities.

### `apps/api` (Backend - Hono / Node.js)

The backend API server imports `@leadgers/core` primarily to provide the actual implementations of the interfaces against the underlying Postgres database.

**Dependency flow:**

1. **Adapters**: Implements core interfaces using the Prisma ORM.
   - _Example:_ `src/adapters/PrismaFinanceRepository.ts` implements `IFinanceRepository`.
2. **Controllers/Routers**: Receives HTTP requests, calls Core Use Cases, and returns Domain Entities.

---

## How it works in practice (End-to-end Example)

If we add a new feature, e.g., "Delete Transaction":

1. **Core Package (`packages/core`)**:
   - Add `delete(id: string): Promise<void>` to `IFinanceRepository`.
   - Add `DeleteTransaction` Use Case.
2. **Backend API (`apps/api`)**:
   - Update `PrismaFinanceRepository` to implement the new `delete` method using Prisma.
   - Add a `DELETE /transactions/:id` route that calls the core use case.
3. **Frontend Web (`apps/web`)**:
   - Update `SupabaseFinanceRepository` to implement the `delete` method (if calling Supabase directly) OR hit the new API route.
   - Call the interface method from a React component when the user clicks "Delete".

## Adding New Dependencies

- **Global rules**: If a type or logic needs to be shared across backend and frontend, it goes in `@leadgers/core`.
- **Infrastructure specific**: If it involves the network (fetch, axios), database operations (Prisma), or browser APIs (DOM), it MUST stay inside the specific `apps/` that requires it.
