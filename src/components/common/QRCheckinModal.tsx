import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PremiumButton } from "./PremiumButton"
import { QrCode, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth, useSubscription, useCheckin } from "@/hooks"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface QRCheckinModalProps {
  trigger?: React.ReactNode
}

export function QRCheckinModal({ trigger }: QRCheckinModalProps) {
  const { user, profile } = useAuth()
  const { data: subscriptionData, isLoading: subLoading } = useSubscription()
  const checkin = useCheckin()
  const [checkinSuccess, setCheckinSuccess] = useState(false)

  const subscription = subscriptionData?.subscription
  const hasActiveSubscription = subscription?.status === "active"

  // Generate QR data - user ID that reception can scan
  const qrData = JSON.stringify({
    type: "titanium_checkin",
    userId: user?.id,
    timestamp: Date.now(),
  })

  const handleSelfCheckin = async () => {
    try {
      await checkin.mutateAsync()
      setCheckinSuccess(true)
      setTimeout(() => setCheckinSuccess(false), 3000)
    } catch (error) {
      console.error("Check-in error:", error)
    }
  }

  const defaultTrigger = (
    <PremiumButton className="w-full sm:w-auto">
      <QrCode className="mr-2 h-4 w-4" />
      Mi QR Check-in
    </PremiumButton>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Check-in QR
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {/* User Info */}
          <div className="text-center mb-4">
            <p className="font-bold text-lg">
              {profile?.firstName} {profile?.lastName}
            </p>
            <p className="text-muted-foreground text-sm">{user?.rut}</p>
          </div>

          {/* Subscription Status */}
          {subLoading ? (
            <Badge variant="secondary">Cargando...</Badge>
          ) : hasActiveSubscription ? (
            <Badge variant="default" className="bg-green-600 mb-4">
              <CheckCircle className="mr-1 h-3 w-3" />
              {subscription.plan.name} - Activa
            </Badge>
          ) : (
            <Badge variant="destructive" className="mb-4">
              <AlertCircle className="mr-1 h-3 w-3" />
              Sin membresía activa
            </Badge>
          )}

          {/* QR Code */}
          {hasActiveSubscription ? (
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <QRCodeSVG
                value={qrData}
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          ) : (
            <div className="bg-muted p-8 rounded-lg text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Necesitas una membresía activa para hacer check-in
              </p>
            </div>
          )}

          {/* Instructions */}
          {hasActiveSubscription && (
            <div className="text-center mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Muestra este código en recepción para registrar tu entrada
              </p>

              {/* Self Check-in Button */}
              <div className="pt-2 border-t border-border">
                <PremiumButton
                  variant="outline"
                  onClick={handleSelfCheckin}
                  loading={checkin.isPending}
                  disabled={checkinSuccess}
                  className="w-full"
                >
                  {checkinSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      ¡Check-in Exitoso!
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Check-in Automático
                    </>
                  )}
                </PremiumButton>
                <p className="text-xs text-muted-foreground mt-2">
                  Usa esto si estás en el gimnasio
                </p>
              </div>

              {checkin.isError && (
                <p className="text-sm text-destructive">
                  {(checkin.error as Error).message || "Error al hacer check-in"}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
