import { useState } from "react"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumButton } from "@/components/common"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  LogOut,
  User,
  Shield,
  Phone,
  Mail,
  Calendar,
  Save,
  AlertTriangle,
  Check,
} from "lucide-react"
import { useAuth, useProfile, useUpdateProfile } from "@/hooks"
import { formatRut } from "@/lib/utils"

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20 skeleton-red" />
          <Skeleton className="h-10 w-full skeleton-red" />
        </div>
      ))}
    </div>
  )
}

export function SettingsPage() {
  const { user, logout, logoutLoading } = useAuth()
  const { data: profileData, isLoading: profileLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const profile = profileData?.profile

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })
  const [formInitialized, setFormInitialized] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Initialize form when profile loads
  if (profile && !formInitialized) {
    setFormData({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phone: profile.phone || "",
    })
    setFormInitialized(true)
  }

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "reception":
        return "Recepción"
      case "instructor":
        return "Instructor"
      default:
        return "Usuario"
    }
  }

  return (
    <UserLayout title="Ajustes - Titanium Gym" userRole={user?.role}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Ajustes</h1>
          <p className="text-muted-foreground">
            Administra tu cuenta y preferencias
          </p>
        </div>

        {/* Account Info Card */}
        <DashboardCard title="Información de Cuenta">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="font-medium">{getRoleName(user?.role || "user")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">RUT</p>
                <p className="font-medium font-mono">
                  {user?.rut ? formatRut(user.rut) : "—"}
                </p>
              </div>
            </div>

            {user?.email && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Profile Edit Card */}
        <DashboardCard title="Mi Perfil" loading={profileLoading}>
          {profileLoading ? (
            <ProfileSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="Tu nombre"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Tu apellido"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+56 9 1234 5678"
                    className="pl-10 bg-background"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <PremiumButton
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>Guardando...</>
                  ) : saveSuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Guardado
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </PremiumButton>

                {updateProfile.isError && (
                  <span className="text-destructive text-sm">
                    Error al guardar
                  </span>
                )}
              </div>
            </div>
          )}
        </DashboardCard>

        {/* Danger Zone */}
        <DashboardCard title="Sesión">
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Cerrar sesión en este dispositivo. Tendrás que volver a ingresar
              con tu RUT y contraseña.
            </p>

            <PremiumButton
              variant="outline"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logoutLoading ? "Cerrando sesión..." : "Cerrar Sesión"}
            </PremiumButton>
          </div>
        </DashboardCard>

        {/* Version Info */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Titanium Gym App v0.1.0</p>
          <p className="text-xs mt-1">© 2026 Titanium Gym Iquique</p>
        </div>
      </div>
    </UserLayout>
  )
}
