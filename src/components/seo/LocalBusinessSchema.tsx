interface LocalBusinessSchemaProps {
  page?: "home" | "planes" | "maquinas" | "espacios" | "ubicacion" | "contacto"
}

const businessInfo = {
  name: "Titanium Gym Iquique",
  description:
    "El gimnasio premium de Iquique con las mejores máquinas, entrenadores certificados y tecnología de punta. Rutinas personalizadas con IA.",
  address: {
    streetAddress: "Manuel Bulnes 1540",
    addressLocality: "Iquique",
    addressRegion: "Tarapacá",
    postalCode: "1100000",
    addressCountry: "CL",
  },
  geo: {
    latitude: -20.228059,
    longitude: -70.138669,
  },
  phone: "+56 57 241 5000",
  email: "contacto@titaniumgym.cl",
  url: "https://titaniumgym.cl",
  priceRange: "$$$",
  openingHours: [
    "Mo-Fr 06:00-23:00",
    "Sa 08:00-20:00",
    "Su 09:00-14:00",
  ],
  image: "https://titaniumgym.cl/assets/logo.png",
  sameAs: [
    "https://www.instagram.com/titaniumgym.iquique",
    "https://www.facebook.com/titaniumgym.iquique",
  ],
}

const pageMetadata = {
  home: {
    title: "Titanium Gym Iquique | El Mejor Gimnasio de Iquique",
    description:
      "Titanium Gym: El gimnasio premium de Iquique. Máquinas de última generación, entrenadores certificados y rutinas personalizadas con IA. ¡Inscríbete hoy!",
    keywords:
      "gimnasio iquique, gym iquique, fitness iquique, entrenamiento iquique, titanium gym, musculación iquique",
  },
  planes: {
    title: "Planes y Precios | Titanium Gym Iquique",
    description:
      "Conoce nuestros planes de membresía: Básico, Premium y Titanium. Precios accesibles y beneficios exclusivos. Gimnasio en Iquique.",
    keywords:
      "precios gimnasio iquique, planes gym iquique, membresía gimnasio, titanium gym precios",
  },
  maquinas: {
    title: "Máquinas y Equipamiento | Titanium Gym Iquique",
    description:
      "Más de 200 máquinas de última generación: cardio, musculación, peso libre y funcional. El mejor equipamiento de Iquique.",
    keywords:
      "maquinas gimnasio iquique, equipamiento gym, pesas iquique, cardio iquique",
  },
  espacios: {
    title: "Espacios y Pisos | Titanium Gym Iquique",
    description:
      "Conoce nuestros espacios premium: pisos dedicados a musculación, cardio, funcional y más. Instalaciones de primer nivel en Iquique.",
    keywords:
      "espacios gimnasio iquique, pisos gym iquique, instalaciones gimnasio, titanium gym espacios",
  },
  ubicacion: {
    title: "Ubicación y Horarios | Titanium Gym Iquique",
    description:
      "Encuéntranos en Manuel Bulnes 1540, Iquique. Abierto de lunes a domingo. Estacionamiento gratuito disponible.",
    keywords:
      "direccion titanium gym, gimnasio manuel bulnes iquique, horarios gym iquique",
  },
  contacto: {
    title: "Contacto | Titanium Gym Iquique",
    description:
      "Contáctanos para más información sobre membresías, entrenamiento personalizado o dudas. WhatsApp, email o visítanos.",
    keywords: "contacto titanium gym, telefono gimnasio iquique, whatsapp gym iquique",
  },
}

export function LocalBusinessSchema({ page = "home" }: LocalBusinessSchemaProps) {
  const meta = pageMetadata[page]

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "GymFitness",
    "@id": "https://titaniumgym.cl/#organization",
    name: businessInfo.name,
    description: businessInfo.description,
    url: businessInfo.url,
    telephone: businessInfo.phone,
    email: businessInfo.email,
    priceRange: businessInfo.priceRange,
    image: businessInfo.image,
    address: {
      "@type": "PostalAddress",
      streetAddress: businessInfo.address.streetAddress,
      addressLocality: businessInfo.address.addressLocality,
      addressRegion: businessInfo.address.addressRegion,
      postalCode: businessInfo.address.postalCode,
      addressCountry: businessInfo.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: businessInfo.geo.latitude,
      longitude: businessInfo.geo.longitude,
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
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
    sameAs: businessInfo.sameAs,
    areaServed: {
      "@type": "City",
      name: "Iquique",
      "@id": "https://www.wikidata.org/wiki/Q201080",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Planes de Membresía",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Plan Básico",
          price: "29990",
          priceCurrency: "CLP",
        },
        {
          "@type": "Offer",
          name: "Plan Premium",
          price: "44990",
          priceCurrency: "CLP",
        },
        {
          "@type": "Offer",
          name: "Plan Titanium",
          price: "69990",
          priceCurrency: "CLP",
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://titaniumgym.cl",
      },
      ...(page !== "home"
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: meta.title.split("|")[0].trim(),
              item: `https://titaniumgym.cl/${page}`,
            },
          ]
        : []),
    ],
  }

  const canonicalUrl = `https://titaniumgym.cl${page === "home" ? "" : `/${page}`}`

  return (
    <>
      <title>{meta.title}</title>
      <meta name="title" content={meta.title} />
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={businessInfo.image} />
      <meta property="og:locale" content="es_CL" />
      <meta property="og:site_name" content="Titanium Gym Iquique" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={businessInfo.image} />
      <meta name="geo.region" content="CL-TA" />
      <meta name="geo.placename" content="Iquique" />
      <meta
        name="geo.position"
        content={`${businessInfo.geo.latitude};${businessInfo.geo.longitude}`}
      />
      <meta
        name="ICBM"
        content={`${businessInfo.geo.latitude}, ${businessInfo.geo.longitude}`}
      />
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </>
  )
}

export { businessInfo }
