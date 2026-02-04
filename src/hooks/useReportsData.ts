import { useQuery } from "@tanstack/react-query"
import { reportsApi } from "@/lib/api"

export function useReportKPIs() {
  return useQuery({
    queryKey: ["reports", "kpis"],
    queryFn: reportsApi.getKPIs,
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useRevenue(
  period?: "today" | "3d" | "7d" | "month",
  month?: string
) {
  return useQuery({
    queryKey: ["reports", "revenue", period, month],
    queryFn: () => reportsApi.getRevenue({ period, month }),
  })
}

export function useTransactions(params?: {
  from?: string
  to?: string
  type?: "all" | "plan" | "product"
  paymentMethod?: "cash" | "webpay" | "transfer" | "all"
  limit?: number
}) {
  return useQuery({
    queryKey: ["reports", "transactions", params],
    queryFn: () => reportsApi.getTransactions(params),
  })
}

export function useRevenueChart(month?: string) {
  return useQuery({
    queryKey: ["reports", "revenue-chart", month],
    queryFn: () => reportsApi.getRevenueChart(month),
  })
}

export function useMembersByPlan() {
  return useQuery({
    queryKey: ["reports", "members-by-plan"],
    queryFn: reportsApi.getMembersByPlan,
  })
}

export function useRecentCheckins(limit?: number) {
  return useQuery({
    queryKey: ["reports", "recent-checkins", limit],
    queryFn: () => reportsApi.getRecentCheckins(limit),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useExportSales(from: string, to: string, enabled = false) {
  return useQuery({
    queryKey: ["reports", "export", from, to],
    queryFn: () => reportsApi.exportSales(from, to),
    enabled,
  })
}
