import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import type { Env, Variables } from "./types"
import { initMiddleware, sessionMiddleware } from "./middleware/auth"

// Routes
import authRoutes from "./routes/auth"
import publicRoutes from "./routes/public"
import userRoutes from "./routes/user"
import adminRoutes from "./routes/admin"
import receptionRoutes from "./routes/reception"
import routinesRoutes from "./routes/routines"
import loyaltyRoutes from "./routes/loyalty"
import familyRoutes from "./routes/family"
import contractsRoutes from "./routes/contracts"
import reportsRoutes from "./routes/reports"

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// CORS origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://titaniumgym.cl",
  "https://titanium-bbt.pages.dev",
]

// CORS middleware
app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
)

// Global middleware
app.use("*", logger())

// Initialize DB and Auth
app.use("*", initMiddleware)
app.use("*", sessionMiddleware)

// Health check
app.get("/", (c) => {
  return c.json({
    name: "Titanium Gym API",
    version: "0.0.1",
    status: "ok",
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.route("/auth", authRoutes)
app.route("/public", publicRoutes)
app.route("/user", userRoutes)
app.route("/admin", adminRoutes)
app.route("/reception", receptionRoutes)
app.route("/routines", routinesRoutes)
app.route("/loyalty", loyaltyRoutes)
app.route("/family", familyRoutes)
app.route("/contracts", contractsRoutes)
app.route("/reports", reportsRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error("Error:", err)
  return c.json(
    {
      error: "Internal server error",
      message: c.env.ENVIRONMENT === "development" ? err.message : undefined,
    },
    500
  )
})

export default app
