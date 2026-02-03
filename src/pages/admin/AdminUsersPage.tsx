import { useState } from "react"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumTable, PremiumButton } from "@/components/common"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Shield, User, UserCheck } from "lucide-react"
import { useAuth, useAdminUsers, useUpdateUserRole } from "@/hooks"
import { formatRut } from "@/lib/utils"

const roleLabels = {
  admin: { label: "Admin", variant: "destructive" as const, icon: Shield },
  reception: { label: "Recepción", variant: "secondary" as const, icon: UserCheck },
  user: { label: "Usuario", variant: "outline" as const, icon: User },
}

export function AdminUsersPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { data, isLoading } = useAdminUsers({ search: debouncedSearch })
  const updateRole = useUpdateUserRole()

  // Debounce search
  const handleSearch = (value: string) => {
    setSearch(value)
    setTimeout(() => setDebouncedSearch(value), 300)
  }

  const handleRoleChange = (userId: string, role: "admin" | "reception" | "user") => {
    updateRole.mutate({ id: userId, role })
  }

  const users = data?.users || []

  return (
    <UserLayout title="Usuarios - Admin" userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Usuarios</h1>
            <p className="text-muted-foreground">
              {data?.pagination.total || 0} usuarios registrados
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por RUT, nombre o email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        {/* Users Table */}
        <DashboardCard title="Lista de Usuarios" loading={isLoading}>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <PremiumTable
              headers={["Usuario", "RUT", "Email", "Rol", "Acciones"]}
              loading={isLoading}
              rows={users.map((u) => [
                <div key={u.id} className="min-w-[150px]">
                  <p className="font-medium">
                    {u.profile?.firstName} {u.profile?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {u.profile?.phone || "Sin teléfono"}
                  </p>
                </div>,
                <span key={`rut-${u.id}`} className="font-mono text-sm">
                  {formatRut(u.rut)}
                </span>,
                <span key={`email-${u.id}`} className="text-sm text-muted-foreground">
                  {u.email || "—"}
                </span>,
                <Badge
                  key={`role-${u.id}`}
                  variant={roleLabels[u.role].variant}
                  className="gap-1"
                >
                  {roleLabels[u.role].label}
                </Badge>,
                <Select
                  key={`select-${u.id}`}
                  value={u.role}
                  onValueChange={(value) =>
                    handleRoleChange(u.id, value as "admin" | "reception" | "user")
                  }
                  disabled={updateRole.isPending}
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="reception">Recepción</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>,
              ])}
            />
          </div>

          {/* Pagination info */}
          {data?.pagination && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Mostrando {users.length} de {data.pagination.total} usuarios
            </div>
          )}
        </DashboardCard>
      </div>
    </UserLayout>
  )
}
