import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format RUT with dots and hyphen (12.345.678-9)
 */
export function formatRut(rut: string): string {
  // Remove all non-numeric characters except 'k' or 'K'
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase()
  
  if (clean.length < 2) return clean
  
  // Split body and verifier
  const body = clean.slice(0, -1)
  const verifier = clean.slice(-1)
  
  // Add dots to body (every 3 digits from right)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  
  return `${formatted}-${verifier}`
}

/**
 * Clean RUT to only digits and K
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase()
}

/**
 * Validate Chilean RUT
 */
export function validateRut(rut: string): boolean {
  const clean = cleanRut(rut)
  
  if (clean.length < 2) return false
  
  const body = clean.slice(0, -1)
  const verifier = clean.slice(-1)
  
  // Calculate expected verifier
  let sum = 0
  let multiplier = 2
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  
  const remainder = sum % 11
  const expectedVerifier = remainder === 0 ? "0" : remainder === 1 ? "K" : String(11 - remainder)
  
  return verifier === expectedVerifier
}
