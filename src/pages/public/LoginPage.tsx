import { LandingLayout } from "@/components/layout"
import { DashboardCard, FormInput, PremiumButton, Logo } from "@/components/common"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks"
import { loginSchema } from "@/lib/validations"

export function LoginPage() {
  const { login, loginLoading, loginError } = useAuth()
  const [rut, setRut] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatRut = (value: string) => {
    let cleaned = value.replace(/[^0-9kK]/g, "").toUpperCase()
    if (cleaned.length > 9) cleaned = cleaned.slice(0, 9)

    if (cleaned.length > 1) {
      const dv = cleaned.slice(-1)
      const body = cleaned.slice(0, -1)
      const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      return `${formatted}-${dv}`
    }
    return cleaned
  }

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRut(formatRut(e.target.value))
    if (errors.rut) setErrors((prev) => ({ ...prev, rut: "" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = loginSchema.safeParse({ rut, password })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    login({ rut, password })
  }

  return (
    <LandingLayout title="Ingresar - Titanium Gym">
      <section className="py-16 min-h-[calc(100vh-200px)] flex items-center">
        <div className="container px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Logo size="lg" className="mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-2">Bienvenido</h1>
              <p className="text-muted-foreground">
                Ingresa con tu RUT y contraseña
              </p>
            </div>

            <DashboardCard title="">
              <form onSubmit={handleSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-destructive/20 border border-destructive rounded-md text-destructive text-sm">
                    {loginError.message}
                  </div>
                )}
                <div>
                  <FormInput
                    label="RUT"
                    placeholder="12.345.678-9"
                    value={rut}
                    onChange={handleRutChange}
                    autoComplete="username"
                  />
                  {errors.rut && (
                    <p className="text-destructive text-sm mt-1">{errors.rut}</p>
                  )}
                </div>
                <div>
                  <FormInput
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                    }}
                    autoComplete="current-password"
                  />
                  {errors.password && (
                    <p className="text-destructive text-sm mt-1">{errors.password}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <a href="#" className="text-sm text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <PremiumButton
                  type="submit"
                  loading={loginLoading}
                  className="w-full"
                >
                  Ingresar
                </PremiumButton>
              </form>
            </DashboardCard>

            <p className="text-center text-muted-foreground mt-6">
              ¿No tienes cuenta?{" "}
              <Link to="/planes" className="text-primary hover:underline">
                Ver planes
              </Link>
            </p>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}
