import { Background, Header, Sidebar, MobileNav, ViewingAsBanner } from "@/components/common"
import { useAuth, useRoleSwitcher } from "@/hooks"
import { cn } from "@/lib/utils"

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
  const { user } = useAuth()
  const { effectiveRole, isViewingAs } = useRoleSwitcher()
  const displayRole = user?.role === "admin" ? effectiveRole : userRole

  return (
    <Background className="flex min-h-screen">
      <title>{title}</title>
      <ViewingAsBanner />
      <Sidebar userRole={displayRole} />
      <div className={cn("flex-1 flex flex-col", isViewingAs && "pt-10")}>
        <Header showAuth={false} />
        <main className="flex-1 container px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav userRole={displayRole} />
    </Background>
  )
}
