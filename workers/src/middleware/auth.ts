import { createMiddleware } from "hono/factory"
import type { Env, Variables } from "../types"
import { createDb } from "../db"
import { createAuth } from "../lib/auth"

// Initialize DB and Auth - Hyperdrive (Workers) or DATABASE_URL (Node.js)
export const initMiddleware = createMiddleware<{
  Bindings: Env
  Variables: Variables
}>(async (c, next) => {
  const connectionString = c.env.HYPERDRIVE?.connectionString || c.env.DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("No database connection string available")
  }
  const db = createDb(connectionString)
  const auth = createAuth(db)

  c.set("db", db)
  c.set("auth", auth)

  await next()
})

// Session middleware
export const sessionMiddleware = createMiddleware<{
  Bindings: Env
  Variables: Variables
}>(async (c, next) => {
  const auth = c.get("auth")
  const sessionId = c.req.header("Authorization")?.replace("Bearer ", "") ?? null

  if (!sessionId) {
    c.set("user", null)
    c.set("session", null)
    return next()
  }

  const { session, user } = await auth.validateSession(sessionId)

  c.set("user", user)
  c.set("session", session)

  await next()
})

// Require auth middleware
export const requireAuth = createMiddleware<{
  Bindings: Env
  Variables: Variables
}>(async (c, next) => {
  const user = c.get("user")

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  await next()
})

// Require role middleware
export const requireRole = (...roles: Array<"admin" | "reception" | "instructor" | "user">) =>
  createMiddleware<{
    Bindings: Env
    Variables: Variables
  }>(async (c, next) => {
    const user = c.get("user")

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    if (!roles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403)
    }

    await next()
  })
