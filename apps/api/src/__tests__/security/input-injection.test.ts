import { describe, it, expect, vi } from "vitest";
import app from "../../app";

vi.mock("../../config/supabase", () => ({
  createScopedClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "user-123", email: "test@leadgers.com" } },
        error: null,
      }),
    },
  }),
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              data: [
                {
                  tenant_id: "tenant-aaa",
                  roles: { name: "admin" },
                  status: "active",
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    }),
  },
}));

vi.mock("../../config/prisma", () => ({
  prisma: {
    sales_opportunities: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "deal-1" }),
      update: vi.fn().mockResolvedValue({ id: "deal-1" }),
      delete: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn((fn: any) =>
      fn({
        sales_opportunities: {
          findFirst: vi.fn().mockResolvedValue(null),
          update: vi.fn().mockResolvedValue({ id: "deal-1" }),
        },
      }),
    ),
  },
}));

const AUTH_HEADERS = {
  Authorization: "Bearer valid-token",
  "x-tenant-id": "tenant-aaa",
  "Content-Type": "application/json",
};

describe("Input Injection Tests (OWASP A05)", () => {
  const sqlInjectionPayloads = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "1; SELECT * FROM information_schema.tables",
    "' UNION SELECT null, username, password FROM users--",
    "1' AND SLEEP(5)--",
    "admin'--",
  ];

  const xssPayloads = [
    '<script>alert("xss")</script>',
    "<img src=x onerror=alert(1)>",
    '"><svg onload=alert(1)>',
    "javascript:alert(1)",
    "<body onload=alert(1)>",
    "'-alert(1)-'",
  ];

  const commandInjectionPayloads = [
    "; ls -la",
    "| cat /etc/passwd",
    "$(whoami)",
    "`id`",
    "&& rm -rf /",
  ];

  describe("SQL Injection via POST body", () => {
    for (const payload of sqlInjectionPayloads) {
      it(`should handle SQL injection attempt: "${payload.substring(0, 30)}..."`, async () => {
        const res = await app.request("/api/sales/deals", {
          method: "POST",
          headers: AUTH_HEADERS,
          body: JSON.stringify({
            title: payload,
            value: 100,
          }),
        });

        // Should either succeed (Prisma parameterizes) or fail validation — never 500
        expect(res.status).not.toBe(500);
      });
    }
  });

  describe("XSS via POST body", () => {
    for (const payload of xssPayloads) {
      it(`should sanitize XSS attempt: "${payload.substring(0, 30)}..."`, async () => {
        const res = await app.request("/api/sales/deals", {
          method: "POST",
          headers: AUTH_HEADERS,
          body: JSON.stringify({
            title: payload,
            value: 0,
          }),
        });

        // X-Content-Type-Options should be set
        expect(res.headers.get("x-content-type-options")).toBe("nosniff");

        if (res.status === 200 || res.status === 201) {
          const body = await res.json();
          // Stored XSS check: the response should not contain unescaped script tags
          const bodyStr = JSON.stringify(body);
          expect(bodyStr).not.toContain("<script>");
        }
      });
    }
  });

  describe("Command Injection via POST body", () => {
    for (const payload of commandInjectionPayloads) {
      it(`should handle command injection: "${payload.substring(0, 20)}..."`, async () => {
        const res = await app.request("/api/sales/deals", {
          method: "POST",
          headers: AUTH_HEADERS,
          body: JSON.stringify({
            title: payload,
            value: 0,
          }),
        });

        expect(res.status).not.toBe(500);
      });
    }
  });

  describe("Oversized input rejection", () => {
    it("should reject title exceeding max length", async () => {
      const res = await app.request("/api/sales/deals", {
        method: "POST",
        headers: AUTH_HEADERS,
        body: JSON.stringify({
          title: "A".repeat(10001),
          value: 0,
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should reject notes exceeding max length", async () => {
      const res = await app.request("/api/sales/deals", {
        method: "POST",
        headers: AUTH_HEADERS,
        body: JSON.stringify({
          title: "Test Deal",
          value: 0,
          notes: "A".repeat(50001),
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should reject numeric fields exceeding maximum", async () => {
      const res = await app.request("/api/sales/deals", {
        method: "POST",
        headers: AUTH_HEADERS,
        body: JSON.stringify({
          title: "Test Deal",
          value: 999_999_999_999_999,
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("Deeply nested object attack", () => {
    it("should reject deeply nested JSON", async () => {
      let payload: any = { title: "test" };
      for (let i = 0; i < 100; i++) {
        payload = { nested: payload };
      }

      const res = await app.request("/api/sales/deals", {
        method: "POST",
        headers: AUTH_HEADERS,
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(400);
    });
  });
});
