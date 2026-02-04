import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, asc, lte, desc } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { requireAuth, requireRole } from "../middleware/auth"
import { loyaltyLevels, subscriptions, profiles } from "../db/schema"

const loyaltyRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// ============ PUBLIC ============

// GET /loyalty/levels - Get all loyalty levels (public)
loyaltyRoutes.get("/levels", async (c) => {
  const db = c.get("db")

  const levels = await db
    .select()
    .from(loyaltyLevels)
    .orderBy(asc(loyaltyLevels.minDays))

  return c.json({ levels })
})

// ============ USER ============

// GET /loyalty/my-level - Get current user's loyalty level
loyaltyRoutes.get("/my-level", requireAuth, async (c) => {
  const db = c.get("db")
  const user = c.get("user")!

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado" }, 404)
  }

  // Get current subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.profileId, profile.id))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1)

  const accumulatedDays = subscription?.loyaltyDaysAccumulated ?? 0

  // Get all levels
  const levels = await db
    .select()
    .from(loyaltyLevels)
    .orderBy(asc(loyaltyLevels.minDays))

  // Find current level
  const currentLevel = levels
    .filter((l) => l.minDays <= accumulatedDays)
    .pop()

  // Find next level
  const nextLevel = levels.find((l) => l.minDays > accumulatedDays)

  // Calculate progress to next level
  const progressToNext = nextLevel
    ? {
        daysNeeded: nextLevel.minDays - accumulatedDays,
        percentComplete: Math.round((accumulatedDays / nextLevel.minDays) * 100),
      }
    : null

  return c.json({
    accumulatedDays,
    currentLevel: currentLevel || null,
    nextLevel: nextLevel || null,
    progressToNext,
    allLevels: levels,
  })
})

// ============ ADMIN ============

// GET /loyalty/admin/levels - List all levels (admin)
loyaltyRoutes.get("/admin/levels", requireAuth, requireRole("admin"), async (c) => {
  const db = c.get("db")

  const levels = await db
    .select()
    .from(loyaltyLevels)
    .orderBy(asc(loyaltyLevels.minDays))

  return c.json({ levels })
})

// POST /loyalty/admin/levels - Create a level
const createLevelSchema = z.object({
  name: z.string().min(1).max(50),
  minDays: z.number().int().min(0),
  discountPercent: z.number().int().min(0).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  benefits: z.array(z.string()).optional(),
})

loyaltyRoutes.post(
  "/admin/levels",
  requireAuth,
  requireRole("admin"),
  zValidator("json", createLevelSchema),
  async (c) => {
    const db = c.get("db")
    const data = c.req.valid("json")

    const [level] = await db
      .insert(loyaltyLevels)
      .values(data)
      .returning()

    return c.json({ level, message: "Nivel de lealtad creado" }, 201)
  }
)

// PUT /loyalty/admin/levels/:id - Update a level
loyaltyRoutes.put(
  "/admin/levels/:id",
  requireAuth,
  requireRole("admin"),
  zValidator("json", createLevelSchema.partial()),
  async (c) => {
    const db = c.get("db")
    const { id } = c.req.param()
    const data = c.req.valid("json")

    const [level] = await db
      .update(loyaltyLevels)
      .set(data)
      .where(eq(loyaltyLevels.id, id))
      .returning()

    if (!level) {
      return c.json({ error: "Nivel no encontrado" }, 404)
    }

    return c.json({ level, message: "Nivel actualizado" })
  }
)

// DELETE /loyalty/admin/levels/:id - Delete a level
loyaltyRoutes.delete(
  "/admin/levels/:id",
  requireAuth,
  requireRole("admin"),
  async (c) => {
    const db = c.get("db")
    const { id } = c.req.param()

    const [deleted] = await db
      .delete(loyaltyLevels)
      .where(eq(loyaltyLevels.id, id))
      .returning()

    if (!deleted) {
      return c.json({ error: "Nivel no encontrado" }, 404)
    }

    return c.json({ success: true, message: "Nivel eliminado" })
  }
)

// ============ HELPER FUNCTIONS ============

// Calculate loyalty discount for a user
export async function calculateLoyaltyDiscount(
  db: any,
  profileId: string
): Promise<{ discountPercent: number; levelName: string | null }> {
  // Get current subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.profileId, profileId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1)

  const accumulatedDays = subscription?.loyaltyDaysAccumulated ?? 0

  // Get applicable level
  const [level] = await db
    .select()
    .from(loyaltyLevels)
    .where(lte(loyaltyLevels.minDays, accumulatedDays))
    .orderBy(desc(loyaltyLevels.minDays))
    .limit(1)

  return {
    discountPercent: level?.discountPercent ?? 0,
    levelName: level?.name ?? null,
  }
}

// Update accumulated days after a subscription ends
export async function updateLoyaltyDays(
  db: any,
  subscriptionId: string
): Promise<void> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1)

  if (!sub) return

  const startDate = new Date(sub.startDate)
  const endDate = new Date(sub.endDate)
  const now = new Date()

  // Calculate days used (up to end date or now, whichever is earlier)
  const effectiveEnd = endDate < now ? endDate : now
  const daysUsed = Math.ceil(
    (effectiveEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Get plan to check if it's a daily pass
  // Daily passes don't count towards loyalty

  // Update accumulated days
  await db
    .update(subscriptions)
    .set({
      loyaltyDaysAccumulated: (sub.loyaltyDaysAccumulated ?? 0) + daysUsed,
    })
    .where(eq(subscriptions.id, subscriptionId))
}

export default loyaltyRoutes
