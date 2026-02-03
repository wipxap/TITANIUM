import { LandingLayout } from "@/components/layout"
import { PremiumButton, DashboardCard, StatCard } from "@/components/common"
import { LocalBusinessSchema } from "@/components/seo"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import { Dumbbell, Users, Clock, MapPin } from "lucide-react"
import { useLandingStats } from "@/hooks"

function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-3 glow-red">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full skeleton-red" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 skeleton-red" />
          <Skeleton className="h-8 w-16 skeleton-red" />
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const { data, isLoading, error } = useLandingStats()
  const stats = data?.stats

  return (
    <LandingLayout>
      <LocalBusinessSchema page="home" />
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary text-glow mb-6">
              Entrena como un
              <br />
              <span className="text-foreground">TITANIO</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              El gimnasio premium de Iquique. Máquinas de última generación,
              rutinas personalizadas con IA y la mejor comunidad fitness del norte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/planes">
                <PremiumButton className="text-lg px-8 py-6">
                  Ver Planes
                </PremiumButton>
              </Link>
              <Link to="/ubicacion">
                <PremiumButton variant="outline" className="text-lg px-8 py-6">
                  <MapPin className="mr-2 h-5 w-5" />
                  Ubicación
                </PremiumButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-border">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading || error ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  icon={Dumbbell}
                  label="Máquinas"
                  value={stats?.totalMachines || "—"}
                  accent
                />
                <StatCard
                  icon={Users}
                  label="Miembros activos"
                  value={stats?.activeMembers || "—"}
                />
                <StatCard
                  icon={Clock}
                  label="Horas abiertos"
                  value={stats?.hoursOpen ? `${stats.hoursOpen}h` : "—"}
                  accent
                />
                <StatCard
                  icon={MapPin}
                  label="Ubicación"
                  value={stats?.location || "—"}
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            ¿Por qué <span className="text-primary text-glow">Titanium</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <DashboardCard title="Rutinas con IA">
              <p className="text-muted-foreground">
                Genera tu rutina personalizada con inteligencia artificial.
                Adaptada a tus objetivos, nivel y equipamiento disponible.
              </p>
            </DashboardCard>
            <DashboardCard title="Check-in QR">
              <p className="text-muted-foreground">
                Acceso rápido al gimnasio con tu código QR personal.
                Sin filas, sin esperas. Escanea y entrena.
              </p>
            </DashboardCard>
            <DashboardCard title="Progreso en tiempo real">
              <p className="text-muted-foreground">
                Registra tus sets, pesos y repeticiones. Visualiza tu progreso
                y alcanza tus metas más rápido.
              </p>
            </DashboardCard>
          </div>
        </div>
      </section>

      {/* Location Preview */}
      <section className="py-16 border-t border-border">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Encuéntranos en <span className="text-primary text-glow">Iquique</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Manuel Bulnes 1540, Iquique, Chile
            </p>
            <div className="aspect-video bg-card rounded-lg glow-red overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.123456789!2d-70.138669!3d-20.228059!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDEzJzQxLjAiUyA3MMKwMDgnMTkuMiJX!5e0!3m2!1ses!2scl!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Titanium Gym"
              />
            </div>
            <Link to="/ubicacion" className="inline-block mt-6">
              <PremiumButton variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Ver más detalles
              </PremiumButton>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a la familia Titanium hoy y transforma tu vida.
          </p>
          <Link to="/login">
            <PremiumButton className="text-lg px-8 py-6">
              Comenzar ahora
            </PremiumButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2026 Titanium Gym. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/contacto" className="hover:text-primary transition-colors">
                Contacto
              </Link>
              <a href="#" className="hover:text-primary transition-colors">
                Términos
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </LandingLayout>
  )
}
