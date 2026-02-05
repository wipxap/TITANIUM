import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { requireAuth } from "../middleware/auth"
import { profiles, machines, userRoutines } from "../db/schema"
import { generateRoutineWithGemini, generateFallbackRoutine } from "../lib/gemini"

const routinesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// All routes require authentication
routinesRoutes.use("/*", requireAuth)

// Schema for routine generation
const generateRoutineSchema = z.object({
  goals: z.string().min(5).max(500),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.number().int().min(1).max(7),
  sessionDuration: z.number().int().min(15).max(180), // 15 min to 3 hours
  focusAreas: z.array(z.string()).optional(),
})

// POST /routines/generate - Generate a new routine with AI
routinesRoutes.post("/generate", zValidator("json", generateRoutineSchema), async (c) => {
  const db = c.get("db")
  const user = c.get("user")!
  const data = c.req.valid("json")

  // Get user profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado. Complete su perfil primero." }, 404)
  }

  // Get available machines
  const machinesList = await db
    .select({ name: machines.name })
    .from(machines)
    .where(eq(machines.isActive, true))

  const equipmentNames = machinesList.map((m) => m.name)

  // Get health conditions from profile
  const healthConditions = profile.healthData?.conditions || []

  let generatedRoutine

  try {
    // Try to generate with Gemini
    const geminiApiKey = c.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      console.warn("GEMINI_API_KEY not configured, using fallback")
      generatedRoutine = generateFallbackRoutine(data.daysPerWeek, data.experienceLevel)
    } else {
      generatedRoutine = await generateRoutineWithGemini(geminiApiKey, {
        goals: data.goals,
        experienceLevel: data.experienceLevel,
        daysPerWeek: data.daysPerWeek,
        sessionDuration: data.sessionDuration,
        equipment: equipmentNames,
        healthConditions,
        focusAreas: data.focusAreas,
      })
    }
  } catch (error) {
    console.error("Error generating routine:", error)
    // Use fallback if AI fails
    generatedRoutine = generateFallbackRoutine(data.daysPerWeek, data.experienceLevel)
  }

  // Deactivate previous routines
  await db
    .update(userRoutines)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(userRoutines.profileId, profile.id))

  // Save the new routine
  const [savedRoutine] = await db
    .insert(userRoutines)
    .values({
      profileId: profile.id,
      name: generatedRoutine.name,
      description: generatedRoutine.description,
      routineJson: { days: generatedRoutine.days },
      generatedBy: "gemini",
      isActive: true,
    })
    .returning()

  return c.json({
    routine: savedRoutine,
    message: "Rutina generada exitosamente",
  })
})

// PUT /routines/:id/activate - Activate a specific routine
routinesRoutes.put("/:id/activate", async (c) => {
  const db = c.get("db")
  const user = c.get("user")!
  const { id } = c.req.param()

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado" }, 404)
  }

  // Deactivate all routines
  await db
    .update(userRoutines)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(userRoutines.profileId, profile.id))

  // Activate selected routine
  const [routine] = await db
    .update(userRoutines)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(userRoutines.id, id))
    .returning()

  if (!routine) {
    return c.json({ error: "Rutina no encontrada" }, 404)
  }

  return c.json({ routine })
})

// DELETE /routines/:id - Delete a routine
routinesRoutes.delete("/:id", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()

  const [deleted] = await db
    .delete(userRoutines)
    .where(eq(userRoutines.id, id))
    .returning()

  if (!deleted) {
    return c.json({ error: "Rutina no encontrada" }, 404)
  }

  return c.json({ success: true })
})

export default routinesRoutes
