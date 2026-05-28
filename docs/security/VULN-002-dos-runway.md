## [VULN-002] Potential DoS via Unbounded Projection Months

| Field      | Value                                    |
| ---------- | ---------------------------------------- |
| OWASP 2025 | A02 — Security Misconfiguration          |
| Severity   | MEDIUM                                   |
| EPSS Score | N/A                                      |
| Module     | apps/api/src/routes/finance              |
| Files      | apps/api/src/routes/finance/runway.ts:34 |
| Status     | ✅ Fixed                                 |

### Attack Vector

An attacker could send a POST request to the `/runway` endpoint with an excessively large value for `projectionMonths` (e.g., 1,000,000). The server would attempt to loop through these months, performing calculations for multiple scenarios, leading to CPU exhaustion and a Denial of Service (DoS) for the API instance.

### Proof-of-Concept Test

```typescript
it("should reject excessively large projectionMonths in runway", async () => {
  const res = await app.request("/runway", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectionMonths: 1000000,
    }),
  });
  expect(res.status).toBe(400);
});
```

### Clean Architecture Impact

Input validation was missing in the Application/DTO layer. By adding a Zod schema, we ensure that data is sanitized and bounded before it reaches the calculation logic.

### Fix Applied

Implemented Zod schema validation using the `validateBody` middleware, limiting `projectionMonths` to a maximum of 60 months.

### Verification

- Phase 1 security test now passes (returns 400 for excessive values).
- Validation correctly handles default values and type coercion.

### Journal Trigger?

NO — Routine input validation fix.
