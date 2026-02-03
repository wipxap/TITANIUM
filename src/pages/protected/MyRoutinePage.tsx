import { Link } from "react-router-dom"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumTable, PremiumButton } from "@/components/common"
import { Skeleton } from "@/components/ui/skeleton"
import { Play, Check, RotateCcw, AlertCircle, Sparkles } from "lucide-react"
import { useState, useMemo } from "react"
import { useAuth, useRoutines, useLogProgress } from "@/hooks"

function RoutineSkeleton() {
  return (
    <div className="space-y-6">
      <DashboardCard title="Progreso de Hoy">
        <Skeleton className="h-6 w-full skeleton-red" />
      </DashboardCard>
      <DashboardCard title="Ejercicios" loading>
        <div />
      </DashboardCard>
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

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">Error al cargar rutina</h3>
      <p className="text-muted-foreground mb-4">
        No pudimos cargar tu rutina. Intenta de nuevo.
      </p>
      <PremiumButton onClick={onRetry}>Reintentar</PremiumButton>
    </div>
  )
}

interface ExerciseWithState {
  name: string
  sets: number
  reps: string
  weight?: string
  rest?: string
  notes?: string
  completed: boolean
}

export function MyRoutinePage() {
  const { user } = useAuth()
  const { data, isLoading, error, refetch } = useRoutines()
  const logProgress = useLogProgress()
  
  const routines = data?.routines || []
  const activeRoutine = routines.find((r) => r.isActive) || routines[0]

  // Get today's exercises from routine
  const todayDayIndex = new Date().getDay() // 0 = Sunday
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const todayName = dayNames[todayDayIndex]

  const todayExercises = useMemo(() => {
    if (!activeRoutine?.routineJson?.days) return []
    
    // Find today's workout or first available
    const todayWorkout = activeRoutine.routineJson.days.find(
      (d) => d.dayName.toLowerCase() === todayName.toLowerCase()
    ) || activeRoutine.routineJson.days[0]

    return todayWorkout?.exercises || []
  }, [activeRoutine, todayName])

  // Local state for tracking completion (optimistic UI)
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())

  const toggleCompleted = async (exerciseName: string, exercise: ExerciseWithState) => {
    const newCompleted = new Set(completedExercises)
    
    if (newCompleted.has(exerciseName)) {
      newCompleted.delete(exerciseName)
    } else {
      newCompleted.add(exerciseName)
      
      // Log progress to API
      logProgress.mutate({
        routineId: activeRoutine?.id,
        exerciseName: exercise.name,
        sets: exercise.sets,
        reps: parseInt(exercise.reps.split("-")[0]) || 10,
        weightKg: exercise.weight ? parseFloat(exercise.weight) : undefined,
      })
    }
    
    setCompletedExercises(newCompleted)
  }

  const resetRutina = () => {
    setCompletedExercises(new Set())
  }

  const completados = completedExercises.size
  const total = todayExercises.length
  const progreso = total > 0 ? Math.round((completados / total) * 100) : 0

  if (isLoading) {
    return (
      <UserLayout title="Mi Rutina - Titanium Gym" userRole={user?.role}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2 skeleton-red" />
              <Skeleton className="h-5 w-32 skeleton-red" />
            </div>
          </div>
          <RoutineSkeleton />
        </div>
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

  if (!activeRoutine || todayExercises.length === 0) {
    return (
      <UserLayout title="Mi Rutina - Titanium Gym" userRole={user?.role}>
        <EmptyState />
      </UserLayout>
    )
  }

  const todayFocus = activeRoutine.routineJson?.days?.find(
    (d) => d.dayName.toLowerCase() === todayName.toLowerCase()
  )?.focus || "Entrenamiento"

  return (
    <UserLayout title="Mi Rutina - Titanium Gym" userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{activeRoutine.name}</h1>
            <p className="text-muted-foreground">{todayName} - {todayFocus}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <PremiumButton variant="outline" onClick={resetRutina} className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar
            </PremiumButton>
            <PremiumButton className="w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4" />
              Iniciar Rutina
            </PremiumButton>
          </div>
        </div>

        {/* Progress */}
        <DashboardCard title="Progreso de Hoy">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {completados} de {total} ejercicios completados
              </span>
              <span className="text-primary font-bold">{progreso}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 glow-red"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        </DashboardCard>

        {/* Ejercicios */}
        <DashboardCard title="Ejercicios">
          <PremiumTable
            headers={["Ejercicio", "Series", "Reps", "Peso", "Estado"]}
            rows={todayExercises.map((e) => [
              e.name,
              e.sets.toString(),
              e.reps,
              e.weight || "—",
              <button
                key={e.name}
                onClick={() => toggleCompleted(e.name, { ...e, completed: completedExercises.has(e.name) })}
                className={`p-2 rounded-full transition-all ${
                  completedExercises.has(e.name)
                    ? "bg-primary text-primary-foreground glow-red"
                    : "bg-muted text-muted-foreground hover:bg-primary/20"
                }`}
              >
                <Check className="h-4 w-4" />
              </button>,
            ])}
          />
        </DashboardCard>

        {/* Tips */}
        <DashboardCard title="Tips del Entrenamiento">
          <ul className="space-y-2 text-muted-foreground">
            <li>• Calienta 5-10 minutos antes de empezar</li>
            <li>• Descansa 60-90 segundos entre series</li>
            <li>• Mantén la técnica correcta en todo momento</li>
            <li>• Hidratación constante durante el entrenamiento</li>
          </ul>
        </DashboardCard>
      </div>
    </UserLayout>
  )
}
