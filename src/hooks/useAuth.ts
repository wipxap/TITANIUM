import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { authApi, getAuthToken } from "@/lib/api"
import type { LoginData, RegisterData } from "@/lib/api"

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: !!getAuthToken(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] })
      toast.success("¡Bienvenido a Titanium!")
      navigate("/my")
    },
    onError: (error) => {
      toast.error(error.message || "Error al iniciar sesión")
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] })
      toast.success("¡Cuenta creada exitosamente!")
      navigate("/my")
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear cuenta")
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear()
      toast.success("Sesión cerrada")
      navigate("/login")
    },
  })

  return {
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
    logoutLoading: logoutMutation.isPending,
  }
}
