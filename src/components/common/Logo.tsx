import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizes = {
  sm: "h-12 w-auto",      // For header (48px height)
  md: "h-20 w-auto",      // For sidebar (80px height)
  lg: "h-32 w-auto",      // Medium displays
  xl: "h-48 w-auto"       // Hero sections
}

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <img
      src="/assets/logo.png"
      alt="Titanium Gym Logo"
      className={cn(
        "object-contain transition-all duration-300 hover:scale-105",
        "drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]",
        "hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]",
        sizes[size],
        className
      )}
    />
  )
}
