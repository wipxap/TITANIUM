const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787"

// Auth token storage
let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem("titanium_token", token)
  } else {
    localStorage.removeItem("titanium_token")
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken
  authToken = localStorage.getItem("titanium_token")
  return authToken
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Error de conexión" }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// ============ AUTH API ============

export interface LoginData {
  rut: string
  password: string
}

export interface RegisterData {
  rut: string
  password: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    rut: string
    email: string | null
    role: "admin" | "reception" | "instructor" | "user"
  }
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
    setAuthToken(response.token)
    return response
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
    setAuthToken(response.token)
    return response
  },

  logout: async () => {
    await apiFetch("/auth/logout", { method: "POST" })
    setAuthToken(null)
  },

  me: async () => {
    return apiFetch<{ user: AuthResponse["user"]; profile: any }>("/auth/me")
  },
}

// ============ PUBLIC API ============

export interface Plan {
  id: string
  name: string
  description: string | null
  priceClp: number
  durationDays: number
  features: string[] | null
  sortOrder: number
  // Restricciones horarias
  allowedTimeStart: string | null
  allowedTimeEnd: string | null
  // Pases diarios
  isDailyPass: boolean
  // Sesiones limitadas
  totalSessions: number | null
  sessionsPerPeriod: number | null
  // Límite de compras
  maxPurchasesPerUser: number | null
  // Planes familiares
  isFamilyPlan: boolean
  maxBeneficiaries: number | null
}

export interface Machine {
  id: string
  name: string
  muscleGroup: string
  description: string | null
  instructions: string | null
  videoUrl: string | null
  imageUrl: string | null
  quantity: number
}

export interface Space {
  id: string
  name: string
  subtitle: string | null
  description: string | null
  floorNumber: number
  imageUrl: string | null
  features: string[] | null
  sortOrder: number
  isActive: boolean
}

export interface LandingStats {
  totalMachines: number
  activeMembers: number
  totalPlans: number
  hoursOpen: number
  location: string
}

export const publicApi = {
  getStats: () => apiFetch<{ stats: LandingStats }>("/public/stats"),
  getPlans: () => apiFetch<{ plans: Plan[] }>("/public/plans"),
  getPlan: (id: string) => apiFetch<{ plan: Plan }>(`/public/plans/${id}`),
  getMachines: () => apiFetch<{ machines: Machine[] }>("/public/machines"),
  getMachine: (id: string) => apiFetch<{ machine: Machine }>(`/public/machines/${id}`),
  getMachinesByGroup: (group: string) =>
    apiFetch<{ machines: Machine[] }>(`/public/machines/group/${group}`),
  getSpaces: () => apiFetch<{ spaces: Space[] }>("/public/spaces"),
}

// ============ USER API ============

export interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone: string | null
  birthDate: string | null
  gender: "male" | "female" | "other" | null
  weightKg: number | null
  heightCm: number | null
  goals: string | null
  healthData: {
    conditions?: string[]
    injuries?: string[]
    medications?: string[]
  } | null
}

export interface Subscription {
  id: string
  status: "active" | "expired" | "cancelled" | "pending"
  startDate: string
  endDate: string
  plan: {
    id: string
    name: string
    features: string[] | null
  }
}

export interface Checkin {
  id: string
  profileId: string
  checkedInAt: string
  checkedOutAt: string | null
  method: string
}

export interface Routine {
  id: string
  name: string
  description: string | null
  routineJson: {
    days: Array<{
      dayName: string
      focus: string
      exercises: Array<{
        machineId?: string
        name: string
        sets: number
        reps: string
        weight?: string
        rest?: string
        notes?: string
      }>
    }>
  } | null
  isActive: boolean
}

export interface ProgressLog {
  id: string
  exerciseName: string
  sets: number
  reps: number
  weightKg: string | null
  durationSeconds: number | null
  speed: string | null
  incline: string | null
  notes: string | null
  completedAt: string
}

// ============ ADMIN API ============

export interface AdminUser {
  id: string
  rut: string
  email: string | null
  role: "admin" | "reception" | "instructor" | "user"
  createdAt: string
  profile: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
  } | null
}

// ============ CASH REGISTER TYPES ============

export interface CashRegister {
  id: string
  openedBy: string
  closedBy: string | null
  openedAt: string
  closedAt: string | null
  initialAmount: number
  finalAmount: number | null
  expectedCash: number | null
  expectedCard: number | null
  expectedTransfer: number | null
  declaredCash: number | null
  declaredCard: number | null
  declaredTransfer: number | null
  cashDifference: number | null
  cardDifference: number | null
  transferDifference: number | null
  notes: string | null
}

export interface CashRegisterWithDetails extends CashRegister {
  openedByUser: {
    id: string
    rut: string
    name: string
  } | null
  closedByUser?: {
    id: string
    rut: string
    name: string
  } | null
  currentTotals?: {
    cash: number
    card: number
    webpay: number
    transfer: number
  }
  salesCount: number
  totalDifference?: number
  isOpen?: boolean
}

export interface CloseCashRegisterData {
  declaredCash: number
  declaredCard: number
  declaredTransfer: number
  notes?: string
}

export interface CashRegisterSummary {
  salesCount: number
  expected: {
    cash: number
    card: number
    transfer: number
    total: number
  }
  declared: {
    cash: number
    card: number
    transfer: number
    total: number
  }
  differences: {
    cash: number
    card: number
    transfer: number
    total: number
  }
}

// ============ POS SALE TYPES ============

export type PosSaleStatus = "completed" | "void_pending" | "voided"

export interface PosSale {
  id: string
  receiptNumber: string | null
  totalClp: number
  paymentMethod: string
  status: PosSaleStatus
  items: Array<{
    productId?: string
    planId?: string
    quantity: number
    unitPrice: number
  }> | null
  notes: string | null
  createdAt: string
  profile: {
    id: string
    firstName: string
    lastName: string
  } | null
  soldBy: {
    id: string
    rut: string
  } | null
}

// ============ VOID REQUEST TYPES ============

export type VoidRequestStatus = "pending" | "approved" | "rejected"

export interface VoidRequest {
  id: string
  reason: string
  status: VoidRequestStatus
  adminNotes: string | null
  createdAt: string
  reviewedAt: string | null
  sale: {
    id: string
    receiptNumber: string | null
    totalClp: number
    paymentMethod: string
    items: PosSale["items"]
    createdAt: string
  }
  requestedBy: {
    id: string
    rut: string
    name: string
  }
}

export const adminApi = {
  getUsers: (params?: { search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    const query = searchParams.toString()
    return apiFetch<{
      users: AdminUser[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
    }>(`/admin/users${query ? `?${query}` : ""}`)
  },

  getUser: (id: string) =>
    apiFetch<{
      user: AdminUser
      profile: Profile | null
      subscription: Subscription | null
      recentCheckins: Checkin[]
    }>(`/admin/users/${id}`),

  updateUserRole: (id: string, role: "admin" | "reception" | "instructor" | "user") =>
    apiFetch<{ user: AdminUser }>(`/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  getMachines: () => apiFetch<{ machines: Machine[] }>("/admin/machines"),

  createMachine: (data: Partial<Machine>) =>
    apiFetch<{ machine: Machine }>("/admin/machines", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMachine: (id: string, data: Partial<Machine>) =>
    apiFetch<{ machine: Machine }>(`/admin/machines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteMachine: (id: string) =>
    apiFetch<{ success: boolean }>(`/admin/machines/${id}`, { method: "DELETE" }),

  getPlans: () => apiFetch<{ plans: Plan[] }>("/admin/plans"),

  createPlan: (data: Partial<Plan>) =>
    apiFetch<{ plan: Plan }>("/admin/plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updatePlan: (id: string, data: Partial<Plan>) =>
    apiFetch<{ plan: Plan }>(`/admin/plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deletePlan: (id: string) =>
    apiFetch<{ success: boolean }>(`/admin/plans/${id}`, { method: "DELETE" }),

  // Spaces
  getSpaces: () => apiFetch<{ spaces: Space[] }>("/admin/spaces"),

  createSpace: (data: Partial<Space>) =>
    apiFetch<{ space: Space }>("/admin/spaces", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateSpace: (id: string, data: Partial<Space>) =>
    apiFetch<{ space: Space }>(`/admin/spaces/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteSpace: (id: string) =>
    apiFetch<{ success: boolean }>(`/admin/spaces/${id}`, { method: "DELETE" }),

  // Void Requests
  getVoidRequests: (status?: VoidRequestStatus | "all") =>
    apiFetch<{ voidRequests: VoidRequest[] }>(`/admin/void-requests${status ? `?status=${status}` : ""}`),

  approveVoidRequest: (id: string, adminNotes?: string) =>
    apiFetch<{ voidRequest: any; message: string }>(`/admin/void-requests/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ adminNotes }),
    }),

  rejectVoidRequest: (id: string, adminNotes: string) =>
    apiFetch<{ voidRequest: any; message: string }>(`/admin/void-requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ adminNotes }),
    }),

  // Cash Registers
  getCashRegisters: (params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    onlyWithDifferences?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.startDate) searchParams.set("startDate", params.startDate)
    if (params?.endDate) searchParams.set("endDate", params.endDate)
    if (params?.onlyWithDifferences) searchParams.set("onlyWithDifferences", "true")
    const query = searchParams.toString()
    return apiFetch<{
      cashRegisters: CashRegisterWithDetails[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
    }>(`/admin/cash-registers${query ? `?${query}` : ""}`)
  },
}

// ============ RECEPTION API ============

export interface SearchUser {
  id: string
  rut: string
  profile: {
    id: string
    firstName: string
    lastName: string
  } | null
}

export interface TodayCheckin {
  id: string
  checkedInAt: string
  checkedOutAt: string | null
  method: string
  profile: {
    id: string
    firstName: string
    lastName: string
  }
  user: {
    rut: string
  }
}

export interface UserSubscriptionDetails {
  subscription: (Subscription & {
    paidAmount: number | null
    paymentMethod: string | null
    plan: Plan
  }) | null
  daysRemaining: number
  isExpiringSoon: boolean
  isExpired: boolean
  canRenew: boolean
}

export interface RenewSubscriptionData {
  userId: string
  planId: string
  paymentMethod: "cash" | "webpay" | "transfer"
  notes?: string
}

export interface RenewSubscriptionResponse {
  subscription: Subscription
  sale: any
  isRenewal: boolean
  message: string
}

export const receptionApi = {
  searchUsers: (query: string) =>
    apiFetch<{ users: SearchUser[] }>(`/reception/search?q=${encodeURIComponent(query)}`),

  getUserForCheckin: (id: string) =>
    apiFetch<{
      user: { id: string; rut: string }
      profile: Profile | null
      subscription: Subscription | null
      activeCheckin: Checkin | null
      canCheckin: boolean
    }>(`/reception/user/${id}`),

  getUserSubscription: (userId: string) =>
    apiFetch<UserSubscriptionDetails>(`/reception/user/${userId}/subscription`),

  renewSubscription: (data: RenewSubscriptionData) =>
    apiFetch<RenewSubscriptionResponse>("/reception/renew", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  checkin: (userId: string) =>
    apiFetch<{ checkin: Checkin; message: string }>("/reception/checkin", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  checkout: (userId: string) =>
    apiFetch<{ checkin: Checkin; message: string }>("/reception/checkout", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  getTodayCheckins: () =>
    apiFetch<{
      checkins: TodayCheckin[]
      stats: { active: number; total: number }
    }>("/reception/today"),

  getProducts: () => apiFetch<{ products: any[] }>("/reception/products"),

  getPlans: () => apiFetch<{ plans: Plan[] }>("/reception/plans"),

  createSale: (data: {
    userId?: string
    items: Array<{ type: "product" | "plan"; id: string; quantity: number }>
    paymentMethod: "cash" | "card" | "transfer"
    notes?: string
  }) =>
    apiFetch<{ sale: any; receiptNumber: string; total: number; message: string }>("/reception/sale", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Cash Register
  getCashRegister: () =>
    apiFetch<{
      cashRegister: CashRegisterWithDetails | null
      isOpen: boolean
    }>("/reception/cash-register/current"),

  openCashRegister: (initialAmount: number) =>
    apiFetch<{ cashRegister: CashRegister; message: string }>("/reception/cash-register/open", {
      method: "POST",
      body: JSON.stringify({ initialAmount }),
    }),

  closeCashRegister: (data: CloseCashRegisterData) =>
    apiFetch<{
      cashRegister: CashRegister
      summary: CashRegisterSummary
      message: string
    }>("/reception/cash-register/close", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Sales History
  getSalesHistory: (params?: {
    page?: number
    limit?: number
    status?: PosSaleStatus
    paymentMethod?: string
    startDate?: string
    endDate?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.status) searchParams.set("status", params.status)
    if (params?.paymentMethod) searchParams.set("paymentMethod", params.paymentMethod)
    if (params?.startDate) searchParams.set("startDate", params.startDate)
    if (params?.endDate) searchParams.set("endDate", params.endDate)
    const query = searchParams.toString()
    return apiFetch<{
      sales: PosSale[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
    }>(`/reception/sales${query ? `?${query}` : ""}`)
  },

  getSaleDetails: (id: string) =>
    apiFetch<{
      sale: PosSale & { transactionId: string | null }
      voidRequest: {
        id: string
        reason: string
        status: VoidRequestStatus
        adminNotes: string | null
        createdAt: string
        reviewedAt: string | null
      } | null
    }>(`/reception/sales/${id}`),

  requestVoid: (saleId: string, reason: string) =>
    apiFetch<{ voidRequest: any; message: string }>(`/reception/sales/${saleId}/void-request`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
}

// ============ ROUTINES API ============

export interface GenerateRoutineInput {
  goals: string
  experienceLevel: "beginner" | "intermediate" | "advanced"
  daysPerWeek: number
  sessionDuration: number
  focusAreas?: string[]
}

// ============ LOYALTY API ============

export interface LoyaltyLevel {
  id: string
  name: string
  minDays: number
  discountPercent: number
  color: string | null
  benefits: string[] | null
}

export interface MyLoyaltyLevel {
  accumulatedDays: number
  currentLevel: LoyaltyLevel | null
  nextLevel: LoyaltyLevel | null
  progressToNext: {
    daysNeeded: number
    percentComplete: number
  } | null
  allLevels: LoyaltyLevel[]
}

export const loyaltyApi = {
  getLevels: () => apiFetch<{ levels: LoyaltyLevel[] }>("/loyalty/levels"),

  getMyLevel: () => apiFetch<MyLoyaltyLevel>("/loyalty/my-level"),

  // Admin
  createLevel: (data: Omit<LoyaltyLevel, "id">) =>
    apiFetch<{ level: LoyaltyLevel; message: string }>("/loyalty/admin/levels", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateLevel: (id: string, data: Partial<LoyaltyLevel>) =>
    apiFetch<{ level: LoyaltyLevel; message: string }>(`/loyalty/admin/levels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteLevel: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/loyalty/admin/levels/${id}`, {
      method: "DELETE",
    }),
}

// ============ CONTRACTS API ============

export interface Contract {
  id: string
  name: string
  content: string
  version: string
  isActive: boolean
  requiresSignature: boolean
}

export interface SignedContract {
  id: string
  signedAt: string
  contract: {
    id: string
    name: string
    version: string
  }
}

export interface ContractCheckResult {
  hasSigned: boolean
  requiresSignature: boolean
  contract: Contract | null
}

export const contractsApi = {
  getActive: () => apiFetch<{ contract: Contract | null }>("/contracts/active"),

  getMySigned: () =>
    apiFetch<{ signedContracts: SignedContract[] }>("/contracts/my-signed"),

  checkSigned: () => apiFetch<ContractCheckResult>("/contracts/check-signed"),

  sign: (data: { contractId: string; signatureData: string; subscriptionId?: string }) =>
    apiFetch<{ signedContract: any; message: string }>("/contracts/sign", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin
  getAll: () => apiFetch<{ contracts: Contract[] }>("/contracts/admin"),

  create: (data: { name: string; content: string; version?: string; requiresSignature?: boolean }) =>
    apiFetch<{ contract: Contract; message: string }>("/contracts/admin", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Contract>) =>
    apiFetch<{ contract: Contract; message: string }>(`/contracts/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  activate: (id: string) =>
    apiFetch<{ contract: Contract; message: string }>(`/contracts/admin/${id}/activate`, {
      method: "PUT",
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/contracts/admin/${id}`, {
      method: "DELETE",
    }),

  getSignatures: (contractId: string) =>
    apiFetch<{ signatures: Array<{ id: string; signedAt: string; ipAddress: string | null; profile: { id: string; firstName: string; lastName: string } }> }>(
      `/contracts/admin/signatures/${contractId}`
    ),
}

// ============ FAMILY API ============

export interface FamilyCode {
  id: string
  code: string
  isUsed: boolean
  usedAt: string | null
  expiresAt: string | null
  beneficiaryProfile: {
    id: string
    firstName: string
    lastName: string
  } | null
}

export interface MyFamilyCodes {
  codes: FamilyCode[]
  maxBeneficiaries: number
  usedCount: number
  availableCount: number
}

export const familyApi = {
  getMyCodes: () => apiFetch<MyFamilyCodes>("/family/my-codes"),

  generateCode: () =>
    apiFetch<{ code: FamilyCode; message: string }>("/family/generate-code", {
      method: "POST",
    }),

  redeemCode: (code: string) =>
    apiFetch<{ subscription: Subscription; message: string }>("/family/redeem", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  lookupCode: (code: string) =>
    apiFetch<{
      code: FamilyCode
      plan: Plan
      owner: { firstName: string; lastName: string }
      isValid: boolean
    }>(`/family/lookup/${code}`),
}

// ============ ROUTINES API ============

export const routinesApi = {
  generate: (data: GenerateRoutineInput) =>
    apiFetch<{ routine: Routine; message: string }>("/routines/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  activate: (id: string) =>
    apiFetch<{ routine: Routine }>(`/routines/${id}/activate`, { method: "PUT" }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/routines/${id}`, { method: "DELETE" }),
}

// ============ USER API ============

// ============ REPORTS API ============

export interface ReportKPIs {
  activeSubs: number
  todayCheckins: number
  todaySales: number
  monthlyRevenue: number
  prevMonthRevenue: number
  revenueGrowth: number | null
}

export interface RevenueByPeriod {
  total: number
  byPaymentMethod: {
    cash: number
    webpay: number
    transfer: number
  }
  transactionCount: number
  period: string
  startDate: string
  endDate: string
}

export interface ReportTransaction {
  id: string
  totalClp: number
  paymentMethod: string
  items: Array<{
    productId?: string
    planId?: string
    quantity: number
    unitPrice: number
  }> | null
  notes: string | null
  createdAt: string
  profile: {
    id: string
    firstName: string
    lastName: string
  } | null
  soldBy: {
    id: string
    rut: string
  } | null
}

export interface DailyRevenue {
  date: string
  day: number
  total: number
}

export interface MemberByPlan {
  subscriptionId: string
  status: string
  startDate: string
  endDate: string
  profile: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
  }
  user: {
    rut: string
  }
}

export interface PlanWithMembers {
  planId: string
  planName: string
  priceClp: number
  activeCount: number
  totalRevenue: number
  members: MemberByPlan[]
}

export interface RecentCheckin {
  id: string
  checkedInAt: string
  checkedOutAt: string | null
  method: string
  profile: {
    id: string
    firstName: string
    lastName: string
  }
  user: {
    rut: string
  }
}

export interface ExportData {
  fecha: string
  id: string
  cliente: string
  monto: number
  metodoPago: string
  items: string
  vendedor: string
  notas: string
}

export const reportsApi = {
  getKPIs: () => apiFetch<ReportKPIs>("/reports/kpis"),

  getRevenue: (params?: { period?: "today" | "3d" | "7d" | "month"; month?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set("period", params.period)
    if (params?.month) searchParams.set("month", params.month)
    const query = searchParams.toString()
    return apiFetch<RevenueByPeriod>(`/reports/revenue${query ? `?${query}` : ""}`)
  },

  getTransactions: (params?: {
    from?: string
    to?: string
    type?: "all" | "plan" | "product"
    paymentMethod?: "cash" | "webpay" | "transfer" | "all"
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set("from", params.from)
    if (params?.to) searchParams.set("to", params.to)
    if (params?.type) searchParams.set("type", params.type)
    if (params?.paymentMethod) searchParams.set("paymentMethod", params.paymentMethod)
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    const query = searchParams.toString()
    return apiFetch<{ transactions: ReportTransaction[]; count: number }>(
      `/reports/transactions${query ? `?${query}` : ""}`
    )
  },

  getRevenueChart: (month?: string) => {
    const query = month ? `?month=${month}` : ""
    return apiFetch<{ dailyRevenue: DailyRevenue[]; month: string; totalDays: number }>(
      `/reports/revenue-chart${query}`
    )
  },

  getMembersByPlan: () => apiFetch<{ plans: PlanWithMembers[] }>("/reports/members-by-plan"),

  getRecentCheckins: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : ""
    return apiFetch<{ checkins: RecentCheckin[] }>(`/reports/recent-checkins${query}`)
  },

  exportSales: (from: string, to: string) =>
    apiFetch<{ data: ExportData[]; filename: string; count: number; period: { from: string; to: string } }>(
      `/reports/export?from=${from}&to=${to}`
    ),
}

export const userApi = {
  getProfile: () => apiFetch<{ profile: Profile }>("/user/profile"),

  updateProfile: (data: Partial<Profile>) =>
    apiFetch<{ profile: Profile }>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getSubscription: () =>
    apiFetch<{ subscription: Subscription | null }>("/user/subscription"),

  getCheckins: () => apiFetch<{ checkins: Checkin[] }>("/user/checkins"),

  checkin: () =>
    apiFetch<{ checkin: Checkin }>("/user/checkin", { method: "POST" }),

  getRoutines: () => apiFetch<{ routines: Routine[] }>("/user/routines"),

  getRoutine: (id: string) => apiFetch<{ routine: Routine }>(`/user/routines/${id}`),

  logProgress: (data: {
    routineId?: string
    exerciseName: string
    sets: number
    reps: number
    weightKg?: number
    durationSeconds?: number
    speed?: number
    incline?: number
    notes?: string
  }) =>
    apiFetch<{ progress: ProgressLog }>("/user/progress", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProgress: () => apiFetch<{ progress: ProgressLog[] }>("/user/progress"),
}
