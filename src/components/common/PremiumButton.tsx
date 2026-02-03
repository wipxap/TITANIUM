import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: "default" | "outline" | "destructive" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function PremiumButton({
  children,
  loading,
  className,
  variant = "default",
  size = "default",
  disabled,
  ...props
}: PremiumButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "font-bold uppercase tracking-wider glow-red hover:scale-105 transition-all",
        variant === "default" && "bg-primary hover:bg-accent text-primary-foreground",
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
