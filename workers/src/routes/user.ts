import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, desc, and, gte } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { requireAuth } from "../middleware/auth"
import {
  profiles,
  subscriptions,
  plans,
  checkins,
  userRoutines,
  progressLogs,
} from "../db/schema"

const userRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// All routes require authentication
userRoutes.use("/*", requireAuth)

// GET /user/profile - Get current user profile
userRoutes.get("/profile", async (c) => {
  const db = c.get("db")
  const user = c.get("user")!

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  return c.json({ profile })
})

// PUT /user/profile - Update profile
const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  goals: z.string().optional(),
  healthData: z
    .object({
      conditions: z.array(z.string()).optional(),
      injuries: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
    })
    .optional(),
})

userRoutes.put("/profile", zValidator("json", updateProfileSchema), async (c) => {
  const db = c.get("db")
  const user = c.get("user")!
  const data = c.req.valid("json")

  const [updatedProfile] = await db
    .update(profiles)
    .set({
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, user.id))
    .returning()

  return c.json({ profile: updatedProfile })
})

// GET /user/subscription - Get current subscription
userRoutes.get("/subscription", async (c) => {
  const db = c.get("db")
  const user = c.get("user")!

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado" }, 404)
  }

  const [subscription] = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      plan: {
        id: plans.id,
        name: plans.name,
        features: plans.features,
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

  return c.json({ subscription: subscription ?? null })
})

// GET /user/checkins - Get user check-in history
userRoutes.get("/checkins", async (c) => {
  const db = c.get("db")
  const user = c.get("user")!

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ checkins: [] })
  }

  const userCheckins = await db
    .select()
    .from(checkins)
    .where(eq(checkins.profileId, profile.id))
    .orderBy(desc(checkins.checkedInAt))
    .limit(50)

  return c.json({ checkins: userCheckins })
})

// POST /user/checkin - Create check-in (QR)
userRoutes.post("/checkin", async (c) => {
  const db = c.get("db")
  const user = c.get("user")!

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado" }, 404)
  }

  // Check if already checked in today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [existingCheckin] = await db
    .select()
    .from(checkins)
    .where(
      and(
        eq(checkins.profileId, profile.id),
        gte(checkins.checkedInAt, today)
      )
    )
    .limit(1)

  if (existingCheckin && !existingCheckin.checkedOutAt) {
    return c.json({ error: "Ya tienes un check-in activo" }, 400)
  }

  const [newCheckin] = await db
    .insert(checkins)
    .values({
      profileId: profile.id,
      method: "qr",
    })
    .returning()

  return c.json({ checkin: newCheckin })
})

// GET /user/routines - Get user routines
userRoutes.get("/routines", async (c) => {
  const db = c.get("db")
  const user = c.get("user")!

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ routines: [] })
  }

  const routines = await db
    .select()
    .from(userRoutines)
    .where(eq(userRoutines.profileId, profile.id))
    .orderBy(desc(userRoutines.createdAt))

  return c.json({ routines })
})

// GET /user/routines/:id - Get specific routine
userRoutes.get("/routines/:id", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()

  const [routine] = await db
    .select()
    .from(userRoutines)
    .where(eq(userRoutines.id, id))
    .limit(1)

  if (!routine) {
    return c.json({ error: "Rutina no encontrada" }, 404)
  }

  return c.json({ routine })
})

// POST /user/progress - Log exercise progress
const progressSchema = z.object({
  routineId: z.string().uuid().optional(),
  exerciseName: z.string().min(1),
  sets: z.number().positive(),
  reps: z.number().positive(),
  weightKg: z.number().positive().optional(),
  notes: z.string().optional(),
})

userRoutes.post("/progress", zValidator("json", progressSchema), async (c) => {
  const db = c.get("db")
  const user = c.get("user")!
  const data = c.req.valid("json")

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado" }, 404)
  }

  const [log] = await db
    .insert(progressLogs)
    .values({
      profileId: profile.id,
      routineId: data.routineId ?? null,
      exerciseName: data.exerciseName,
      sets: data.sets,
      reps: data.reps,
      weightKg: data.weightKg != null ? String(data.weightKg) : null,
      notes: data.notes ?? null,
    })
    .returning()

  return c.json({ progress: log })
})

// GET /user/progress - Get progress history
userRoutes.get("/progress", async (c) => {
  try {
    const db = c.get("db")
    const user = c.get("user")!

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    if (!profile) {
      return c.json({ progress: [] })
    }

    const progress = await db
      .select()
      .from(progressLogs)
      .where(eq(progressLogs.profileId, profile.id))
      .orderBy(desc(progressLogs.completedAt))
      .limit(100)

    return c.json({ progress })
  } catch (err) {
    console.error("Error fetching progress:", err)
    return c.json({ progress: [] })
  }
})

export default userRoutes
