import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Home,
  ClipboardList,
  Settings,
  UserCheck,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  icon: LucideIcon
  label: string
  to: string
  roles?: string[]
}

const navItems: NavItem[] = [
  { icon: Home, label: "Inicio", to: "/my" },
  { icon: ClipboardList, label: "Rutina", to: "/my/routine", roles: ["user", "instructor"] },
  { icon: TrendingUp, label: "Progreso", to: "/my/progress", roles: ["user", "instructor"] },
  { icon: UserCheck, label: "Check-in", to: "/reception/checkin", roles: ["admin", "reception"] },
  { icon: DollarSign, label: "POS", to: "/reception/pos", roles: ["admin", "reception"] },
  { icon: Settings, label: "Ajustes", to: "/settings" },
]

interface MobileNavProps {
  userRole?: string
}

export function MobileNav({ userRole = "user" }: MobileNavProps) {
  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {filteredItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                "text-muted-foreground",
                isActive && "text-primary"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isActive && "bg-primary/20 glow-red"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
