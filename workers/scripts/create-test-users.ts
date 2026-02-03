/**
 * Create test users for Titanium Gym
 * Run: DATABASE_URL="..." npx tsx scripts/create-test-users.ts
 */

import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { users, profiles, subscriptions, plans } from "../src/db/schema"
import { scrypt } from "@noble/hashes/scrypt"
import { bytesToHex, randomBytes } from "@noble/hashes/utils"
import { eq } from "drizzle-orm"

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no definida")
  process.exit(1)
}

const sql = postgres(DATABASE_URL)
const db = drizzle(sql)

function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scrypt(password, salt, { N: 16384, r: 8, p: 1, dkLen: 32 })
  return `${bytesToHex(salt)}$${bytesToHex(hash)}`
}

const testUsers = [
  {
    rut: "222222222", // 22.222.222-2
    email: "user@titaniumgym.cl",
    role: "user" as const,
    firstName: "Usuario",
    lastName: "Prueba",
    phone: "+56911111111",
    password: "User2026!",
  },
  {
    rut: "333333333", // 33.333.333-3
    email: "reception@titaniumgym.cl",
    role: "reception" as const,
    firstName: "Recepción",
    lastName: "Titanium",
    phone: "+56922222222",
    password: "Reception2026!",
  },
  {
    rut: "444444444", // 44.444.444-4
    email: "instructor@titaniumgym.cl",
    role: "instructor" as const,
    firstName: "Instructor",
    lastName: "Fitness",
    phone: "+56933333333",
    password: "Instructor2026!",
  },
]

async function createTestUsers() {
  console.log("🧪 Creando usuarios de prueba...\n")

  // Get a plan for subscription
  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.name, "Premium"))
    .limit(1)

  for (const testUser of testUsers) {
    try {
      // Check if user exists
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.rut, testUser.rut))
        .limit(1)

      if (existing) {
        console.log(`⏭️  ${testUser.role}: Ya existe (RUT: ${formatRut(testUser.rut)})`)
        continue
      }

      // Create user
      const hashedPassword = hashPassword(testUser.password)
      const [newUser] = await db
        .insert(users)
        .values({
          rut: testUser.rut,
          email: testUser.email,
          hashedPassword,
          role: testUser.role,
        })
        .returning()

      // Create profile
      const [profile] = await db
        .insert(profiles)
        .values({
          userId: newUser.id,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          phone: testUser.phone,
        })
        .returning()

      // Create subscription for user role (with plan)
      if (testUser.role === "user" && plan) {
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

      console.log(`✅ ${testUser.role.toUpperCase()}:`)
      console.log(`   RUT: ${formatRut(testUser.rut)}`)
      console.log(`   Email: ${testUser.email}`)
      console.log(`   Password: ${testUser.password}`)
      console.log("")
    } catch (error) {
      console.error(`❌ Error creando ${testUser.role}:`, error)
    }
  }

  console.log("============================================================")
  console.log("📋 RESUMEN DE CUENTAS DE PRUEBA:")
  console.log("============================================================")
  console.log("")
  console.log("👤 USUARIO (con membresía Premium):")
  console.log("   RUT: 22.222.222-2")
  console.log("   Password: User2026!")
  console.log("")
  console.log("🏪 RECEPCIÓN:")
  console.log("   RUT: 33.333.333-3")
  console.log("   Password: Reception2026!")
  console.log("")
  console.log("🏋️ INSTRUCTOR:")
  console.log("   RUT: 44.444.444-4")
  console.log("   Password: Instructor2026!")
  console.log("")
  console.log("👑 ADMIN (ya existente):")
  console.log("   RUT: 11.111.111-1")
  console.log("   Password: TitaniumAdmin2026!")
  console.log("")

  await sql.end()
  process.exit(0)
}

function formatRut(rut: string): string {
  const body = rut.slice(0, -1)
  const dv = rut.slice(-1)
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv
}

createTestUsers().catch((err) => {
  console.error("❌ Error:", err)
  process.exit(1)
})
