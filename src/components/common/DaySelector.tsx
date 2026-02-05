import { cn } from "@/lib/utils"

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

interface DaySelectorProps {
  routineDays: string[]
  selectedDay: string
  onSelectDay: (day: string) => void
  todayName: string
}

export function DaySelector({ routineDays, selectedDay, onSelectDay, todayName }: DaySelectorProps) {
  const normalizedRoutineDays = routineDays.map(normalize)
  const normalizedToday = normalize(todayName)

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {DAYS.map((day) => {
        const nd = normalize(day)
        const hasRoutine = normalizedRoutineDays.includes(nd)
        const isSelected = normalize(selectedDay) === nd
        const isToday = normalizedToday === nd

        return (
          <button
            key={day}
            onClick={() => onSelectDay(day)}
            className={cn(
              "relative flex-shrink-0 min-w-[44px] h-[44px] px-3 rounded-full border text-sm font-medium transition-all",
              isSelected
                ? "bg-primary text-primary-foreground border-primary glow-red"
                : hasRoutine
                  ? "border-primary/60 text-primary hover:bg-primary/10"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
            )}
          >
            {day.slice(0, 3)}
            {isToday && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
