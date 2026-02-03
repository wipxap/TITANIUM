import { NavLink } from "react-router-dom"
import { Logo } from "./Logo"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  DollarSign,
  Dumbbell,
  Settings,
  ClipboardList,
  UserCheck,
  Package,
  LogOut,
  TrendingUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/hooks"

interface NavItem {
  icon: LucideIcon
  label: string
  to: string
  roles?: string[]
}

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", to: "/my" },
  { icon: ClipboardList, label: "Mi Rutina", to: "/my/routine", roles: ["user", "instructor"] },
  { icon: TrendingUp, label: "Mi Progreso", to: "/my/progress", roles: ["user", "instructor"] },
  { icon: UserCheck, label: "Check-in", to: "/reception/checkin", roles: ["admin", "reception"] },
  { icon: DollarSign, label: "POS", to: "/reception/pos", roles: ["admin", "reception"] },
  { icon: Users, label: "Usuarios", to: "/admin/users", roles: ["admin"] },
  { icon: Dumbbell, label: "Máquinas", to: "/admin/machines", roles: ["admin", "instructor"] },
  { icon: Package, label: "Productos", to: "/admin/products", roles: ["admin"] },
  { icon: Settings, label: "Ajustes", to: "/settings" },
]

interface SidebarProps {
  userRole?: string
}

export function Sidebar({ userRole = "user" }: SidebarProps) {
  const { logout, logoutLoading } = useAuth()
  
  const filteredItems = navItems.filter((item) => {
    // If no roles specified, show to everyone
    if (!item.roles) return true
    // If user role matches any of the item's roles
    return item.roles.includes(userRole)
  })

  return (
    <aside className="hidden md:flex bg-card w-64 border-r border-border min-h-screen p-4 flex-col shrink-0">
      <Logo size="md" className="mb-6 mx-auto" />
      <nav className="space-y-1 flex-1">
        {filteredItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                "hover:bg-primary/20 hover:glow-red",
                isActive && "bg-primary/20 text-primary glow-red"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Logout at bottom */}
      <button
        onClick={() => logout()}
        disabled={logoutLoading}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full mt-4",
          "hover:bg-destructive/20 text-muted-foreground hover:text-destructive",
          logoutLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">{logoutLoading ? "Saliendo..." : "Cerrar Sesión"}</span>
      </button>
    </aside>
  )
}
