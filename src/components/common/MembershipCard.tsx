import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PremiumButton } from "./PremiumButton"
import { CreditCard, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import type { Subscription } from "@/lib/api"

interface MembershipCardProps {
  subscription: Subscription | null | undefined
  loading?: boolean
  showRenewButton?: boolean
  compact?: boolean
  className?: string
}

function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getMembershipStatus(daysRemaining: number, status: string) {
  if (status !== "active") {
    return {
      color: "destructive" as const,
      bgClass: "bg-destructive/10 border-destructive/30",
      progressClass: "bg-destructive",
      icon: XCircle,
      label: status === "expired" ? "Vencida" : status === "cancelled" ? "Cancelada" : "Pendiente",
    }
  }

  if (daysRemaining <= 0) {
    return {
      color: "destructive" as const,
      bgClass: "bg-destructive/10 border-destructive/30",
      progressClass: "bg-destructive",
      icon: XCircle,
      label: "Vencida",
    }
  }

  if (daysRemaining <= 7) {
    return {
      color: "destructive" as const,
      bgClass: "bg-destructive/10 border-destructive/30",
      progressClass: "bg-destructive",
      icon: AlertTriangle,
      label: "Por vencer",
    }
  }

  if (daysRemaining <= 15) {
    return {
      color: "warning" as const,
      bgClass: "bg-yellow-500/10 border-yellow-500/30",
      progressClass: "bg-yellow-500",
      icon: Clock,
      label: "Atención",
    }
  }

  return {
    color: "success" as const,
    bgClass: "bg-green-500/10 border-green-500/30",
    progressClass: "bg-green-500",
    icon: CheckCircle,
    label: "Activa",
  }
}

export function MembershipCard({
  subscription,
  loading,
  showRenewButton = true,
  compact = false,
  className,
}: MembershipCardProps) {
  if (loading) {
    return (
      <Card className={cn("bg-card border-border glow-red", className)}>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-primary text-glow text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mi Membresía
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 skeleton-red" />
            <Skeleton className="h-4 w-full skeleton-red" />
            <Skeleton className="h-10 w-full skeleton-red" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // No subscription
  if (!subscription) {
    return (
      <Card className={cn("bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 glow-red", className)}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Sin membresía activa
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Adquiere un plan para acceder a todas las funcionalidades del gym
              </p>
            </div>
            <Link to="/planes">
              <PremiumButton>Ver Planes</PremiumButton>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const daysRemaining = calculateDaysRemaining(subscription.endDate)
  const status = getMembershipStatus(daysRemaining, subscription.status)
  const StatusIcon = status.icon

  // Calculate progress (based on typical 30-day membership)
  const totalDays = 30 // Could be improved to use actual plan duration
  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100))

  const showRenew = showRenewButton && (daysRemaining <= 7 || subscription.status !== "active")

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg border", status.bgClass, className)}>
        <StatusIcon className={cn("h-5 w-5", {
          "text-green-500": status.color === "success",
          "text-yellow-500": status.color === "warning",
          "text-destructive": status.color === "destructive",
        })} />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{subscription.plan.name}</p>
          <p className="text-sm text-muted-foreground">
            {daysRemaining > 0 ? `${daysRemaining} días restantes` : "Membresía vencida"}
          </p>
        </div>
        <Badge variant={status.color === "success" ? "default" : status.color === "warning" ? "secondary" : "destructive"}>
          {status.label}
        </Badge>
      </div>
    )
  }

  return (
    <Card className={cn("border glow-red", status.bgClass, className)}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Mi Membresía
          </CardTitle>
          <Badge variant={status.color === "success" ? "default" : status.color === "warning" ? "secondary" : "destructive"}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-4">
        {/* Plan Name */}
        <div>
          <p className="text-2xl font-bold text-primary">{subscription.plan.name}</p>
          <p className="text-sm text-muted-foreground">
            Válido hasta {new Date(subscription.endDate).toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Días restantes</span>
            <span className={cn("font-bold", {
              "text-green-500": status.color === "success",
              "text-yellow-500": status.color === "warning",
              "text-destructive": status.color === "destructive",
            })}>
              {daysRemaining > 0 ? daysRemaining : 0}
            </span>
          </div>
          <Progress
            value={progressPercent}
            className={cn("h-2", status.progressClass)}
          />
        </div>

        {/* Features */}
        {subscription.plan.features && subscription.plan.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {subscription.plan.features.slice(0, 3).map((feature, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {subscription.plan.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{subscription.plan.features.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Renew Button */}
        {showRenew && (
          <Link to="/planes">
            <PremiumButton className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Renovar Membresía
            </PremiumButton>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to export for use in other components
export { calculateDaysRemaining, getMembershipStatus }
