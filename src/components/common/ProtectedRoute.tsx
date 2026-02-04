import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks"
import { Skeleton } from "@/components/ui/skeleton"

type UserRole = "admin" | "reception" | "instructor" | "user"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-12 w-full bg-zinc-800" />
          <Skeleton className="h-32 w-full bg-zinc-800" />
          <Skeleton className="h-8 w-2/3 bg-zinc-800" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/my" replace />
  }

  return <>{children}</>
}
