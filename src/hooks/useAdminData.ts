import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import type { Machine, Plan } from "@/lib/api"

export function useAdminUsers(params?: { search?: string; page?: number }) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminApi.getUsers(params),
  })
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: "admin" | "reception" | "user" }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useAdminMachines() {
  return useQuery({
    queryKey: ["admin", "machines"],
    queryFn: adminApi.getMachines,
  })
}

export function useCreateMachine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Machine>) => adminApi.createMachine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "machines"] })
      queryClient.invalidateQueries({ queryKey: ["public", "machines"] })
    },
  })
}

export function useUpdateMachine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Machine> }) =>
      adminApi.updateMachine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "machines"] })
      queryClient.invalidateQueries({ queryKey: ["public", "machines"] })
    },
  })
}

export function useDeleteMachine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteMachine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "machines"] })
      queryClient.invalidateQueries({ queryKey: ["public", "machines"] })
    },
  })
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: adminApi.getPlans,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Plan>) => adminApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
      queryClient.invalidateQueries({ queryKey: ["public", "plans"] })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Plan> }) =>
      adminApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
      queryClient.invalidateQueries({ queryKey: ["public", "plans"] })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
      queryClient.invalidateQueries({ queryKey: ["public", "plans"] })
    },
  })
}
