import { useQuery } from "@tanstack/react-query"
import { publicApi } from "@/lib/api"

export function useLandingStats() {
  return useQuery({
    queryKey: ["public", "stats"],
    queryFn: publicApi.getStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function usePlans() {
  return useQuery({
    queryKey: ["public", "plans"],
    queryFn: publicApi.getPlans,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: ["public", "plans", id],
    queryFn: () => publicApi.getPlan(id),
    enabled: !!id,
  })
}

export function useMachines() {
  return useQuery({
    queryKey: ["public", "machines"],
    queryFn: publicApi.getMachines,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useMachine(id: string) {
  return useQuery({
    queryKey: ["public", "machines", id],
    queryFn: () => publicApi.getMachine(id),
    enabled: !!id,
  })
}

export function useMachinesByGroup(group: string) {
  return useQuery({
    queryKey: ["public", "machines", "group", group],
    queryFn: () => publicApi.getMachinesByGroup(group),
    enabled: !!group,
  })
}
