import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { PremiumButton } from "@/components/common"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  SkipForward,
  RotateCcw,
  Gauge,
  TrendingUp,
  Activity,
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

const CARDIO_KEYWORDS = ["trotadora", "elíptica", "eliptica", "escalera", "bicicleta", "cinta", "remo", "cardio", "correr", "caminar"]

function isCardioExercise(name: string): boolean {
  const lower = name.toLowerCase()
  return CARDIO_KEYWORDS.some((kw) => lower.includes(kw))
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
  const [skippedExercises, setSkippedExercises] = useState<Set<number>>(new Set())
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [finished, setFinished] = useState(false)
  const [showPending, setShowPending] = useState(false)
  const [cardioDuration, setCardioDuration] = useState(0)
  const [cardioSpeed, setCardioSpeed] = useState(0)
  const [cardioIncline, setCardioIncline] = useState(0)
  const startTimeRef = useRef(Date.now())

  const exercise = exercises[currentExIdx]
  const isCardio = exercise ? isCardioExercise(exercise.name) : false
  const totalExercises = exercises.length

  // Find next available (not completed and not skipped) exercise from a given index
  const findNextAvailable = useCallback(
    (fromIdx: number, completed: Set<number>, skipped: Set<number>) => {
      for (let i = fromIdx; i < totalExercises; i++) {
        if (!completed.has(i) && !skipped.has(i)) return i
      }
      // Wrap around from beginning
      for (let i = 0; i < fromIdx; i++) {
        if (!completed.has(i) && !skipped.has(i)) return i
      }
      return -1
    },
    [totalExercises]
  )

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
    (ex: typeof exercise, cardio?: { duration: number; speed: number; incline: number }) => {
      if (!ex) return
      if (cardio) {
        logProgress.mutate({
          routineId: activeRoutine?.id,
          exerciseName: ex.name,
          sets: 1,
          reps: 1,
          durationSeconds: cardio.duration * 60,
          speed: cardio.speed || undefined,
          incline: cardio.incline || undefined,
        })
      } else {
        logProgress.mutate({
          routineId: activeRoutine?.id,
          exerciseName: ex.name,
          sets: ex.sets,
          reps: parseInt(ex.reps.split("-")[0]) || 10,
          weightKg: ex.weight ? parseFloat(ex.weight) : undefined,
        })
      }
    },
    [activeRoutine, logProgress]
  )

  const resetCardioInputs = () => {
    setCardioDuration(0)
    setCardioSpeed(0)
    setCardioIncline(0)
  }

  const advanceToNext = (newCompleted: Set<number>) => {
    const next = findNextAvailable(currentExIdx + 1, newCompleted, skippedExercises)
    if (next === -1) {
      if (skippedExercises.size > 0) {
        setShowPending(true)
      } else {
        setFinished(true)
      }
    } else {
      setCurrentExIdx(next)
      setCurrentSet(1)
      resetCardioInputs()
    }
  }

  const completeCardio = () => {
    if (!exercise || cardioDuration <= 0) return
    const newCompleted = new Set(completedExercises)
    newCompleted.add(currentExIdx)
    setCompletedExercises(newCompleted)
    logExercise(exercise, { duration: cardioDuration, speed: cardioSpeed, incline: cardioIncline })
    advanceToNext(newCompleted)
  }

  const completeSet = () => {
    if (!exercise) return

    if (currentSet < exercise.sets) {
      setCurrentSet(currentSet + 1)
      const restSec = parseRestSeconds(exercise.rest)
      setRestTime(restSec)
      setResting(true)
    } else {
      const newCompleted = new Set(completedExercises)
      newCompleted.add(currentExIdx)
      setCompletedExercises(newCompleted)
      logExercise(exercise)
      advanceToNext(newCompleted)
    }
  }

  const handleSkipExercise = (idx: number) => {
    const newSkipped = new Set(skippedExercises)
    newSkipped.add(idx)
    setSkippedExercises(newSkipped)
    setResting(false)
    setRestTime(0)
    resetCardioInputs()

    const next = findNextAvailable(idx + 1, completedExercises, newSkipped)
    if (next === -1) {
      setShowPending(true)
    } else {
      setCurrentExIdx(next)
      setCurrentSet(1)
      resetCardioInputs()
    }
  }

  const returnToExercise = (idx: number) => {
    const newSkipped = new Set(skippedExercises)
    newSkipped.delete(idx)
    setSkippedExercises(newSkipped)
    setCurrentExIdx(idx)
    setCurrentSet(1)
    setShowPending(false)
    setResting(false)
    resetCardioInputs()
  }

  const goToExercise = (idx: number) => {
    if (idx >= 0 && idx < totalExercises) {
      setCurrentExIdx(idx)
      setCurrentSet(1)
      setResting(false)
      resetCardioInputs()
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

  // Pending skipped exercises screen
  if (showPending && !finished) {
    const skippedList = Array.from(skippedExercises).map((i) => ({ idx: i, ...exercises[i] }))
    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleExit} className="w-[44px] h-[44px] flex items-center justify-center">
            <X className="h-6 w-6" />
          </button>
          <p className="text-sm font-medium">{formatTime(elapsed)}</p>
          <div className="w-[44px]" />
        </div>

        <div className="flex-1 space-y-6">
          <div className="text-center">
            <SkipForward className="h-10 w-10 text-amber-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold">Ejercicios Pendientes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {skippedList.length} ejercicio{skippedList.length !== 1 ? "s" : ""} saltado{skippedList.length !== 1 ? "s" : ""} por máquina ocupada
            </p>
          </div>

          <div className="space-y-3">
            {skippedList.map((ex) => (
              <div key={ex.idx} className="p-4 rounded-lg border border-amber-700/30 bg-amber-900/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">{ex.sets} series x {ex.reps}</p>
                </div>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  className="border-amber-600 text-amber-400 hover:bg-amber-900/20 flex-shrink-0"
                  onClick={() => returnToExercise(ex.idx)}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Volver
                </PremiumButton>
              </div>
            ))}
          </div>
        </div>

        <PremiumButton onClick={() => setFinished(true)} className="w-full h-14 mt-6">
          Finalizar sin completar
        </PremiumButton>
      </div>
    )
  }

  // Finished screen
  if (finished) {
    const completedCount = completedExercises.size
    const skippedCount = skippedExercises.size
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full w-28 h-28 flex items-center justify-center mb-6 glow-red">
          <Trophy className="h-14 w-14 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Entrenamiento Completo</h1>
        <p className="text-muted-foreground mb-8">Excelente trabajo</p>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatTime(elapsed)}</p>
            <p className="text-xs text-muted-foreground">Tiempo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Ejercicios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {exercises.filter((_, i) => completedExercises.has(i)).reduce((sum, e) => sum + e.sets, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Series</p>
          </div>
        </div>

        {skippedCount > 0 && (
          <p className="text-sm text-amber-400 mb-6">
            Ejercicios saltados: {skippedCount} de {totalExercises}
          </p>
        )}

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
      <Progress value={((completedExercises.size + skippedExercises.size) / totalExercises) * 100} className="h-1 rounded-none" />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {resting ? (
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
          <div className="text-center space-y-5 w-full max-w-sm">
            {isCardio ? (
              <Activity className="h-12 w-12 text-green-500 mx-auto" />
            ) : (
              <Dumbbell className="h-12 w-12 text-primary mx-auto" />
            )}
            <div>
              <h2 className="text-2xl font-bold">{exercise.name}</h2>
              {isCardio ? (
                <Badge variant="secondary" className="mt-3">Cardio</Badge>
              ) : (
                <div className="flex justify-center gap-2 mt-3">
                  <Badge variant="secondary">{exercise.sets} series x {exercise.reps}</Badge>
                  {exercise.weight && <Badge variant="secondary">{exercise.weight}</Badge>}
                </div>
              )}
            </div>

            {isCardio ? (
              <div className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2 text-sm">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    Duracion (minutos)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    placeholder="30"
                    value={cardioDuration || ""}
                    onChange={(e) => setCardioDuration(Number(e.target.value))}
                    className="h-12 text-lg text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speed" className="flex items-center gap-2 text-sm">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    Velocidad (km/h)
                  </Label>
                  <Input
                    id="speed"
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="8.0"
                    value={cardioSpeed || ""}
                    onChange={(e) => setCardioSpeed(Number(e.target.value))}
                    className="h-12 text-lg text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incline" className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Inclinacion (%)
                  </Label>
                  <Input
                    id="incline"
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="2.0"
                    value={cardioIncline || ""}
                    onChange={(e) => setCardioIncline(Number(e.target.value))}
                    className="h-12 text-lg text-center"
                  />
                </div>
              </div>
            ) : (
              <p className="text-lg">
                Serie <span className="text-primary font-bold">{currentSet}</span> de {exercise.sets}
              </p>
            )}

            {exercise.notes && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {exercise.notes}
              </p>
            )}

            {isCardio ? (
              <PremiumButton
                onClick={completeCardio}
                disabled={cardioDuration <= 0}
                className="w-full h-14 text-lg"
              >
                COMPLETAR CARDIO
              </PremiumButton>
            ) : (
              <PremiumButton onClick={completeSet} className="w-full h-14 text-lg">
                {currentSet < exercise.sets ? "COMPLETAR SERIE" : "COMPLETAR EJERCICIO"}
              </PremiumButton>
            )}

            <button
              onClick={() => handleSkipExercise(currentExIdx)}
              className="w-full h-12 flex items-center justify-center gap-2 border border-amber-600/50 text-amber-400 rounded-lg hover:bg-amber-900/20 transition-colors text-sm font-medium"
            >
              <SkipForward className="h-4 w-4" />
              Máquina Ocupada - Saltar
            </button>
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
                  : skippedExercises.has(i)
                    ? "bg-amber-500"
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
