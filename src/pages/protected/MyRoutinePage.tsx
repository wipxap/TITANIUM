import { Link } from "react-router-dom"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumButton, DaySelector, ExerciseCard } from "@/components/common"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Play,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Coffee,
  History,
  Trash2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"
import { useState, useMemo } from "react"
import {
  useAuth,
  useRoutines,
  useLogProgress,
  useProgress,
  useActivateRoutine,
  useDeleteRoutine,
} from "@/hooks"

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function getTodayName() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    weekday: "long",
  })
  const raw = formatter.format(now)
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function getTodayDateStr() {
  return new Date().toLocaleDateString("es-CL", { timeZone: "America/Santiago" })
}

function RoutineSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full skeleton-red" />
      <Skeleton className="h-6 w-full skeleton-red" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-16 w-full skeleton-red" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12 px-4">
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center glow-red">
        <Sparkles className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">Crea tu primera rutina</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Nuestra IA generará una rutina personalizada basada en tus objetivos y condición física.
      </p>
      <Link to="/my/routine/generate">
        <PremiumButton size="lg">
          <Sparkles className="mr-2 h-4 w-4" />
          Generar Rutina con IA
        </PremiumButton>
      </Link>
    </div>
  )
}

function RestDayState({ nextTrainingDay }: { nextTrainingDay: string | null }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="bg-gradient-to-br from-muted/40 to-muted/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <Coffee className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">Día de descanso</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Recupera energías para tu próximo entrenamiento.
        {nextTrainingDay && (
          <> Próximo: <span className="text-primary font-medium">{nextTrainingDay}</span></>
        )}
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">Error al cargar rutina</h3>
      <p className="text-muted-foreground mb-4">No pudimos cargar tu rutina. Intenta de nuevo.</p>
      <PremiumButton onClick={onRetry}>Reintentar</PremiumButton>
    </div>
  )
}

export function MyRoutinePage() {
  const { user } = useAuth()
  const { data, isLoading, error, refetch } = useRoutines()
  const logProgress = useLogProgress()
  const { data: progressData } = useProgress()
  const activateRoutine = useActivateRoutine()
  const deleteRoutine = useDeleteRoutine()

  const routines = data?.routines || []
  const activeRoutine = routines.find((r) => r.isActive) || routines[0]

  const todayName = getTodayName()
  const [selectedDay, setSelectedDay] = useState(todayName)
  const [historyOpen, setHistoryOpen] = useState(false)

  // Days that have a routine assigned
  const routineDays = useMemo(() => {
    if (!activeRoutine?.routineJson?.days) return []
    return activeRoutine.routineJson.days.map((d) => d.dayName)
  }, [activeRoutine])

  // Find exercises for selected day
  const selectedDayData = useMemo(() => {
    if (!activeRoutine?.routineJson?.days) return null
    return activeRoutine.routineJson.days.find(
      (d) => normalize(d.dayName) === normalize(selectedDay)
    ) || null
  }, [activeRoutine, selectedDay])

  const exercises = selectedDayData?.exercises || []

  // Has routine but no exercises for this day = rest day
  const isRestDay = !!activeRoutine && routineDays.length > 0 && !selectedDayData

  // Find next training day from selected day
  const nextTrainingDay = useMemo(() => {
    if (!routineDays.length) return null
    const currentIdx = DAY_NAMES.findIndex((d) => normalize(d) === normalize(selectedDay))
    for (let i = 1; i <= 7; i++) {
      const checkDay = DAY_NAMES[(currentIdx + i) % 7]
      if (routineDays.some((rd) => normalize(rd) === normalize(checkDay))) {
        return checkDay
      }
    }
    return null
  }, [routineDays, selectedDay])

  // Persisted completions from progress API (today)
  const todayCompleted = useMemo(() => {
    if (!progressData?.progress || !activeRoutine) return new Set<string>()
    const todayStr = getTodayDateStr()
    const set = new Set<string>()
    for (const log of progressData.progress) {
      const logDate = new Date(log.completedAt).toLocaleDateString("es-CL", {
        timeZone: "America/Santiago",
      })
      if (logDate === todayStr) {
        set.add(log.exerciseName)
      }
    }
    return set
  }, [progressData, activeRoutine])

  // Local state merged with persisted
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set())
  const completedExercises = useMemo(() => {
    const merged = new Set(todayCompleted)
    localCompleted.forEach((e) => merged.add(e))
    return merged
  }, [todayCompleted, localCompleted])

  const toggleCompleted = (exercise: { name: string; sets: number; reps: string; weight?: string }) => {
    const newLocal = new Set(localCompleted)
    if (completedExercises.has(exercise.name)) {
      newLocal.delete(exercise.name)
    } else {
      newLocal.add(exercise.name)
      logProgress.mutate({
        routineId: activeRoutine?.id,
        exerciseName: exercise.name,
        sets: exercise.sets,
        reps: parseInt(exercise.reps.split("-")[0]) || 10,
        weightKg: exercise.weight ? parseFloat(exercise.weight) : undefined,
      })
    }
    setLocalCompleted(newLocal)
  }

  const resetProgress = () => setLocalCompleted(new Set())

  const completados = completedExercises.size
  const total = exercises.length
  const progreso = total > 0 ? Math.round((completados / total) * 100) : 0

  if (isLoading) {
    return (
      <UserLayout title="Mi Rutina - Titanium Gym" userRole={user?.role}>
        <RoutineSkeleton />
      </UserLayout>
    )
  }

  if (error) {
    return (
      <UserLayout title="Mi Rutina - Titanium Gym" userRole={user?.role}>
        <ErrorState onRetry={() => refetch()} />
      </UserLayout>
    )
  }

  if (!activeRoutine || routineDays.length === 0) {
    return (
      <UserLayout title="Mi Rutina - Titanium Gym" userRole={user?.role}>
        <EmptyState />
      </UserLayout>
    )
  }

  return (
    <UserLayout title="Mi Rutina - Titanium Gym" userRole={user?.role}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{activeRoutine.name}</h1>
            {activeRoutine.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {activeRoutine.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex-shrink-0 w-[44px] h-[44px] rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <History className="h-5 w-5" />
          </button>
        </div>

        {/* Day Selector */}
        <DaySelector
          routineDays={routineDays}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          todayName={todayName}
        />

        {/* Rest Day */}
        {isRestDay && <RestDayState nextTrainingDay={nextTrainingDay} />}

        {/* Exercises */}
        {exercises.length > 0 && (
          <>
            {/* Progress Bar */}
            <DashboardCard
              title={`${selectedDayData?.focus || "Entrenamiento"} — ${completados}/${total}`}
            >
              <div className="space-y-2">
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 glow-red"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </div>
            </DashboardCard>

            {/* Exercise List */}
            <div className="space-y-2">
              {exercises.map((e, i) => (
                <ExerciseCard
                  key={`${e.name}-${i}`}
                  exercise={e}
                  index={i}
                  completed={completedExercises.has(e.name)}
                  onToggle={() => toggleCompleted(e)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <PremiumButton variant="outline" onClick={resetProgress} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reiniciar
              </PremiumButton>
              <Link to={`/my/routine/workout?day=${encodeURIComponent(selectedDay)}`} className="flex-1">
                <PremiumButton className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Iniciar Rutina
                </PremiumButton>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* History Sheet */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Mis Rutinas</SheetTitle>
            <SheetDescription>{routines.length} rutina{routines.length !== 1 ? "s" : ""}</SheetDescription>
          </SheetHeader>

          <div className="space-y-3 mt-6">
            {routines.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-lg border border-border space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm truncate">{r.name}</p>
                  {r.isActive && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[11px]">
                      Activa
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{r.routineJson?.days?.length || 0} días</span>
                </div>
                <div className="flex gap-2">
                  {!r.isActive && (
                    <button
                      onClick={() => activateRoutine.mutate(r.id)}
                      disabled={activateRoutine.isPending}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Activar
                    </button>
                  )}
                  <button
                    onClick={() => deleteRoutine.mutate(r.id)}
                    disabled={deleteRoutine.isPending}
                    className="flex items-center gap-1 text-xs text-destructive hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <Link
              to="/my/routine/generate"
              onClick={() => setHistoryOpen(false)}
              className="flex items-center justify-between p-3 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Generar Nueva Rutina</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </UserLayout>
  )
}
