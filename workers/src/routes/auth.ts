import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { users, profiles } from "../db/schema"
import { hashPassword, verifyPassword } from "../lib/password"
import { validateRut, cleanRut, formatRut } from "../lib/auth"
import { generateId } from "lucia"

const auth = new Hono<{ Bindings: Env; Variables: Variables }>()

// Login schema
const loginSchema = z.object({
  rut: z.string().min(8).max(12),
  password: z.string().min(6),
})

// Register schema
const registerSchema = z.object({
  rut: z.string().min(8).max(12),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

// POST /auth/login
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { rut, password } = c.req.valid("json")
  const db = c.get("db")
  const lucia = c.get("auth")

  // Validate RUT format
  if (!validateRut(rut)) {
    return c.json({ error: "RUT inválido" }, 400)
  }

  const cleanedRut = cleanRut(rut)

  // Find user by RUT
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.rut, cleanedRut))
    .limit(1)

  if (!user) {
    return c.json({ error: "Credenciales inválidas" }, 401)
  }

  // Verify password
  const validPassword = await verifyPassword(user.hashedPassword, password)
  if (!validPassword) {
    return c.json({ error: "Credenciales inválidas" }, 401)
  }

  // Create session
  const session = await lucia.createSession(user.id, {})

  return c.json({
    token: session.id,
    user: {
      id: user.id,
      rut: formatRut(user.rut),
      email: user.email,
      role: user.role,
    },
  })
})

// POST /auth/register
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const { rut, password, firstName, lastName, email, phone } = c.req.valid("json")
  const db = c.get("db")
  const lucia = c.get("auth")

  // Validate RUT
  if (!validateRut(rut)) {
    return c.json({ error: "RUT inválido" }, 400)
  }

  const cleanedRut = cleanRut(rut)

  // Check if user exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.rut, cleanedRut))
    .limit(1)

  if (existingUser) {
    return c.json({ error: "El RUT ya está registrado" }, 400)
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      rut: cleanedRut,
      email: email ?? null,
      hashedPassword,
      role: "user",
    })
    .returning()

  // Create profile
  await db.insert(profiles).values({
    userId: newUser.id,
    firstName,
    lastName,
    phone: phone ?? null,
  })

  // Create session
  const session = await lucia.createSession(newUser.id, {})

  return c.json({
    token: session.id,
    user: {
      id: newUser.id,
      rut: formatRut(newUser.rut),
      email: newUser.email,
      role: newUser.role,
    },
  })
})

// POST /auth/logout
auth.post("/logout", async (c) => {
  const lucia = c.get("auth")
  const session = c.get("session")

  if (session) {
    await lucia.invalidateSession(session.id)
  }

  return c.json({ success: true })
})

// GET /auth/me
auth.get("/me", async (c) => {
  const user = c.get("user")
  const db = c.get("db")

  if (!user) {
    return c.json({ error: "No autenticado" }, 401)
  }

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  return c.json({
    user: {
      id: user.id,
      rut: formatRut(user.rut),
      email: user.email,
      role: user.role,
    },
    profile: profile ?? null,
  })
})

export default auth
