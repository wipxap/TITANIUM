import { UserLayout } from "./UserLayout"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AdminLayout({ children, title = "Admin - Titanium Gym" }: AdminLayoutProps) {
  return (
    <UserLayout title={title} userRole="admin">
      {children}
    </UserLayout>
  )
}
