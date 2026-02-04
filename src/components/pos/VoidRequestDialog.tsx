import { useState } from "react"
import { PremiumButton } from "@/components/common"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { PosSale } from "@/lib/api"

interface VoidRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  isLoading: boolean
  sale: PosSale | null
}

export function VoidRequestDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  sale,
}: VoidRequestDialogProps) {
  const [reason, setReason] = useState("")

  const handleConfirm = () => {
    if (reason.length >= 10) {
      onConfirm(reason)
      setReason("")
    }
  }

  if (!sale) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-500">
            <AlertTriangle className="h-5 w-5" />
            Solicitar Anulación
          </DialogTitle>
          <DialogDescription>
            Esta solicitud será revisada por un administrador antes de ser aprobada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Boleta:</span>
              <span className="font-mono">{sale.receiptNumber || sale.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto:</span>
              <span className="font-bold text-primary">{formatPrice(sale.totalClp)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cliente:</span>
              <span>
                {sale.profile
                  ? `${sale.profile.firstName} ${sale.profile.lastName}`
                  : "No registrado"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Motivo de la anulación <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reason"
              placeholder="Ej: Cliente devolvió producto sin abrir..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={reason.length > 0 && reason.length < 10 ? "border-red-500" : ""}
            />
            {reason.length > 0 && reason.length < 10 && (
              <p className="text-xs text-red-500">
                El motivo debe tener al menos 10 caracteres ({reason.length}/10)
              </p>
            )}
          </div>

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-500">
              Si esta venta incluye un plan, la suscripción del cliente será cancelada automáticamente al aprobar la anulación.
            </p>
          </div>
        </div>

        <DialogFooter>
          <PremiumButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </PremiumButton>
          <PremiumButton
            onClick={handleConfirm}
            loading={isLoading}
            disabled={reason.length < 10}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Solicitar Anulación
          </PremiumButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
