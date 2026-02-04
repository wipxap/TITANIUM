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

## Variables de Entorno

```env
# Frontend (.env)
VITE_API_URL=http://localhost:8787

# Backend (workers/.dev.vars)
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
LUCIA_PEPPER=...
```

---

## Herramientas MCP Disponibles (USAR ACTIVAMENTE)

| MCP | Uso | Cuándo usar |
|-----|-----|-------------|
| **shadcn** | Componentes UI, patrones, bloques | **SIEMPRE** antes de crear/modificar componentes UI |
| **Context7** | Documentación actualizada de librerías | SIEMPRE antes de implementar con Lucia, Drizzle, Hono, TanStack Query, Gemini |
| **Postgres** | Queries SQL de solo lectura | Explorar datos, verificar schemas, debugging |
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
3. `Postgres` → Explorar datos existentes
4. Implementar código
5. `GitHub` → Crear PR cuando listo

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
