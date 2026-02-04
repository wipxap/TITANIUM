import { useRef, useEffect, useState } from "react"
import { PremiumButton } from "./PremiumButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eraser, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void
  onCancel?: () => void
  width?: number
  height?: number
  className?: string
}

export function SignatureCanvas({
  onSave,
  onCancel,
  width = 400,
  height = 200,
  className,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas background
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set drawing style
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasDrawn(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawn) return

    const signatureData = canvas.toDataURL("image/png")
    onSave(signatureData)
  }

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-lg">Firma Digital</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Dibuja tu firma en el recuadro usando el mouse o tu dedo
        </p>

        <div className="border border-border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="flex gap-2">
          <PremiumButton
            variant="outline"
            onClick={clearCanvas}
            className="flex-1"
          >
            <Eraser className="h-4 w-4 mr-2" />
            Limpiar
          </PremiumButton>

          {onCancel && (
            <PremiumButton
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </PremiumButton>
          )}

          <PremiumButton
            onClick={saveSignature}
            disabled={!hasDrawn}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Firmar
          </PremiumButton>
        </div>
      </CardContent>
    </Card>
  )
}
