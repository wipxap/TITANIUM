import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumButton } from "@/components/common"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Target,
  Calendar,
  Clock,
  Dumbbell,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react"
import { useAuth, useGenerateRoutine } from "@/hooks"
import { cn } from "@/lib/utils"

const experienceLevels = [
  {
    value: "beginner",
    label: "Principiante",
    description: "0-6 meses de experiencia",
    icon: "🌱",
  },
  {
    value: "intermediate",
    label: "Intermedio",
    description: "6 meses - 2 años",
    icon: "💪",
  },
  {
    value: "advanced",
    label: "Avanzado",
    description: "Más de 2 años",
    icon: "🔥",
  },
]

const goalOptions = [
  { value: "muscle", label: "Ganar Músculo", icon: "💪" },
  { value: "strength", label: "Aumentar Fuerza", icon: "🏋️" },
  { value: "lose_fat", label: "Perder Grasa", icon: "🔥" },
  { value: "endurance", label: "Resistencia", icon: "🏃" },
  { value: "tone", label: "Tonificar", icon: "✨" },
  { value: "health", label: "Salud General", icon: "❤️" },
]

const focusAreas = [
  { value: "chest", label: "Pecho" },
  { value: "back", label: "Espalda" },
  { value: "shoulders", label: "Hombros" },
  { value: "arms", label: "Brazos" },
  { value: "legs", label: "Piernas" },
  { value: "core", label: "Core/Abdomen" },
  { value: "glutes", label: "Glúteos" },
]

type Step = "goals" | "experience" | "schedule" | "focus" | "generating"

export function GenerateRoutinePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const generateRoutine = useGenerateRoutine()

  const [step, setStep] = useState<Step>("goals")
  const [formData, setFormData] = useState({
    goals: "",
    selectedGoals: [] as string[],
    experienceLevel: "" as "beginner" | "intermediate" | "advanced" | "",
    daysPerWeek: 3,
    sessionDuration: 60,
    focusAreas: [] as string[],
  })

  const toggleGoal = (goal: string) => {
    const current = formData.selectedGoals
    const updated = current.includes(goal)
      ? current.filter((g) => g !== goal)
      : [...current, goal]
    setFormData({ ...formData, selectedGoals: updated })
  }

  const toggleFocus = (area: string) => {
    const current = formData.focusAreas
    const updated = current.includes(area)
      ? current.filter((a) => a !== area)
      : [...current, area]
    setFormData({ ...formData, focusAreas: updated })
  }

  const canProceed = () => {
    switch (step) {
      case "goals":
        return formData.selectedGoals.length > 0
      case "experience":
        return !!formData.experienceLevel
      case "schedule":
        return formData.daysPerWeek > 0 && formData.sessionDuration >= 15
      case "focus":
        return true // Optional step
      default:
        return false
    }
  }

  const nextStep = () => {
    const steps: Step[] = ["goals", "experience", "schedule", "focus"]
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    } else {
      handleGenerate()
    }
  }

  const prevStep = () => {
    const steps: Step[] = ["goals", "experience", "schedule", "focus"]
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  const handleGenerate = async () => {
    setStep("generating")

    const goalsText = formData.selectedGoals
      .map((g) => goalOptions.find((o) => o.value === g)?.label)
      .join(", ")

    try {
      await generateRoutine.mutateAsync({
        goals: goalsText + (formData.goals ? `. ${formData.goals}` : ""),
        experienceLevel: formData.experienceLevel as "beginner" | "intermediate" | "advanced",
        daysPerWeek: formData.daysPerWeek,
        sessionDuration: formData.sessionDuration,
        focusAreas: formData.focusAreas,
      })

      // Navigate to routine page
      navigate("/my/routine")
    } catch (error) {
      console.error("Error generating routine:", error)
      setStep("focus") // Go back to last step
    }
  }

  const stepNumber = {
    goals: 1,
    experience: 2,
    schedule: 3,
    focus: 4,
    generating: 5,
  }

  return (
    <UserLayout title="Generar Rutina - Titanium Gym" userRole={user?.role}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Generador de Rutinas IA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Crea tu Rutina Personalizada
          </h1>
          <p className="text-muted-foreground mt-2">
            Responde algunas preguntas y la IA creará tu rutina ideal
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={cn(
                "flex-1 h-2 rounded-full transition-all",
                stepNumber[step] >= n ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step Content */}
        <DashboardCard
          title={
            step === "generating" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generando tu rutina...
              </div>
            ) : step === "goals" ? (
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ¿Cuál es tu objetivo?
              </div>
            ) : step === "experience" ? (
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Tu nivel de experiencia
              </div>
            ) : step === "schedule" ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tu disponibilidad
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Áreas de enfoque (opcional)
              </div>
            )
          }
        >
          {/* Goals Step */}
          {step === "goals" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {goalOptions.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => toggleGoal(goal.value)}
                    className={cn(
                      "p-4 border rounded-lg text-center transition-all",
                      formData.selectedGoals.includes(goal.value)
                        ? "border-primary bg-primary/10 glow-red"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <div className="font-medium text-sm">{goal.label}</div>
                    {formData.selectedGoals.includes(goal.value) && (
                      <Check className="h-4 w-4 text-primary mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customGoal">Detalles adicionales (opcional)</Label>
                <Input
                  id="customGoal"
                  placeholder="Ej: Quiero enfocarme en definición para el verano..."
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
          )}

          {/* Experience Step */}
          {step === "experience" && (
            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      experienceLevel: level.value as "beginner" | "intermediate" | "advanced",
                    })
                  }
                  className={cn(
                    "w-full p-4 border rounded-lg text-left transition-all flex items-center gap-4",
                    formData.experienceLevel === level.value
                      ? "border-primary bg-primary/10 glow-red"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-3xl">{level.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold">{level.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {level.description}
                    </div>
                  </div>
                  {formData.experienceLevel === level.value && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Schedule Step */}
          {step === "schedule" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Días por semana</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <button
                      key={day}
                      onClick={() => setFormData({ ...formData, daysPerWeek: day })}
                      className={cn(
                        "flex-1 py-3 border rounded-lg font-bold transition-all",
                        formData.daysPerWeek === day
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Recomendado: 3-5 días para resultados óptimos
                </p>
              </div>

              <div className="space-y-3">
                <Label>Duración por sesión</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 45, 60, 90].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setFormData({ ...formData, sessionDuration: duration })}
                      className={cn(
                        "py-3 border rounded-lg transition-all",
                        formData.sessionDuration === duration
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="font-bold">{duration}</div>
                      <div className="text-xs opacity-80">min</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Focus Areas Step */}
          {step === "focus" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Selecciona las áreas que quieres priorizar (opcional)
              </p>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((area) => (
                  <button
                    key={area.value}
                    onClick={() => toggleFocus(area.value)}
                    className={cn(
                      "px-4 py-2 border rounded-full transition-all",
                      formData.focusAreas.includes(area.value)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generating Step */}
          {step === "generating" && (
            <div className="text-center py-8">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-primary/30 rounded-full animate-pulse" />
                <div className="absolute inset-4 bg-primary rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <p className="text-lg font-medium">
                La IA está analizando tu perfil...
              </p>
              <p className="text-muted-foreground mt-2">
                Esto puede tomar unos segundos
              </p>

              {generateRoutine.isError && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-destructive">
                    Error al generar rutina. Intentando con rutina básica...
                  </p>
                </div>
              )}
            </div>
          )}
        </DashboardCard>

        {/* Navigation Buttons */}
        {step !== "generating" && (
          <div className="flex justify-between gap-4">
            <PremiumButton
              variant="outline"
              onClick={prevStep}
              disabled={step === "goals"}
              className={step === "goals" ? "invisible" : ""}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </PremiumButton>

            <PremiumButton onClick={nextStep} disabled={!canProceed()}>
              {step === "focus" ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generar Rutina
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </PremiumButton>
          </div>
        )}

        {/* Summary */}
        {step !== "goals" && step !== "generating" && (
          <div className="flex flex-wrap gap-2 justify-center">
            {formData.selectedGoals.length > 0 && (
              <Badge variant="secondary">
                {formData.selectedGoals
                  .map((g) => goalOptions.find((o) => o.value === g)?.label)
                  .join(", ")}
              </Badge>
            )}
            {formData.experienceLevel && (
              <Badge variant="secondary">
                {experienceLevels.find((l) => l.value === formData.experienceLevel)?.label}
              </Badge>
            )}
            {step === "focus" && (
              <>
                <Badge variant="secondary">{formData.daysPerWeek} días/semana</Badge>
                <Badge variant="secondary">{formData.sessionDuration} min</Badge>
              </>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  )
}
