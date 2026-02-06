import { eq, sql } from "drizzle-orm"
import { profiles, users } from "../db/schema"
import type { Database } from "../db"

export async function getBirthdayUsers(
  db: Database,
  range: "today" | "week"
) {
  // Get current date in Chile timezone
  const nowChile = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Santiago" })
  )
  const month = nowChile.getMonth() + 1
  const day = nowChile.getDate()

  let condition: ReturnType<typeof sql>

  if (range === "today") {
    condition = sql`EXTRACT(MONTH FROM ${profiles.birthDate}) = ${month} AND EXTRACT(DAY FROM ${profiles.birthDate}) = ${day}`
  } else {
    // Build pairs of (month, day) for the next 7 days
    const pairs: Array<{ m: number; d: number }> = []
    for (let i = 0; i < 7; i++) {
      const dt = new Date(nowChile)
      dt.setDate(dt.getDate() + i)
      pairs.push({ m: dt.getMonth() + 1, d: dt.getDate() })
    }

    // Build SQL: (EXTRACT(MONTH FROM birth_date) * 100 + EXTRACT(DAY FROM birth_date)) IN (101, 102, ...)
    const values = pairs.map((p) => p.m * 100 + p.d)
    condition = sql`(EXTRACT(MONTH FROM ${profiles.birthDate}) * 100 + EXTRACT(DAY FROM ${profiles.birthDate})) IN (${sql.raw(values.join(", "))})`
  }

  const result = await db
    .select({
      profileId: profiles.id,
      fullName: sql<string>`${profiles.firstName} || ' ' || ${profiles.lastName}`,
      rut: users.rut,
      birthDate: profiles.birthDate,
      phone: profiles.phone,
      email: users.email,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(sql`${profiles.birthDate} IS NOT NULL AND (${condition})`)

  // Calculate age for each user
  const birthdays = result.map((r) => {
    let age: number | null = null
    if (r.birthDate) {
      const bd = new Date(r.birthDate)
      age = nowChile.getFullYear() - bd.getFullYear()
      const monthDiff = nowChile.getMonth() - bd.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && nowChile.getDate() < bd.getDate())) {
        age--
      }
    }
    return {
      ...r,
      age,
    }
  })

  return { birthdays, total: birthdays.length, range }
}
