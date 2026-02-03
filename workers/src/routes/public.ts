import { Hono } from "hono"
import { eq, sql, count, sum } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { plans, machines, profiles, subscriptions } from "../db/schema"

const publicRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// GET /public/stats - Landing page stats
publicRoutes.get("/stats", async (c) => {
  const db = c.get("db")

  // Get total machines count
  const [machinesResult] = await db
    .select({ total: sum(machines.quantity) })
    .from(machines)
    .where(eq(machines.isActive, true))

  // Get active members count (users with active subscription)
  const [membersResult] = await db
    .select({ total: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))

  // Get total plans count
  const [plansResult] = await db
    .select({ total: count() })
    .from(plans)
    .where(eq(plans.isActive, true))

  return c.json({
    stats: {
      totalMachines: Number(machinesResult?.total) || 0,
      activeMembers: Number(membersResult?.total) || 0,
      totalPlans: Number(plansResult?.total) || 0,
      hoursOpen: 17, // 6:00 - 23:00
      location: "Iquique",
    },
  })
})

// GET /public/plans - Get all active plans
publicRoutes.get("/plans", async (c) => {
  const db = c.get("db")

  const activePlans = await db
    .select({
      id: plans.id,
      name: plans.name,
      description: plans.description,
      priceClp: plans.priceClp,
      durationDays: plans.durationDays,
      features: plans.features,
      sortOrder: plans.sortOrder,
    })
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(plans.sortOrder)

  return c.json({ plans: activePlans })
})

// GET /public/plans/:id - Get single plan
publicRoutes.get("/plans/:id", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()

  const [plan] = await db
    .select({
      id: plans.id,
      name: plans.name,
      description: plans.description,
      priceClp: plans.priceClp,
      durationDays: plans.durationDays,
      features: plans.features,
    })
    .from(plans)
    .where(eq(plans.id, id))
    .limit(1)

  if (!plan) {
    return c.json({ error: "Plan no encontrado" }, 404)
  }

  return c.json({ plan })
})

// GET /public/machines - Get all active machines
publicRoutes.get("/machines", async (c) => {
  const db = c.get("db")

  const activeMachines = await db
    .select({
      id: machines.id,
      name: machines.name,
      muscleGroup: machines.muscleGroup,
      description: machines.description,
      instructions: machines.instructions,
      videoUrl: machines.videoUrl,
      imageUrl: machines.imageUrl,
      quantity: machines.quantity,
    })
    .from(machines)
    .where(eq(machines.isActive, true))
    .orderBy(machines.muscleGroup, machines.name)

  return c.json({ machines: activeMachines })
})

// GET /public/machines/:id - Get single machine
publicRoutes.get("/machines/:id", async (c) => {
  const db = c.get("db")
  const { id } = c.req.param()

  const [machine] = await db
    .select({
      id: machines.id,
      name: machines.name,
      muscleGroup: machines.muscleGroup,
      description: machines.description,
      instructions: machines.instructions,
      videoUrl: machines.videoUrl,
      imageUrl: machines.imageUrl,
      quantity: machines.quantity,
    })
    .from(machines)
    .where(eq(machines.id, id))
    .limit(1)

  if (!machine) {
    return c.json({ error: "Máquina no encontrada" }, 404)
  }

  return c.json({ machine })
})

// GET /public/machines/group/:group - Get machines by muscle group
publicRoutes.get("/machines/group/:group", async (c) => {
  const db = c.get("db")
  const { group } = c.req.param()

  const groupMachines = await db
    .select({
      id: machines.id,
      name: machines.name,
      muscleGroup: machines.muscleGroup,
      description: machines.description,
      quantity: machines.quantity,
    })
    .from(machines)
    .where(eq(machines.muscleGroup, group as any))
    .orderBy(machines.name)

  return c.json({ machines: groupMachines })
})

export default publicRoutes
