import { DashboardCard, PremiumButton } from "@/components/common"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CircleDollarSign,
  Lock,
  Unlock,
  Banknote,
  CreditCard,
  Building2,
  Clock,
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { CashRegisterWithDetails } from "@/lib/api"

interface CashRegisterStatusProps {
  cashRegister: CashRegisterWithDetails | null
  isOpen: boolean
  isLoading: boolean
  onOpen: () => void
  onClose: () => void
}

export function CashRegisterStatus({
  cashRegister,
  isOpen,
  isLoading,
  onOpen,
  onClose,
}: CashRegisterStatusProps) {
  if (isLoading) {
    return (
      <DashboardCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </DashboardCard>
    )
  }

  if (!isOpen || !cashRegister) {
    return (
      <DashboardCard className="bg-yellow-500/10 border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Lock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="font-medium text-yellow-500">Caja Cerrada</p>
              <p className="text-sm text-muted-foreground">
                Debe abrir caja para realizar ventas
              </p>
            </div>
          </div>
          <PremiumButton onClick={onOpen} className="gap-2">
            <Unlock className="h-4 w-4" />
            Abrir Caja
          </PremiumButton>
        </div>
      </DashboardCard>
    )
  }

  const totals = cashRegister.currentTotals || { cash: 0, card: 0, webpay: 0, transfer: 0 }
  const totalSales = totals.cash + totals.card + totals.webpay + totals.transfer

  return (
    <DashboardCard className="bg-green-500/10 border-green-500/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CircleDollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-green-500">Caja Abierta</p>
                <Badge variant="secondary" className="text-xs">
                  {cashRegister.salesCount} ventas
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Abierta por {cashRegister.openedByUser?.name || "N/A"}
              </p>
            </div>
          </div>
          <PremiumButton variant="outline" onClick={onClose} className="gap-2">
            <Lock className="h-4 w-4" />
            Cerrar Caja
          </PremiumButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-2 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Banknote className="h-3 w-3" />
              Efectivo
            </div>
            <p className="font-medium">{formatPrice(totals.cash)}</p>
          </div>
          <div className="p-2 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CreditCard className="h-3 w-3" />
              Tarjeta
            </div>
            <p className="font-medium">{formatPrice(totals.card + totals.webpay)}</p>
          </div>
          <div className="p-2 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Building2 className="h-3 w-3" />
              Transfer
            </div>
            <p className="font-medium">{formatPrice(totals.transfer)}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/30">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Clock className="h-3 w-3" />
              Total
            </div>
            <p className="font-bold text-primary">{formatPrice(totalSales)}</p>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
