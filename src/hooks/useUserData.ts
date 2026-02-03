import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
    },
  })
}

export function useGenerateRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GenerateRoutineInput) => routinesApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "routines"] })
    },
  })
}

export function useActivateRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => routinesApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "routines"] })
    },
  })
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => routinesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "routines"] })
    },
  })
}
