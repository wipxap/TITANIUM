import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { PremiumButton } from "./PremiumButton"
import { SignatureCanvas } from "./SignatureCanvas"
import { FileText, ChevronRight } from "lucide-react"
import { useSignContract } from "@/hooks"
import type { Contract } from "@/lib/api"

interface ContractSignModalProps {
  contract: Contract
  open: boolean
  onOpenChange: (open: boolean) => void
  onSigned?: () => void
  subscriptionId?: string
}

export function ContractSignModal({
  contract,
  open,
  onOpenChange,
  onSigned,
  subscriptionId,
}: ContractSignModalProps) {
  const [step, setStep] = useState<"read" | "sign">("read")
  const [hasReadContract, setHasReadContract] = useState(false)
  const signContract = useSignContract()

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50
    if (isAtBottom) {
      setHasReadContract(true)
    }
  }

  const handleSign = async (signatureData: string) => {
    try {
      await signContract.mutateAsync({
        contractId: contract.id,
        signatureData,
        subscriptionId,
      })
      onOpenChange(false)
      onSigned?.()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleClose = () => {
    setStep("read")
    setHasReadContract(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {contract.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant="outline">Versión {contract.version}</Badge>
            {step === "read" ? "Lee el contrato completo" : "Firma el contrato"}
          </DialogDescription>
        </DialogHeader>

        {step === "read" ? (
          <>
            <ScrollArea
              className="h-[400px] border border-border rounded-lg p-4"
              onScrollCapture={handleScroll}
            >
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: contract.content }}
              />
            </ScrollArea>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {hasReadContract
                  ? "Has leído el contrato completo"
                  : "Desplázate hasta el final para continuar"}
              </p>
              <PremiumButton
                onClick={() => setStep("sign")}
                disabled={!hasReadContract}
              >
                Continuar a Firmar
                <ChevronRight className="ml-2 h-4 w-4" />
              </PremiumButton>
            </div>
          </>
        ) : (
          <SignatureCanvas
            onSave={handleSign}
            onCancel={() => setStep("read")}
          />
        )}

        {signContract.isPending && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <p className="text-muted-foreground">Guardando firma...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
