import { Component, type ReactNode } from "react"
import { Background, Logo, PremiumButton } from "@/components/common"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      return (
        <Background className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <Logo size="lg" className="mx-auto mb-8" />

            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>

              <div>
                <h1 className="text-xl font-bold mb-2">Algo salió mal</h1>
                <p className="text-muted-foreground text-sm">
                  Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                </p>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <div className="bg-muted/50 rounded-md p-3 text-left">
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center pt-2">
                <PremiumButton variant="outline" onClick={this.handleHome}>
                  <Home className="mr-2 h-4 w-4" />
                  Inicio
                </PremiumButton>
                <PremiumButton onClick={this.handleReload}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recargar
                </PremiumButton>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Si el problema persiste, contacta soporte
            </p>
          </div>
        </Background>
      )
    }

    return this.props.children
  }
}
