import { useState } from "react"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumTable, PremiumButton, StatCard } from "@/components/common"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  UserCheck,
  LogIn,
  LogOut,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import {
  useAuth,
  useSearchUsers,
  useUserForCheckin,
  useReceptionCheckin,
  useCheckout,
  useTodayCheckins,
} from "@/hooks"
export function CheckinPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const { data: searchResults } = useSearchUsers(searchQuery)
  const { data: userDetails } = useUserForCheckin(selectedUserId || "")
  const { data: todayData, isLoading: loadingToday } = useTodayCheckins()

  const checkin = useReceptionCheckin()
  const checkout = useCheckout()

  const handleCheckin = async () => {
    if (!selectedUserId) return
    await checkin.mutateAsync(selectedUserId)
    setSelectedUserId(null)
    setSearchQuery("")
  }

  const handleCheckout = async () => {
    if (!selectedUserId) return
    await checkout.mutateAsync(selectedUserId)
    setSelectedUserId(null)
    setSearchQuery("")
  }

  const todayCheckins = todayData?.checkins || []
  const stats = todayData?.stats || { active: 0, total: 0 }

  return (
    <UserLayout title="Check-in - Recepción" userRole={user?.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Check-in</h1>
          <p className="text-muted-foreground">
            Control de ingreso al gimnasio
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Users}
            label="En el gym"
            value={stats.active}
            accent
          />
          <StatCard
            icon={Clock}
            label="Check-ins hoy"
            value={stats.total}
          />
        </div>

        {/* Search User */}
        <DashboardCard title="Buscar Usuario">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por RUT o nombre..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedUserId(null)
                }}
                className="pl-10 bg-background"
              />
            </div>

            {/* Search Results */}
            {searchResults?.users && searchResults.users.length > 0 && !selectedUserId && (
              <div className="border border-border rounded-lg divide-y divide-border">
                {searchResults.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {u.profile?.firstName} {u.profile?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {u.rut}
                      </p>
                    </div>
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {/* Selected User Details */}
            {selectedUserId && userDetails && (
              <div className="border border-primary/30 rounded-lg p-4 bg-primary/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {userDetails.profile?.firstName} {userDetails.profile?.lastName}
                    </h3>
                    <p className="text-muted-foreground font-mono">
                      {userDetails.user.rut}
                    </p>

                    {/* Subscription Status */}
                    <div className="mt-3">
                      {userDetails.subscription ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {userDetails.subscription.plan.name} - Activa
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Sin membresía activa
                        </Badge>
                      )}
                    </div>

                    {/* Active Check-in */}
                    {userDetails.activeCheckin && (
                      <div className="mt-2">
                        <Badge variant="secondary">
                          <Clock className="mr-1 h-3 w-3" />
                          Check-in activo desde{" "}
                          {new Date(userDetails.activeCheckin.checkedInAt).toLocaleTimeString(
                            "es-CL",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {userDetails.canCheckin ? (
                      <PremiumButton
                        onClick={handleCheckin}
                        loading={checkin.isPending}
                        className="whitespace-nowrap"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Check-in
                      </PremiumButton>
                    ) : userDetails.activeCheckin ? (
                      <PremiumButton
                        variant="outline"
                        onClick={handleCheckout}
                        loading={checkout.isPending}
                        className="whitespace-nowrap"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Check-out
                      </PremiumButton>
                    ) : (
                      <Badge variant="destructive">Sin membresía</Badge>
                    )}
                  </div>
                </div>

                {checkin.isError && (
                  <p className="text-destructive text-sm mt-2">
                    Error: {(checkin.error as Error).message}
                  </p>
                )}
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Today's Check-ins */}
        <DashboardCard title="Check-ins de Hoy" loading={loadingToday}>
          {todayCheckins.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay check-ins hoy</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <PremiumTable
                headers={["Usuario", "RUT", "Entrada", "Salida", "Estado"]}
                rows={todayCheckins.map((c) => [
                  <span key={c.id} className="font-medium">
                    {c.profile.firstName} {c.profile.lastName}
                  </span>,
                  <span key={`rut-${c.id}`} className="font-mono text-sm">
                    {c.user.rut}
                  </span>,
                  <span key={`in-${c.id}`} className="text-sm">
                    {new Date(c.checkedInAt).toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>,
                  <span key={`out-${c.id}`} className="text-sm text-muted-foreground">
                    {c.checkedOutAt
                      ? new Date(c.checkedOutAt).toLocaleTimeString("es-CL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>,
                  c.checkedOutAt ? (
                    <Badge key={`status-${c.id}`} variant="outline">
                      Salió
                    </Badge>
                  ) : (
                    <Badge key={`status-${c.id}`} variant="default" className="bg-green-600">
                      En gym
                    </Badge>
                  ),
                ])}
              />
            </div>
          )}
        </DashboardCard>
      </div>
    </UserLayout>
  )
}
