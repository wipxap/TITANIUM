# TITANIUM GYM APP

Sistema de gestión para **Gimnasio Premium Iquique** - Manuel Bulnes 1540, Iquique, Chile.

---

## Stack Obligatorio

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Vite 6 + TypeScript 5.7 + TanStack Query v5 + shadcn/ui + Tailwind 3.4 |
| Mobile | Capacitor 8 (PWA + offline + QR check-in) |
| Backend | Cloudflare Workers + Hono 4.6 + Drizzle ORM 0.38 |
| Database | GCP Cloud SQL PostgreSQL 15 (southamerica-west1-b) + Hyperdrive |
| Auth | Lucia 3.2 (RUT chileno único, **Scrypt** @noble/hashes Workers-compatible, RBAC: admin/reception/instructor/user) |
| AI | Google Gemini 1.5 Flash (generación de rutinas) |
| Deploy | Cloudflare Pages + Workers (git push automático) |

**IMPORTANTE: Scrypt es obligatorio** - Argon2id NO es compatible con Cloudflare Workers. El proyecto usa `@noble/hashes/scrypt` con parámetros seguros (N=16384, r=8, p=1).

---

## Filosofía EIPC (TRANSVERSAL A TODO)

**EIPC debe aplicarse en TODAS las capas: código, diseño, backend, frontend, schemas, APIs.**

- **EASY**: Código minimalista, auto-documentado. UI intuitiva, mobile-first. APIs claras y predecibles.
- **INSTANT**: **LA APP DEBE SER INSTANTÁNEA** - Feedback visual inmediato. Optimistic updates en mutaciones. Loads <100ms, queries <10ms. Skeleton loaders en todo loading state. Sin spinners que bloqueen UI.
- **PRACTICAL**: Cada línea de código con propósito. Reutilizable sin over-engineering. Componentes `common/` para Titanium.
- **COMPACT**: Archivos <250 líneas. Tablas densas, forms mínimos. Cards p-3, spacing optimizado. Sin bloat.

---

## Reglas de Desarrollo OBLIGATORIAS

### SIEMPRE EXPLORAR SCHEMA PRIMERO

**ANTES de implementar cualquier feature con datos:**
1. Leer `workers/src/db/schema.ts` completo
2. Verificar tablas, relaciones y enums existentes
3. Entender la estructura de datos antes de escribir código

### SIEMPRE REVISAR CONTEXT7

**ANTES de usar cualquier librería:**
- Usar MCP Context7 para obtener documentación actualizada
- Verificar APIs correctas de: Lucia, Drizzle, Hono, TanStack Query, Gemini
- No asumir sintaxis - siempre confirmar con docs actuales

### ZONA HORARIA CHILE (CRÍTICO)

**TODAS las fechas deben usar `America/Santiago`:**
- **PROHIBIDO:** Offsets fijos como `-04:00` o `-03:00`
- **OBLIGATORIO:** Usar identificador `America/Santiago`
- Chile tiene horario de verano que cambia entre -03:00 y -04:00

---

## Reglas CERO MOCK (CRÍTICO)

**PROHIBIDO:**
- Arrays/objetos hardcodeados como datos de ejemplo
- `setTimeout()` simulando llamadas API
- Datos estáticos "para reemplazar después"
- `console.log()` de debug en producción
- Stats/métricas inventadas

**OBLIGATORIO:**
- Hooks React Query conectados a API real
- Estados: loading (skeleton), empty, error (con retry)
- Flujo: Schema DB → Endpoint API → Hook React Query → Componente

**Si no hay backend aún:** Skeleton permanente o "Próximamente", NUNCA mock data.

---

## MOBILE FIRST (CRÍTICO)

- **Diseño:** Empezar por 320px-428px, luego escalar
- **Touch targets:** Mínimo 44x44px
- **Texto mínimo:** 16px body, 14px labels
- **Testing obligatorio:** Probar en 375px antes de desktop
- **Convención Tailwind:** default → `md:` → `lg:` → `xl:`

```css
/* CORRECTO: Mobile first */
className="p-4 md:p-6 lg:p-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

/* INCORRECTO: Desktop first */
className="p-8 sm:p-4"
```

---

## Tema Visual TITANIUM

- **Dark mode ONLY** - No light mode
- Primary: `#B71C1C` | Accent: `#E57373` | Background: `#000000` | Card: `#1A1A1A`
- Font heading: Oswald bold uppercase
- Font body: Inter
- Efectos: `glow-red`, `text-glow`, `skeleton-red`

---

## Estructura de Carpetas

```
TITANIUM/
├── src/                    # Frontend React
│   ├── components/
│   │   ├── ui/            # shadcn/ui base
│   │   ├── common/        # Reutilizables Titanium (Logo, Background, DashboardCard, etc.)
│   │   ├── layout/        # Layouts por rol (Landing, User, Admin, Reception)
│   │   └── seo/           # SEO components (LocalBusinessSchema)
│   ├── pages/
│   │   ├── public/        # Home, Login, Planes, Maquinas, Ubicacion, Contacto
│   │   ├── protected/     # Dashboard, Routines, Progress, Settings
│   │   ├── admin/         # Users, Machines management
│   │   └── reception/     # Checkin, POS
│   ├── hooks/             # useAuth, useUserData, useAdminData, useReceptionData, usePublicData
│   ├── lib/               # api.ts, utils.ts
│   └── styles/            # globals.css
├── workers/               # Backend Cloudflare
│   ├── src/
│   │   ├── db/           # schema.ts, index.ts
│   │   ├── lib/          # auth.ts, password.ts, gemini.ts
│   │   ├── middleware/   # auth middleware
│   │   └── routes/       # auth, public, user, admin, reception, routines
│   └── scripts/          # seed.ts, migrations
└── public/               # Assets estáticos
```

---

## Schema de Base de Datos

**Tablas principales:** `users`, `sessions`, `profiles`, `plans`, `subscriptions`, `machines`, `products`, `cashRegisters`, `posSales`, `checkins`, `userRoutines`, `progressLogs`

**Enums:**
- `user_role`: admin, reception, instructor, user
- `gender`: male, female, other
- `subscription_status`: active, expired, cancelled, pending
- `payment_method`: cash, webpay, transfer
- `muscle_group`: chest, back, shoulders, arms, legs, core, cardio, full_body

---

## Patrones de Código

### Frontend

- **Data fetching:** `useQuery` de TanStack (nunca useEffect para fetch)
- **Estructura componente:** imports → hooks → derived → handlers → effects → early returns → JSX
- **API client tipado:** `src/lib/api.ts`

### Backend

- **Middleware stack:** initMiddleware → sessionMiddleware → requireAuth → requireRole
- **Validación:** Zod en todas las rutas
- **Validación RUT:** Incluida en auth
- **Roles:** admin, reception, instructor, user

---

## Desarrollo Local

**Comando para iniciar entorno de desarrollo:**
```bash
./dev.sh
```

Esto inicia:
- **Backend:** http://localhost:8787 (Cloudflare Workers con Wrangler)
- **Frontend:** http://localhost:5173 (Vite)

**Alternativa manual:**
```bash
# Terminal 1 - Backend
cd workers && npm run dev

# Terminal 2 - Frontend
npm run dev
```

**IMPORTANTE:** Usar `./dev.sh` cada vez que se necesite reiniciar el entorno local.

---

## Deploy (CRÍTICO)

**ÚNICA forma permitida de deploy:**
```bash
git add -A && git commit -m "tipo(titanium): mensaje" && git push
```

**PROHIBIDO:**
- `npx wrangler pages deploy` - RIESGO DE BLOQUEO por Cloudflare
- `npm run deploy`
- Deploy manual directo a Cloudflare
- Cualquier forma de deploy que no sea git push

**Razón:** Cloudflare puede bloquear cuentas por exceso de deploys manuales.

Cloudflare Pages hace deploy automático (~2 min) desde GitHub cuando detecta push.

---

## Arquitectura Backend (CRÍTICO)

**Estado actual: Backend en GCP Compute Engine (migración temporal)**

El Cloudflare Worker (`titanium-gym-api.wipxap.workers.dev`) está **muerto** (error 1101). La API corre en GCP Compute Engine.

| Componente | URL | Estado |
|-----------|-----|--------|
| **Frontend** | `https://titanium-bbt.pages.dev` | Cloudflare Pages (deploy vía git push) |
| **API (producción)** | `https://34-54-40-117.sslip.io` | GCP Compute Engine (IP: 34.54.40.117) |
| **API (Worker)** | `https://titanium-gym-api.wipxap.workers.dev` | **MUERTO** - Error 1101 |

### Variables de entorno de producción

- **`.env.production`** (en git): `VITE_API_URL=https://34-54-40-117.sslip.io`
- **Cloudflare Pages dashboard**: Puede tener `VITE_API_URL` que **sobreescribe** el archivo. Verificar que apunte a GCP, no al Worker muerto.

### GCP Compute Engine

- **IP**: `34.54.40.117`
- **Dominio**: `34-54-40-117.sslip.io` (SSL automático via sslip.io)
- **Docker**: `workers/Dockerfile` → ejecuta `npx tsx src/server.ts`
- **Entry point**: `workers/src/server.ts` (Hono + `@hono/node-server`)
- **Puerto**: 8080

### Si el frontend muestra errores CORS

1. Verificar que Cloudflare Pages dashboard tenga `VITE_API_URL=https://34-54-40-117.sslip.io`
2. Verificar que el origin del frontend esté en `allowedOrigins` en `workers/src/index.ts`
3. Re-deploy: `git push` (triggerea build de Pages con `.env.production` correcto)

---

## Base de Datos (CRÍTICO - LEER ANTES DE USAR MCP POSTGRES)

**⚠️ ADVERTENCIA CRÍTICA: El MCP Postgres puede estar configurado con credenciales de OTRO proyecto. SIEMPRE verificar que estás conectado a la BD correcta antes de ejecutar queries.**

### Credenciales de Titanium (ÚNICA BD VÁLIDA)

| Campo | Valor |
|-------|-------|
| **Host** | `34.176.85.127` |
| **Puerto** | `5432` |
| **Database** | `titanium_app` |
| **Usuario** | `titanium_app` |
| **Región GCP** | `southamerica-west1-b` |

### Verificación OBLIGATORIA

**ANTES de usar MCP Postgres, ejecutar:**
```sql
SELECT current_database();
-- DEBE retornar: titanium_app
-- Si retorna OTRO nombre (ej: cemsa_db) → ESTÁS EN LA BD EQUIVOCADA
```

### Si el MCP Postgres está mal configurado

Usar Bash con psql en lugar del MCP:
```bash
PGPASSWORD=<password> psql -h 34.176.85.127 -U titanium_app -d titanium_app -c "TU_QUERY"
```

### Tablas de Titanium

```
users, sessions, profiles, plans, subscriptions, machines,
products, cash_registers, pos_sales, checkins, user_routines,
progress_logs, loyalty_levels, contracts, signed_contracts, family_codes
```

**Si ves tablas como `auth_users`, `gym_configs`, `attendance`, `bookings` → ESTÁS EN CEMSA, NO EN TITANIUM.**

---

## Variables de Entorno

```env
# Frontend (.env)
VITE_API_URL=http://localhost:8787

# Backend (workers/.dev.vars)
DATABASE_URL=postgresql://titanium_app:<password>@34.176.85.127:5432/titanium_app
GEMINI_API_KEY=...
LUCIA_PEPPER=...
```

---

## Herramientas MCP Disponibles (USAR ACTIVAMENTE)

| MCP | Uso | Cuándo usar |
|-----|-----|-------------|
| **shadcn** | Componentes UI, patrones, bloques | **SIEMPRE** antes de crear/modificar componentes UI |
| **Context7** | Documentación actualizada de librerías | SIEMPRE antes de implementar con Lucia, Drizzle, Hono, TanStack Query, Gemini |
| **Postgres** | Queries SQL de solo lectura | **⚠️ VERIFICAR BD PRIMERO** - Ver sección "Base de Datos" |
| **GCloud** | CLI Google Cloud Platform | Cloud SQL, config southamerica-west1-b |
| **Cloudflare** | Workers, KV, D1, R2, AI | Gestión de Workers, storage |
| **GitHub** | PRs, issues, branches | Crear PRs, revisar código, gestión de repo |
| **Sequential Thinking** | Razonamiento paso a paso | Problemas complejos, arquitectura, debugging |

### MCP shadcn (OBLIGATORIO PARA UI)

**SIEMPRE usar el MCP shadcn antes de crear componentes UI:**

```
mcp__shadcn__getComponents()     # Lista todos los componentes disponibles
mcp__shadcn__getComponent("X")   # Obtiene código, ejemplos y patrones de X
```

**Categorías disponibles:**
- `components` - Componentes base (Button, Card, Dialog, Input, Table, etc.)
- `blocks` - Bloques completos (Dashboard, Auth, Settings, etc.)
- `charts` - Gráficos con Recharts
- `patterns` - Patrones de diseño comunes
- `hooks` - Hooks útiles para UI
- `themes` - Temas y personalización

**Cuándo usar:**
- Crear nuevo componente → `getComponent("components")` primero
- Dashboard/página compleja → `getComponent("blocks")` para inspiración
- Gráficos de progreso → `getComponent("charts")`
- Animaciones/efectos → `getComponent("patterns")`

**Beneficios:**
- Código actualizado y probado
- Consistencia con el design system
- Accesibilidad incluida
- Ejemplos de uso reales

**Flujo recomendado:**
1. `shadcn` → Verificar componentes/bloques disponibles
2. `Context7` → Verificar docs de librería
3. **⚠️ ANTES de Postgres** → Verificar `SELECT current_database()` = `titanium_app`
4. `Postgres` o `psql` → Explorar datos existentes
5. Implementar código
6. `GitHub` → Crear PR cuando listo

---

## Restricciones Absolutas

- **NO** AWS, Vercel, Supabase
- **NO** console.log en producción
- **CERO MOCK** - Todo dato debe ser REAL
- **NO** crear archivos innecesarios
- **NO** light mode
- **NO** Argon2id (incompatible con Workers) - USAR SCRYPT
- **NO** wrangler deploy manual - SOLO git push
- **NO** offsets de zona horaria fijos - USAR `America/Santiago`

---

## Datos de Prueba (Seed)

- **Admin:** RUT 11.111.111-1, Pass: TitaniumAdmin2026!
- **Planes:** Básico, Premium, Titanium
- **Máquinas:** 32 máquinas por grupo muscular

---

## Comunicación

- Responder SIEMPRE en español
- Ser conciso, no repetir información conocida
- Errores: diagnosticar rápido y arreglar sin explicaciones excesivas
    