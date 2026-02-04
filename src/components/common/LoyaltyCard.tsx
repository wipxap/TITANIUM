import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Star, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MyLoyaltyLevel } from "@/lib/api"

interface LoyaltyCardProps {
  loyaltyData: MyLoyaltyLevel | undefined
  loading?: boolean
  className?: string
}

export function LoyaltyCard({ loyaltyData, loading, className }: LoyaltyCardProps) {
  if (loading) {
    return (
      <Card className={cn("bg-card border-border glow-red", className)}>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-primary text-glow text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Programa de Lealtad
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-3">
            <Skeleton className="h-8 w-32 skeleton-red" />
            <Skeleton className="h-4 w-full skeleton-red" />
            <Skeleton className="h-20 w-full skeleton-red" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!loyaltyData) {
    return null
  }

  const { accumulatedDays, currentLevel, nextLevel, progressToNext } = loyaltyData

  return (
    <Card className={cn("bg-card border-border glow-red", className)}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Programa de Lealtad
          </CardTitle>
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              borderColor: currentLevel?.color || "#B71C1C",
              color: currentLevel?.color || "#B71C1C",
            }}
          >
            {accumulatedDays} días
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-4">
        {/* Current Level */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${currentLevel?.color || "#B71C1C"}20` }}
          >
            <Star
              className="h-6 w-6"
              style={{ color: currentLevel?.color || "#B71C1C" }}
            />
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: currentLevel?.color || "#B71C1C" }}>
              {currentLevel?.name || "Sin nivel"}
            </p>
            {currentLevel?.discountPercent && currentLevel.discountPercent > 0 && (
              <p className="text-sm text-muted-foreground">
                {currentLevel.discountPercent}% descuento en renovaciones
              </p>
            )}
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && progressToNext && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Próximo nivel</span>
              <span className="flex items-center gap-1">
                <span style={{ color: nextLevel.color || "#E57373" }}>{nextLevel.name}</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
            <Progress value={progressToNext.percentComplete} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progressToNext.daysNeeded} días más para {nextLevel.name}
            </p>
          </div>
        )}

        {/* Benefits */}
        {currentLevel?.benefits && currentLevel.benefits.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Tus beneficios:</p>
            <div className="flex flex-wrap gap-1">
              {currentLevel.benefits.map((benefit, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* No level yet */}
        {!currentLevel && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Acumula días de entrenamiento para desbloquear beneficios
          </p>
        )}
      </CardContent>
    </Card>
  )
}
