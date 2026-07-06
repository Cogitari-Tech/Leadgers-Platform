import { vi } from "vitest";

// Mock Stripe before any module loads it
vi.mock("stripe", () => {
  function MockStripe() {
    return {
      customers: { create: vi.fn().mockResolvedValue({ id: "cus_mock" }) },
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({ url: "https://mock.stripe.com" }),
        },
      },
      webhooks: {
        constructEvent: vi.fn().mockReturnValue({ type: "test", data: {} }),
      },
    };
  }
  return { default: MockStripe };
});

// Mock @leadgers/core subpaths
vi.mock("@leadgers/core/entities/Transaction", () => ({
  Transaction: class {},
}));
vi.mock("@leadgers/core/entities/Account", () => ({ Account: class {} }));
vi.mock("@leadgers/core/repositories/IFinanceRepository", () => ({}));

// Mock Supabase config
vi.mock("./config/supabase", () => ({
  createScopedClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: new Error("mock"),
      }),
    },
  }),
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              limit: () => ({
                maybeSingle: () => ({ data: null, error: null }),
              }),
              data: [],
              error: null,
            }),
          }),
        }),
      }),
      update: () => ({
        eq: () => ({ data: null, error: null }),
      }),
    }),
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: new Error("mock"),
      }),
    },
  },
}));
