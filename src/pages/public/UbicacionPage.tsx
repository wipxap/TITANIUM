import { LandingLayout } from "@/components/layout"
import { DashboardCard, StatCard, PremiumButton } from "@/components/common"
import { LocalBusinessSchema } from "@/components/seo"
import { MapPin, Clock, Phone, Mail } from "lucide-react"

const horarios = [
  { dias: "Lunes a Viernes", horario: "6:00 - 23:00" },
  { dias: "Sábados", horario: "8:00 - 20:00" },
  { dias: "Domingos y Festivos", horario: "8:00 - 20:00" },
]

export function UbicacionPage() {
  return (
    <LandingLayout
      title="Ubicación - Titanium Gym Iquique"
      description="Visítanos en Manuel Bulnes 1540, Iquique. Abiertos de lunes a domingo. Estacionamiento disponible."
    >
      <LocalBusinessSchema page="ubicacion" />
      <section className="py-16">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nuestra <span className="text-primary text-glow">Ubicación</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Te esperamos en el corazón de Iquique. Fácil acceso y estacionamiento disponible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Mapa */}
            <div className="aspect-square lg:aspect-auto lg:h-full min-h-[400px] bg-card rounded-lg glow-red overflow-hidden">
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

            {/* Info */}
            <div className="space-y-6">
              <DashboardCard title="Dirección">
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-lg">Manuel Bulnes 1540</p>
                    <p className="text-muted-foreground">Iquique, Tarapacá</p>
                    <p className="text-muted-foreground">Chile, 1100000</p>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=-20.228059,-70.138669"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4"
                >
                  <PremiumButton variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Cómo llegar
                  </PremiumButton>
                </a>
              </DashboardCard>

              <DashboardCard title="Horarios">
                <div className="space-y-3">
                  {horarios.map((h, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{h.dias}</span>
                      <span className="font-bold text-primary">{h.horario}</span>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard title="Contacto">
                <div className="space-y-3">
                  <a
                    href="tel:+56912345678"
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    <span>+56 9 1234 5678</span>
                  </a>
                  <a
                    href="mailto:contacto@titaniumgym.cl"
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    <span>contacto@titaniumgym.cl</span>
                  </a>
                </div>
              </DashboardCard>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <StatCard icon={MapPin} label="Dirección" value="Centro" accent />
            <StatCard icon={Clock} label="Abierto" value="17h/día" />
            <StatCard icon={MapPin} label="Estacionamiento" value="Sí" accent />
            <StatCard icon={Clock} label="Días/semana" value="7" />
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}
