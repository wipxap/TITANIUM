import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { contractsApi, type Contract } from "@/lib/api"

export function useActiveContract() {
  return useQuery({
    queryKey: ["contracts", "active"],
    queryFn: contractsApi.getActive,
  })
}

export function useMySignedContracts() {
  return useQuery({
    queryKey: ["contracts", "my-signed"],
    queryFn: contractsApi.getMySigned,
  })
}

export function useCheckContractSigned() {
  return useQuery({
    queryKey: ["contracts", "check-signed"],
    queryFn: contractsApi.checkSigned,
  })
}

export function useSignContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { contractId: string; signatureData: string; subscriptionId?: string }) =>
      contractsApi.sign(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al firmar contrato")
    },
  })
}

// Admin hooks
export function useAdminContracts() {
  return useQuery({
    queryKey: ["contracts", "admin"],
    queryFn: contractsApi.getAll,
  })
}

export function useCreateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; content: string; version?: string; requiresSignature?: boolean }) =>
      contractsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear contrato")
    },
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contract> }) =>
      contractsApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar contrato")
    },
  })
}

export function useActivateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contractsApi.activate(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al activar contrato")
    },
  })
}

export function useDeleteContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contractsApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar contrato")
    },
  })
}

export function useContractSignatures(contractId: string) {
  return useQuery({
    queryKey: ["contracts", "signatures", contractId],
    queryFn: () => contractsApi.getSignatures(contractId),
    enabled: !!contractId,
  })
}
