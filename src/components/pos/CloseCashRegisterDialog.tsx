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
import { Lock, Banknote, CreditCard, Building2, AlertTriangle, Check } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { CashRegisterWithDetails, CloseCashRegisterData } from "@/lib/api"

interface CloseCashRegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: CloseCashRegisterData) => void
  isLoading: boolean
  cashRegister: CashRegisterWithDetails | null
}

export function CloseCashRegisterDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  cashRegister,
}: CloseCashRegisterDialogProps) {
  const [declaredCash, setDeclaredCash] = useState("")
  const [declaredCard, setDeclaredCard] = useState("")
  const [declaredTransfer, setDeclaredTransfer] = useState("")
  const [notes, setNotes] = useState("")

  const totals = cashRegister?.currentTotals || { cash: 0, card: 0, webpay: 0, transfer: 0 }
  const expectedCash = (cashRegister?.initialAmount || 0) + totals.cash
  const expectedCard = totals.card + totals.webpay
  const expectedTransfer = totals.transfer

  const numericCash = parseInt(declaredCash) || 0
  const numericCard = parseInt(declaredCard) || 0
  const numericTransfer = parseInt(declaredTransfer) || 0

  const cashDiff = numericCash - expectedCash
  const cardDiff = numericCard - expectedCard
  const transferDiff = numericTransfer - expectedTransfer
  const totalDiff = cashDiff + cardDiff + transferDiff

  const handleConfirm = () => {
    onConfirm({
      declaredCash: numericCash,
      declaredCard: numericCard,
      declaredTransfer: numericTransfer,
      notes: notes || undefined,
    })
    // Reset form
    setDeclaredCash("")
    setDeclaredCard("")
    setDeclaredTransfer("")
    setNotes("")
  }

  const DifferenceIndicator = ({ diff }: { diff: number }) => {
    if (diff === 0) {
      return <Check className="h-4 w-4 text-green-500" />
    }
    return (
      <span className={diff > 0 ? "text-green-500" : "text-red-500"}>
        {diff > 0 ? "+" : ""}{formatPrice(diff)}
      </span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Cerrar Caja - Arqueo
          </DialogTitle>
          <DialogDescription>
            Cuenta el dinero por cada método de pago y registra los montos declarados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            {/* Cash */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Efectivo
                </Label>
                <span className="text-sm text-muted-foreground">
                  Esperado: {formatPrice(expectedCash)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder={expectedCash.toString()}
                  value={declaredCash}
                  onChange={(e) => setDeclaredCash(e.target.value)}
                  className="flex-1"
                />
                {declaredCash && <DifferenceIndicator diff={cashDiff} />}
              </div>
            </div>

            {/* Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Tarjeta (Débito + Crédito)
                </Label>
                <span className="text-sm text-muted-foreground">
                  Esperado: {formatPrice(expectedCard)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder={expectedCard.toString()}
                  value={declaredCard}
                  onChange={(e) => setDeclaredCard(e.target.value)}
                  className="flex-1"
                />
                {declaredCard && <DifferenceIndicator diff={cardDiff} />}
              </div>
            </div>

            {/* Transfer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Transferencias
                </Label>
                <span className="text-sm text-muted-foreground">
                  Esperado: {formatPrice(expectedTransfer)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder={expectedTransfer.toString()}
                  value={declaredTransfer}
                  onChange={(e) => setDeclaredTransfer(e.target.value)}
                  className="flex-1"
                />
                {declaredTransfer && <DifferenceIndicator diff={transferDiff} />}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input
                placeholder="Ej: Vuelto mal dado, faltante justificado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Summary */}
          {(declaredCash || declaredCard || declaredTransfer) && (
            <div className={`p-3 rounded-lg border ${
              totalDiff === 0
                ? "bg-green-500/10 border-green-500/30"
                : totalDiff > 0
                ? "bg-blue-500/10 border-blue-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {totalDiff === 0 ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className={`h-4 w-4 ${totalDiff > 0 ? "text-blue-500" : "text-red-500"}`} />
                  )}
                  <span className="font-medium">
                    {totalDiff === 0
                      ? "Caja cuadrada"
                      : totalDiff > 0
                      ? "Sobrante"
                      : "Faltante"}
                  </span>
                </div>
                <span className={`font-bold ${
                  totalDiff === 0
                    ? "text-green-500"
                    : totalDiff > 0
                    ? "text-blue-500"
                    : "text-red-500"
                }`}>
                  {totalDiff !== 0 && (totalDiff > 0 ? "+" : "")}{formatPrice(Math.abs(totalDiff))}
                </span>
              </div>
            </div>
          )}
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
            disabled={!declaredCash && !declaredCard && !declaredTransfer}
          >
            Cerrar Caja
          </PremiumButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
