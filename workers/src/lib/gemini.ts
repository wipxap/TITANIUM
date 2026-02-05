/**
 * Gemini AI Service for Routine Generation
 */

interface GenerateRoutineInput {
  goals: string
  experienceLevel: "beginner" | "intermediate" | "advanced"
  daysPerWeek: number
  sessionDuration: number // minutes
  equipment: string[] // available machine names
  healthConditions?: string[]
  focusAreas?: string[]
}

interface RoutineDay {
  dayName: string
  focus: string
  exercises: Array<{
    name: string
    sets: number
    reps: string
    weight?: string
    rest?: string
    notes?: string
  }>
}

interface GeneratedRoutine {
  name: string
  description: string
  days: RoutineDay[]
}

const SYSTEM_PROMPT = `Eres un entrenador personal profesional de Titanium Gym en Iquique, Chile. 
Genera rutinas de ejercicios personalizadas en formato JSON estructurado.

REGLAS IMPORTANTES:
- Las rutinas deben ser realistas y seguras
- Adapta la intensidad al nivel de experiencia
- Incluye calentamiento implícito en las notas del primer ejercicio
- Los ejercicios deben usar las máquinas disponibles del gimnasio
- Respeta las condiciones de salud mencionadas
- El formato de reps puede ser "8-12" para rangos o "10" para fijo
- El peso debe ser "moderado", "ligero", "pesado" o vacío si es peso corporal
- El descanso debe ser en segundos (ej: "60s", "90s")

RESPONDE SOLO CON JSON VÁLIDO, sin markdown ni explicaciones adicionales.`

function buildUserPrompt(input: GenerateRoutineInput): string {
  const {
    goals,
    experienceLevel,
    daysPerWeek,
    sessionDuration,
    equipment,
    healthConditions,
    focusAreas,
  } = input

  const levelDescriptions = {
    beginner: "principiante (0-6 meses de experiencia)",
    intermediate: "intermedio (6 meses - 2 años)",
    advanced: "avanzado (más de 2 años)",
  }

  let prompt = `Genera una rutina de entrenamiento con estas especificaciones:

PERFIL DEL USUARIO:
- Objetivo principal: ${goals}
- Nivel de experiencia: ${levelDescriptions[experienceLevel]}
- Días disponibles por semana: ${daysPerWeek}
- Duración por sesión: ${sessionDuration} minutos

EQUIPAMIENTO DISPONIBLE:
${equipment.map((e) => `- ${e}`).join("\n")}
`

  if (healthConditions && healthConditions.length > 0) {
    prompt += `
CONDICIONES DE SALUD A CONSIDERAR:
${healthConditions.map((c) => `- ${c}`).join("\n")}
`
  }

  if (focusAreas && focusAreas.length > 0) {
    prompt += `
ÁREAS DE ENFOQUE PREFERIDAS:
${focusAreas.map((a) => `- ${a}`).join("\n")}
`
  }

  prompt += `
FORMATO DE RESPUESTA (JSON):
{
  "name": "Nombre descriptivo de la rutina",
  "description": "Descripción breve del enfoque de la rutina",
  "days": [
    {
      "dayName": "Lunes",
      "focus": "Pecho y Tríceps",
      "exercises": [
        {
          "name": "Press de Banca",
          "sets": 4,
          "reps": "8-12",
          "weight": "moderado",
          "rest": "90s",
          "notes": "Calentar con 2 series ligeras"
        }
      ]
    }
  ]
}

Genera exactamente ${daysPerWeek} días de entrenamiento.`

  return prompt
}

export async function generateRoutineWithGemini(
  apiKey: string,
  input: GenerateRoutineInput
): Promise<GeneratedRoutine> {
  const userPrompt = buildUserPrompt(input)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error("Error al generar rutina con IA")
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }

  // Extract the generated text
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!generatedText) {
    throw new Error("Respuesta vacía de Gemini")
  }

  // Parse JSON response
  try {
    const routine = JSON.parse(generatedText) as GeneratedRoutine
    return routine
  } catch {
    throw new Error("Respuesta de IA con formato inválido. Intenta de nuevo.")
  }
}

// Fallback routine for when AI is unavailable
export function generateFallbackRoutine(
  daysPerWeek: number,
  experienceLevel: string
): GeneratedRoutine {
  const isAdvanced = experienceLevel === "advanced"
  const sets = isAdvanced ? 4 : 3
  const reps = isAdvanced ? "8-10" : "10-12"
  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const templates: Record<string, RoutineDay> = {
    push: {
      dayName: "", focus: "Pecho, Hombros y Tríceps",
      exercises: [
        { name: "Press de Banca", sets, reps, rest: "90s", notes: "Calentar con 2 series ligeras" },
        { name: "Press Inclinado Mancuernas", sets, reps, rest: "90s" },
        { name: "Press Militar", sets, reps, rest: "90s" },
        { name: "Elevaciones Laterales", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Fondos en Paralelas", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Extensión de Tríceps", sets: 3, reps: "12-15", rest: "60s" },
      ],
    },
    pull: {
      dayName: "", focus: "Espalda y Bíceps",
      exercises: [
        { name: "Jalón al Pecho", sets, reps, rest: "90s", notes: "Calentar con serie ligera" },
        { name: "Remo con Barra", sets, reps, rest: "90s" },
        { name: "Remo en Máquina", sets, reps, rest: "60s" },
        { name: "Pullover en Polea", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Curl de Bíceps con Barra", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Curl Martillo", sets: 3, reps: "12-15", rest: "60s" },
      ],
    },
    legs: {
      dayName: "", focus: "Piernas y Core",
      exercises: [
        { name: "Sentadilla en Smith", sets, reps, rest: "120s", notes: "Calentar con serie ligera" },
        { name: "Prensa de Piernas", sets, reps, rest: "90s" },
        { name: "Extensión de Cuádriceps", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Curl de Piernas", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Elevación de Pantorrillas", sets: 3, reps: "15-20", rest: "45s" },
        { name: "Crunch Abdominal", sets: 3, reps: "15-20", rest: "45s" },
      ],
    },
    chest: {
      dayName: "", focus: "Pecho",
      exercises: [
        { name: "Press de Banca", sets, reps, rest: "90s", notes: "Calentar con 2 series ligeras" },
        { name: "Press Inclinado Mancuernas", sets, reps, rest: "90s" },
        { name: "Aperturas en Máquina", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Crossover en Polea", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Fondos en Paralelas", sets: 3, reps: "10-12", rest: "60s" },
      ],
    },
    back: {
      dayName: "", focus: "Espalda",
      exercises: [
        { name: "Jalón al Pecho", sets, reps, rest: "90s", notes: "Calentar con serie ligera" },
        { name: "Remo con Barra", sets, reps, rest: "90s" },
        { name: "Remo en Máquina", sets, reps, rest: "60s" },
        { name: "Pullover en Polea", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Peso Muerto Rumano", sets, reps, rest: "90s" },
      ],
    },
    shoulders: {
      dayName: "", focus: "Hombros",
      exercises: [
        { name: "Press Militar", sets, reps, rest: "90s", notes: "Calentar con serie ligera" },
        { name: "Elevaciones Laterales", sets, reps: "12-15", rest: "60s" },
        { name: "Elevaciones Frontales", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Pájaros en Máquina", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Encogimientos con Mancuernas", sets: 3, reps: "12-15", rest: "60s" },
      ],
    },
    arms: {
      dayName: "", focus: "Brazos",
      exercises: [
        { name: "Curl de Bíceps con Barra", sets, reps: "10-12", rest: "60s", notes: "Calentar con serie ligera" },
        { name: "Curl Martillo", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Curl en Polea", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Extensión de Tríceps en Polea", sets, reps: "10-12", rest: "60s" },
        { name: "Fondos en Paralelas", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Press Francés", sets: 3, reps: "12-15", rest: "60s" },
      ],
    },
    upper: {
      dayName: "", focus: "Tren Superior",
      exercises: [
        { name: "Press de Banca", sets, reps, rest: "90s", notes: "Calentar con serie ligera" },
        { name: "Jalón al Pecho", sets, reps, rest: "90s" },
        { name: "Press Militar", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Remo en Máquina", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Curl de Bíceps", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Extensión de Tríceps", sets: 3, reps: "12-15", rest: "60s" },
      ],
    },
    fullbody: {
      dayName: "", focus: "Full Body",
      exercises: [
        { name: "Press de Banca", sets, reps, rest: "90s", notes: "Calentar con series ligeras" },
        { name: "Jalón al Pecho", sets, reps, rest: "90s" },
        { name: "Press Militar", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Prensa de Piernas", sets, reps, rest: "90s" },
        { name: "Curl de Bíceps", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Extensión de Tríceps", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Crunch Abdominal", sets: 3, reps: "15-20", rest: "45s" },
      ],
    },
  }

  // Split muscular según días disponibles
  type SplitKey = keyof typeof templates
  let splitKeys: SplitKey[]
  let routineName: string
  let routineDesc: string

  switch (daysPerWeek) {
    case 1:
    case 2:
      splitKeys = Array(daysPerWeek).fill("fullbody") as SplitKey[]
      routineName = "Rutina Full Body"
      routineDesc = "Rutina equilibrada para trabajar todo el cuerpo"
      break
    case 3:
      splitKeys = ["push", "pull", "legs"]
      routineName = "Rutina Push/Pull/Legs"
      routineDesc = "Split clásico de 3 días para desarrollo equilibrado"
      break
    case 4:
      splitKeys = ["push", "pull", "legs", "upper"]
      routineName = "Rutina Push/Pull/Legs + Upper"
      routineDesc = "Split de 4 días con énfasis en tren superior"
      break
    case 5:
      splitKeys = ["chest", "back", "shoulders", "legs", "arms"]
      routineName = "Rutina Bro Split 5 Días"
      routineDesc = "Un grupo muscular por día para máximo volumen"
      break
    default: // 6-7
      splitKeys = ["push", "pull", "legs", "push", "pull", "legs"]
      if (daysPerWeek === 7) splitKeys.push("fullbody")
      routineName = "Rutina PPL x2"
      routineDesc = "Push/Pull/Legs doble frecuencia semanal"
      break
  }

  const days: RoutineDay[] = splitKeys.slice(0, daysPerWeek).map((key, i) => ({
    ...templates[key],
    dayName: dayNames[i] || `Día ${i + 1}`,
  }))

  return { name: routineName, description: routineDesc, days }
}
