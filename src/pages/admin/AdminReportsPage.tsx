import { useState } from "react"
import { UserLayout } from "@/components/layout/UserLayout"
import { StatCard, DashboardCard, PremiumTable, PremiumButton } from "@/components/common"
import { useAuth } from "@/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  useReportKPIs,
  useRevenue,
  useRevenueChart,
  useTransactions,
  useMembersByPlan,
  useRecentCheckins,
} from "@/hooks"
import { reportsApi } from "@/lib/api"
import { formatCLP, formatTimeCL, formatDateCL } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

type RevenuePeriod = "today" | "3d" | "7d" | "month"

const PERIODS: { value: RevenuePeriod; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "3d", label: "3 días" },
  { value: "7d", label: "7 días" },
  { value: "month", label: "Mes" },
]

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  webpay: "WebPay",
  transfer: "Transferencia",
}

export function AdminReportsPage() {
  const { user } = useAuth()
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("today")
  const [chartMonth, setChartMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const { data: kpis, isLoading: kpisLoading } = useReportKPIs()
  const { data: revenue, isLoading: revenueLoading } = useRevenue(revenuePeriod)
  const { data: chartData, isLoading: chartLoading } = useRevenueChart(chartMonth)
  const { data: txData, isLoading: txLoading } = useTransactions({ limit: 10 })
  const { data: plansData, isLoading: plansLoading } = useMembersByPlan()
  const { data: checkinsData, isLoading: checkinsLoading } = useRecentCheckins(10)

  const handleExport = async () => {
    setExporting(true)
    try {
      const now = new Date()
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
      const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      const result = await reportsApi.exportSales(from, to)

      // Convert to CSV
      const headers = ["Fecha", "ID", "Cliente", "Monto", "Método Pago", "Items", "Vendedor", "Notas"]
      const rows = result.data.map((row) => [
        row.fecha,
        row.id,
        row.cliente,
        row.monto,
        PAYMENT_LABELS[row.metodoPago] || row.metodoPago,
        row.items,
        row.vendedor,
        row.notas,
      ])

      const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n")

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `${result.filename}.csv`
      link.click()
    } finally {
      setExporting(false)
    }
  }

  const getWhatsAppLink = (phone: string | null) => {
    if (!phone) return null
    const cleanPhone = phone.replace(/[^0-9]/g, "")
    const phoneWithCode = cleanPhone.startsWith("56") ? cleanPhone : `56${cleanPhone}`
    return `https://wa.me/${phoneWithCode}`
  }

  return (
    <UserLayout title="Reportes" userRole={user?.role}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-primary text-glow">
            Reportes
          </h1>
          <PremiumButton onClick={handleExport} disabled={exporting} size="sm">
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exportando..." : "Exportar Excel"}
          </PremiumButton>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpisLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 skeleton-red" />
            ))
          ) : (
            <>
              <StatCard
                icon={Users}
                label="Socios Activos"
                value={kpis?.activeSubs || 0}
              />
              <StatCard
                icon={Calendar}
                label="Check-ins Hoy"
                value={kpis?.todayCheckins || 0}
              />
              <StatCard
                icon={DollarSign}
                label="Ventas Hoy"
                value={formatCLP(kpis?.todaySales || 0)}
                accent
              />
              <div className="relative">
                <StatCard
                  icon={TrendingUp}
                  label="Cartera Mes"
                  value={formatCLP(kpis?.monthlyRevenue || 0)}
                />
                {kpis?.revenueGrowth !== null && kpis?.revenueGrowth !== undefined && (
                  <div
                    className={cn(
                      "absolute top-2 right-2 flex items-center text-xs font-medium",
                      kpis.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {kpis.revenueGrowth >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(kpis.revenueGrowth)}%
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Revenue by Period */}
        <DashboardCard title="Ingresos por Período" loading={revenueLoading}>
          <div className="space-y-3">
            {/* Period Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setRevenuePeriod(p.value)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    revenuePeriod === p.value
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted-foreground/10"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Revenue Display */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-primary text-glow">
                  {formatCLP(revenue?.total || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {revenue?.transactionCount || 0} transacciones
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(revenue?.byPaymentMethod || {}).map(([method, amount]) => (
                  <div key={method} className="text-center">
                    <p className="text-xs text-muted-foreground">{PAYMENT_LABELS[method]}</p>
                    <p className="text-sm font-semibold">{formatCLP(amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Revenue Chart */}
        <DashboardCard
          title={
            <div className="flex items-center justify-between w-full">
              <span>Ingresos Diarios</span>
              <input
                type="month"
                value={chartMonth}
                onChange={(e) => setChartMonth(e.target.value)}
                className="text-sm bg-transparent border border-border rounded px-2 py-1"
              />
            </div>
          }
          loading={chartLoading}
        >
          <div className="h-64 w-full min-h-[256px]">
            {chartData?.dailyRevenue && chartData.dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={chartData.dailyRevenue}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#888", fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#888", fontSize: 10 }}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCLP(Number(value)), "Total"]}
                    labelFormatter={(label) => `Día ${label}`}
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {chartData.dailyRevenue.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.total > 0 ? "#B71C1C" : "#333"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Sin datos para mostrar
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Transactions */}
          <DashboardCard title="Transacciones Recientes" loading={txLoading}>
            <PremiumTable
              headers={["Cliente", "Monto", "Método", "Hora"]}
              rows={
                txData?.transactions.map((tx) => [
                  tx.profile
                    ? `${tx.profile.firstName} ${tx.profile.lastName}`
                    : "No registrado",
                  formatCLP(tx.totalClp),
                  <Badge key={tx.id} variant="outline" className="text-xs">
                    {PAYMENT_LABELS[tx.paymentMethod] || tx.paymentMethod}
                  </Badge>,
                  formatTimeCL(tx.createdAt),
                ]) || []
              }
              loadingRows={5}
            />
            {txData?.transactions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Sin transacciones recientes
              </p>
            )}
          </DashboardCard>

          {/* Recent Check-ins */}
          <DashboardCard title="Actividad Reciente" loading={checkinsLoading}>
            <div className="space-y-2">
              {checkinsData?.checkins.map((checkin) => (
                <div
                  key={checkin.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {checkin.profile.firstName} {checkin.profile.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {checkin.method.toUpperCase()} • {checkin.user.rut}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeCL(checkin.checkedInAt)}
                  </p>
                </div>
              ))}
              {checkinsData?.checkins.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Sin check-ins recientes
                </p>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Members by Plan */}
        <DashboardCard title="Clientes por Plan" loading={plansLoading}>
          <div className="space-y-2">
            {plansData?.plans.map((plan) => (
              <div key={plan.planId} className="border border-border rounded-lg overflow-hidden">
                {/* Plan Header */}
                <button
                  onClick={() =>
                    setExpandedPlan(expandedPlan === plan.planId ? null : plan.planId)
                  }
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{plan.planName}</span>
                    <Badge variant="secondary">{plan.activeCount} socios</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {formatCLP(plan.priceClp)}/c.u
                    </span>
                    <span className="font-medium text-primary">
                      {formatCLP(plan.totalRevenue)}
                    </span>
                    {expandedPlan === plan.planId ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Members List */}
                {expandedPlan === plan.planId && (
                  <div className="border-t border-border">
                    {plan.members.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        Sin miembros activos
                      </p>
                    ) : (
                      <div className="divide-y divide-border">
                        {plan.members.map((member) => {
                          const whatsappLink = getWhatsAppLink(member.profile.phone)
                          const endDate = new Date(member.endDate)
                          const now = new Date()
                          const daysLeft = Math.ceil(
                            (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                          )
                          const isExpiringSoon = daysLeft <= 7 && daysLeft > 0

                          return (
                            <div
                              key={member.subscriptionId}
                              className="flex items-center justify-between p-3 hover:bg-muted/20"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {member.profile.firstName} {member.profile.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {member.user.rut} • {member.profile.phone || "Sin teléfono"}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Vence</p>
                                  <p
                                    className={cn(
                                      "text-sm font-medium",
                                      isExpiringSoon && "text-yellow-500",
                                      daysLeft <= 0 && "text-red-500"
                                    )}
                                  >
                                    {formatDateCL(member.endDate)}
                                  </p>
                                </div>
                                {whatsappLink && (
                                  <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {plansData?.plans.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Sin planes activos
              </p>
            )}
          </div>
        </DashboardCard>
      </div>
    </UserLayout>
  )
}
