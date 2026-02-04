import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { loyaltyApi, type LoyaltyLevel } from "@/lib/api"

export function useLoyaltyLevels() {
  return useQuery({
    queryKey: ["loyalty", "levels"],
    queryFn: loyaltyApi.getLevels,
  })
}

export function useMyLoyaltyLevel() {
  return useQuery({
    queryKey: ["loyalty", "my-level"],
    queryFn: loyaltyApi.getMyLevel,
  })
}

// Admin hooks
export function useCreateLoyaltyLevel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<LoyaltyLevel, "id">) => loyaltyApi.createLevel(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["loyalty"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear nivel de lealtad")
    },
  })
}

export function useUpdateLoyaltyLevel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LoyaltyLevel> }) =>
      loyaltyApi.updateLevel(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["loyalty"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar nivel de lealtad")
    },
  })
}

export function useDeleteLoyaltyLevel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => loyaltyApi.deleteLevel(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["loyalty"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar nivel de lealtad")
    },
  })
}
