import { Link } from "react-router-dom"
import { Logo } from "./Logo"
import { PremiumButton } from "./PremiumButton"
import { Menu } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  showAuth?: boolean
}

const navLinks = [
  { label: "Inicio", to: "/" },
  { label: "Planes", to: "/planes" },
  { label: "Espacios", to: "/espacios" },
  { label: "Ubicación", to: "/ubicacion" },
  { label: "Contacto", to: "/contacto" },
]

export function Header({ showAuth = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-background/90 backdrop-blur border-b border-border sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/">
          <Logo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {label}
            </Link>
          ))}
          {showAuth && (
            <Link to="/login">
              <PremiumButton>Ingresar</PremiumButton>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Nav */}
      <nav
        className={cn(
          "md:hidden border-t border-border bg-background/95 backdrop-blur",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="container px-4 py-4 flex flex-col gap-4">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-muted-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          {showAuth && (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <PremiumButton className="w-full">Ingresar</PremiumButton>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
