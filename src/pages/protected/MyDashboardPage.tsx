import { UserLayout } from "@/components/layout"
import { DashboardCard, StatCard, PremiumButton, QRCheckinModal, MembershipCard, LoyaltyCard } from "@/components/common"
import { Skeleton } from "@/components/ui/skeleton"
import { Dumbbell, Calendar, TrendingUp, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth, useCheckins, useSubscription, useRoutines, useProgress, useMyLoyaltyLevel } from "@/hooks"

function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-3 glow-red">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full skeleton-red" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 skeleton-red" />
          <Skeleton className="h-8 w-16 skeleton-red" />
        </div>
      </div>
    </div>
  )
}

export function MyDashboardPage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const { data: checkinsData, isLoading: checkinsLoading } = useCheckins()
  const { data: subscriptionData, isLoading: subLoading } = useSubscription()
  const { data: routinesData, isLoading: routinesLoading } = useRoutines()
  const { data: progressData, isLoading: progressLoading } = useProgress()
  const { data: loyaltyData, isLoading: loyaltyLoading } = useMyLoyaltyLevel()

  const checkins = checkinsData?.checkins || []
  const subscription = subscriptionData?.subscription
  const routines = routinesData?.routines || []
  const progress = progressData?.progress || []

  // Calculate stats from real data
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const checkinsThisMonth = checkins.filter((c) => {
    const date = new Date(c.checkedInAt)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length

  // Calculate streak (consecutive days)
  const calculateStreak = () => {
    if (checkins.length === 0) return 0
    const sortedCheckins = [...checkins].sort(
      (a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()
    )
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const checkin of sortedCheckins) {
      const checkinDate = new Date(checkin.checkedInAt)
      checkinDate.setHours(0, 0, 0, 0)
      const diffDays = Math.floor(
        (currentDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffDays <= 1) {
        streak++
        currentDate = checkinDate
      } else {
        break
      }
    }
    return streak
  }

  const streak = calculateStreak()
  const isLoading = authLoading || checkinsLoading || subLoading

  const firstName = profile?.firstName || "Usuario"
  const isAdmin = user?.role === "admin"
  const isReception = user?.role === "reception"

  return (
    <UserLayout title="Mi Dashboard - Titanium Gym" userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Hola, {authLoading ? <Skeleton className="inline-block h-8 w-32 skeleton-red" /> : firstName}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Panel de Administración" : isReception ? "Panel de Recepción" : "Bienvenido de vuelta a Titanium Gym"}
            </p>
          </div>
          {!isAdmin && !isReception && <QRCheckinModal />}
        </div>

        {/* Membership Card for regular users */}
        {!isAdmin && !isReception && (
          <div className="grid md:grid-cols-2 gap-4">
            <MembershipCard
              subscription={subscription}
              loading={subLoading}
              showRenewButton={true}
            />
            <LoyaltyCard
              loyaltyData={loyaltyData}
              loading={loyaltyLoading}
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon={Calendar}
                label="Días este mes"
                value={checkinsThisMonth}
                accent
              />
              <StatCard
                icon={Dumbbell}
                label="Entrenamientos"
                value={checkins.length}
              />
              <StatCard
                icon={TrendingUp}
                label="Racha actual"
                value={streak > 0 ? `${streak} días` : "—"}
                accent
              />
              <StatCard
                icon={Calendar}
                label="Membresía"
                value={subscription?.plan.name || "Sin plan"}
              />
            </>
          )}
        </div>

        {/* Quick Actions - Only for regular users */}
        {!isAdmin && !isReception && (
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <DashboardCard
              title="Mi Rutina"
              loading={routinesLoading}
            >
              {routines.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <p>
                      Genera tu primera rutina personalizada con inteligencia artificial
                    </p>
                  </div>
                  <Link to="/my/routine/generate">
                    <PremiumButton className="w-full sm:w-auto">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generar Rutina con IA
                    </PremiumButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Tu rutina "{routines[0]?.name}" está lista. ¡Es hora de entrenar!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/my/routine">
                      <PremiumButton className="w-full">Ver Rutina</PremiumButton>
                    </Link>
                    <Link to="/my/routine/generate">
                      <PremiumButton variant="outline" className="w-full sm:w-auto">Generar Nueva</PremiumButton>
                    </Link>
                  </div>
                </div>
              )}
            </DashboardCard>

            <DashboardCard
              title="Progreso Reciente"
              loading={progressLoading}
            >
              {progress.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Completa ejercicios para ver tu progreso aquí
                  </p>
                  <Link to="/my/routine">
                    <PremiumButton variant="outline" className="w-full sm:w-auto">Ir a Rutina</PremiumButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {progress.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{p.exerciseName}</span>
                      <span className="text-primary font-bold">
                        {p.sets}x{p.reps} {p.weightKg ? `@ ${p.weightKg}kg` : ""}
                      </span>
                    </div>
                  ))}
                  <Link to="/my/progress">
                    <PremiumButton variant="outline" className="w-full mt-2">
                      Ver Progreso Completo
                    </PremiumButton>
                  </Link>
                </div>
              )}
            </DashboardCard>
          </div>
        )}

        {/* Admin Quick Stats */}
        {isAdmin && (
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <DashboardCard title="Gestión de Usuarios">
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Administra usuarios, membresías y permisos del sistema
                </p>
                <Link to="/admin/users">
                  <PremiumButton className="w-full">Ver Usuarios</PremiumButton>
                </Link>
              </div>
            </DashboardCard>

            <DashboardCard title="Máquinas">
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Gestiona el inventario de equipos del gimnasio
                </p>
                <Link to="/admin/machines">
                  <PremiumButton variant="outline" className="w-full">Ver Máquinas</PremiumButton>
                </Link>
              </div>
            </DashboardCard>

            <DashboardCard title="Punto de Venta">
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Accede al sistema de ventas y registros
                </p>
                <Link to="/reception/pos">
                  <PremiumButton variant="outline" className="w-full">Abrir POS</PremiumButton>
                </Link>
              </div>
            </DashboardCard>
          </div>
        )}

        {/* Recent Activity - Only for regular users */}
        {!isAdmin && !isReception && (
          <DashboardCard title="Actividad Reciente" loading={checkinsLoading}>
            {checkins.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Tu historial de check-ins aparecerá aquí
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkins.slice(0, 5).map((checkin) => {
                  const date = new Date(checkin.checkedInAt)
                  const today = new Date()
                  const isToday = date.toDateString() === today.toDateString()
                  const yesterday = new Date(today)
                  yesterday.setDate(yesterday.getDate() - 1)
                  const isYesterday = date.toDateString() === yesterday.toDateString()

                  const dateLabel = isToday
                    ? "Hoy"
                    : isYesterday
                      ? "Ayer"
                      : date.toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "short",
                        })

                  return (
                    <div
                      key={checkin.id}
                      className="flex justify-between items-center py-2 border-b border-border last:border-0"
                    >
                      <span className="text-muted-foreground">{dateLabel}</span>
                      <span>
                        Check-in a las{" "}
                        {date.toLocaleTimeString("es-CL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </DashboardCard>
        )}
      </div>
    </UserLayout>
  )
}
