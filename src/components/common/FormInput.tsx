import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormInput({ label, error, className, id, ...props }: FormInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-primary font-medium">
        {label}
      </Label>
      <Input
        id={inputId}
        className={cn(
          "border-border bg-card focus:ring-primary focus:border-primary glow-red",
          error && "border-destructive focus:border-destructive",
          className
        )}
        {...props}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
