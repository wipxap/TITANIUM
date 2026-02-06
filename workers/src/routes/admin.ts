import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, desc, like, or, sql, and, gte, lte, isNull } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { requireAuth, requireRole } from "../middleware/auth"
import { users, profiles, subscriptions, plans, machines, checkins, voidRequests, posSales, cashRegisters, gymSpaces, renewalDiscounts } from "../db/schema"
import { formatRut } from "../lib/auth"
import { getBirthdayUsers } from "../lib/birthdays"

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
  floor: z.number().int().positive().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
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

// ============ VOID REQUESTS ============

// GET /admin/void-requests - List void requests
adminRoutes.get("/void-requests", async (c) => {
  const db = c.get("db")
  const status = c.req.query("status") || "pending" // pending, approved, rejected, all

  const conditions: any[] = []
  if (status !== "all") {
    conditions.push(eq(voidRequests.status, status as any))
  }

  const requests = await db
    .select({
      id: voidRequests.id,
      reason: voidRequests.reason,
      status: voidRequests.status,
      adminNotes: voidRequests.adminNotes,
      createdAt: voidRequests.createdAt,
      reviewedAt: voidRequests.reviewedAt,
      sale: {
        id: posSales.id,
        receiptNumber: posSales.receiptNumber,
        totalClp: posSales.totalClp,
        paymentMethod: posSales.paymentMethod,
        items: posSales.items,
        createdAt: posSales.createdAt,
      },
      requestedBy: {
        id: users.id,
        rut: users.rut,
      },
    })
    .from(voidRequests)
    .innerJoin(posSales, eq(voidRequests.saleId, posSales.id))
    .innerJoin(users, eq(voidRequests.requestedById, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(voidRequests.createdAt))

  // Get requester profiles
  const requestsWithProfiles = await Promise.all(
    requests.map(async (r) => {
      const [profile] = await db
        .select({
          firstName: profiles.firstName,
          lastName: profiles.lastName,
        })
        .from(profiles)
        .where(eq(profiles.userId, r.requestedBy.id))
        .limit(1)

      return {
        ...r,
        requestedBy: {
          ...r.requestedBy,
          rut: formatRut(r.requestedBy.rut),
          name: profile ? `${profile.firstName} ${profile.lastName}` : "N/A",
        },
      }
    })
  )

  return c.json({ voidRequests: requestsWithProfiles })
})

// POST /admin/void-requests/:id/approve - Approve void request
const approveVoidSchema = z.object({
  adminNotes: z.string().optional(),
})

adminRoutes.post("/void-requests/:id/approve", zValidator("json", approveVoidSchema), async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()
  const { adminNotes } = c.req.valid("json")
  const adminUser = c.get("user")!

  // Get void request with sale
  const [request] = await db
    .select({
      id: voidRequests.id,
      saleId: voidRequests.saleId,
      status: voidRequests.status,
    })
    .from(voidRequests)
    .where(eq(voidRequests.id, id))
    .limit(1)

  if (!request) {
    return c.json({ error: "Solicitud no encontrada" }, 404)
  }

  if (request.status !== "pending") {
    return c.json({ error: "Esta solicitud ya fue procesada" }, 400)
  }

  // Get sale with items to check for plans
  const [sale] = await db
    .select()
    .from(posSales)
    .where(eq(posSales.id, request.saleId))
    .limit(1)

  if (!sale) {
    return c.json({ error: "Venta no encontrada" }, 404)
  }

  // Update void request
  const [updatedRequest] = await db
    .update(voidRequests)
    .set({
      status: "approved",
      reviewedById: adminUser.id,
      reviewedAt: new Date(),
      adminNotes,
    })
    .where(eq(voidRequests.id, id))
    .returning()

  // Update sale status
  await db
    .update(posSales)
    .set({ status: "voided" })
    .where(eq(posSales.id, request.saleId))

  // If sale included a plan, cancel the subscription
  const items = sale.items as Array<{ planId?: string; productId?: string; quantity: number; unitPrice: number }> | null
  if (items && sale.profileId) {
    const planItems = items.filter((item) => item.planId)
    for (const planItem of planItems) {
      // Find and cancel the subscription created by this sale
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.profileId, sale.profileId),
            eq(subscriptions.planId, planItem.planId!),
            eq(subscriptions.status, "active")
          )
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(1)

      if (subscription) {
        await db
          .update(subscriptions)
          .set({ status: "cancelled" })
          .where(eq(subscriptions.id, subscription.id))
      }
    }
  }

  return c.json({
    voidRequest: updatedRequest,
    message: "Solicitud aprobada. La venta ha sido anulada.",
  })
})

// POST /admin/void-requests/:id/reject - Reject void request
const rejectVoidSchema = z.object({
  adminNotes: z.string().min(1, "Debe proporcionar una razón para el rechazo"),
})

adminRoutes.post("/void-requests/:id/reject", zValidator("json", rejectVoidSchema), async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()
  const { adminNotes } = c.req.valid("json")
  const adminUser = c.get("user")!

  // Get void request
  const [request] = await db
    .select()
    .from(voidRequests)
    .where(eq(voidRequests.id, id))
    .limit(1)

  if (!request) {
    return c.json({ error: "Solicitud no encontrada" }, 404)
  }

  if (request.status !== "pending") {
    return c.json({ error: "Esta solicitud ya fue procesada" }, 400)
  }

  // Update void request
  const [updatedRequest] = await db
    .update(voidRequests)
    .set({
      status: "rejected",
      reviewedById: adminUser.id,
      reviewedAt: new Date(),
      adminNotes,
    })
    .where(eq(voidRequests.id, id))
    .returning()

  // Revert sale status to completed
  await db
    .update(posSales)
    .set({ status: "completed" })
    .where(eq(posSales.id, request.saleId))

  return c.json({
    voidRequest: updatedRequest,
    message: "Solicitud rechazada. La venta permanece activa.",
  })
})

// ============ CASH REGISTERS ============

// GET /admin/cash-registers - List cash registers for supervision
adminRoutes.get("/cash-registers", async (c) => {
  const db = c.get("db")
  const page = parseInt(c.req.query("page") || "1")
  const limit = parseInt(c.req.query("limit") || "20")
  const startDate = c.req.query("startDate")
  const endDate = c.req.query("endDate")
  const onlyWithDifferences = c.req.query("onlyWithDifferences") === "true"
  const offset = (page - 1) * limit

  const conditions: any[] = []

  if (startDate) {
    conditions.push(gte(cashRegisters.openedAt, new Date(startDate)))
  }
  if (endDate) {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    conditions.push(lte(cashRegisters.openedAt, end))
  }

  if (onlyWithDifferences) {
    conditions.push(
      or(
        sql`${cashRegisters.cashDifference} != 0`,
        sql`${cashRegisters.cardDifference} != 0`,
        sql`${cashRegisters.transferDifference} != 0`
      )
    )
  }

  const registers = await db
    .select()
    .from(cashRegisters)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(cashRegisters.openedAt))
    .limit(limit)
    .offset(offset)

  // Get user info for each register
  const registersWithUsers = await Promise.all(
    registers.map(async (r) => {
      const [openedByUser] = await db
        .select({
          id: users.id,
          rut: users.rut,
          profile: {
            firstName: profiles.firstName,
            lastName: profiles.lastName,
          },
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(users.id, r.openedBy))
        .limit(1)

      let closedByUser = null
      if (r.closedBy) {
        const [user] = await db
          .select({
            id: users.id,
            rut: users.rut,
            profile: {
              firstName: profiles.firstName,
              lastName: profiles.lastName,
            },
          })
          .from(users)
          .leftJoin(profiles, eq(users.id, profiles.userId))
          .where(eq(users.id, r.closedBy))
          .limit(1)
        closedByUser = user
      }

      // Get sales count
      const [salesCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(posSales)
        .where(eq(posSales.cashRegisterId, r.id))

      return {
        ...r,
        openedByUser: openedByUser ? {
          id: openedByUser.id,
          rut: formatRut(openedByUser.rut),
          name: openedByUser.profile ? `${openedByUser.profile.firstName} ${openedByUser.profile.lastName}` : "N/A",
        } : null,
        closedByUser: closedByUser ? {
          id: closedByUser.id,
          rut: formatRut(closedByUser.rut),
          name: closedByUser.profile ? `${closedByUser.profile.firstName} ${closedByUser.profile.lastName}` : "N/A",
        } : null,
        salesCount: salesCount.count,
        totalDifference: (r.cashDifference || 0) + (r.cardDifference || 0) + (r.transferDifference || 0),
        isOpen: !r.closedAt,
      }
    })
  )

  // Get total count
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(cashRegisters)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  return c.json({
    cashRegisters: registersWithUsers,
    pagination: {
      page,
      limit,
      total: Number(totalResult.count),
      totalPages: Math.ceil(Number(totalResult.count) / limit),
    },
  })
})

// ============ SPACES ============

// GET /admin/spaces - List all spaces (including inactive)
adminRoutes.get("/spaces", async (c) => {
  const db = c.get("db")

  const spacesList = await db
    .select()
    .from(gymSpaces)
    .orderBy(gymSpaces.sortOrder)

  return c.json({ spaces: spacesList })
})

// POST /admin/spaces - Create space
const createSpaceSchema = z.object({
  name: z.string().min(2),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  floorNumber: z.number().int().min(1).max(10),
  imageUrl: z.string().url().optional(),
  features: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
})

adminRoutes.post("/spaces", zValidator("json", createSpaceSchema), async (c) => {
  const db = c.get("db")
  const data = c.req.valid("json")

  const [space] = await db
    .insert(gymSpaces)
    .values(data)
    .returning()

  return c.json({ space }, 201)
})

// PUT /admin/spaces/:id - Update space
adminRoutes.put("/spaces/:id", zValidator("json", createSpaceSchema.partial()), async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()
  const data = c.req.valid("json")

  const [space] = await db
    .update(gymSpaces)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(gymSpaces.id, id))
    .returning()

  if (!space) {
    return c.json({ error: "Espacio no encontrado" }, 404)
  }

  return c.json({ space })
})

// DELETE /admin/spaces/:id - Soft delete (isActive = false)
adminRoutes.delete("/spaces/:id", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()
  const hard = c.req.query("hard") === "true"

  if (hard) {
    const [deleted] = await db
      .delete(gymSpaces)
      .where(eq(gymSpaces.id, id))
      .returning()

    if (!deleted) {
      return c.json({ error: "Espacio no encontrado" }, 404)
    }

    return c.json({ success: true })
  }

  // Soft delete
  const [space] = await db
    .update(gymSpaces)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(gymSpaces.id, id))
    .returning()

  if (!space) {
    return c.json({ error: "Espacio no encontrado" }, 404)
  }

  return c.json({ success: true, space })
})

// ============ BIRTHDAYS ============

// GET /admin/birthdays?range=today|week
adminRoutes.get("/birthdays", async (c) => {
  const db = c.get("db")
  const range = (c.req.query("range") || "today") as "today" | "week"
  const result = await getBirthdayUsers(db, range)
  return c.json(result)
})

// ============ RENEWAL DISCOUNTS ============

// GET /admin/renewal-discounts
adminRoutes.get("/renewal-discounts", async (c) => {
  const db = c.get("db")

  const discounts = await db
    .select()
    .from(renewalDiscounts)
    .orderBy(desc(renewalDiscounts.createdAt))

  return c.json({ discounts })
})

// POST /admin/renewal-discounts
const createRenewalDiscountSchema = z.object({
  name: z.string().min(2),
  discountPercent: z.number().int().min(1).max(100),
  conditionType: z.enum(["expiring_soon", "expired"]),
  daysBeforeExpiry: z.number().int().min(1).optional(),
  daysAfterExpiry: z.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
})

adminRoutes.post("/renewal-discounts", zValidator("json", createRenewalDiscountSchema), async (c) => {
  const db = c.get("db")
  const data = c.req.valid("json")

  if (data.conditionType === "expiring_soon" && !data.daysBeforeExpiry) {
    return c.json({ error: "daysBeforeExpiry requerido para condición expiring_soon" }, 400)
  }
  if (data.conditionType === "expired" && !data.daysAfterExpiry) {
    return c.json({ error: "daysAfterExpiry requerido para condición expired" }, 400)
  }

  const [discount] = await db
    .insert(renewalDiscounts)
    .values(data)
    .returning()

  return c.json({ discount }, 201)
})

// PUT /admin/renewal-discounts/:id
adminRoutes.put("/renewal-discounts/:id", zValidator("json", createRenewalDiscountSchema.partial()), async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()
  const data = c.req.valid("json")

  const [discount] = await db
    .update(renewalDiscounts)
    .set(data)
    .where(eq(renewalDiscounts.id, id))
    .returning()

  if (!discount) {
    return c.json({ error: "Descuento no encontrado" }, 404)
  }

  return c.json({ discount })
})

// DELETE /admin/renewal-discounts/:id
adminRoutes.delete("/renewal-discounts/:id", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()

  const [deleted] = await db
    .delete(renewalDiscounts)
    .where(eq(renewalDiscounts.id, id))
    .returning()

  if (!deleted) {
    return c.json({ error: "Descuento no encontrado" }, 404)
  }

  return c.json({ success: true })
})

export default adminRoutes
