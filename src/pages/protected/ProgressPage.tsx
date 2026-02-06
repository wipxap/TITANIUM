import { useMemo } from "react"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumButton, PremiumTable } from "@/components/common"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import {
  TrendingUp,
  Dumbbell,
  Calendar,
  Trophy,
  Target,
  Activity,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth, useProgress, useCheckins } from "@/hooks"

function isCardioLog(p: { durationSeconds?: number | null }): boolean {
  return !!p.durationSeconds && p.durationSeconds > 0
}

export function ProgressPage() {
  const { user } = useAuth()
  const { data: progressData, isLoading: loadingProgress } = useProgress()
  const { data: checkinsData, isLoading: loadingCheckins } = useCheckins()

  const progress = progressData?.progress || []
  const checkins = checkinsData?.checkins || []

  // Process data for charts
  const chartData = useMemo(() => {
    // Group progress by date
    const byDate = progress.reduce((acc, p) => {
      const date = new Date(p.completedAt).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
      })
      if (!acc[date]) {
        acc[date] = { date, exercises: 0, totalVolume: 0 }
      }
      acc[date].exercises++
      acc[date].totalVolume += p.sets * p.reps * (parseFloat(p.weightKg || "0") || 1)
      return acc
    }, {} as Record<string, { date: string; exercises: number; totalVolume: number }>)

    return Object.values(byDate).slice(-14) // Last 14 days
  }, [progress])

  // Check-in frequency by day of week
  const checkinsByDay = useMemo(() => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    const counts = Array(7).fill(0)

    checkins.forEach((c) => {
      const day = new Date(c.checkedInAt).getDay()
      counts[day]++
    })

    return days.map((name, i) => ({ name, visits: counts[i] }))
  }, [checkins])

  // Stats calculations
  const stats = useMemo(() => {
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()

    const monthCheckins = checkins.filter((c) => {
      const d = new Date(c.checkedInAt)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    }).length

    const totalExercises = progress.length
    const totalVolume = progress.reduce(
      (sum, p) => sum + p.sets * p.reps * (parseFloat(p.weightKg || "0") || 1),
      0
    )

    // Exercise frequency
    const exerciseFreq = progress.reduce((acc, p) => {
      acc[p.exerciseName] = (acc[p.exerciseName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topExercises = Object.entries(exerciseFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      monthCheckins,
      totalExercises,
      totalVolume: Math.round(totalVolume),
      topExercises,
    }
  }, [checkins, progress])

  const isLoading = loadingProgress || loadingCheckins

  return (
    <UserLayout title="Mi Progreso - Titanium Gym" userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Mi Progreso</h1>
            <p className="text-muted-foreground">
              Seguimiento de tu evolución en el gimnasio
            </p>
          </div>
          <Link to="/my/routine">
            <PremiumButton variant="outline">
              <Dumbbell className="mr-2 h-4 w-4" />
              Ir a Rutina
            </PremiumButton>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard title="" loading={isLoading}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Este mes</p>
                <p className="text-2xl font-bold">{stats.monthCheckins}</p>
                <p className="text-xs text-muted-foreground">visitas</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="" loading={isLoading}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-full">
                <Dumbbell className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ejercicios</p>
                <p className="text-2xl font-bold">{stats.totalExercises}</p>
                <p className="text-xs text-muted-foreground">completados</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="" loading={isLoading}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volumen</p>
                <p className="text-2xl font-bold">
                  {stats.totalVolume > 1000
                    ? `${(stats.totalVolume / 1000).toFixed(1)}k`
                    : stats.totalVolume}
                </p>
                <p className="text-xs text-muted-foreground">kg totales</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="" loading={isLoading}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-ins</p>
                <p className="text-2xl font-bold">{checkins.length}</p>
                <p className="text-xs text-muted-foreground">totales</p>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Volume Chart */}
          <DashboardCard title="Volumen de Entrenamiento" loading={isLoading}>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sin datos de entrenamiento aún</p>
                  <Link to="/my/routine" className="text-primary text-sm">
                    Empieza tu rutina
                  </Link>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalVolume"
                    stroke="#B71C1C"
                    strokeWidth={2}
                    dot={{ fill: "#B71C1C" }}
                    name="Volumen (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </DashboardCard>

          {/* Check-ins by Day */}
          <DashboardCard title="Frecuencia de Visitas" loading={isLoading}>
            {checkins.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sin check-ins registrados</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={checkinsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="visits" fill="#B71C1C" radius={[4, 4, 0, 0]} name="Visitas" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </DashboardCard>
        </div>

        {/* Top Exercises */}
        <DashboardCard title="Ejercicios Más Realizados" loading={isLoading}>
          {stats.topExercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Completa ejercicios para ver tu ranking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topExercises.map(([name, count], index) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-yellow-950"
                          : index === 1
                            ? "bg-gray-400 text-gray-950"
                            : index === 2
                              ? "bg-amber-600 text-amber-950"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium">{name}</span>
                  </div>
                  <Badge variant="secondary">{count} veces</Badge>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* Recent Activity */}
        <DashboardCard title="Actividad Reciente" loading={isLoading}>
          {progress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tu historial de ejercicios aparecerá aquí</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <PremiumTable
                headers={["Ejercicio", "Detalle", "Intensidad", "Fecha"]}
                rows={progress.slice(0, 10).map((p) => [
                  <span key={p.id} className="font-medium flex items-center gap-1.5">
                    {isCardioLog(p) ? (
                      <Activity className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Dumbbell className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    )}
                    {p.exerciseName}
                  </span>,
                  isCardioLog(p) ? (
                    <span key={`sr-${p.id}`} className="text-green-400">
                      {Math.round((p.durationSeconds || 0) / 60)} min
                    </span>
                  ) : (
                    <span key={`sr-${p.id}`}>
                      {p.sets} x {p.reps}
                    </span>
                  ),
                  isCardioLog(p) ? (
                    <span key={`w-${p.id}`} className="text-green-400 font-medium text-sm">
                      {p.speed ? `${p.speed} km/h` : ""}
                      {p.speed && p.incline ? " · " : ""}
                      {p.incline ? `${p.incline}%` : ""}
                      {!p.speed && !p.incline ? "—" : ""}
                    </span>
                  ) : (
                    <span key={`w-${p.id}`} className="text-primary font-medium">
                      {p.weightKg ? `${p.weightKg} kg` : "—"}
                    </span>
                  ),
                  <span key={`d-${p.id}`} className="text-muted-foreground text-sm">
                    {new Date(p.completedAt).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>,
                ])}
              />
            </div>
          )}
        </DashboardCard>
      </div>
    </UserLayout>
  )
}
