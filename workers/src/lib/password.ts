import { scrypt } from "@noble/hashes/scrypt"
import { bytesToHex, hexToBytes, randomBytes } from "@noble/hashes/utils"

// Scrypt parameters (recommended for password hashing)
const SCRYPT_N = 16384 // CPU/memory cost
const SCRYPT_R = 8 // Block size
const SCRYPT_P = 1 // Parallelization
const KEY_LENGTH = 32 // Output length in bytes
const SALT_LENGTH = 16 // Salt length in bytes

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const hash = scrypt(password, salt, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, dkLen: KEY_LENGTH })
  
  // Format: salt$hash (both hex encoded)
  return `${bytesToHex(salt)}$${bytesToHex(hash)}`
}

export async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = storedHash.split("$")
    if (!saltHex || !hashHex) return false

    const salt = hexToBytes(saltHex)
    const expectedHash = hexToBytes(hashHex)
    
    const computedHash = scrypt(password, salt, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, dkLen: KEY_LENGTH })
    
    // Constant-time comparison
    if (computedHash.length !== expectedHash.length) return false
    
    let result = 0
    for (let i = 0; i < computedHash.length; i++) {
      result |= computedHash[i] ^ expectedHash[i]
    }
    
    return result === 0
  } catch {
    return false
  }
}
