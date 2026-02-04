import { useState } from "react"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumButton, MembershipCard } from "@/components/common"
import {
  CashRegisterStatus,
  OpenCashRegisterDialog,
  CloseCashRegisterDialog,
} from "@/components/pos"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  RefreshCw,
  AlertTriangle,
  History,
} from "lucide-react"
import {
  useAuth,
  useSearchUsers,
  useReceptionPlans,
  useCreateSale,
  useUserSubscription,
  useRenewSubscription,
  useCashRegister,
  useOpenCashRegister,
  useCloseCashRegister,
} from "@/hooks"
import { formatPrice } from "@/lib/utils"
import { Link } from "react-router-dom"

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
  const { data: cashRegisterData, isLoading: loadingCashRegister } = useCashRegister()
  const createSale = useCreateSale()
  const renewSubscription = useRenewSubscription()
  const openCashRegister = useOpenCashRegister()
  const closeCashRegister = useCloseCashRegister()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserName, setSelectedUserName] = useState<string>("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash")
  const [saleSuccess, setSaleSuccess] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showOpenCashDialog, setShowOpenCashDialog] = useState(false)
  const [showCloseCashDialog, setShowCloseCashDialog] = useState(false)

  const { data: searchResults } = useSearchUsers(searchQuery)
  const { data: subscriptionData, isLoading: loadingSubscription } = useUserSubscription(selectedUserId || "")

  const plans = plansData?.plans || []
  const isCashRegisterOpen = cashRegisterData?.isOpen ?? false

  const addToCart = (plan: { id: string; name: string; priceClp: number }) => {
    if (!isCashRegisterOpen) return

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
    setSelectedUserName("")
    setSearchQuery("")
  }

  const hasPlanInCart = cart.some((item) => item.type === "plan")
  const isRenewal = hasPlanInCart && subscriptionData?.subscription !== null

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSaleConfirm = () => {
    if (cart.length === 0 || !isCashRegisterOpen) return
    setShowConfirmDialog(true)
  }

  const handleSale = async () => {
    if (cart.length === 0) return
    setShowConfirmDialog(false)

    const planItem = cart.find((item) => item.type === "plan")
    if (planItem && selectedUserId && subscriptionData?.canRenew) {
      try {
        await renewSubscription.mutateAsync({
          userId: selectedUserId,
          planId: planItem.id,
          paymentMethod: paymentMethod === "card" ? "webpay" : paymentMethod,
        })

        setSaleSuccess(true)
        setTimeout(() => {
          setSaleSuccess(false)
          clearCart()
        }, 2000)
        return
      } catch {
        return
      }
    }

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
    } catch {
      // Error handled by mutation
    }
  }

  const handleOpenCashRegister = async (initialAmount: number) => {
    try {
      await openCashRegister.mutateAsync(initialAmount)
      setShowOpenCashDialog(false)
    } catch {
      // Error handled by mutation
    }
  }

  const handleCloseCashRegister = async (data: {
    declaredCash: number
    declaredCard: number
    declaredTransfer: number
    notes?: string
  }) => {
    try {
      await closeCashRegister.mutateAsync(data)
      setShowCloseCashDialog(false)
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <UserLayout title="POS - Recepción" userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Punto de Venta</h1>
            <p className="text-muted-foreground">
              Venta de membresías y productos
            </p>
          </div>
          <Link to="/reception/sales">
            <PremiumButton variant="outline" className="gap-2">
              <History className="h-4 w-4" />
              Historial
            </PremiumButton>
          </Link>
        </div>

        {/* Cash Register Status */}
        <CashRegisterStatus
          cashRegister={cashRegisterData?.cashRegister || null}
          isOpen={isCashRegisterOpen}
          isLoading={loadingCashRegister}
          onOpen={() => setShowOpenCashDialog(true)}
          onClose={() => setShowCloseCashDialog(true)}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Plans & Products */}
          <div className="space-y-6">
            {/* Customer Search */}
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
                    disabled={!isCashRegisterOpen}
                  />
                </div>

                {searchResults?.users && searchResults.users.length > 0 && !selectedUserId && (
                  <div className="border border-border rounded-lg divide-y divide-border max-h-32 overflow-y-auto">
                    {searchResults.users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          const fullName = `${u.profile?.firstName} ${u.profile?.lastName}`
                          setSelectedUserId(u.id)
                          setSelectedUserName(fullName)
                          setSearchQuery(fullName)
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

            {/* Customer Subscription Status */}
            {selectedUserId && (
              <DashboardCard title="Estado de Membresía" loading={loadingSubscription}>
                {subscriptionData?.subscription ? (
                  <div className="space-y-3">
                    <MembershipCard
                      subscription={{
                        id: subscriptionData.subscription.id,
                        status: subscriptionData.subscription.status,
                        startDate: subscriptionData.subscription.startDate,
                        endDate: subscriptionData.subscription.endDate,
                        plan: subscriptionData.subscription.plan,
                      }}
                      compact
                      showRenewButton={false}
                    />
                    <div className="flex items-center gap-2 text-sm">
                      {subscriptionData.isExpired ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Membresía vencida
                        </Badge>
                      ) : subscriptionData.isExpiringSoon ? (
                        <Badge variant="secondary" className="gap-1 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                          <AlertTriangle className="h-3 w-3" />
                          Vence en {subscriptionData.daysRemaining} días
                        </Badge>
                      ) : (
                        <Badge variant="default" className="gap-1 bg-green-500/20 text-green-500 border-green-500/30">
                          <Check className="h-3 w-3" />
                          {subscriptionData.daysRemaining} días restantes
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Sin membresía activa</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Selecciona un plan para activar
                    </p>
                  </div>
                )}
              </DashboardCard>
            )}

            {/* Plans */}
            <DashboardCard title="Membresías" loading={loadingPlans}>
              <div className="grid grid-cols-1 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => addToCart(plan)}
                    disabled={!isCashRegisterOpen}
                    className={`flex items-center justify-between p-3 border border-border rounded-lg text-left transition-all ${
                      isCashRegisterOpen
                        ? "hover:border-primary hover:bg-primary/5"
                        : "opacity-50 cursor-not-allowed"
                    }`}
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
                    {isCashRegisterOpen
                      ? "Selecciona productos o membresías"
                      : "Abre la caja para comenzar"}
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

                  {/* Renewal indicator */}
                  {hasPlanInCart && selectedUserId && (
                    <div className={`p-3 rounded-lg border ${isRenewal ? "bg-yellow-500/10 border-yellow-500/30" : "bg-green-500/10 border-green-500/30"}`}>
                      <div className="flex items-center gap-2 text-sm">
                        {isRenewal ? (
                          <>
                            <RefreshCw className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-500 font-medium">Renovación de membresía</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 text-green-500" />
                            <span className="text-green-500 font-medium">Nueva membresía</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

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
                      onClick={handleSaleConfirm}
                      loading={createSale.isPending || renewSubscription.isPending}
                      className="flex-1"
                      disabled={saleSuccess || !isCashRegisterOpen}
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

                  {(createSale.isError || renewSubscription.isError) && (
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {isRenewal ? (
                <>
                  <RefreshCw className="h-5 w-5 text-yellow-500" />
                  Confirmar Renovación
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Confirmar Venta
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                {selectedUserId && selectedUserName && (
                  <p className="text-foreground">
                    Cliente: <span className="font-medium">{selectedUserName}</span>
                  </p>
                )}
                <p className="text-foreground mt-2">
                  Total: <span className="font-bold text-primary">{formatPrice(total)}</span>
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Método de pago: {paymentMethod === "cash" ? "Efectivo" : paymentMethod === "card" ? "Tarjeta" : "Transferencia"}
                </p>
              </div>
              {isRenewal && hasPlanInCart && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-2">
                  <p className="text-yellow-500 text-sm">
                    Se renovará la membresía existente del cliente
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSale}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRenewal ? "Renovar" : "Cobrar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Open Cash Register Dialog */}
      <OpenCashRegisterDialog
        open={showOpenCashDialog}
        onOpenChange={setShowOpenCashDialog}
        onConfirm={handleOpenCashRegister}
        isLoading={openCashRegister.isPending}
      />

      {/* Close Cash Register Dialog */}
      <CloseCashRegisterDialog
        open={showCloseCashDialog}
        onOpenChange={setShowCloseCashDialog}
        onConfirm={handleCloseCashRegister}
        isLoading={closeCashRegister.isPending}
        cashRegister={cashRegisterData?.cashRegister || null}
      />
    </UserLayout>
  )
}
