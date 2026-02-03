import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, desc, and, gte, isNull, like, or } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { requireAuth, requireRole } from "../middleware/auth"
import {
  users,
  profiles,
  subscriptions,
  plans,
  checkins,
  products,
  posSales,
} from "../db/schema"
import { cleanRut, formatRut } from "../lib/auth"

const receptionRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// All routes require admin or reception role
receptionRoutes.use("/*", requireAuth, requireRole("admin", "reception"))

// ============ CHECK-IN ============

// GET /reception/search - Search user by RUT for check-in
receptionRoutes.get("/search", async (c) => {
  const db = c.get("db")
  const query = c.req.query("q")

  if (!query || query.length < 3) {
    return c.json({ users: [] })
  }

  const cleanedQuery = cleanRut(query)

  const results = await db
    .select({
      id: users.id,
      rut: users.rut,
      profile: {
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      },
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(
      or(
        like(users.rut, `%${cleanedQuery}%`),
        like(profiles.firstName, `%${query}%`),
        like(profiles.lastName, `%${query}%`)
      )
    )
    .limit(10)

  return c.json({
    users: results.map((u) => ({
      ...u,
      rut: formatRut(u.rut),
    })),
  })
})

// GET /reception/user/:id - Get user info for check-in
receptionRoutes.get("/user/:id", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()

  const [user] = await db
    .select({
      id: users.id,
      rut: users.rut,
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

  // Get active subscription
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
        .where(
          and(
            eq(subscriptions.profileId, profile.id),
            eq(subscriptions.status, "active")
          )
        )
        .orderBy(desc(subscriptions.startDate))
        .limit(1)
        .then((r) => r[0])
    : null

  // Check if already checked in today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activeCheckin = profile
    ? await db
        .select()
        .from(checkins)
        .where(
          and(
            eq(checkins.profileId, profile.id),
            gte(checkins.checkedInAt, today),
            isNull(checkins.checkedOutAt)
          )
        )
        .limit(1)
        .then((r) => r[0])
    : null

  return c.json({
    user: { ...user, rut: formatRut(user.rut) },
    profile,
    subscription,
    activeCheckin,
    canCheckin: !!subscription && !activeCheckin,
  })
})

// POST /reception/checkin - Manual check-in
const checkinSchema = z.object({
  userId: z.string().uuid(),
})

receptionRoutes.post("/checkin", zValidator("json", checkinSchema), async (c) => {
  const db = c.get("db")
  const { userId } = c.req.valid("json")
  const receptionUser = c.get("user")!

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado" }, 404)
  }

  // Check subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.profileId, profile.id),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1)

  if (!subscription) {
    return c.json({ error: "Usuario sin membresía activa" }, 400)
  }

  // Check if already checked in
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [existing] = await db
    .select()
    .from(checkins)
    .where(
      and(
        eq(checkins.profileId, profile.id),
        gte(checkins.checkedInAt, today),
        isNull(checkins.checkedOutAt)
      )
    )
    .limit(1)

  if (existing) {
    return c.json({ error: "Ya tiene check-in activo" }, 400)
  }

  // Create check-in
  const [checkin] = await db
    .insert(checkins)
    .values({
      profileId: profile.id,
      method: "manual",
      checkedInBy: receptionUser.id,
    })
    .returning()

  return c.json({ checkin, message: "Check-in exitoso" })
})

// POST /reception/checkout - Manual check-out
receptionRoutes.post("/checkout", zValidator("json", checkinSchema), async (c) => {
  const db = c.get("db")
  const { userId } = c.req.valid("json")

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado" }, 404)
  }

  // Find active check-in
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [activeCheckin] = await db
    .select()
    .from(checkins)
    .where(
      and(
        eq(checkins.profileId, profile.id),
        gte(checkins.checkedInAt, today),
        isNull(checkins.checkedOutAt)
      )
    )
    .limit(1)

  if (!activeCheckin) {
    return c.json({ error: "No hay check-in activo" }, 400)
  }

  // Update check-out
  const [checkin] = await db
    .update(checkins)
    .set({ checkedOutAt: new Date() })
    .where(eq(checkins.id, activeCheckin.id))
    .returning()

  return c.json({ checkin, message: "Check-out exitoso" })
})

// GET /reception/today - Get today's check-ins
receptionRoutes.get("/today", async (c) => {
  const db = c.get("db")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayCheckins = await db
    .select({
      id: checkins.id,
      checkedInAt: checkins.checkedInAt,
      checkedOutAt: checkins.checkedOutAt,
      method: checkins.method,
      profile: {
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      },
      user: {
        rut: users.rut,
      },
    })
    .from(checkins)
    .innerJoin(profiles, eq(checkins.profileId, profiles.id))
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(gte(checkins.checkedInAt, today))
    .orderBy(desc(checkins.checkedInAt))

  const activeCount = todayCheckins.filter((c) => !c.checkedOutAt).length
  const totalCount = todayCheckins.length

  return c.json({
    checkins: todayCheckins.map((c) => ({
      ...c,
      user: { rut: formatRut(c.user.rut) },
    })),
    stats: {
      active: activeCount,
      total: totalCount,
    },
  })
})

// ============ POS / PRODUCTS ============

// GET /reception/products - List products for sale
receptionRoutes.get("/products", async (c) => {
  const db = c.get("db")

  const productsList = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.category, products.name)

  return c.json({ products: productsList })
})

// GET /reception/plans - List plans for sale
receptionRoutes.get("/plans", async (c) => {
  const db = c.get("db")

  const plansList = await db
    .select()
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(plans.sortOrder)

  return c.json({ plans: plansList })
})

// POST /reception/sale - Create a sale
const saleSchema = z.object({
  userId: z.string().uuid().optional(), // Optional for anonymous sales
  items: z.array(
    z.object({
      type: z.enum(["product", "plan"]),
      id: z.string().uuid(),
      quantity: z.number().int().positive().default(1),
    })
  ),
  paymentMethod: z.enum(["cash", "card", "transfer"]),
  notes: z.string().optional(),
})

receptionRoutes.post("/sale", zValidator("json", saleSchema), async (c) => {
  const db = c.get("db")
  const { userId, items, paymentMethod, notes } = c.req.valid("json")
  const receptionUser = c.get("user")!

  let totalAmount = 0
  const saleItems: Array<{
    productId?: string
    planId?: string
    quantity: number
    unitPrice: number
  }> = []

  // Calculate total and validate items
  for (const item of items) {
    if (item.type === "product") {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.id))
        .limit(1)

      if (!product) {
        return c.json({ error: `Producto ${item.id} no encontrado` }, 400)
      }

      totalAmount += product.priceClp * item.quantity
      saleItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.priceClp,
      })
    } else {
      const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, item.id))
        .limit(1)

      if (!plan) {
        return c.json({ error: `Plan ${item.id} no encontrado` }, 400)
      }

      totalAmount += plan.priceClp * item.quantity
      saleItems.push({
        planId: plan.id,
        quantity: item.quantity,
        unitPrice: plan.priceClp,
      })

      // If buying a plan, create subscription
      if (userId) {
        const [profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.userId, userId))
          .limit(1)

        if (profile) {
          const startDate = new Date()
          const endDate = new Date()
          endDate.setDate(endDate.getDate() + plan.durationDays)

          await db.insert(subscriptions).values({
            profileId: profile.id,
            planId: plan.id,
            status: "active",
            startDate,
            endDate,
          })
        }
      }
    }
  }

  // Get profile ID if user specified
  let profileId: string | null = null
  if (userId) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1)
    profileId = profile?.id ?? null
  }

  // Create sale record
  const [sale] = await db
    .insert(posSales)
    .values({
      profileId,
      soldById: receptionUser.id,
      items: saleItems,
      totalClp: totalAmount,
      paymentMethod,
      notes,
    })
    .returning()

  return c.json({
    sale,
    total: totalAmount,
    message: "Venta registrada exitosamente",
  })
})

export default receptionRoutes
