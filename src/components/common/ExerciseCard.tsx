import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Exercise {
  name: string
  sets: number
  reps: string
  weight?: string
  rest?: string
  notes?: string
}

interface ExerciseCardProps {
  exercise: Exercise
  index: number
  completed: boolean
  onToggle: () => void
}

export function ExerciseCard({ exercise, index, completed, onToggle }: ExerciseCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        completed
          ? "border-primary/50 bg-primary/5"
          : "border-border"
      )}
    >
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
        {index + 1}
      </span>

      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-sm truncate", completed && "line-through opacity-60")}>
          {exercise.name}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
            {exercise.sets}×{exercise.reps}
          </Badge>
          {exercise.weight && (
            <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
              {exercise.weight}
            </Badge>
          )}
          {exercise.rest && (
            <Badge variant="outline" className="text-[11px] px-1.5 py-0">
              {exercise.rest}
            </Badge>
          )}
        </div>
        {exercise.notes && (
          <p className="text-[11px] text-muted-foreground mt-1 truncate">{exercise.notes}</p>
        )}
      </div>

      <button
        onClick={onToggle}
        className={cn(
          "flex-shrink-0 w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all",
          completed
            ? "bg-primary text-primary-foreground glow-red"
            : "bg-muted text-muted-foreground hover:bg-primary/20"
        )}
      >
        <Check className="h-5 w-5" />
      </button>
    </div>
  )
}
