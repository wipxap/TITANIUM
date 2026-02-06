import { eq, desc, and } from "drizzle-orm"
import { subscriptions, renewalDiscounts } from "../db/schema"
import type { Database } from "../db"

export async function calculateRenewalDiscount(
  db: Database,
  profileId: string
): Promise<{
  discountPercent: number
  discountName: string | null
  discountId: string | null
}> {
  // 1. Get most recent subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.profileId, profileId))
    .orderBy(desc(subscriptions.endDate))
    .limit(1)

  if (!subscription) {
    return { discountPercent: 0, discountName: null, discountId: null }
  }

  const now = new Date()
  const endDate = new Date(subscription.endDate)
  const diffMs = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  // 2. Get all active renewal discounts
  const discounts = await db
    .select()
    .from(renewalDiscounts)
    .where(eq(renewalDiscounts.isActive, true))

  let bestDiscount: {
    discountPercent: number
    discountName: string | null
    discountId: string | null
  } = { discountPercent: 0, discountName: null, discountId: null }

  for (const d of discounts) {
    let applies = false

    if (d.conditionType === "expiring_soon" && diffDays > 0 && d.daysBeforeExpiry !== null) {
      // Subscription is still active but expiring soon
      applies = diffDays <= d.daysBeforeExpiry
    } else if (d.conditionType === "expired" && diffDays <= 0 && d.daysAfterExpiry !== null) {
      // Subscription already expired
      const daysSinceExpiry = Math.abs(diffDays)
      applies = daysSinceExpiry <= d.daysAfterExpiry
    }

    if (applies && d.discountPercent > bestDiscount.discountPercent) {
      bestDiscount = {
        discountPercent: d.discountPercent,
        discountName: d.name,
        discountId: d.id,
      }
    }
  }

  return bestDiscount
}
