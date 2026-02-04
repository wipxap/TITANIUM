import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, and, isNull } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { requireAuth, requireRole } from "../middleware/auth"
import { familyCodes, subscriptions, profiles, plans } from "../db/schema"
import { nanoid } from "nanoid"

const familyRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// Generate a unique family code
function generateFamilyCode(): string {
  return `FAM-${nanoid(8).toUpperCase()}`
}

// ============ USER ROUTES ============

// GET /family/my-codes - Get codes generated from my subscription
familyRoutes.get("/my-codes", requireAuth, async (c) => {
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

  // Get active subscription with family plan
  const subscription = await db
    .select({
      subscription: subscriptions,
      plan: plans,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.profileId, profile.id),
        eq(subscriptions.status, "active"),
        eq(plans.isFamilyPlan, true)
      )
    )
    .limit(1)
    .then((r) => r[0])

  if (!subscription) {
    return c.json({
      codes: [],
      maxBeneficiaries: 0,
      usedCount: 0,
      availableCount: 0,
    })
  }

  // Get codes for this subscription
  const codes = await db
    .select({
      id: familyCodes.id,
      code: familyCodes.code,
      isUsed: familyCodes.isUsed,
      usedAt: familyCodes.usedAt,
      expiresAt: familyCodes.expiresAt,
      beneficiaryProfile: {
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      },
    })
    .from(familyCodes)
    .leftJoin(profiles, eq(familyCodes.beneficiaryProfileId, profiles.id))
    .where(eq(familyCodes.subscriptionId, subscription.subscription.id))

  const usedCount = codes.filter((c) => c.isUsed).length
  const maxBeneficiaries = subscription.plan.maxBeneficiaries ?? 0

  return c.json({
    codes,
    maxBeneficiaries,
    usedCount,
    availableCount: maxBeneficiaries - usedCount,
  })
})

// POST /family/generate-code - Generate a new family code
familyRoutes.post("/generate-code", requireAuth, async (c) => {
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

  // Get active subscription with family plan
  const subscription = await db
    .select({
      subscription: subscriptions,
      plan: plans,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.profileId, profile.id),
        eq(subscriptions.status, "active"),
        eq(plans.isFamilyPlan, true)
      )
    )
    .limit(1)
    .then((r) => r[0])

  if (!subscription) {
    return c.json({ error: "No tienes un plan familiar activo" }, 400)
  }

  // Check if max beneficiaries reached
  const existingCodes = await db
    .select()
    .from(familyCodes)
    .where(eq(familyCodes.subscriptionId, subscription.subscription.id))

  const maxBeneficiaries = subscription.plan.maxBeneficiaries ?? 0
  if (existingCodes.length >= maxBeneficiaries) {
    return c.json({
      error: `Ya has generado el máximo de ${maxBeneficiaries} códigos`,
    }, 400)
  }

  // Generate code
  const code = generateFamilyCode()
  const expiresAt = new Date(subscription.subscription.endDate) // Code expires with subscription

  const [newCode] = await db
    .insert(familyCodes)
    .values({
      code,
      subscriptionId: subscription.subscription.id,
      expiresAt,
    })
    .returning()

  return c.json({
    code: newCode,
    message: "Código generado exitosamente",
  })
})

// POST /family/redeem - Redeem a family code
const redeemSchema = z.object({
  code: z.string().min(1),
})

familyRoutes.post("/redeem", requireAuth, zValidator("json", redeemSchema), async (c) => {
  const db = c.get("db")
  const user = c.get("user")!
  const { code } = c.req.valid("json")

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado" }, 404)
  }

  // Find the code
  const familyCode = await db
    .select({
      code: familyCodes,
      subscription: subscriptions,
      plan: plans,
    })
    .from(familyCodes)
    .innerJoin(subscriptions, eq(familyCodes.subscriptionId, subscriptions.id))
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(eq(familyCodes.code, code.toUpperCase()))
    .limit(1)
    .then((r) => r[0])

  if (!familyCode) {
    return c.json({ error: "Código no encontrado" }, 404)
  }

  if (familyCode.code.isUsed) {
    return c.json({ error: "Este código ya fue utilizado" }, 400)
  }

  if (familyCode.code.expiresAt && new Date(familyCode.code.expiresAt) < new Date()) {
    return c.json({ error: "Este código ha expirado" }, 400)
  }

  if (familyCode.subscription.status !== "active") {
    return c.json({ error: "La suscripción asociada ya no está activa" }, 400)
  }

  // Check if user already has an active subscription
  const existingSubscription = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.profileId, profile.id),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1)
    .then((r) => r[0])

  if (existingSubscription) {
    return c.json({ error: "Ya tienes una membresía activa" }, 400)
  }

  // Mark code as used
  await db
    .update(familyCodes)
    .set({
      isUsed: true,
      usedAt: new Date(),
      beneficiaryProfileId: profile.id,
    })
    .where(eq(familyCodes.id, familyCode.code.id))

  // Create subscription for beneficiary (same duration as parent)
  const [newSubscription] = await db
    .insert(subscriptions)
    .values({
      profileId: profile.id,
      planId: familyCode.plan.id,
      status: "active",
      startDate: new Date(),
      endDate: familyCode.subscription.endDate, // Same end date as parent
      paidAmount: 0, // No cost for beneficiary
    })
    .returning()

  return c.json({
    subscription: {
      ...newSubscription,
      plan: {
        id: familyCode.plan.id,
        name: familyCode.plan.name,
      },
    },
    message: "¡Código canjeado exitosamente! Tu membresía está activa.",
  })
})

// ============ RECEPTION ROUTES ============

// GET /family/lookup/:code - Lookup a code (for reception)
familyRoutes.get(
  "/lookup/:code",
  requireAuth,
  requireRole("admin", "reception"),
  async (c) => {
    const db = c.get("db")
    const { code } = c.req.param()

    const familyCode = await db
      .select({
        code: familyCodes,
        subscription: subscriptions,
        plan: plans,
        ownerProfile: profiles,
      })
      .from(familyCodes)
      .innerJoin(subscriptions, eq(familyCodes.subscriptionId, subscriptions.id))
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .innerJoin(profiles, eq(subscriptions.profileId, profiles.id))
      .where(eq(familyCodes.code, code.toUpperCase()))
      .limit(1)
      .then((r) => r[0])

    if (!familyCode) {
      return c.json({ error: "Código no encontrado" }, 404)
    }

    return c.json({
      code: familyCode.code,
      plan: familyCode.plan,
      owner: {
        firstName: familyCode.ownerProfile.firstName,
        lastName: familyCode.ownerProfile.lastName,
      },
      isValid: !familyCode.code.isUsed &&
        familyCode.subscription.status === "active" &&
        (!familyCode.code.expiresAt || new Date(familyCode.code.expiresAt) > new Date()),
    })
  }
)

export default familyRoutes
