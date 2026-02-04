import { Badge } from "@/components/ui/badge"
import { PremiumButton } from "@/components/common"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Banknote,
  CreditCard,
  Building2,
  Ban,
  Clock,
  Check,
  Eye,
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { PosSale, PosSaleStatus } from "@/lib/api"

interface SalesHistoryTableProps {
  sales: PosSale[]
  isLoading: boolean
  onViewDetails: (sale: PosSale) => void
  onRequestVoid: (sale: PosSale) => void
}

const statusConfig: Record<PosSaleStatus, { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof Check }> = {
  completed: { label: "Completada", variant: "default", icon: Check },
  void_pending: { label: "Anulación pendiente", variant: "secondary", icon: Clock },
  voided: { label: "Anulada", variant: "destructive", icon: Ban },
}

const paymentMethodIcons: Record<string, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  webpay: CreditCard,
  transfer: Building2,
}

export function SalesHistoryTable({
  sales,
  isLoading,
  onViewDetails,
  onRequestVoid,
}: SalesHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay ventas para mostrar</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Boleta</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            const status = statusConfig[sale.status]
            const PaymentIcon = paymentMethodIcons[sale.paymentMethod] || Banknote
            const StatusIcon = status.icon

            return (
              <TableRow key={sale.id}>
                <TableCell className="font-mono text-sm">
                  {sale.receiptNumber || sale.id.slice(0, 8)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(sale.createdAt).toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "America/Santiago",
                  })}
                </TableCell>
                <TableCell>
                  {sale.profile
                    ? `${sale.profile.firstName} ${sale.profile.lastName}`
                    : <span className="text-muted-foreground">No registrado</span>}
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(sale.totalClp)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{sale.paymentMethod}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <PremiumButton
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(sale)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </PremiumButton>
                    {sale.status === "completed" && (
                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        onClick={() => onRequestVoid(sale)}
                        className="h-8 w-8 p-0 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                      >
                        <Ban className="h-4 w-4" />
                      </PremiumButton>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
