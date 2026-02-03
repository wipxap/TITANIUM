import { Background, Header, Sidebar, MobileNav } from "@/components/common"
import { Helmet } from "react-helmet-async"

interface UserLayoutProps {
  children: React.ReactNode
  title?: string
  userRole?: string
}

export function UserLayout({
  children,
  title = "Mi Cuenta - Titanium Gym",
  userRole = "user",
}: UserLayoutProps) {
  return (
    <Background className="flex min-h-screen">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Header showAuth={false} />
        <main className="flex-1 container px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav userRole={userRole} />
    </Background>
  )
}
