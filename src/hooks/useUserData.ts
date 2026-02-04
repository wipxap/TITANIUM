import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { userApi, routinesApi } from "@/lib/api"
import type { Profile, GenerateRoutineInput } from "@/lib/api"

export function useProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: userApi.getProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Profile>) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
      toast.success("Perfil actualizado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar perfil")
    },
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: ["user", "subscription"],
    queryFn: userApi.getSubscription,
  })
}

export function useCheckins() {
  return useQuery({
    queryKey: ["user", "checkins"],
    queryFn: userApi.getCheckins,
  })
}

export function useCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.checkin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "checkins"] })
      toast.success("Check-in registrado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrar check-in")
    },
  })
}

export function useRoutines() {
  return useQuery({
    queryKey: ["user", "routines"],
    queryFn: userApi.getRoutines,
  })
}

export function useRoutine(id: string) {
  return useQuery({
    queryKey: ["user", "routines", id],
    queryFn: () => userApi.getRoutine(id),
    enabled: !!id,
  })
}

export function useProgress() {
  return useQuery({
    queryKey: ["user", "progress"],
    queryFn: userApi.getProgress,
  })
}

export function useLogProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.logProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "progress"] })
      toast.success("Progreso registrado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrar progreso")
    },
  })
}

export function useGenerateRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GenerateRoutineInput) => routinesApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "routines"] })
      toast.success("¡Rutina generada con IA!")
    },
    onError: (error) => {
      toast.error(error.message || "Error al generar rutina")
    },
  })
}

export function useActivateRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => routinesApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "routines"] })
      toast.success("Rutina activada")
    },
    onError: (error) => {
      toast.error(error.message || "Error al activar rutina")
    },
  })
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => routinesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "routines"] })
      toast.success("Rutina eliminada")
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar rutina")
    },
  })
}
