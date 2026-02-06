import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

let cachedDb: ReturnType<typeof drizzle> | null = null
let cachedConnStr: string | null = null

// Singleton: reuse connection pool across requests (critical for Node.js/GCP)
export function createDb(connectionString: string) {
  if (cachedDb && cachedConnStr === connectionString) {
    return cachedDb
  }
  const client = postgres(connectionString, {
    prepare: false, // Required for Hyperdrive
    max: 5,         // Limit pool to prevent exhausting Cloud SQL connections
    idle_timeout: 30,
  })
  cachedDb = drizzle(client, { schema })
  cachedConnStr = connectionString
  return cachedDb
}

export type Database = ReturnType<typeof createDb>

export * from "./schema"
