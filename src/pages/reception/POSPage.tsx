import { useState } from "react"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumButton } from "@/components/common"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ShoppingCart,
  CreditCard,
  Banknote,
  Building2,
  Plus,
  Minus,
  Trash2,
  Check,
} from "lucide-react"
import {
  useAuth,
  useSearchUsers,
  useReceptionPlans,
  useCreateSale,
} from "@/hooks"

interface CartItem {
  id: string
  type: "plan" | "product"
  name: string
  price: number
  quantity: number
}

export function POSPage() {
  const { user } = useAuth()
  const { data: plansData, isLoading: loadingPlans } = useReceptionPlans()
  const createSale = useCreateSale()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash")
  const [saleSuccess, setSaleSuccess] = useState(false)

  const { data: searchResults } = useSearchUsers(searchQuery)

  const plans = plansData?.plans || []

  const addToCart = (plan: { id: string; name: string; priceClp: number }) => {
    const existing = cart.find((item) => item.id === plan.id)
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === plan.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          id: plan.id,
          type: "plan",
          name: plan.name,
          price: plan.priceClp,
          quantity: 1,
        },
      ])
    }
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setSelectedUserId(null)
    setSearchQuery("")
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSale = async () => {
    if (cart.length === 0) return

    try {
      await createSale.mutateAsync({
        userId: selectedUserId || undefined,
        items: cart.map((item) => ({
          type: item.type,
          id: item.id,
          quantity: item.quantity,
        })),
        paymentMethod,
      })

      setSaleSuccess(true)
      setTimeout(() => {
        setSaleSuccess(false)
        clearCart()
      }, 2000)
    } catch (error) {
      console.error("Error creating sale:", error)
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(price)

  return (
    <UserLayout title="POS - Recepción" userRole={user?.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Punto de Venta</h1>
          <p className="text-muted-foreground">
            Venta de membresías y productos
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Plans & Products */}
          <div className="space-y-6">
            {/* Customer Search (Optional) */}
            <DashboardCard title="Cliente (Opcional)">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente por RUT..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSelectedUserId(null)
                    }}
                    className="pl-10 bg-background"
                  />
                </div>

                {searchResults?.users && searchResults.users.length > 0 && !selectedUserId && (
                  <div className="border border-border rounded-lg divide-y divide-border max-h-32 overflow-y-auto">
                    {searchResults.users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUserId(u.id)
                          setSearchQuery(`${u.profile?.firstName} ${u.profile?.lastName}`)
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors text-sm"
                      >
                        {u.profile?.firstName} {u.profile?.lastName} - {u.rut}
                      </button>
                    ))}
                  </div>
                )}

                {selectedUserId && (
                  <Badge variant="secondary" className="gap-1">
                    <Check className="h-3 w-3" />
                    Cliente seleccionado
                  </Badge>
                )}
              </div>
            </DashboardCard>

            {/* Plans */}
            <DashboardCard title="Membresías" loading={loadingPlans}>
              <div className="grid grid-cols-1 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => addToCart(plan)}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {plan.durationDays} días
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatPrice(plan.priceClp)}
                      </p>
                      <Plus className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* Right: Cart */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <DashboardCard
              title={
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito
                  {cart.length > 0 && (
                    <Badge variant="secondary">{cart.length}</Badge>
                  )}
                </div>
              }
            >
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Carrito vacío</p>
                  <p className="text-sm text-muted-foreground">
                    Selecciona productos o membresías
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 hover:bg-destructive/20 rounded text-destructive ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Método de Pago</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod("cash")}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === "cash"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Banknote className="h-5 w-5" />
                        <span className="text-xs">Efectivo</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="text-xs">Tarjeta</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("transfer")}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === "transfer"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Building2 className="h-5 w-5" />
                        <span className="text-xs">Transfer</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <PremiumButton
                      variant="outline"
                      onClick={clearCart}
                      className="flex-1"
                    >
                      Cancelar
                    </PremiumButton>
                    <PremiumButton
                      onClick={handleSale}
                      loading={createSale.isPending}
                      className="flex-1"
                      disabled={saleSuccess}
                    >
                      {saleSuccess ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          ¡Vendido!
                        </>
                      ) : (
                        "Cobrar"
                      )}
                    </PremiumButton>
                  </div>

                  {createSale.isError && (
                    <p className="text-destructive text-sm text-center">
                      Error al procesar la venta
                    </p>
                  )}
                </div>
              )}
            </DashboardCard>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
