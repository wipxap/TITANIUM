import type { Database } from "./db"
import type { Lucia, Session, User } from "lucia"

// Use Cloudflare's global Hyperdrive type (optional for Node.js runtime)
export interface Env {
  HYPERDRIVE?: Hyperdrive
  DATABASE_URL?: string
  GEMINI_API_KEY?: string
  LUCIA_PEPPER?: string
  ENVIRONMENT?: string
}

export interface Variables {
  db: Database
  auth: Lucia
  user: User | null
  session: Session | null
}
