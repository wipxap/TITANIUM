import { Lucia } from "lucia"
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { sessions, users } from "../db/schema"
import type { Database } from "../db"

export function createAuth(db: Database) {
  const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users)

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: true,
        sameSite: "lax",
      },
    },
    getUserAttributes: (attributes) => ({
      rut: attributes.rut,
      email: attributes.email,
      role: attributes.role,
    }),
  })
}

// Type declarations for Lucia
declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof createAuth>
    DatabaseUserAttributes: {
      rut: string
      email: string | null
      role: "admin" | "reception" | "instructor" | "user"
    }
  }
}

// RUT validation utilities
export function formatRut(rut: string): string {
  // Remove all non-alphanumeric characters
  let cleaned = rut.replace(/[^0-9kK]/g, "").toUpperCase()
  if (cleaned.length > 9) cleaned = cleaned.slice(0, 9)

  if (cleaned.length > 1) {
    const dv = cleaned.slice(-1)
    const body = cleaned.slice(0, -1)
    // Add dots for thousands
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    return `${formatted}-${dv}`
  }
  return cleaned
}

export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase()
}

export function validateRut(rut: string): boolean {
  const cleaned = cleanRut(rut)
  if (cleaned.length < 8 || cleaned.length > 9) return false

  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)

  // Calculate verification digit
  let sum = 0
  let multiplier = 2

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = sum % 11
  const calculatedDv = remainder === 0 ? "0" : remainder === 1 ? "K" : String(11 - remainder)

  return dv === calculatedDv
}
