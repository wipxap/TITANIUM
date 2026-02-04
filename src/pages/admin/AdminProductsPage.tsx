import { UserLayout } from "@/components/layout/UserLayout"
import { DashboardCard } from "@/components/common"
import { useAuth } from "@/hooks"
import { Package } from "lucide-react"

export function AdminProductsPage() {
  const { user } = useAuth()

  return (
    <UserLayout title="Productos" userRole={user?.role}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-primary text-glow">
          Productos
        </h1>

        <DashboardCard title="Gestión de Productos">
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Módulo en desarrollo</p>
            <p className="text-sm">Próximamente podrás gestionar productos del gimnasio aquí.</p>
          </div>
        </DashboardCard>
      </div>
    </UserLayout>
  )
}
