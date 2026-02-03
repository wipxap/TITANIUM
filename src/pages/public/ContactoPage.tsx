import { LandingLayout } from "@/components/layout"
import { DashboardCard, FormInput, PremiumButton } from "@/components/common"
import { LocalBusinessSchema } from "@/components/seo"
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react"
import { useState } from "react"

export function ContactoPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simular envío
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <LandingLayout
      title="Contacto - Titanium Gym Iquique"
      description="Contáctanos para más información. Teléfono, email y formulario de contacto disponibles."
    >
      <LocalBusinessSchema page="contacto" />
      <section className="py-16">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-primary text-glow">Contáctanos</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ¿Tienes preguntas? Estamos aquí para ayudarte.
              Escríbenos y te responderemos lo antes posible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Formulario */}
            <DashboardCard title="Envíanos un mensaje">
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Nombre"
                  placeholder="Tu nombre completo"
                  required
                />
                <FormInput
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                />
                <FormInput
                  label="Teléfono"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                />
                <div className="space-y-2">
                  <label className="text-primary font-medium text-sm">
                    Mensaje
                  </label>
                  <textarea
                    className="w-full min-h-[120px] rounded-md border border-border bg-card px-3 py-2 text-sm focus:ring-primary focus:border-primary glow-red resize-none"
                    placeholder="¿En qué podemos ayudarte?"
                    required
                  />
                </div>
                <PremiumButton type="submit" loading={loading} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar mensaje
                </PremiumButton>
              </form>
            </DashboardCard>

            {/* Info de Contacto */}
            <div className="space-y-6">
              <DashboardCard title="Información de contacto">
                <div className="space-y-4">
                  <a
                    href="tel:+56912345678"
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">+56 9 1234 5678</p>
                    </div>
                  </a>
                  <a
                    href="mailto:contacto@titaniumgym.cl"
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">contacto@titaniumgym.cl</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dirección</p>
                      <p className="font-medium">Manuel Bulnes 1540, Iquique</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horario</p>
                      <p className="font-medium">Lun-Vie: 6:00-23:00</p>
                      <p className="font-medium">Sáb-Dom: 8:00-20:00</p>
                    </div>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Redes Sociales">
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="p-3 bg-primary/20 rounded-full hover:bg-primary/30 transition-colors glow-red"
                  >
                    <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="p-3 bg-primary/20 rounded-full hover:bg-primary/30 transition-colors glow-red"
                  >
                    <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}
