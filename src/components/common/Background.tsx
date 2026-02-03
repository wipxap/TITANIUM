import { cn } from "@/lib/utils"

interface BackgroundProps {
  children: React.ReactNode
  className?: string
}

export function Background({ children, className }: BackgroundProps) {
  // Check if className contains flex to propagate to inner container
  const hasFlex = className?.includes("flex")
  
  return (
    <div className={cn("min-h-screen bg-background relative overflow-hidden", className)}>
      <div className="absolute inset-0 gradient-titanium pointer-events-none" />
      <div className={cn("relative z-10", hasFlex && "flex min-h-screen w-full")}>
        {children}
      </div>
    </div>
  )
}
