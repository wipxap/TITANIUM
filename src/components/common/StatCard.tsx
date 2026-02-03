import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  accent?: boolean
  className?: string
}

export function StatCard({ icon: Icon, label, value, accent, className }: StatCardProps) {
  return (
    <Card className={cn("bg-card border-border glow-red", className)}>
      <CardContent className="flex items-center gap-4 p-3">
        <div className={cn("p-3 rounded-full", accent ? "bg-primary" : "bg-accent")}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-3xl font-bold text-primary text-glow">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
