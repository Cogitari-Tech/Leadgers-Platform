# Sentinel Journal

## 2025-05-15 — Initializing Sentinel for Leadgers

**Module:** System-wide
**Learning:** Starting audit of Leadgers Platform.

## 2025-05-15 — Missing RBAC on CRUD Endpoints

**Module:** apps/api/src/routes/finance
**VULN-ID:** VULN-001
**Vulnerability:** Missing role-based checks on DELETE operations.
**Root Cause:** AI-scaffolded or rapid-development controllers often focus on tenant isolation (e.g., `where: { tenant_id }`) but neglect granular RBAC (e.g., `if (role !== 'admin')`).
**Architectural Impact:** Use Case/Route layer responsibility mismatch.
**Learning:** Always verify `userRole` in addition to `tenantId` for any state-mutating operation (POST, PUT, DELETE).
**Prevention:** Apply a reusable RBAC middleware or ensure Use Case layer strictly enforces role requirements.
