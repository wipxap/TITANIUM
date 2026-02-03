import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { receptionApi } from "@/lib/api"

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

export function useCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => receptionApi.checkin(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reception", "today"] })
      queryClient.invalidateQueries({ queryKey: ["reception", "user"] })
    },
  })
}

export function useCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => receptionApi.checkout(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reception", "today"] })
      queryClient.invalidateQueries({ queryKey: ["reception", "user"] })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reception"] })
    },
  })
}
