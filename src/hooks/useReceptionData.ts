import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { receptionApi, type RenewSubscriptionData } from "@/lib/api"

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["reception", "search", query],
    queryFn: () => receptionApi.searchUsers(query),
    enabled: query.length >= 3,
  })
}

export function useUserForCheckin(id: string) {
  return useQuery({
    queryKey: ["reception", "user", id],
    queryFn: () => receptionApi.getUserForCheckin(id),
    enabled: !!id,
  })
}

export function useUserSubscription(userId: string) {
  return useQuery({
    queryKey: ["reception", "subscription", userId],
    queryFn: () => receptionApi.getUserSubscription(userId),
    enabled: !!userId,
  })
}

export function useRenewSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RenewSubscriptionData) => receptionApi.renewSubscription(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reception"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message || "Error al renovar membresía")
    },
  })
}

export function useCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => receptionApi.checkin(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reception", "today"] })
      queryClient.invalidateQueries({ queryKey: ["reception", "user"] })
      toast.success(data.message || "Check-in registrado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrar check-in")
    },
  })
}

export function useCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => receptionApi.checkout(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reception", "today"] })
      queryClient.invalidateQueries({ queryKey: ["reception", "user"] })
      toast.success(data.message || "Check-out registrado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrar check-out")
    },
  })
}

export function useTodayCheckins() {
  return useQuery({
    queryKey: ["reception", "today"],
    queryFn: receptionApi.getTodayCheckins,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useReceptionProducts() {
  return useQuery({
    queryKey: ["reception", "products"],
    queryFn: receptionApi.getProducts,
  })
}

export function useReceptionPlans() {
  return useQuery({
    queryKey: ["reception", "plans"],
    queryFn: receptionApi.getPlans,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: receptionApi.createSale,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reception"] })
      toast.success(data.message || "Venta registrada")
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrar venta")
    },
  })
}
