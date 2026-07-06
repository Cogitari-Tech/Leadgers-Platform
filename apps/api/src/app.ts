import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { securityHeaders } from "./middleware/security-headers";
import { requestId } from "./middleware/request-id";
import { bodyLimit } from "./middleware/body-limit";
import { errorHandler } from "./middleware/error-handler";
import { rateLimiter } from "./middleware/rate-limiter";
import runwayRoutes from "./routes/finance/runway";
import unitEconomicsRoutes from "./routes/finance/unit-economics";
import burnRateRoutes from "./routes/finance/burn-rate";
import analyzeRoutes from "./routes/ai/analyze";
import weeklyDigestRoutes from "./routes/ai/weekly-digest";
import aiConfigRoutes from "./routes/ai/config";
import capTableRoutes from "./routes/finance/cap-table";
import { inngestRoutes } from "./routes/inngest";
import healthScoreRoutes from "./routes/strategic/health-score";
import northStarRoutes from "./routes/strategic/north-star";
import bmcRoutes from "./routes/strategic/bmc";
import okrsRoutes from "./routes/strategic/okrs";
import milestonesRoutes from "./routes/strategic/milestones";
import techDebtRoutes from "./routes/product/tech-debt";
import roadmapRoutes from "./routes/product/roadmap";
import headcountRoutes from "./routes/people/headcount";
import salesRoutes from "./routes/sales/deals";
import billingRoutes from "./routes/billing";
import investorRoutes from "./routes/investor";

const app = new Hono();

// ─── Layer 0: Request Tracking ───────────────────────────
app.use("*", requestId);

// ─── Layer 1: Observability ──────────────────────────────
app.use("*", logger());

// ─── Layer 2: Security Headers ───────────────────────────
app.use("*", securityHeaders);

// ─── Layer 3: CORS ───────────────────────────────────────
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-tenant-id"],
  }),
);

// ─── Layer 4: Body Size Limits ───────────────────────────
app.use("/api/*", bodyLimit({ maxSize: 1_048_576 })); // 1MB default

// ─── Layer 5: Rate Limiting ─────────────────────────────
app.use("/api/*", rateLimiter({ max: 60, windowMs: 60_000 }));
app.use("/api/ai/*", rateLimiter({ max: 10, windowMs: 60_000 }));

// ─── Layer 6: Global Error Handler ──────────────────────
app.onError(errorHandler);

// ─── Health Check ────────────────────────────────────────
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────
app.route("/api/finance/runway", runwayRoutes);
app.route("/api/finance/unit-economics", unitEconomicsRoutes);
app.route("/api/finance/burn-rate", burnRateRoutes);
app.route("/api/finance/cap-table", capTableRoutes);
app.route("/api/ai/analyze", analyzeRoutes);
app.route("/api/ai/weekly-digest", weeklyDigestRoutes);
app.route("/api/ai/config", aiConfigRoutes);
app.route("/api/strategic/health-score", healthScoreRoutes);
app.route("/api/strategic/north-star", northStarRoutes);
app.route("/api/strategic/bmc", bmcRoutes);
app.route("/api/strategic/okrs", okrsRoutes);
app.route("/api/strategic/milestones", milestonesRoutes);
app.route("/api/product/tech-debt", techDebtRoutes);
app.route("/api/product/roadmap", roadmapRoutes);
app.route("/api/people/headcount", headcountRoutes);
app.route("/api/sales", salesRoutes);
app.route("/api/billing", billingRoutes);
app.route("/api/investor", investorRoutes);

app.on(["GET", "POST", "PUT"], "/api/inngest", (c) => inngestRoutes(c));

export default app;
