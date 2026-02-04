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
    const error = await response.text()
    console.error("Gemini API error:", error)
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
  } catch (e) {
    console.error("Failed to parse Gemini response:", generatedText)
    throw new Error("Error al procesar respuesta de IA")
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

  const fullBodyDay: RoutineDay = {
    dayName: "Día",
    focus: "Full Body",
    exercises: [
      { name: "Press de Banca", sets, reps, rest: "90s", notes: "Calentar con series ligeras" },
      { name: "Jalón al Pecho", sets, reps, rest: "90s" },
      { name: "Press Militar", sets, reps, rest: "60s" },
      { name: "Prensa de Piernas", sets, reps, rest: "90s" },
      { name: "Curl de Bíceps", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Extensión de Tríceps", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Crunch Abdominal", sets: 3, reps: "15-20", rest: "45s" },
    ],
  }

  const days: RoutineDay[] = []
  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  for (let i = 0; i < daysPerWeek; i++) {
    days.push({
      ...fullBodyDay,
      dayName: dayNames[i] || `Día ${i + 1}`,
    })
  }

  return {
    name: "Rutina Full Body Básica",
    description: "Rutina equilibrada para trabajar todo el cuerpo",
    days,
  }
}
