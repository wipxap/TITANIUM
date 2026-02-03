/**
 * TITANIUM GYM - Seed Data
 * Ejecutar: DATABASE_URL="..." npm run db:seed
 */

import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { plans, machines, users, profiles } from "../src/db/schema"
import { scrypt } from "@noble/hashes/scrypt"
import { bytesToHex, randomBytes } from "@noble/hashes/utils"

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no definida")
  console.error("   Ejecutar: DATABASE_URL=\"postgresql://...\" npm run db:seed")
  process.exit(1)
}

const sql = postgres(DATABASE_URL)
const db = drizzle(sql)

// Hash password with scrypt (same as Workers)
function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scrypt(password, salt, { N: 16384, r: 8, p: 1, dkLen: 32 })
  return `${bytesToHex(salt)}$${bytesToHex(hash)}`
}

async function seed() {
  console.log("🌱 Iniciando seed de Titanium Gym...")

  // ============ PLANES ============
  console.log("\n📋 Creando planes...")
  
  const planesData = [
    {
      name: "Básico",
      description: "Acceso completo al gimnasio con horario extendido",
      priceClp: 29990,
      durationDays: 30,
      features: [
        "Acceso a todas las máquinas",
        "Horario completo (6:00 - 23:00)",
        "Casillero personal",
        "App móvil con check-in QR",
      ],
      sortOrder: 1,
    },
    {
      name: "Premium",
      description: "Incluye rutinas con IA y seguimiento de progreso",
      priceClp: 44990,
      durationDays: 30,
      features: [
        "Todo lo del plan Básico",
        "Rutinas personalizadas con IA",
        "Seguimiento de progreso",
        "Acceso a clases grupales",
        "1 sesión con entrenador/mes",
      ],
      sortOrder: 2,
    },
    {
      name: "Titanium",
      description: "Experiencia completa con entrenador personal",
      priceClp: 69990,
      durationDays: 30,
      features: [
        "Todo lo del plan Premium",
        "Entrenador personal ilimitado",
        "Plan nutricional personalizado",
        "Acceso 24/7",
        "Invitados gratis (2/mes)",
        "Toalla y artículos de aseo",
      ],
      sortOrder: 3,
    },
  ]

  await db.insert(plans).values(planesData).onConflictDoNothing()
  console.log(`   ✅ ${planesData.length} planes creados`)

  // ============ MÁQUINAS ============
  console.log("\n🏋️ Creando máquinas...")

  const maquinasData = [
    // Pecho
    { name: "Press de Banca", muscleGroup: "chest" as const, quantity: 4, description: "Press horizontal con barra olímpica" },
    { name: "Press Inclinado", muscleGroup: "chest" as const, quantity: 3, description: "Press en banco inclinado 30-45°" },
    { name: "Press Declinado", muscleGroup: "chest" as const, quantity: 2, description: "Press en banco declinado" },
    { name: "Pec Deck", muscleGroup: "chest" as const, quantity: 2, description: "Máquina de aperturas para pecho" },
    { name: "Cable Crossover", muscleGroup: "chest" as const, quantity: 2, description: "Poleas para cruces de pecho" },
    
    // Espalda
    { name: "Jalón al Pecho", muscleGroup: "back" as const, quantity: 3, description: "Polea alta para dorsales" },
    { name: "Remo Sentado", muscleGroup: "back" as const, quantity: 3, description: "Remo en máquina con agarre cerrado/abierto" },
    { name: "Remo T-Bar", muscleGroup: "back" as const, quantity: 2, description: "Remo con barra T" },
    { name: "Hiperextensiones", muscleGroup: "back" as const, quantity: 2, description: "Banco para lumbares" },
    { name: "Dominadas Asistidas", muscleGroup: "back" as const, quantity: 2, description: "Máquina de dominadas con asistencia" },
    
    // Hombros
    { name: "Press Militar", muscleGroup: "shoulders" as const, quantity: 2, description: "Press de hombros sentado" },
    { name: "Elevaciones Laterales", muscleGroup: "shoulders" as const, quantity: 2, description: "Máquina para deltoides laterales" },
    { name: "Face Pull", muscleGroup: "shoulders" as const, quantity: 2, description: "Polea para deltoides posterior" },
    
    // Brazos
    { name: "Curl de Bíceps", muscleGroup: "arms" as const, quantity: 3, description: "Máquina de curl para bíceps" },
    { name: "Curl Predicador", muscleGroup: "arms" as const, quantity: 2, description: "Banco Scott para bíceps" },
    { name: "Extensión de Tríceps", muscleGroup: "arms" as const, quantity: 2, description: "Polea para tríceps" },
    { name: "Fondos Asistidos", muscleGroup: "arms" as const, quantity: 2, description: "Máquina de fondos para tríceps" },
    
    // Piernas
    { name: "Prensa de Piernas", muscleGroup: "legs" as const, quantity: 3, description: "Prensa 45° para cuádriceps" },
    { name: "Hack Squat", muscleGroup: "legs" as const, quantity: 2, description: "Sentadilla en máquina" },
    { name: "Extensión de Cuádriceps", muscleGroup: "legs" as const, quantity: 3, description: "Máquina de extensión de piernas" },
    { name: "Curl Femoral", muscleGroup: "legs" as const, quantity: 3, description: "Máquina para isquiotibiales" },
    { name: "Pantorrillas Sentado", muscleGroup: "legs" as const, quantity: 2, description: "Máquina para gemelos" },
    { name: "Abductora", muscleGroup: "legs" as const, quantity: 2, description: "Máquina para abductores" },
    { name: "Aductora", muscleGroup: "legs" as const, quantity: 2, description: "Máquina para aductores" },
    { name: "Squat Rack", muscleGroup: "legs" as const, quantity: 4, description: "Rack para sentadillas libres" },
    
    // Core
    { name: "Crunch Abdominal", muscleGroup: "core" as const, quantity: 2, description: "Máquina de abdominales" },
    { name: "Rotación de Torso", muscleGroup: "core" as const, quantity: 2, description: "Máquina para oblicuos" },
    
    // Cardio
    { name: "Cinta de Correr", muscleGroup: "cardio" as const, quantity: 10, description: "Treadmill con inclinación" },
    { name: "Bicicleta Estática", muscleGroup: "cardio" as const, quantity: 8, description: "Bicicleta vertical" },
    { name: "Elíptica", muscleGroup: "cardio" as const, quantity: 6, description: "Cross trainer elíptico" },
    { name: "Bicicleta Reclinada", muscleGroup: "cardio" as const, quantity: 4, description: "Bicicleta con respaldo" },
    { name: "Máquina de Remo", muscleGroup: "cardio" as const, quantity: 4, description: "Remo ergométrico Concept2" },
    { name: "Stairmaster", muscleGroup: "cardio" as const, quantity: 3, description: "Escaladora" },
  ]

  await db.insert(machines).values(maquinasData).onConflictDoNothing()
  console.log(`   ✅ ${maquinasData.length} máquinas creadas`)

  // ============ USUARIO ADMIN ============
  console.log("\n👤 Creando usuario admin...")

  const adminPassword = hashPassword("TitaniumAdmin2026!")
  
  const [adminUser] = await db
    .insert(users)
    .values({
      rut: "111111111", // RUT de prueba: 11.111.111-1
      email: "admin@titaniumgym.cl",
      hashedPassword: adminPassword,
      role: "admin",
    })
    .onConflictDoNothing()
    .returning()

  if (adminUser) {
    await db.insert(profiles).values({
      userId: adminUser.id,
      firstName: "Admin",
      lastName: "Titanium",
      phone: "+56912345678",
    })
    console.log("   ✅ Usuario admin creado")
    console.log("      RUT: 11.111.111-1")
    console.log("      Password: TitaniumAdmin2026!")
  } else {
    console.log("   ⏭️  Usuario admin ya existe")
  }

  // ============ RESUMEN ============
  console.log("\n============================================================")
  console.log("✅ Seed completado exitosamente!")
  console.log("============================================================")
  console.log("\n📊 Resumen:")
  console.log(`   - ${planesData.length} planes`)
  console.log(`   - ${maquinasData.length} máquinas`)
  console.log("   - 1 usuario admin")
  console.log("\n🔐 Credenciales Admin:")
  console.log("   RUT: 11.111.111-1")
  console.log("   Password: TitaniumAdmin2026!")
  console.log("\n⚠️  Cambia la contraseña del admin después del primer login!")

  await sql.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err)
  process.exit(1)
})
