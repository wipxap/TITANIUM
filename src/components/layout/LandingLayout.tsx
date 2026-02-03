import { Background, Header } from "@/components/common"

interface LandingLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

const defaultMeta = {
  title: "Titanium Gym - Gimnasio Premium en Iquique",
  description:
    "El mejor gimnasio de Iquique. Ubicados en Manuel Bulnes 1540. Planes flexibles, máquinas de última generación y rutinas personalizadas con IA.",
}

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://titaniumgym.cl",
  name: "Titanium Gym",
  description: "Gimnasio premium en Iquique con máquinas de última generación y rutinas personalizadas con IA",
  image: "https://titaniumgym.cl/assets/logo.png",
  telephone: "+56 9 XXXX XXXX",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Manuel Bulnes 1540",
    addressLocality: "Iquique",
    addressRegion: "Tarapacá",
    postalCode: "1100000",
    addressCountry: "CL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -20.228059,
    longitude: -70.138669,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "06:00",
      closes: "23:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "08:00",
      closes: "20:00",
    },
  ],
  priceRange: "$$",
}

export function LandingLayout({
  children,
  title = defaultMeta.title,
  description = defaultMeta.description,
}: LandingLayoutProps) {
  return (
    <Background>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="es_CL" />
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      <Header />
      <main>{children}</main>
    </Background>
  )
}
