import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { AppEnv } from "../../types/env";

const { mockFindMany, mockFindFirst, mockCreate, mockUpdate, mockDelete } =
  vi.hoisted(() => ({
    mockFindMany: vi.fn(),
    mockFindFirst: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
  }));

vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    investor_updates = {
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    };
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

import { updatesRouter } from "./updates";

type UserRole = "owner" | "admin" | "manager" | "member" | "viewer";
const authState: { role: UserRole } = { role: "owner" };

describe("Investor Updates API", () => {
  let app: Hono<AppEnv>;

  beforeEach(() => {
    app = new Hono<AppEnv>();
    app.use("*", async (c, next) => {
      c.set("tenantId", "tenant-123");
      c.set("user", { id: "user-123" } as never);
      c.set("userRole", authState.role);
      await next();
    });
    app.route("/", updatesRouter);
    vi.clearAllMocks();
    authState.role = "owner";
  });

  it("should list updates scoped to the tenant", async () => {
    mockFindMany.mockResolvedValue([{ id: "u1", title: "Update Q2" }]);

    const res = await app.request("/");
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { tenant_id: "tenant-123" },
      orderBy: { created_at: "desc" },
    });
  });

  it("should create a draft update with server-derived tenant and author", async () => {
    mockCreate.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "u1", ...data }),
    );

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Update Q2",
        content_md: "# Highlights\nMRR cresceu.",
        period: "2026-Q2",
      }),
    });

    expect(res.status).toBe(201);
    const args = mockCreate.mock.calls[0][0];
    expect(args.data.tenant_id).toBe("tenant-123");
    expect(args.data.created_by).toBe("user-123");
    expect(args.data.status).toBe("draft");
  });

  it("should reject writes for non-admin roles", async () => {
    authState.role = "viewer";

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Update Q2",
        content_md: "conteúdo",
        period: "2026-Q2",
      }),
    });

    expect(res.status).toBe(403);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("should reject invalid payloads", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "", content_md: "x" }),
    });

    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("should patch only updates belonging to the tenant", async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await app.request("/u-other", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Hijack" }),
    });

    expect(res.status).toBe(404);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should publish an update setting status and published_at", async () => {
    mockFindFirst.mockResolvedValue({ id: "u1", tenant_id: "tenant-123" });
    mockUpdate.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "u1", ...data }),
    );

    const res = await app.request("/u1/publish", { method: "POST" });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe("published");
    const args = mockUpdate.mock.calls[0][0];
    expect(args.where).toEqual({ id: "u1", tenant_id: "tenant-123" });
    expect(args.data.published_at).toBeTruthy();
  });

  it("should delete scoped to the tenant", async () => {
    mockFindFirst.mockResolvedValue({ id: "u1", tenant_id: "tenant-123" });
    mockDelete.mockResolvedValue({ id: "u1" });

    const res = await app.request("/u1", { method: "DELETE" });

    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: "u1", tenant_id: "tenant-123" },
    });
  });
});
