import { useState } from "react"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumButton } from "@/components/common"
import { SalesHistoryTable, VoidRequestDialog } from "@/components/pos"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Filter, Receipt, Banknote, CreditCard, Building2 } from "lucide-react"
import { useAuth, useSalesHistory, useRequestVoid } from "@/hooks"
import { formatPrice, formatDateTimeCL } from "@/lib/utils"
import { Link } from "react-router-dom"
import type { PosSale, PosSaleStatus } from "@/lib/api"

export function SalesHistoryPage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<PosSaleStatus | "all">("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [selectedSale, setSelectedSale] = useState<PosSale | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showVoidDialog, setShowVoidDialog] = useState(false)

  const requestVoid = useRequestVoid()

  const { data: salesData, isLoading } = useSalesHistory({
    status: statusFilter === "all" ? undefined : statusFilter,
    paymentMethod: paymentFilter === "all" ? undefined : paymentFilter,
    limit: 50,
  })

  const sales = salesData?.sales || []

  const handleViewDetails = (sale: PosSale) => {
    setSelectedSale(sale)
    setShowDetailsDialog(true)
  }

  const handleRequestVoid = (sale: PosSale) => {
    setSelectedSale(sale)
    setShowVoidDialog(true)
  }

  const handleConfirmVoid = async (reason: string) => {
    if (!selectedSale) return
    try {
      await requestVoid.mutateAsync({ saleId: selectedSale.id, reason })
      setShowVoidDialog(false)
      setSelectedSale(null)
    } catch {
      // Error handled by mutation
    }
  }

  const paymentMethodIcons: Record<string, typeof Banknote> = {
    cash: Banknote,
    card: CreditCard,
    webpay: CreditCard,
    transfer: Building2,
  }

  return (
    <UserLayout title="Historial de Ventas" userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/reception/pos">
              <PremiumButton variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </PremiumButton>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Historial de Ventas</h1>
              <p className="text-muted-foreground">Ventas del día</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <DashboardCard>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as PosSaleStatus | "all")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="void_pending">Anulación pendiente</SelectItem>
                <SelectItem value="voided">Anuladas</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={paymentFilter}
              onValueChange={setPaymentFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>
            {sales.length > 0 && (
              <Badge variant="secondary">
                {sales.length} venta{sales.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </DashboardCard>

        {/* Sales Table */}
        <DashboardCard title="Ventas">
          <SalesHistoryTable
            sales={sales}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onRequestVoid={handleRequestVoid}
          />
        </DashboardCard>
      </div>

      {/* Sale Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Detalle de Venta
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Boleta</p>
                  <p className="font-mono font-medium">
                    {selectedSale.receiptNumber || selectedSale.id.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDateTimeCL(selectedSale.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">
                    {selectedSale.profile
                      ? `${selectedSale.profile.firstName} ${selectedSale.profile.lastName}`
                      : "No registrado"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vendedor</p>
                  <p className="font-medium">
                    {selectedSale.soldBy?.rut || "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {selectedSale.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 bg-muted/50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {item.planId ? "Plan" : "Producto"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">Sin items</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = paymentMethodIcons[selectedSale.paymentMethod] || Banknote
                    return <Icon className="h-4 w-4 text-muted-foreground" />
                  })()}
                  <span className="text-sm capitalize">{selectedSale.paymentMethod}</span>
                </div>
                <p className="text-xl font-bold text-primary">
                  {formatPrice(selectedSale.totalClp)}
                </p>
              </div>

              {selectedSale.notes && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm">{selectedSale.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Void Request Dialog */}
      <VoidRequestDialog
        open={showVoidDialog}
        onOpenChange={setShowVoidDialog}
        onConfirm={handleConfirmVoid}
        isLoading={requestVoid.isPending}
        sale={selectedSale}
      />
    </UserLayout>
  )
}
