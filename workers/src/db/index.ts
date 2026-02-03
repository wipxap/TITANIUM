import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// For Cloudflare Workers with Hyperdrive
export function createDb(connectionString: string) {
  const client = postgres(connectionString, {
    prepare: false, // Required for Hyperdrive
  })
  return drizzle(client, { schema })
}

export type Database = ReturnType<typeof createDb>

export * from "./schema"
