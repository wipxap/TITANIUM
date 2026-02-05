import { Eye } from "lucide-react"
import { useRoleSwitcher } from "@/hooks/useRoleSwitcher"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  reception: "Recepción",
  instructor: "Instructor",
  user: "Usuario",
}

export function RoleSwitcher() {
  const { effectiveRole, setRole, isAdmin } = useRoleSwitcher()

  if (!isAdmin) return null

  return (
    <div className="px-2 mb-4">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
        <Eye className="h-3.5 w-3.5" />
        Viendo como
      </label>
      <Select value={effectiveRole} onValueChange={(v) => setRole(v as "admin" | "reception" | "instructor" | "user")}>
        <SelectTrigger className="h-8 text-sm bg-card border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
