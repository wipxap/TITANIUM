import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, desc, and, gte, isNull, like, or, count } from "drizzle-orm"
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
import { calculateLoyaltyDiscount } from "./loyalty"

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

  // Check subscription with plan details
  const subscriptionWithPlan = await db
    .select({
      subscription: subscriptions,
      plan: plans,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.profileId, profile.id),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1)
    .then((r) => r[0])

  if (!subscriptionWithPlan) {
    return c.json({ error: "Usuario sin membresía activa" }, 400)
  }

  const { subscription, plan } = subscriptionWithPlan

  // Validate time restrictions (using Chile timezone)
  if (plan.allowedTimeStart && plan.allowedTimeEnd) {
    const now = new Date()
    const chileTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Santiago" }))
    const currentTime = `${String(chileTime.getHours()).padStart(2, "0")}:${String(chileTime.getMinutes()).padStart(2, "0")}`

    if (currentTime < plan.allowedTimeStart || currentTime > plan.allowedTimeEnd) {
      return c.json({
        error: `Tu plan solo permite acceso entre ${plan.allowedTimeStart} y ${plan.allowedTimeEnd}`,
      }, 400)
    }
  }

  // Validate sessions remaining
  if (plan.totalSessions !== null && subscription.sessionsRemaining !== null) {
    if (subscription.sessionsRemaining <= 0) {
      return c.json({ error: "No tienes sesiones disponibles en tu plan" }, 400)
    }
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

  // Decrement sessions if plan has limited sessions
  if (plan.totalSessions !== null && subscription.sessionsRemaining !== null) {
    await db
      .update(subscriptions)
      .set({ sessionsRemaining: subscription.sessionsRemaining - 1 })
      .where(eq(subscriptions.id, subscription.id))
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

  return c.json({
    checkin,
    message: "Check-in exitoso",
    sessionsRemaining: plan.totalSessions !== null ? (subscription.sessionsRemaining ?? 0) - 1 : null,
  })
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

  // Increment loyalty days on active subscription (except daily passes)
  const activeSubscription = await db
    .select({
      subscription: subscriptions,
      plan: plans,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.profileId, profile.id),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1)
    .then((r) => r[0])

  if (activeSubscription && !activeSubscription.plan.isDailyPass) {
    await db
      .update(subscriptions)
      .set({
        loyaltyDaysAccumulated: (activeSubscription.subscription.loyaltyDaysAccumulated ?? 0) + 1,
      })
      .where(eq(subscriptions.id, activeSubscription.subscription.id))
  }

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

// ============ SUBSCRIPTION VERIFICATION ============

// GET /reception/user/:id/subscription - Get user subscription details
receptionRoutes.get("/user/:id/subscription", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, id))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado" }, 404)
  }

  // Get active or most recent subscription
  const subscription = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      paidAmount: subscriptions.paidAmount,
      paymentMethod: subscriptions.paymentMethod,
      plan: {
        id: plans.id,
        name: plans.name,
        priceClp: plans.priceClp,
        durationDays: plans.durationDays,
        features: plans.features,
      },
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(eq(subscriptions.profileId, profile.id))
    .orderBy(desc(subscriptions.startDate))
    .limit(1)
    .then((r) => r[0])

  if (!subscription) {
    return c.json({
      subscription: null,
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: true,
      canRenew: true,
    })
  }

  const now = new Date()
  const endDate = new Date(subscription.endDate)
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysRemaining <= 0 || subscription.status !== "active"
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7

  return c.json({
    subscription,
    daysRemaining: Math.max(0, daysRemaining),
    isExpiringSoon,
    isExpired,
    canRenew: isExpired || isExpiringSoon,
  })
})

// POST /reception/renew - Renew a subscription
const renewSchema = z.object({
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  paymentMethod: z.enum(["cash", "webpay", "transfer"]),
  notes: z.string().optional(),
})

receptionRoutes.post("/renew", zValidator("json", renewSchema), async (c) => {
  const db = c.get("db")
  const { userId, planId, paymentMethod, notes } = c.req.valid("json")
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

  // Get plan
  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.id, planId))
    .limit(1)

  if (!plan) {
    return c.json({ error: "Plan no encontrado" }, 404)
  }

  // Validate max purchases per user
  if (plan.maxPurchasesPerUser !== null) {
    const [purchaseCount] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.profileId, profile.id),
          eq(subscriptions.planId, plan.id)
        )
      )

    if (purchaseCount.count >= plan.maxPurchasesPerUser) {
      return c.json({
        error: `Este plan solo permite ${plan.maxPurchasesPerUser} compra(s) por usuario`,
      }, 400)
    }
  }

  // Get current active subscription
  const currentSubscription = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.profileId, profile.id),
        eq(subscriptions.status, "active")
      )
    )
    .orderBy(desc(subscriptions.endDate))
    .limit(1)
    .then((r) => r[0])

  // Calculate start date
  let startDate: Date
  const now = new Date()

  if (currentSubscription) {
    const currentEndDate = new Date(currentSubscription.endDate)
    // If current subscription hasn't expired yet, start from its end date
    if (currentEndDate > now) {
      startDate = currentEndDate
    } else {
      // If expired, start from today
      startDate = now
    }

    // Mark old subscription as expired if it's past its end date
    if (currentEndDate <= now) {
      await db
        .update(subscriptions)
        .set({ status: "expired" })
        .where(eq(subscriptions.id, currentSubscription.id))
    }
  } else {
    startDate = now
  }

  // Calculate end date
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + plan.durationDays)

  // Calculate sessions reset date if plan has limited sessions
  let sessionsResetDate: Date | null = null
  if (plan.sessionsPerPeriod) {
    sessionsResetDate = new Date(startDate)
    sessionsResetDate.setMonth(sessionsResetDate.getMonth() + 1) // Reset monthly
  }

  // Calculate loyalty discount (skip for daily passes)
  let loyaltyDiscount = { discountPercent: 0, levelName: null as string | null }
  let accumulatedDays = 0
  if (!plan.isDailyPass) {
    loyaltyDiscount = await calculateLoyaltyDiscount(db, profile.id)
    // Get accumulated days from previous subscription
    accumulatedDays = currentSubscription?.loyaltyDaysAccumulated ?? 0
  }

  // Calculate final price with loyalty discount
  const discountAmount = Math.round((plan.priceClp * loyaltyDiscount.discountPercent) / 100)
  const finalPrice = plan.priceClp - discountAmount

  // Create new subscription
  const [newSubscription] = await db
    .insert(subscriptions)
    .values({
      profileId: profile.id,
      planId: plan.id,
      status: "active",
      startDate,
      endDate,
      paidAmount: finalPrice,
      paymentMethod,
      // Initialize sessions if plan has limited sessions
      sessionsRemaining: plan.totalSessions ?? plan.sessionsPerPeriod ?? null,
      sessionsResetDate,
      // Loyalty tracking
      loyaltyDaysAccumulated: accumulatedDays,
      discountApplied: loyaltyDiscount.discountPercent > 0 ? loyaltyDiscount.discountPercent : null,
    })
    .returning()

  // Create sale record
  const [sale] = await db
    .insert(posSales)
    .values({
      profileId: profile.id,
      soldById: receptionUser.id,
      items: [
        {
          planId: plan.id,
          quantity: 1,
          unitPrice: plan.priceClp,
        },
      ],
      totalClp: finalPrice,
      paymentMethod,
      notes: notes || `Renovación de membresía - ${plan.name}${loyaltyDiscount.levelName ? ` (Descuento ${loyaltyDiscount.levelName}: ${loyaltyDiscount.discountPercent}%)` : ""}`,
    })
    .returning()

  return c.json({
    subscription: {
      ...newSubscription,
      plan: {
        id: plan.id,
        name: plan.name,
        features: plan.features,
      },
    },
    sale,
    isRenewal: !!currentSubscription,
    loyalty: {
      levelName: loyaltyDiscount.levelName,
      discountPercent: loyaltyDiscount.discountPercent,
      discountAmount,
      originalPrice: plan.priceClp,
      finalPrice,
    },
    message: currentSubscription ? "Membresía renovada exitosamente" : "Membresía activada exitosamente",
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

      // Validate max purchases per user
      if (plan.maxPurchasesPerUser !== null && userId) {
        const [userProfile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.userId, userId))
          .limit(1)

        if (userProfile) {
          const [purchaseCount] = await db
            .select({ count: count() })
            .from(subscriptions)
            .where(
              and(
                eq(subscriptions.profileId, userProfile.id),
                eq(subscriptions.planId, plan.id)
              )
            )

          if (purchaseCount.count >= plan.maxPurchasesPerUser) {
            return c.json({
              error: `Este plan solo permite ${plan.maxPurchasesPerUser} compra(s) por usuario`,
            }, 400)
          }
        }
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

          // Calculate sessions reset date if plan has limited sessions
          let sessionsResetDate: Date | null = null
          if (plan.sessionsPerPeriod) {
            sessionsResetDate = new Date(startDate)
            sessionsResetDate.setMonth(sessionsResetDate.getMonth() + 1)
          }

          await db.insert(subscriptions).values({
            profileId: profile.id,
            planId: plan.id,
            status: "active",
            startDate,
            endDate,
            // Initialize sessions if plan has limited sessions
            sessionsRemaining: plan.totalSessions ?? plan.sessionsPerPeriod ?? null,
            sessionsResetDate,
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
