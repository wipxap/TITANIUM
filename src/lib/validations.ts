import { z } from "zod"

// Validar RUT chileno con dígito verificador
function validateRut(rut: string): boolean {
  const cleaned = rut.replace(/[^0-9kK]/g, "").toUpperCase()
  if (cleaned.length < 2) return false

  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)

  let sum = 0
  let multiplier = 2

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const expectedDv = 11 - (sum % 11)
  const calculatedDv =
    expectedDv === 11 ? "0" : expectedDv === 10 ? "K" : String(expectedDv)

  return dv === calculatedDv
}

export const loginSchema = z.object({
  rut: z
    .string()
    .min(1, "RUT es requerido")
    .refine(validateRut, "RUT inválido"),
  password: z.string().min(1, "Contraseña es requerida"),
})

export const registerSchema = z.object({
  rut: z
    .string()
    .min(1, "RUT es requerido")
    .refine(validateRut, "RUT inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener una mayúscula")
    .regex(/[0-9]/, "Debe contener un número"),
  firstName: z.string().min(2, "Nombre muy corto"),
  lastName: z.string().min(2, "Apellido muy corto"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
})

export const profileSchema = z.object({
  firstName: z.string().min(2, "Nombre muy corto"),
  lastName: z.string().min(2, "Apellido muy corto"),
  phone: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  weightKg: z.number().min(20).max(300).optional().nullable(),
  heightCm: z.number().min(100).max(250).optional().nullable(),
  goals: z.string().optional().nullable(),
})

export const generateRoutineSchema = z.object({
  goals: z.string().min(10, "Describe tus objetivos (mínimo 10 caracteres)"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.number().min(1).max(7),
  sessionDuration: z.number().min(20).max(180),
  focusAreas: z.array(z.string()).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type GenerateRoutineInput = z.infer<typeof generateRoutineSchema>
