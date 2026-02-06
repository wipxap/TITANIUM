import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

const slides = [
  {
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80",
    alt: "Interior de gimnasio con equipamiento moderno",
  },
  {
    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80",
    alt: "Persona entrenando con pesas",
  },
  {
    src: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80",
    alt: "Zona de entrenamiento funcional",
  },
]

export function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ])

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide, i) => (
          <div key={i} className="relative min-w-0 flex-[0_0_100%]">
            <div className="aspect-[16/9] md:aspect-[21/9]">
              <img
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
            <div className="absolute inset-0 bg-black/60" />
          </div>
        ))}
      </div>
    </div>
  )
}
