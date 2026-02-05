import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface DashboardCardProps {
  title?: React.ReactNode
  children: React.ReactNode
  loading?: boolean
  className?: string
}

export function DashboardCard({ title, children, loading, className }: DashboardCardProps) {
  return (
    <Card className={cn("bg-card border-border glow-red", className)}>
      {title && (
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-primary text-glow text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("p-3", title ? "pt-0" : "")}>
        {loading ? (
          <Skeleton className="h-32 w-full skeleton-red rounded-lg" />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
