import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { familyApi } from "@/lib/api"

export function useMyFamilyCodes() {
  return useQuery({
    queryKey: ["family", "my-codes"],
    queryFn: familyApi.getMyCodes,
  })
}

export function useGenerateFamilyCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: familyApi.generateCode,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["family"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al generar código")
    },
  })
}

export function useRedeemFamilyCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => familyApi.redeemCode(code),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["family"] })
      queryClient.invalidateQueries({ queryKey: ["user", "subscription"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al canjear código")
    },
  })
}

export function useLookupFamilyCode(code: string) {
  return useQuery({
    queryKey: ["family", "lookup", code],
    queryFn: () => familyApi.lookupCode(code),
    enabled: code.length >= 5,
  })
}
