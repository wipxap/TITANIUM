import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, sql, desc, gte, lte, and, count } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { requireAuth, requireRole } from "../middleware/auth"
import {
  users,
  profiles,
  subscriptions,
  plans,
  posSales,
  checkins,
} from "../db/schema"

const reportsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// All routes require admin role
reportsRoutes.use("/*", requireAuth, requireRole("admin"))

// Helper: Get Chile timezone date boundaries
function getChileDate(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Santiago" })
  )
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getEndOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function getStartOfMonth(year: number, month: number): Date {
  return new Date(year, month - 1, 1)
}

function getEndOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0, 23, 59, 59, 999)
}

function getDaysAgo(days: number): Date {
  const date = getChileDate()
  date.setDate(date.getDate() - days)
  return getStartOfDay(date)
}

// GET /reports/kpis - Dashboard KPIs
reportsRoutes.get("/kpis", async (c) => {
  const db = c.get("db")
  const now = getChileDate()
  const todayStart = getStartOfDay(now)
  const todayEnd = getEndOfDay(now)
  const monthStart = getStartOfMonth(now.getFullYear(), now.getMonth() + 1)
  const monthEnd = getEndOfMonth(now.getFullYear(), now.getMonth() + 1)

  // Previous month for comparison
  const prevMonthStart = getStartOfMonth(now.getFullYear(), now.getMonth())
  const prevMonthEnd = getEndOfMonth(now.getFullYear(), now.getMonth())

  // Active subscriptions count
  const [{ activeSubs }] = await db
    .select({ activeSubs: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))

  // Today's check-ins
  const [{ todayCheckins }] = await db
    .select({ todayCheckins: count() })
    .from(checkins)
    .where(
      and(
        gte(checkins.checkedInAt, todayStart),
        lte(checkins.checkedInAt, todayEnd)
      )
    )

  // Today's sales total
  const [todaySalesResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${posSales.totalClp}), 0)` })
    .from(posSales)
    .where(
      and(
        gte(posSales.createdAt, todayStart),
        lte(posSales.createdAt, todayEnd)
      )
    )

  // Monthly revenue
  const [monthlyResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${posSales.totalClp}), 0)` })
    .from(posSales)
    .where(
      and(gte(posSales.createdAt, monthStart), lte(posSales.createdAt, monthEnd))
    )

  // Previous month revenue for comparison
  const [prevMonthResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${posSales.totalClp}), 0)` })
    .from(posSales)
    .where(
      and(
        gte(posSales.createdAt, prevMonthStart),
        lte(posSales.createdAt, prevMonthEnd)
      )
    )

  const monthlyRevenue = Number(monthlyResult?.total || 0)
  const prevMonthRevenue = Number(prevMonthResult?.total || 0)
  const revenueGrowth =
    prevMonthRevenue > 0
      ? Math.round(((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : null

  return c.json({
    activeSubs: Number(activeSubs),
    todayCheckins: Number(todayCheckins),
    todaySales: Number(todaySalesResult?.total || 0),
    monthlyRevenue,
    prevMonthRevenue,
    revenueGrowth,
  })
})

// GET /reports/revenue - Revenue by period
const revenueQuerySchema = z.object({
  period: z.enum(["today", "3d", "7d", "month"]).optional().default("today"),
  month: z.string().optional(), // Format: YYYY-MM
})

reportsRoutes.get("/revenue", zValidator("query", revenueQuerySchema), async (c) => {
  const db = c.get("db")
  const { period, month } = c.req.valid("query")

  let startDate: Date
  let endDate: Date
  const now = getChileDate()

  if (month) {
    const [year, m] = month.split("-").map(Number)
    startDate = getStartOfMonth(year, m)
    endDate = getEndOfMonth(year, m)
  } else {
    switch (period) {
      case "today":
        startDate = getStartOfDay(now)
        endDate = getEndOfDay(now)
        break
      case "3d":
        startDate = getDaysAgo(2)
        endDate = getEndOfDay(now)
        break
      case "7d":
        startDate = getDaysAgo(6)
        endDate = getEndOfDay(now)
        break
      case "month":
        startDate = getStartOfMonth(now.getFullYear(), now.getMonth() + 1)
        endDate = getEndOfMonth(now.getFullYear(), now.getMonth() + 1)
        break
    }
  }

  // Total revenue
  const [totalResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${posSales.totalClp}), 0)`,
      count: count(),
    })
    .from(posSales)
    .where(and(gte(posSales.createdAt, startDate), lte(posSales.createdAt, endDate)))

  // Revenue by payment method
  const byMethodResult = await db
    .select({
      method: posSales.paymentMethod,
      total: sql<number>`COALESCE(SUM(${posSales.totalClp}), 0)`,
    })
    .from(posSales)
    .where(and(gte(posSales.createdAt, startDate), lte(posSales.createdAt, endDate)))
    .groupBy(posSales.paymentMethod)

  const byPaymentMethod: Record<string, number> = {
    cash: 0,
    webpay: 0,
    transfer: 0,
  }
  byMethodResult.forEach((r) => {
    if (r.method && r.method in byPaymentMethod) {
      byPaymentMethod[r.method] = Number(r.total)
    }
  })

  return c.json({
    total: Number(totalResult?.total || 0),
    byPaymentMethod,
    transactionCount: Number(totalResult?.count || 0),
    period,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  })
})

// GET /reports/transactions - Recent transactions
const transactionsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  type: z.enum(["all", "plan", "product"]).optional().default("all"),
  paymentMethod: z.enum(["cash", "webpay", "transfer", "all"]).optional().default("all"),
  limit: z.coerce.number().optional().default(50),
})

reportsRoutes.get("/transactions", zValidator("query", transactionsQuerySchema), async (c) => {
  const db = c.get("db")
  const { from, to, type, paymentMethod, limit } = c.req.valid("query")

  const conditions = []

  if (from) {
    conditions.push(gte(posSales.createdAt, new Date(from)))
  }
  if (to) {
    conditions.push(lte(posSales.createdAt, new Date(to)))
  }
  if (paymentMethod !== "all") {
    conditions.push(eq(posSales.paymentMethod, paymentMethod))
  }

  const sales = await db
    .select({
      id: posSales.id,
      totalClp: posSales.totalClp,
      paymentMethod: posSales.paymentMethod,
      items: posSales.items,
      notes: posSales.notes,
      createdAt: posSales.createdAt,
      profile: {
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      },
      soldBy: {
        id: users.id,
        rut: users.rut,
      },
    })
    .from(posSales)
    .leftJoin(profiles, eq(posSales.profileId, profiles.id))
    .leftJoin(users, eq(posSales.soldById, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(posSales.createdAt))
    .limit(limit)

  // Filter by type if needed (plan vs product)
  let filteredSales = sales
  if (type !== "all") {
    filteredSales = sales.filter((sale) => {
      if (!sale.items) return false
      const items = sale.items as Array<{ planId?: string; productId?: string }>
      if (type === "plan") {
        return items.some((item) => item.planId)
      }
      return items.some((item) => item.productId)
    })
  }

  return c.json({
    transactions: filteredSales,
    count: filteredSales.length,
  })
})

// GET /reports/revenue-chart - Daily revenue for chart
const chartQuerySchema = z.object({
  month: z.string().optional(), // Format: YYYY-MM
})

reportsRoutes.get("/revenue-chart", zValidator("query", chartQuerySchema), async (c) => {
  const db = c.get("db")
  const { month } = c.req.valid("query")

  const now = getChileDate()
  let year: number
  let m: number

  if (month) {
    [year, m] = month.split("-").map(Number)
  } else {
    year = now.getFullYear()
    m = now.getMonth() + 1
  }

  const startDate = getStartOfMonth(year, m)
  const endDate = getEndOfMonth(year, m)
  const daysInMonth = new Date(year, m, 0).getDate()

  // Get daily totals
  const dailyTotals = await db
    .select({
      day: sql<number>`EXTRACT(DAY FROM ${posSales.createdAt})`,
      total: sql<number>`COALESCE(SUM(${posSales.totalClp}), 0)`,
    })
    .from(posSales)
    .where(and(gte(posSales.createdAt, startDate), lte(posSales.createdAt, endDate)))
    .groupBy(sql`EXTRACT(DAY FROM ${posSales.createdAt})`)

  // Create array for all days of month
  const dailyRevenue = []
  const totalsMap = new Map(dailyTotals.map((d) => [Number(d.day), Number(d.total)]))

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    dailyRevenue.push({
      date,
      day,
      total: totalsMap.get(day) || 0,
    })
  }

  return c.json({
    dailyRevenue,
    month: `${year}-${String(m).padStart(2, "0")}`,
    totalDays: daysInMonth,
  })
})

// GET /reports/members-by-plan - Members grouped by plan
reportsRoutes.get("/members-by-plan", async (c) => {
  const db = c.get("db")

  // Get all active plans with their members
  const plansData = await db
    .select({
      planId: plans.id,
      planName: plans.name,
      priceClp: plans.priceClp,
    })
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(plans.sortOrder)

  const result = []

  for (const plan of plansData) {
    // Get members with this plan (active subscriptions)
    const members = await db
      .select({
        subscriptionId: subscriptions.id,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        profile: {
          id: profiles.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          phone: profiles.phone,
        },
        user: {
          rut: users.rut,
        },
      })
      .from(subscriptions)
      .innerJoin(profiles, eq(subscriptions.profileId, profiles.id))
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(
        and(eq(subscriptions.planId, plan.planId), eq(subscriptions.status, "active"))
      )
      .orderBy(desc(subscriptions.endDate))

    result.push({
      planId: plan.planId,
      planName: plan.planName,
      priceClp: plan.priceClp,
      activeCount: members.length,
      totalRevenue: members.length * plan.priceClp,
      members,
    })
  }

  return c.json({ plans: result })
})

// GET /reports/recent-checkins - Recent check-ins
const checkinsQuerySchema = z.object({
  limit: z.coerce.number().optional().default(15),
})

reportsRoutes.get("/recent-checkins", zValidator("query", checkinsQuerySchema), async (c) => {
  const db = c.get("db")
  const { limit } = c.req.valid("query")

  const recentCheckins = await db
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
    .orderBy(desc(checkins.checkedInAt))
    .limit(limit)

  return c.json({ checkins: recentCheckins })
})

// GET /reports/export - Export sales data
const exportQuerySchema = z.object({
  from: z.string(),
  to: z.string(),
})

reportsRoutes.get("/export", zValidator("query", exportQuerySchema), async (c) => {
  const db = c.get("db")
  const { from, to } = c.req.valid("query")

  const startDate = new Date(from)
  const endDate = new Date(to)
  endDate.setHours(23, 59, 59, 999)

  const sales = await db
    .select({
      id: posSales.id,
      totalClp: posSales.totalClp,
      paymentMethod: posSales.paymentMethod,
      transactionId: posSales.transactionId,
      items: posSales.items,
      notes: posSales.notes,
      createdAt: posSales.createdAt,
      profile: {
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      },
      soldBy: {
        rut: users.rut,
      },
    })
    .from(posSales)
    .leftJoin(profiles, eq(posSales.profileId, profiles.id))
    .leftJoin(users, eq(posSales.soldById, users.id))
    .where(and(gte(posSales.createdAt, startDate), lte(posSales.createdAt, endDate)))
    .orderBy(posSales.createdAt)

  // Format data for export
  const exportData = sales.map((sale) => {
    const items = (sale.items as Array<{ planId?: string; productId?: string; quantity: number; unitPrice: number }>) || []
    const itemsDescription = items
      .map((item) => `${item.quantity}x $${item.unitPrice}`)
      .join(", ")

    return {
      fecha: new Date(sale.createdAt).toLocaleString("es-CL", {
        timeZone: "America/Santiago",
      }),
      id: sale.id,
      cliente: sale.profile
        ? `${sale.profile.firstName} ${sale.profile.lastName}`
        : "No registrado",
      monto: sale.totalClp,
      metodoPago: sale.paymentMethod,
      items: itemsDescription,
      vendedor: sale.soldBy?.rut || "-",
      notas: sale.notes || "",
    }
  })

  const fromFormatted = from.replace(/-/g, "")
  const toFormatted = to.replace(/-/g, "")
  const filename = `Reporte_Ventas_${fromFormatted}_${toFormatted}`

  return c.json({
    data: exportData,
    filename,
    count: exportData.length,
    period: { from, to },
  })
})

export default reportsRoutes
