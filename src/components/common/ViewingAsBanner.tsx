import { useRoleSwitcher } from "@/hooks/useRoleSwitcher"

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  reception: "Recepción",
  instructor: "Instructor",
  user: "Usuario",
}

export function ViewingAsBanner() {
  const { effectiveRole, isViewingAs, resetRole } = useRoleSwitcher()

  if (!isViewingAs) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] bg-amber-600 text-black text-center py-1.5 text-sm font-medium cursor-pointer select-none"
      onClick={resetRole}
    >
      Vista: {ROLE_LABELS[effectiveRole] ?? effectiveRole}
      <span className="ml-3 underline">Volver a Admin</span>
    </div>
  )
}
