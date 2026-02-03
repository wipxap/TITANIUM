import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, desc, like, or, sql } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { requireAuth, requireRole } from "../middleware/auth"
import { users, profiles, subscriptions, plans, machines, checkins } from "../db/schema"

const adminRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// All routes require admin role
adminRoutes.use("/*", requireAuth, requireRole("admin"))

// ============ USERS ============

// GET /admin/users - List all users with profiles
adminRoutes.get("/users", async (c) => {
  const db = c.get("db")
  const search = c.req.query("search")
  const page = parseInt(c.req.query("page") || "1")
  const limit = parseInt(c.req.query("limit") || "20")
  const offset = (page - 1) * limit

  let query = db
    .select({
      id: users.id,
      rut: users.rut,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      profile: {
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        phone: profiles.phone,
      },
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset)

  if (search) {
    query = query.where(
      or(
        like(users.rut, `%${search}%`),
        like(users.email, `%${search}%`),
        like(profiles.firstName, `%${search}%`),
        like(profiles.lastName, `%${search}%`)
      )
    ) as typeof query
  }

  const usersList = await query

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)

  return c.json({
    users: usersList,
    pagination: {
      page,
      limit,
      total: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
    },
  })
})

// GET /admin/users/:id - Get user details with subscription
adminRoutes.get("/users/:id", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()

  const [user] = await db
    .select({
      id: users.id,
      rut: users.rut,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  if (!user) {
    return c.json({ error: "Usuario no encontrado" }, 404)
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, id))
    .limit(1)

  const subscription = profile
    ? await db
        .select({
          id: subscriptions.id,
          status: subscriptions.status,
          startDate: subscriptions.startDate,
          endDate: subscriptions.endDate,
          plan: {
            id: plans.id,
            name: plans.name,
          },
        })
        .from(subscriptions)
        .innerJoin(plans, eq(subscriptions.planId, plans.id))
        .where(eq(subscriptions.profileId, profile.id))
        .orderBy(desc(subscriptions.startDate))
        .limit(1)
        .then((r) => r[0])
    : null

  const recentCheckins = profile
    ? await db
        .select()
        .from(checkins)
        .where(eq(checkins.profileId, profile.id))
        .orderBy(desc(checkins.checkedInAt))
        .limit(10)
    : []

  return c.json({ user, profile, subscription, recentCheckins })
})

// PUT /admin/users/:id/role - Update user role
const updateRoleSchema = z.object({
  role: z.enum(["admin", "reception", "user"]),
})

adminRoutes.put("/users/:id/role", zValidator("json", updateRoleSchema), async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()
  const { role } = c.req.valid("json")

  const [updated] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, id))
    .returning()

  if (!updated) {
    return c.json({ error: "Usuario no encontrado" }, 404)
  }

  return c.json({ user: updated })
})

// ============ MACHINES ============

// GET /admin/machines - List all machines
adminRoutes.get("/machines", async (c) => {
  const db = c.get("db")

  const machinesList = await db
    .select()
    .from(machines)
    .orderBy(machines.muscleGroup, machines.name)

  return c.json({ machines: machinesList })
})

// POST /admin/machines - Create machine
const createMachineSchema = z.object({
  name: z.string().min(2),
  muscleGroup: z.enum(["chest", "back", "shoulders", "arms", "legs", "core", "cardio"]),
  description: z.string().optional(),
  instructions: z.string().optional(),
  videoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  quantity: z.number().int().positive().default(1),
})

adminRoutes.post("/machines", zValidator("json", createMachineSchema), async (c) => {
  const db = c.get("db")
  const data = c.req.valid("json")

  const [machine] = await db
    .insert(machines)
    .values(data)
    .returning()

  return c.json({ machine }, 201)
})

// PUT /admin/machines/:id - Update machine
adminRoutes.put("/machines/:id", zValidator("json", createMachineSchema.partial()), async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()
  const data = c.req.valid("json")

  const [machine] = await db
    .update(machines)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(machines.id, id))
    .returning()

  if (!machine) {
    return c.json({ error: "Máquina no encontrada" }, 404)
  }

  return c.json({ machine })
})

// DELETE /admin/machines/:id - Delete machine
adminRoutes.delete("/machines/:id", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()

  const [deleted] = await db
    .delete(machines)
    .where(eq(machines.id, id))
    .returning()

  if (!deleted) {
    return c.json({ error: "Máquina no encontrada" }, 404)
  }

  return c.json({ success: true })
})

// ============ PLANS ============

// GET /admin/plans - List all plans
adminRoutes.get("/plans", async (c) => {
  const db = c.get("db")

  const plansList = await db
    .select()
    .from(plans)
    .orderBy(plans.sortOrder)

  return c.json({ plans: plansList })
})

// POST /admin/plans - Create plan
const createPlanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  priceClp: z.number().int().positive(),
  durationDays: z.number().int().positive(),
  features: z.array(z.string()).optional(),
  sortOrder: z.number().int().default(0),
})

adminRoutes.post("/plans", zValidator("json", createPlanSchema), async (c) => {
  const db = c.get("db")
  const data = c.req.valid("json")

  const [plan] = await db
    .insert(plans)
    .values(data)
    .returning()

  return c.json({ plan }, 201)
})

// PUT /admin/plans/:id - Update plan
adminRoutes.put("/plans/:id", zValidator("json", createPlanSchema.partial()), async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()
  const data = c.req.valid("json")

  const [plan] = await db
    .update(plans)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(plans.id, id))
    .returning()

  if (!plan) {
    return c.json({ error: "Plan no encontrado" }, 404)
  }

  return c.json({ plan })
})

// DELETE /admin/plans/:id - Delete plan
adminRoutes.delete("/plans/:id", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()

  const [deleted] = await db
    .delete(plans)
    .where(eq(plans.id, id))
    .returning()

  if (!deleted) {
    return c.json({ error: "Plan no encontrado" }, 404)
  }

  return c.json({ success: true })
})

export default adminRoutes
