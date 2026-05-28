## [VULN-001] Missing Role-Based Access Control on Financial Deletions

| Field      | Value                                            |
| ---------- | ------------------------------------------------ |
| OWASP 2025 | A01 — Broken Access Control                      |
| Severity   | HIGH                                             |
| EPSS Score | N/A                                              |
| Module     | apps/api/src/routes/finance                      |
| Files      | apps/api/src/routes/finance/cap-table.ts:178,270 |
| Status     | ✅ Fixed                                         |

### Attack Vector

An attacker with a 'member' role (low privilege) within a tenant could delete critical financial data, such as cap table rounds or shareholder records, by sending a DELETE request to the corresponding endpoints. The system only verified tenant ownership but did not check the user's specific role or permissions.

### Proof-of-Concept Test

```typescript
it("should prevent 'member' role from deleting cap table rounds", async () => {
  currentRole = "member";
  const res = await app.request("/cap-table/rounds/round-123", {
    method: "DELETE",
  });
  expect(res.status).toBe(403);
});
```

### Clean Architecture Impact

This vulnerability affected the Use Case/Controller boundary. While the fix was applied at the route level for immediate remediation, authorization logic ideally belongs in the Use Case layer to ensure consistent enforcement across different delivery mechanisms.

### Fix Applied

Added explicit role checks in the DELETE routes to ensure only users with 'admin' or 'manager' roles can perform these operations.

### Verification

- Phase 1 security test now passes (returns 403 for members).
- Full finance test suite remains green.
- Manual verification of role-based rejection confirmed.

### Journal Trigger?

YES — Missing ownership/role checks on scaffolded CRUD endpoints.
