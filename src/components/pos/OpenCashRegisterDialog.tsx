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
import { Unlock, Banknote } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface OpenCashRegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (initialAmount: number) => void
  isLoading: boolean
}

export function OpenCashRegisterDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: OpenCashRegisterDialogProps) {
  const [amount, setAmount] = useState("")

  const handleConfirm = () => {
    const numericAmount = parseInt(amount) || 0
    onConfirm(numericAmount)
    setAmount("")
  }

  const numericAmount = parseInt(amount) || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-primary" />
            Abrir Caja
          </DialogTitle>
          <DialogDescription>
            Ingresa el monto de efectivo inicial en la caja. Este será el punto de partida para el arqueo al cierre.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="initialAmount">Monto Inicial (CLP)</Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="initialAmount"
                type="number"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-lg"
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Puedes dejarlo en $0 si no hay efectivo inicial
            </p>
          </div>

          {numericAmount > 0 && (
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Monto inicial:</p>
              <p className="text-xl font-bold text-primary">{formatPrice(numericAmount)}</p>
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
          <PremiumButton onClick={handleConfirm} loading={isLoading}>
            Abrir Caja
          </PremiumButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
