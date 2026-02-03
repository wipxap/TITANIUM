import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "reception", "instructor", "user"])
export const genderEnum = pgEnum("gender", ["male", "female", "other"])
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "cancelled",
  "pending",
])
export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "webpay",
  "transfer",
])
export const muscleGroupEnum = pgEnum("muscle_group", [
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
  "cardio",
  "full_body",
])

// ============ AUTH TABLES (Lucia compatible) ============

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  rut: varchar("rut", { length: 12 }).notNull().unique(), // 12.345.678-9
  email: varchar("email", { length: 255 }),
  hashedPassword: text("hashed_password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
})

// ============ PROFILES ============

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  birthDate: timestamp("birth_date"),
  gender: genderEnum("gender"),
  weightKg: integer("weight_kg"),
  heightCm: integer("height_cm"),
  goals: text("goals"),
  healthData: jsonb("health_data").$type<{
    conditions?: string[]
    injuries?: string[]
    medications?: string[]
  }>(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ============ PLANS & SUBSCRIPTIONS ============

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  priceClp: integer("price_clp").notNull(), // Precio en CLP
  durationDays: integer("duration_days").notNull(), // 30, 90, 365
  features: jsonb("features").$type<string[]>(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id),
  status: subscriptionStatusEnum("status").notNull().default("pending"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  paidAmount: integer("paid_amount"),
  paymentMethod: paymentMethodEnum("payment_method"),
  transactionId: varchar("transaction_id", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ============ MACHINES ============

export const machines = pgTable("machines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  muscleGroup: muscleGroupEnum("muscle_group").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  quantity: integer("quantity").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ============ PRODUCTS (POS) ============

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  priceClp: integer("price_clp").notNull(),
  stock: integer("stock").notNull().default(0),
  category: varchar("category", { length: 50 }),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ============ CASH REGISTERS ============

export const cashRegisters = pgTable("cash_registers", {
  id: uuid("id").primaryKey().defaultRandom(),
  openedBy: uuid("opened_by")
    .notNull()
    .references(() => users.id),
  closedBy: uuid("closed_by").references(() => users.id),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
  initialAmount: integer("initial_amount").notNull().default(0),
  finalAmount: integer("final_amount"),
  notes: text("notes"),
})

// ============ POS SALES ============

export const posSales = pgTable("pos_sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  cashRegisterId: uuid("cash_register_id").references(() => cashRegisters.id),
  profileId: uuid("profile_id").references(() => profiles.id), // Nullable for walk-ins
  soldById: uuid("sold_by_id")
    .notNull()
    .references(() => users.id),
  totalClp: integer("total_clp").notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // cash, card, transfer
  transactionId: varchar("transaction_id", { length: 100 }),
  items: jsonb("items").$type<
    Array<{
      productId?: string
      planId?: string
      quantity: number
      unitPrice: number
    }>
  >(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ============ CHECK-INS ============

export const checkins = pgTable("checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  checkedInAt: timestamp("checked_in_at").notNull().defaultNow(),
  checkedOutAt: timestamp("checked_out_at"),
  method: varchar("method", { length: 20 }).notNull().default("qr"), // qr, manual
  checkedInBy: uuid("checked_in_by").references(() => users.id), // Reception user who did check-in
})

// ============ USER ROUTINES (AI Generated) ============

export const userRoutines = pgTable("user_routines", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  routineJson: jsonb("routine_json").$type<{
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
  }>(),
  generatedBy: varchar("generated_by", { length: 20 }).default("gemini"), // gemini, manual
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ============ PROGRESS LOGS ============

export const progressLogs = pgTable("progress_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  routineId: uuid("routine_id").references(() => userRoutines.id),
  exerciseName: varchar("exercise_name", { length: 100 }).notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weightKg: decimal("weight_kg", { precision: 5, scale: 2 }),
  notes: text("notes"),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
})

// ============ RELATIONS ============

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  sessions: many(sessions),
}))

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  subscriptions: many(subscriptions),
  checkins: many(checkins),
  routines: many(userRoutines),
  progressLogs: many(progressLogs),
}))

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  profile: one(profiles, {
    fields: [subscriptions.profileId],
    references: [profiles.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}))

export const userRoutinesRelations = relations(userRoutines, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [userRoutines.profileId],
    references: [profiles.id],
  }),
  progressLogs: many(progressLogs),
}))

export const progressLogsRelations = relations(progressLogs, ({ one }) => ({
  profile: one(profiles, {
    fields: [progressLogs.profileId],
    references: [profiles.id],
  }),
  routine: one(userRoutines, {
    fields: [progressLogs.routineId],
    references: [userRoutines.id],
  }),
}))
