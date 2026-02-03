import { LandingLayout } from "@/components/layout"
import { DashboardCard, PremiumTable, PremiumButton } from "@/components/common"
import { LocalBusinessSchema } from "@/components/seo"
import { Skeleton } from "@/components/ui/skeleton"
import { Dumbbell, AlertCircle } from "lucide-react"
import { useMachines } from "@/hooks"

const muscleGroupLabels: Record<string, { label: string; icon: string }> = {
  chest: { label: "Pecho", icon: "💪" },
  back: { label: "Espalda", icon: "🔙" },
  shoulders: { label: "Hombros", icon: "🎯" },
  arms: { label: "Brazos", icon: "💪" },
  legs: { label: "Piernas", icon: "🦵" },
  core: { label: "Core", icon: "🎯" },
  cardio: { label: "Cardio", icon: "❤️" },
  full_body: { label: "Full Body", icon: "🏋️" },
}

function GroupCardSkeleton() {
  return (
    <DashboardCard title="">
      <div className="text-center">
        <Skeleton className="h-8 w-8 mx-auto mb-2 skeleton-red" />
        <Skeleton className="h-5 w-16 mx-auto mb-1 skeleton-red" />
        <Skeleton className="h-4 w-20 mx-auto skeleton-red" />
      </div>
    </DashboardCard>
  )
}

function TableSkeleton() {
  return (
    <DashboardCard title="Catálogo Completo" loading>
      <div />
    </DashboardCard>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">No hay máquinas disponibles</h3>
      <p className="text-muted-foreground">
        El catálogo de máquinas estará disponible próximamente.
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">Error al cargar máquinas</h3>
      <p className="text-muted-foreground mb-4">
        No pudimos cargar el catálogo. Intenta de nuevo.
      </p>
      <PremiumButton onClick={onRetry}>Reintentar</PremiumButton>
    </div>
  )
}

export function MaquinasPage() {
  const { data, isLoading, error, refetch } = useMachines()
  const machines = data?.machines || []

  // Group machines by muscle group
  const groupedMachines = machines.reduce(
    (acc, machine) => {
      const group = machine.muscleGroup
      if (!acc[group]) {
        acc[group] = { count: 0, totalQuantity: 0 }
      }
      acc[group].count++
      acc[group].totalQuantity += machine.quantity
      return acc
    },
    {} as Record<string, { count: number; totalQuantity: number }>
  )

  const totalMachines = machines.reduce((sum, m) => sum + m.quantity, 0)

  return (
    <LandingLayout
      title="Máquinas - Titanium Gym Iquique"
      description="Conoce nuestro equipamiento de última generación. Máquinas para todos los grupos musculares."
    >
      <LocalBusinessSchema page="maquinas" />
      <section className="py-16">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nuestras <span className="text-primary text-glow">Máquinas</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Equipamiento de última generación para maximizar tus resultados.
              {!isLoading && !error && totalMachines > 0 && (
                <> Más de {totalMachines} máquinas disponibles.</>
              )}
            </p>
          </div>

          {isLoading ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <GroupCardSkeleton key={i} />
                ))}
              </div>
              <TableSkeleton />
            </>
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : machines.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Grupos Musculares */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                {Object.entries(groupedMachines).map(([group, data]) => {
                  const groupInfo = muscleGroupLabels[group] || {
                    label: group,
                    icon: "🏋️",
                  }
                  return (
                    <DashboardCard key={group} title="">
                      <div className="text-center">
                        <span className="text-3xl mb-2 block">{groupInfo.icon}</span>
                        <p className="font-bold text-primary">{groupInfo.label}</p>
                        <p className="text-muted-foreground text-sm">
                          {data.totalQuantity} máquinas
                        </p>
                      </div>
                    </DashboardCard>
                  )
                })}
              </div>

              {/* Tabla de Máquinas */}
              <DashboardCard title="Catálogo Completo">
                <div className="flex items-center gap-2 mb-4">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">
                    {machines.length} tipos de máquinas
                  </span>
                </div>
                <PremiumTable
                  headers={["Máquina", "Grupo Muscular", "Cantidad"]}
                  rows={machines.map((m) => [
                    m.name,
                    muscleGroupLabels[m.muscleGroup]?.label || m.muscleGroup,
                    m.quantity.toString(),
                  ])}
                />
              </DashboardCard>
            </>
          )}
        </div>
      </section>
    </LandingLayout>
  )
}
