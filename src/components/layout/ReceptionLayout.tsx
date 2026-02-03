import { UserLayout } from "./UserLayout"

interface ReceptionLayoutProps {
  children: React.ReactNode
  title?: string
}

export function ReceptionLayout({ children, title = "Recepción - Titanium Gym" }: ReceptionLayoutProps) {
  return (
    <UserLayout title={title} userRole="reception">
      {children}
    </UserLayout>
  )
}
