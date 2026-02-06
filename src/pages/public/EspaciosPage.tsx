import { LandingLayout } from "@/components/layout"
import { PremiumButton } from "@/components/common"
import { LocalBusinessSchema } from "@/components/seo"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useSpaces } from "@/hooks"

const fallbackImages = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
  "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80",
]

function SpaceSkeleton({ reverse }: { reverse: boolean }) {
  return (
    <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-6 md:gap-10`}>
      <Skeleton className="w-full md:w-1/2 aspect-[4/3] rounded-xl skeleton-red" />
      <div className="w-full md:w-1/2 space-y-4 py-4">
        <Skeleton className="h-8 w-48 skeleton-red" />
        <Skeleton className="h-5 w-32 skeleton-red" />
        <Skeleton className="h-4 w-full skeleton-red" />
        <Skeleton className="h-4 w-3/4 skeleton-red" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-5 w-40 skeleton-red" />
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">No hay espacios disponibles</h3>
      <p className="text-muted-foreground">
        La informacion de nuestros espacios estara disponible proximamente.
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">Error al cargar espacios</h3>
      <p className="text-muted-foreground mb-4">
        No pudimos cargar la informacion. Intenta de nuevo.
      </p>
      <PremiumButton onClick={onRetry}>Reintentar</PremiumButton>
    </div>
  )
}

export function EspaciosPage() {
  const { data, isLoading, error, refetch } = useSpaces()
  const spaces = data?.spaces?.filter((s) => s.isActive) || []

  return (
    <LandingLayout
      title="Espacios - Titanium Gym Iquique"
      description="Conoce nuestros espacios premium. Pisos dedicados a musculacion, cardio, funcional y mas."
    >
      <LocalBusinessSchema page="espacios" />
      <section className="py-16">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nuestros <span className="text-primary text-glow">Espacios</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Instalaciones de primer nivel diseñadas para maximizar tu rendimiento.
              {!isLoading && !error && spaces.length > 0 && (
                <> {spaces.length} pisos dedicados a tu entrenamiento.</>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-16">
              {[0, 1, 2].map((i) => (
                <SpaceSkeleton key={i} reverse={i % 2 === 1} />
              ))}
            </div>
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : spaces.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-16">
              {spaces.map((space, index) => {
                const imageUrl = space.imageUrl || fallbackImages[index % fallbackImages.length]
                const isReverse = index % 2 === 1

                return (
                  <div
                    key={space.id}
                    className={`flex flex-col ${isReverse ? "md:flex-row-reverse" : "md:flex-row"} gap-6 md:gap-10 items-center`}
                  >
                    <div className="w-full md:w-1/2">
                      <img
                        src={imageUrl}
                        alt={space.name}
                        className="w-full aspect-[4/3] object-cover rounded-xl border border-border"
                        loading="lazy"
                      />
                    </div>
                    <div className="w-full md:w-1/2 space-y-4">
                      <div>
                        <p className="text-sm text-primary font-semibold uppercase tracking-wider">
                          Piso {space.floorNumber}
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold">{space.name}</h2>
                        {space.subtitle && (
                          <p className="text-lg text-muted-foreground">{space.subtitle}</p>
                        )}
                      </div>
                      {space.description && (
                        <p className="text-muted-foreground leading-relaxed">
                          {space.description}
                        </p>
                      )}
                      {space.features && space.features.length > 0 && (
                        <ul className="space-y-2">
                          {space.features.map((feature, fi) => (
                            <li key={fi} className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </LandingLayout>
  )
}
