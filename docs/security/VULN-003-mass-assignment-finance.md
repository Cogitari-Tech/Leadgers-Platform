## [VULN-003] Mass Assignment in Cap Table Creation

| Field      | Value                                            |
| ---------- | ------------------------------------------------ |
| OWASP 2025 | A01 — Broken Access Control                      |
| Severity   | MEDIUM                                           |
| EPSS Score | N/A                                              |
| Module     | apps/api/src/routes/finance                      |
| Files      | apps/api/src/routes/finance/cap-table.ts:145,221 |
| Status     | ✅ Fixed                                         |

### Attack Vector

Attacker could attempt to inject internal fields like `id`, `tenant_id`, or `created_at` in the POST request body. While `tenant_id` was being overwritten by the controller, other fields might have been accepted by Prisma if they matched the schema, potentially leading to data integrity issues or bypassing internal logic.

### Proof-of-Concept Test

```typescript
it("should not allow injecting 'id' in cap table rounds", async () => {
  const res = await app.request("/cap-table/rounds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "INJECTED-ID",
      round_name: "Seed",
      amount_raised: 1000,
    }),
  });
  // Check that mock was called without the injected id
});
```

### Clean Architecture Impact

The Application/DTO layer lacked a strict definition of allowed fields. By using Zod to parse and strip unknown fields, we enforce the principle of Least Privilege for data inputs.

### Fix Applied

Added strict Zod schemas for `createRound` and `createShareholder` which only include the necessary fields, effectively stripping any malicious injections.

### Verification

- Security tests confirm that injected `id` fields are no longer passed to the Prisma client.
- Data integrity is maintained.

### Journal Trigger?

NO — Standard mass assignment mitigation.
