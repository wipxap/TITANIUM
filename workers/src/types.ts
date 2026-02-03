import type { Database } from "./db"
import type { Lucia, Session, User } from "lucia"

// Hyperdrive binding type
interface Hyperdrive {
  connectionString: string
}

export interface Env {
  HYPERDRIVE: Hyperdrive
  GEMINI_API_KEY?: string
  LUCIA_PEPPER?: string
  ENVIRONMENT: string
}

export interface Variables {
  db: Database
  auth: Lucia
  user: User | null
  session: Session | null
}
