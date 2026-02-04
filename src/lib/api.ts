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
    paymentMethod: "cash" | "webpay" | "transfer"
    notes?: string
  }) =>
    apiFetch<{ sale: any; total: number; message: string }>("/reception/sale", {
      method: "POST",
      body: JSON.stringify(data),
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
    notes?: string
  }) =>
    apiFetch<{ progress: ProgressLog }>("/user/progress", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProgress: () => apiFetch<{ progress: ProgressLog[] }>("/user/progress"),
}
