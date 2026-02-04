import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, and, desc } from "drizzle-orm"
import type { Env, Variables } from "../types"
import { requireAuth, requireRole } from "../middleware/auth"
import { contracts, signedContracts, profiles, subscriptions } from "../db/schema"

const contractsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// ============ PUBLIC/USER ROUTES ============

// GET /contracts/active - Get active contract to sign
contractsRoutes.get("/active", async (c) => {
  const db = c.get("db")

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.isActive, true))
    .orderBy(desc(contracts.createdAt))
    .limit(1)

  if (!contract) {
    return c.json({ contract: null })
  }

  return c.json({ contract })
})

// GET /contracts/my-signed - Get user's signed contracts
contractsRoutes.get("/my-signed", requireAuth, async (c) => {
  const db = c.get("db")
  const user = c.get("user")!

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ signedContracts: [] })
  }

  const signed = await db
    .select({
      id: signedContracts.id,
      signedAt: signedContracts.signedAt,
      contract: {
        id: contracts.id,
        name: contracts.name,
        version: contracts.version,
      },
    })
    .from(signedContracts)
    .innerJoin(contracts, eq(signedContracts.contractId, contracts.id))
    .where(eq(signedContracts.profileId, profile.id))
    .orderBy(desc(signedContracts.signedAt))

  return c.json({ signedContracts: signed })
})

// GET /contracts/check-signed - Check if user has signed the active contract
contractsRoutes.get("/check-signed", requireAuth, async (c) => {
  const db = c.get("db")
  const user = c.get("user")!

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ hasSigned: false, requiresSignature: false })
  }

  // Get active contract
  const [activeContract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.isActive, true))
    .orderBy(desc(contracts.createdAt))
    .limit(1)

  if (!activeContract || !activeContract.requiresSignature) {
    return c.json({ hasSigned: true, requiresSignature: false })
  }

  // Check if user has signed this version
  const [signed] = await db
    .select()
    .from(signedContracts)
    .where(
      and(
        eq(signedContracts.profileId, profile.id),
        eq(signedContracts.contractId, activeContract.id)
      )
    )
    .limit(1)

  return c.json({
    hasSigned: !!signed,
    requiresSignature: activeContract.requiresSignature,
    contract: !signed ? activeContract : null,
  })
})

// POST /contracts/sign - Sign a contract
const signSchema = z.object({
  contractId: z.string().uuid(),
  signatureData: z.string().min(1), // Base64 image data
  subscriptionId: z.string().uuid().optional(),
})

contractsRoutes.post("/sign", requireAuth, zValidator("json", signSchema), async (c) => {
  const db = c.get("db")
  const user = c.get("user")!
  const { contractId, signatureData, subscriptionId } = c.req.valid("json")

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    return c.json({ error: "Perfil no encontrado" }, 404)
  }

  // Verify contract exists
  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1)

  if (!contract) {
    return c.json({ error: "Contrato no encontrado" }, 404)
  }

  // Check if already signed
  const [existing] = await db
    .select()
    .from(signedContracts)
    .where(
      and(
        eq(signedContracts.profileId, profile.id),
        eq(signedContracts.contractId, contractId)
      )
    )
    .limit(1)

  if (existing) {
    return c.json({ error: "Ya has firmado este contrato" }, 400)
  }

  // Get request info
  const ipAddress = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || null
  const userAgent = c.req.header("User-Agent") || null

  // Create signed contract
  const [signed] = await db
    .insert(signedContracts)
    .values({
      contractId,
      profileId: profile.id,
      subscriptionId: subscriptionId || null,
      signatureData,
      ipAddress,
      userAgent,
    })
    .returning()

  return c.json({
    signedContract: signed,
    message: "Contrato firmado exitosamente",
  })
})

// ============ ADMIN ROUTES ============

// GET /contracts/admin - List all contracts
contractsRoutes.get("/admin", requireAuth, requireRole("admin"), async (c) => {
  const db = c.get("db")

  const contractsList = await db
    .select()
    .from(contracts)
    .orderBy(desc(contracts.createdAt))

  return c.json({ contracts: contractsList })
})

// POST /contracts/admin - Create a contract
const createContractSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1),
  version: z.string().default("1.0"),
  requiresSignature: z.boolean().default(true),
})

contractsRoutes.post(
  "/admin",
  requireAuth,
  requireRole("admin"),
  zValidator("json", createContractSchema),
  async (c) => {
    const db = c.get("db")
    const data = c.req.valid("json")

    // Deactivate other contracts if this one is being created as active
    await db
      .update(contracts)
      .set({ isActive: false })

    const [contract] = await db
      .insert(contracts)
      .values({
        ...data,
        isActive: true,
      })
      .returning()

    return c.json({ contract, message: "Contrato creado" }, 201)
  }
)

// PUT /contracts/admin/:id - Update a contract
contractsRoutes.put(
  "/admin/:id",
  requireAuth,
  requireRole("admin"),
  zValidator("json", createContractSchema.partial()),
  async (c) => {
    const db = c.get("db")
    const { id } = c.req.param()
    const data = c.req.valid("json")

    const [contract] = await db
      .update(contracts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning()

    if (!contract) {
      return c.json({ error: "Contrato no encontrado" }, 404)
    }

    return c.json({ contract, message: "Contrato actualizado" })
  }
)

// PUT /contracts/admin/:id/activate - Set as active contract
contractsRoutes.put(
  "/admin/:id/activate",
  requireAuth,
  requireRole("admin"),
  async (c) => {
    const db = c.get("db")
    const { id } = c.req.param()

    // Deactivate all contracts
    await db.update(contracts).set({ isActive: false })

    // Activate this one
    const [contract] = await db
      .update(contracts)
      .set({ isActive: true })
      .where(eq(contracts.id, id))
      .returning()

    if (!contract) {
      return c.json({ error: "Contrato no encontrado" }, 404)
    }

    return c.json({ contract, message: "Contrato activado" })
  }
)

// DELETE /contracts/admin/:id - Delete a contract
contractsRoutes.delete(
  "/admin/:id",
  requireAuth,
  requireRole("admin"),
  async (c) => {
    const db = c.get("db")
    const { id } = c.req.param()

    // Check if contract has signatures
    const [signed] = await db
      .select()
      .from(signedContracts)
      .where(eq(signedContracts.contractId, id))
      .limit(1)

    if (signed) {
      return c.json({
        error: "No se puede eliminar un contrato que ya ha sido firmado",
      }, 400)
    }

    const [deleted] = await db
      .delete(contracts)
      .where(eq(contracts.id, id))
      .returning()

    if (!deleted) {
      return c.json({ error: "Contrato no encontrado" }, 404)
    }

    return c.json({ success: true, message: "Contrato eliminado" })
  }
)

// GET /contracts/admin/signatures/:contractId - Get signatures for a contract
contractsRoutes.get(
  "/admin/signatures/:contractId",
  requireAuth,
  requireRole("admin"),
  async (c) => {
    const db = c.get("db")
    const { contractId } = c.req.param()

    const signatures = await db
      .select({
        id: signedContracts.id,
        signedAt: signedContracts.signedAt,
        ipAddress: signedContracts.ipAddress,
        profile: {
          id: profiles.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
        },
      })
      .from(signedContracts)
      .innerJoin(profiles, eq(signedContracts.profileId, profiles.id))
      .where(eq(signedContracts.contractId, contractId))
      .orderBy(desc(signedContracts.signedAt))

    return c.json({ signatures })
  }
)

// Helper function to check if user needs to sign contract
export async function requiresContractSignature(
  db: any,
  profileId: string
): Promise<{ required: boolean; contractId: string | null }> {
  // Get active contract
  const [activeContract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.isActive, true))
    .orderBy(desc(contracts.createdAt))
    .limit(1)

  if (!activeContract || !activeContract.requiresSignature) {
    return { required: false, contractId: null }
  }

  // Check if user has signed
  const [signed] = await db
    .select()
    .from(signedContracts)
    .where(
      and(
        eq(signedContracts.profileId, profileId),
        eq(signedContracts.contractId, activeContract.id)
      )
    )
    .limit(1)

  return {
    required: !signed,
    contractId: signed ? null : activeContract.id,
  }
}

export default contractsRoutes
