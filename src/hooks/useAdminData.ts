import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { adminApi } from "@/lib/api"
import type { Machine, Plan, VoidRequestStatus } from "@/lib/api"

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
      toast.success("Rol actualizado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar rol")
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
      toast.success("Máquina creada")
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear máquina")
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
      toast.success("Máquina actualizada")
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar máquina")
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
      toast.success("Máquina eliminada")
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar máquina")
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
      toast.success("Plan creado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear plan")
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
      toast.success("Plan actualizado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar plan")
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
      toast.success("Plan eliminado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar plan")
    },
  })
}

// ============ VOID REQUESTS HOOKS ============

export function useVoidRequests(status?: VoidRequestStatus | "all") {
  return useQuery({
    queryKey: ["admin", "void-requests", status],
    queryFn: () => adminApi.getVoidRequests(status),
  })
}

export function useApproveVoidRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, adminNotes }: { id: string; adminNotes?: string }) =>
      adminApi.approveVoidRequest(id, adminNotes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "void-requests"] })
      queryClient.invalidateQueries({ queryKey: ["reception", "sales"] })
      toast.success(data.message || "Solicitud aprobada")
    },
    onError: (error) => {
      toast.error(error.message || "Error al aprobar solicitud")
    },
  })
}

export function useRejectVoidRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, adminNotes }: { id: string; adminNotes: string }) =>
      adminApi.rejectVoidRequest(id, adminNotes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "void-requests"] })
      queryClient.invalidateQueries({ queryKey: ["reception", "sales"] })
      toast.success(data.message || "Solicitud rechazada")
    },
    onError: (error) => {
      toast.error(error.message || "Error al rechazar solicitud")
    },
  })
}

// ============ CASH REGISTERS HOOKS ============

export function useAdminCashRegisters(params?: {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  onlyWithDifferences?: boolean
}) {
  return useQuery({
    queryKey: ["admin", "cash-registers", params],
    queryFn: () => adminApi.getCashRegisters(params),
  })
}
