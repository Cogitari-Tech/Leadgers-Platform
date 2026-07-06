# Defense in Depth — Leadgers Platform Security Architecture

> Every layer defends independently. If any layer is bypassed, the others still protect.

---

## Layer Model

```
┌─────────────────────────────────────────────────────────┐
│  Layer 0: Request Tracking (X-Request-ID)               │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Security Headers (CSP, HSTS, X-Frame-Options) │
├─────────────────────────────────────────────────────────┤
│  Layer 2: CORS (Origin Allowlist)                       │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Body Size Limits (1MB / 10MB uploads)         │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Rate Limiting (60/min global, 10/min AI)      │
├─────────────────────────────────────────────────────────┤
│  Layer 5: Authentication (Supabase JWT)                 │
├─────────────────────────────────────────────────────────┤
│  Layer 6: Multi-Tenant Isolation (tenancyMiddleware)    │
├─────────────────────────────────────────────────────────┤
│  Layer 7: Input Validation (Zod schemas, strict limits) │
├─────────────────────────────────────────────────────────┤
│  Layer 8: File Validation (Extension+MIME+Magic Bytes)  │
├─────────────────────────────────────────────────────────┤
│  Layer 9: Atomic Operations (Prisma transactions)       │
├─────────────────────────────────────────────────────────┤
│  Layer 10: Database RLS (Supabase Row Level Security)   │
├─────────────────────────────────────────────────────────┤
│  Layer 11: Error Sanitization (no stack trace leakage)  │
└─────────────────────────────────────────────────────────┘
```

---

## OWASP Top 10:2025 Coverage Matrix

| OWASP | Risk | Layers Defending | Status |
|---|---|---|---|
| **A01** Broken Access Control | IDOR, SSRF | L5 Auth + L6 Tenancy + L10 RLS | ✅ |
| **A02** Security Misconfiguration | Headers, defaults | L1 Headers + L2 CORS | ✅ |
| **A03** Supply Chain | Malicious deps | `npm audit` + lockfile | ⚠️ Manual |
| **A04** Cryptographic Failures | Weak crypto | Supabase JWT (RS256) | ✅ |
| **A05** Injection | SQLi, XSS, CMDi | L7 Zod + Prisma params | ✅ |
| **A06** Insecure Design | Race conditions | L9 Transactions | ✅ |
| **A07** Auth Failures | Session mgmt | L5 Supabase Auth | ✅ |
| **A08** Integrity Failures | Unsigned data | L7 Validation | ✅ |
| **A09** Logging & Alerting | Blind spots | L0 Request ID + logger | ✅ |
| **A10** Exceptional Conditions | Error handling | L11 Error Sanitizer | ✅ |

---

## MITRE ATT&CK Mapping

| ATT&CK Phase | Attack Vector | Defense Layer |
|---|---|---|
| **Reconnaissance** | Tech stack fingerprinting | L1: No `X-Powered-By`, CSP |
| **Initial Access** | Stolen credentials | L5: JWT with short TTL |
| **Execution** | Code injection via input | L7: Zod strict schemas |
| **Persistence** | Malicious file upload | L8: Magic Bytes validation |
| **Privilege Escalation** | IDOR cross-tenant | L6: Tenant isolation + L10: RLS |
| **Defense Evasion** | Error message harvesting | L11: Error sanitization |
| **Collection** | Data exfiltration via API | L4: Rate limiting + L6: Tenancy |
| **Impact** | DoS via large payloads | L3: Body size limits |
| **Impact** | Race condition exploitation | L9: Serializable transactions |

---

## File Upload Security (4-Layer Validation)

```
Upload Request
    │
    ├── Layer 1: Extension Allowlist
    │   └── Only: .pdf, .png, .jpg, .jpeg, .gif, .webp, .zip, .xlsx, .docx, .csv, .txt
    │
    ├── Layer 2: MIME Type Allowlist
    │   └── Must match declared Content-Type against known safe types
    │
    ├── Layer 3: Size Limit
    │   └── Max 10MB per file
    │
    └── Layer 4: Magic Bytes Verification
        └── Read first 8 bytes, verify against known file signatures
        └── Detects: EXE-as-PDF, polyglot files, extension spoofing
```

---

## Atomic Operations

| Operation | Isolation Level | Rationale |
|---|---|---|
| Financial transactions | Serializable | Prevent double-spend |
| Deal stage transitions | ReadCommitted | Prevent TOCTOU race |
| MRR snapshot creation | ReadCommitted | Data consistency |
| Document uploads | ReadCommitted | Metadata integrity |

---

## Input Validation Rules

| Field Type | Max Length | Example |
|---|---|---|
| Short text (titles) | 500 chars | Deal title, role name |
| Long text (descriptions) | 10,000 chars | Notes, descriptions |
| Arrays | 100 items | Key results, BMC items |
| Numbers | Domain-specific | Salary: 1M, Valuation: 1T |
| UUIDs | 36 chars | Validated via `z.string().uuid()` |

---

## Security Test Coverage

| Test Suite | Tests | OWASP |
|---|---|---|
| `auth-bypass.test.ts` | 5 | A07 |
| `security-headers.test.ts` | 8 | A02 |
| `input-injection.test.ts` | 20+ | A05 |
| `body-limits.test.ts` | 4 | A02, A10 |
| `file-upload.test.ts` | 22 | A01, A05 |
| `rate-limiting.test.ts` | 3 | DoS |
| `error-leakage.test.ts` | 5 | A10 |
| **Total** | **67+** | Full OWASP |
