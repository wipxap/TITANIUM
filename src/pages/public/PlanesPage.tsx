import { LandingLayout } from "@/components/layout"
import { DashboardCard, PremiumButton } from "@/components/common"
import { LocalBusinessSchema } from "@/components/seo"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, AlertCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { usePlans } from "@/hooks"

function PlanCardSkeleton() {
  return (
    <DashboardCard title="" className="relative">
      <div className="text-center mb-6">
        <Skeleton className="h-8 w-24 mx-auto mb-2 skeleton-red" />
        <Skeleton className="h-10 w-32 mx-auto skeleton-red" />
      </div>
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="h-5 w-5 rounded-full skeleton-red" />
            <Skeleton className="h-4 flex-1 skeleton-red" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full skeleton-red" />
    </DashboardCard>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">No hay planes disponibles</h3>
      <p className="text-muted-foreground">
        Los planes estarán disponibles próximamente.
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">Error al cargar planes</h3>
      <p className="text-muted-foreground mb-4">
        No pudimos cargar los planes. Intenta de nuevo.
      </p>
      <PremiumButton onClick={onRetry}>Reintentar</PremiumButton>
    </div>
  )
}

function formatPrice(priceClp: number): string {
  return new Intl.NumberFormat("es-CL").format(priceClp)
}

export function PlanesPage() {
  const { data, isLoading, error, refetch } = usePlans()
  const plans = data?.plans || []

  // Determine which plan is "popular" (middle one or most features)
  const popularIndex = plans.length > 1 ? 1 : 0

  return (
    <LandingLayout
      title="Planes - Titanium Gym Iquique"
      description="Conoce nuestros planes de membresía. Acceso a máquinas de última generación y rutinas con IA."
    >
      <LocalBusinessSchema page="planes" />
      <section className="py-16">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nuestros <span className="text-primary text-glow">Planes</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus objetivos.
              Sin contratos largos, cancela cuando quieras.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <PlanCardSkeleton />
              <PlanCardSkeleton />
              <PlanCardSkeleton />
            </div>
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : plans.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, index) => {
                const isPopular = index === popularIndex && plans.length > 1
                return (
                  <DashboardCard
                    key={plan.id}
                    title=""
                    className={isPopular ? "border-primary border-2 relative" : ""}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full">
                        Más popular
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-primary mb-2">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">
                          ${formatPrice(plan.priceClp)}
                        </span>
                        <span className="text-muted-foreground">/mes</span>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {plan.description}
                        </p>
                      )}
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/login" className="block">
                      <PremiumButton
                        className="w-full"
                        variant={isPopular ? "default" : "outline"}
                      >
                        Elegir plan
                      </PremiumButton>
                    </Link>
                  </DashboardCard>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </LandingLayout>
  )
}
