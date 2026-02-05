import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { PremiumButton } from "@/components/common"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Timer,
  Dumbbell,
} from "lucide-react"
import { useRoutines, useLogProgress } from "@/hooks"
import { cn } from "@/lib/utils"

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function parseRestSeconds(rest?: string): number {
  if (!rest) return 60
  const match = rest.match(/(\d+)/)
  return match ? parseInt(match[1]) : 60
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function WorkoutSessionPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data } = useRoutines()
  const logProgress = useLogProgress()

  const dayParam = searchParams.get("day") || ""
  const routines = data?.routines || []
  const activeRoutine = routines.find((r) => r.isActive) || routines[0]

  const exercises = activeRoutine?.routineJson?.days?.find(
    (d) => normalize(d.dayName) === normalize(dayParam)
  )?.exercises || []

  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [resting, setResting] = useState(false)
  const [restTime, setRestTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [finished, setFinished] = useState(false)
  const startTimeRef = useRef(Date.now())

  const exercise = exercises[currentExIdx]
  const totalExercises = exercises.length

  // Elapsed timer
  useEffect(() => {
    if (finished) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [finished])

  // Rest countdown
  useEffect(() => {
    if (!resting || restTime <= 0) return
    const interval = setInterval(() => {
      setRestTime((prev) => {
        if (prev <= 1) {
          setResting(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [resting, restTime])

  const logExercise = useCallback(
    (ex: typeof exercise) => {
      if (!ex) return
      logProgress.mutate({
        routineId: activeRoutine?.id,
        exerciseName: ex.name,
        sets: ex.sets,
        reps: parseInt(ex.reps.split("-")[0]) || 10,
        weightKg: ex.weight ? parseFloat(ex.weight) : undefined,
      })
    },
    [activeRoutine, logProgress]
  )

  const completeSet = () => {
    if (!exercise) return

    if (currentSet < exercise.sets) {
      // More sets remaining
      setCurrentSet(currentSet + 1)
      const restSec = parseRestSeconds(exercise.rest)
      setRestTime(restSec)
      setResting(true)
    } else {
      // All sets done for this exercise
      const newCompleted = new Set(completedExercises)
      newCompleted.add(currentExIdx)
      setCompletedExercises(newCompleted)
      logExercise(exercise)

      if (currentExIdx < totalExercises - 1) {
        // Move to next exercise
        setCurrentExIdx(currentExIdx + 1)
        setCurrentSet(1)
      } else {
        // Workout complete
        setFinished(true)
      }
    }
  }

  const goToExercise = (idx: number) => {
    if (idx >= 0 && idx < totalExercises) {
      setCurrentExIdx(idx)
      setCurrentSet(1)
      setResting(false)
    }
  }

  const skipRest = () => {
    setResting(false)
    setRestTime(0)
  }

  const handleExit = () => {
    if (completedExercises.size > 0 && !finished) {
      setShowExitDialog(true)
    } else {
      navigate("/my/routine")
    }
  }

  if (!exercises.length) {
    navigate("/my/routine")
    return null
  }

  // Finished screen
  if (finished) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full w-28 h-28 flex items-center justify-center mb-6 glow-red">
          <Trophy className="h-14 w-14 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Entrenamiento Completo</h1>
        <p className="text-muted-foreground mb-8">Excelente trabajo</p>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatTime(elapsed)}</p>
            <p className="text-xs text-muted-foreground">Tiempo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalExercises}</p>
            <p className="text-xs text-muted-foreground">Ejercicios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {exercises.reduce((sum, e) => sum + e.sets, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Series</p>
          </div>
        </div>

        <PremiumButton onClick={() => navigate("/my/routine")} className="w-full max-w-sm h-14">
          Volver a Mi Rutina
        </PremiumButton>
      </div>
    )
  }

  const restMaxSec = parseRestSeconds(exercise?.rest)
  const restPercent = restMaxSec > 0 ? (restTime / restMaxSec) * 100 : 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={handleExit} className="w-[44px] h-[44px] flex items-center justify-center">
          <X className="h-6 w-6" />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium">
            {currentExIdx + 1}/{totalExercises} ejercicios
          </p>
          <p className="text-xs text-muted-foreground">{formatTime(elapsed)}</p>
        </div>
        <div className="w-[44px]" />
      </div>

      {/* Progress bar */}
      <Progress value={((currentExIdx + (currentSet / (exercise?.sets || 1))) / totalExercises) * 100} className="h-1 rounded-none" />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {resting ? (
          // Rest timer
          <div className="text-center space-y-6 w-full max-w-sm">
            <Timer className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-lg text-muted-foreground">Descanso</p>
            <p className="text-6xl font-bold tabular-nums">{restTime}s</p>
            <Progress value={restPercent} className="h-3" />
            <PremiumButton variant="outline" onClick={skipRest} className="w-full h-14">
              Saltar Descanso
            </PremiumButton>
          </div>
        ) : exercise ? (
          // Exercise
          <div className="text-center space-y-6 w-full max-w-sm">
            <Dumbbell className="h-12 w-12 text-primary mx-auto" />
            <div>
              <h2 className="text-2xl font-bold">{exercise.name}</h2>
              <div className="flex justify-center gap-2 mt-3">
                <Badge variant="secondary">{exercise.sets} series × {exercise.reps}</Badge>
                {exercise.weight && <Badge variant="secondary">{exercise.weight}</Badge>}
              </div>
            </div>

            <p className="text-lg">
              Serie <span className="text-primary font-bold">{currentSet}</span> de {exercise.sets}
            </p>

            {exercise.notes && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {exercise.notes}
              </p>
            )}

            <PremiumButton onClick={completeSet} className="w-full h-14 text-lg">
              {currentSet < exercise.sets ? "COMPLETAR SERIE" : "COMPLETAR EJERCICIO"}
            </PremiumButton>
          </div>
        ) : null}
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <button
          onClick={() => goToExercise(currentExIdx - 1)}
          disabled={currentExIdx === 0}
          className={cn(
            "w-[44px] h-[44px] flex items-center justify-center rounded-full",
            currentExIdx === 0 ? "opacity-30" : "hover:bg-muted"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="flex gap-1.5">
          {exercises.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                completedExercises.has(i)
                  ? "bg-primary"
                  : i === currentExIdx
                    ? "bg-primary/50 scale-125"
                    : "bg-muted"
              )}
            />
          ))}
        </div>

        <button
          onClick={() => goToExercise(currentExIdx + 1)}
          disabled={currentExIdx >= totalExercises - 1}
          className={cn(
            "w-[44px] h-[44px] flex items-center justify-center rounded-full",
            currentExIdx >= totalExercises - 1 ? "opacity-30" : "hover:bg-muted"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Exit confirmation */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salir del entrenamiento</DialogTitle>
            <DialogDescription>
              Tienes progreso sin guardar. El progreso de ejercicios completados ya fue registrado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <PremiumButton variant="outline" onClick={() => setShowExitDialog(false)}>
              Continuar
            </PremiumButton>
            <PremiumButton onClick={() => navigate("/my/routine")} variant="destructive">
              Salir
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
