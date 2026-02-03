# 🎯 TITANIUM GYM APP + Landing Page SEO - Planificación Definitiva

> **Fecha inicio:** 2026-03-10
>
> **Stack definitivo (EIPC + SEO + Reutilizable UI):**
> - **Frontend:** React 19 + Vite + TS + TanStack Query + shadcn/ui + Tailwind + React Compiler + react-helmet-async
> - **Mobile:** Capacitor 8 (PWA + offline progreso rutinas)
> - **Backend/DB:** Cloudflare Workers + Drizzle ORM + GCP Cloud SQL (southamerica-west1-b) + Memorystore Redis
> - **Auth:** Lucia TS (RUT como username + password, RBAC roles)
> - **AI Rutinas:** Gemini API (Google)
> - **SEO:** Public routes + schema.org LocalBusiness Iquique + Cloudflare edge cache
> - **Deploy:** Cloudflare Pages (root landing pública + SPA app) → wrangler manual primero (~15s)

**Equipo:** @WIPXAP (full-stack lead + SEO), @tbd-content, @tbd-mobile

---

## @think Estrategia Definitiva

- **Ubicación:** Titanium Gym – Manuel Bulnes 1540, Iquique, Chile 1100000 (geo: -20.228059, -70.138669 aprox)
- **Dual:** Landing pública SEO Iquique + app autenticada
- **AI Cambio:** Gemini API para generación rutinas (prompt estructurado → JSON rutina)
- **UI/UX Reutilizable Global WIPXAP:** Estructura obligatoria components/ui/ (shadcn), common/ (reutilizables: Logo, DashboardCard, PremiumTable, etc.), layout/ (por rol). Personalización en globals.css (primary #B71C1C, radius 0.5rem, dark/premium)
- **Fases DAG:**
  1. Landing pública + Core business (auth RUT, recepción POS/Webpay/check-in, usuario membresía)
  2. Catálogo máquinas público + AI rutinas Gemini + progreso offline
  3. Polish SEO/schema + PWA + push FCM
- **Instant/Compact:** Optimistic updates, skeleton loaders, cards p-3, forms mínimos, tablas densas

---

## 📋 User Stories Definitiva

| Fase | Rol | Feature | Prio | Comp | Estado |
|------|-----|---------|------|------|--------|
| 1 | Public | Landing hero Iquique + mapa Manuel Bulnes 1540 | 🔴 | M | ⬜ |
| 1 | Public | Planes + catálogo máquinas públicos | 🔴 | M | ⬜ |
| 1 | Public | Schema LocalBusiness + meta Iquique | 🔴 | S | ⬜ |
| 1 | **Auth** | Login RUT + password | 🔴 | S | ⬜ |
| 1 | **Admin** | CRUD planes/productos/máquinas | 🔴 | M | ⬜ |
| 1 | **Recepción** | POS + Webpay + Check-in + Caja | 🔴 | L | ⬜ |
| 1 | **Usuario** | Membresía + Check-in móvil QR | 🔴 | M | ⬜ |
| 2 | **Usuario** | Onboarding form + Generar rutina Gemini | 🔴 | L | ⬜ |
| 2 | **Usuario** | Rutina interactiva (embeds + registro reps/pesos offline) | 🔴 | L | ⬜ |
| 2 | **Usuario** | Progreso histórico + gráficos | 🟠 | M | ⬜ |
| 3 | Public | Rich snippets + sitemap.xml | 🟠 | S | ⬜ |

---

## 🗄️ ER Diagram (Drizzle-ready)

```mermaid
erDiagram
    users { uuid id PK, string rut UK, string role }
    profiles { uuid id PK, jsonb health_data, int weight_kg, int height_cm, int age, string gender, string goals }
    machines { uuid id PK, string name, string muscle_group, text description, string video_url }
    plans ||--o{ subscriptions : define
    profiles ||--o{ subscriptions : tiene
    profiles ||--o{ pos_sales : compra/vende
    cash_registers ||--o{ pos_sales : registra
    products ||--o{ pos_sales : incluye
    profiles ||--o{ checkins : registra
    profiles ||--o{ user_routines : tiene
    user_routines { jsonb routine_json, jsonb progress_logs }
```

**Redis:** cache público planes/máquinas + user rutina/progreso.

---

## 🛣️ Rutas Definitiva

**Públicas SEO:** `/`, `/planes`, `/maquinas`, `/ubicacion` (mapa Manuel Bulnes 1540), `/contacto`

**Autenticadas:** `/login`, `/my/*`, `/admin/*`, `/reception/*`

**API:** `/api/public/*` (cache Redis), `/api/routines/generate` (Gemini call)

---

## 🔄 Flujos Clave

1. **Landing → mapa embed → CTA login RUT**
2. **Generación rutina** → form → POST /api/routines/generate → Gemini prompt → JSON → DB
3. **Rutina interactiva** → DashboardCard + PremiumTable + SetInput optimistic

---

## ⚙️ Decisiones Técnicas Definitiva

| Decisión | Elegida | Razón |
|----------|---------|-------|
| AI Rutinas | Gemini API | Generación estructurada JSON fiable |
| UI Reutilizable | shadcn/ui + common/ (Logo, DashboardCard, PremiumTable, etc.) | Global WIPXAP, personalizable globals.css |
| Auth | Lucia TS (RUT username) | Login directo RUT |
| Videos | react-player lite | Embed YouTube/Vimeo lazy |
| SEO | react-helmet-async + JSON-LD Iquique | Rich snippets local |

---

## 🚨 Riesgos & Mitigaciones

| Riesgo | Prob | Impacto | Mitigación |
|--------|------|---------|------------|
| Gemini latency/costo | Media | Medio | Cache rutinas 14d + fallback básica |
| Offline sync conflicto | Media | Medio | Timestamp + last-write-wins |

---

## 📊 Métricas Éxito

- FCP landing <1.2s
- Orgánico "gimnasio iquique" top 10
- Rutinas generadas <5s p95
- Usuarios con progreso activo >65%

---

## 📁 Estructura Archivos (Reutilizable WIPXAP)

```
src/
├── components/
│   ├── ui/                  # shadcn base (npx shadcn-ui add ...)
│   ├── common/              # Reutilizables globales
│   │   ├── Logo.tsx
│   │   ├── Background.tsx
│   │   ├── DashboardCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── PremiumTable.tsx
│   │   ├── FormInput.tsx
│   │   ├── PremiumButton.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── layout/              # Por rol
│       ├── AdminLayout.tsx
│       ├── UserLayout.tsx
│       └── LandingLayout.tsx
├── pages/
│   ├── public/              # LandingHomePage, MachinesCatalogPage (usa common/)
│   └── protected/           # MyRoutinePage (DashboardCard + PremiumTable)
├── styles/
│   └── globals.css          # --primary: #B71C1C; --radius: 0.5rem; dark/premium
├── assets/                  # logo.png, backgrounds
├── lib/                     # api.ts, db.ts, gemini.ts
└── hooks/
workers/
├── api/routines/            # generate.ts (Gemini call)
└── _middleware.ts
```

---

## ✅ Checklist Pre-Desarrollo Definitiva

- [ ] npx shadcn-ui init + add button card table input → ui/
- [ ] Crear common/ reutilizables (Logo, DashboardCard, PremiumTable)
- [ ] Personalizar globals.css (colores Titanium dark red/black)
- [ ] Agrega a `.env` Workers:
  ```
  GEMINI_API_KEY=...
  GOOGLE_MAPS_API_KEY=...
  ```
- [ ] Schema JSON-LD en LandingLayout (Manuel Bulnes 1540, Iquique, geo -20.228059/-70.138669)
- [ ] Mapa embed centrado en dirección

---

# 🎨 UI/UX Reutilizable Full (Titanium Red/Black Theme)

> **Full reutilizable (no MVP):** Todos componentes common/ + layout/ completos. Dark premium red/black basado en logo (#B71C1C primary, #000000 bg, Oswald bold headings).
>
> **EIPC cumplido:** Cards p-3, forms mínimos, tablas densas, hover glow-red, optimistic-ready (skeleton integrados). Archivos <250 líneas cada uno.
>
> **Personalización:** Todo usa Tailwind variables de globals.css. Import: `import { DashboardCard, PremiumButton } from "@/components/common/*"`

## @ui Estrategia Full Reutilizable

- **common/**: 9 componentes core (Logo, Background, DashboardCard, StatCard, PremiumTable, FormInput, PremiumButton, Header, Sidebar)
- **layout/**: 3 layouts completos (LandingLayout, UserLayout, AdminLayout/Recepción shared)
- **Theme:** Dark only, red accents, sharp radius 0.5rem, glow effects. Skeleton loaders red dim
- **Assets:** Colocar logo.png en public/assets/logo.png. Fonts Oswald en public/fonts
- **Uso:** Páginas importan common/ + layout correspondiente. TanStack Query skeletons integrados en cards/tables

---

## 🎨 globals.css Full (src/styles/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 0%;         /* #000000 */
    --foreground: 0 0% 100%;       /* #FFFFFF */
    --card: 0 0% 7%;               /* #1A1A1A */
    --card-foreground: 0 0% 100%;
    --popover: 0 0% 7%;
    --popover-foreground: 0 0% 100%;
    --primary: 0 74% 42%;          /* #B71C1C rojo logo */
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 10%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 10%;
    --muted-foreground: 0 0% 70%;
    --accent: 0 58% 60%;           /* #E57373 accent */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --border: 0 0% 20%;            /* #333333 */
    --input: 0 0% 20%;
    --ring: 0 74% 42%;
    --radius: 0.5rem;
  }

  body {
    @apply bg-background text-foreground font-body;
  }

  h1, h2, h3, h4 {
    font-family: 'Oswald', sans-serif;
    @apply uppercase tracking-wider font-bold;
  }
}

@font-face {
  font-family: 'Oswald';
  src: url('/fonts/oswald-variable.ttf') format('truetype');
  font-weight: 100 900;
}

.glow-red { @apply shadow-lg shadow-primary/50 transition-all duration-300 hover:shadow-primary/70; }
.text-glow { @apply drop-shadow-lg drop-shadow-primary/60; }
.skeleton-red { @apply animate-pulse bg-primary/20; }
```

---

## 🧩 common/ Componentes Full Code

### Logo.tsx

```tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizes = {
    sm: "w-32",
    md: "w-48",
    lg: "w-64",
    xl: "w-96"
  };

  return (
    <img
      src="/assets/logo.png"
      alt="Titanium Gym Logo"
      className={cn("glow-red object-contain transition-transform hover:scale-105", sizes[size], className)}
    />
  );
}
```

### Background.tsx

```tsx
import { cn } from "@/lib/utils";

export function Background({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-screen bg-background relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      {children}
    </div>
  );
}
```

### DashboardCard.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function DashboardCard({ title, children, loading, className }: DashboardCardProps) {
  return (
    <Card className={cn("bg-card border-border glow-red p-3", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-primary text-glow">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-32 w-full skeleton-red rounded-xl" /> : children}
      </CardContent>
    </Card>
  );
}
```

### StatCard.tsx

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: boolean;
}

export function StatCard({ icon: Icon, label, value, accent }: StatCardProps) {
  return (
    <Card className="bg-card border-border glow-red p-3">
      <CardContent className="flex items-center gap-4">
        <div className={cn("p-3 rounded-full", accent ? "bg-primary" : "bg-accent")}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-3xl font-bold text-primary text-glow">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### PremiumTable.tsx

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PremiumTableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  loading?: boolean;
  loadingRows?: number;
}

export function PremiumTable({ headers, rows, loading, loadingRows = 5 }: PremiumTableProps) {
  return (
    <Table className="border border-border">
      <TableHeader>
        <TableRow className="bg-primary hover:bg-primary">
          {headers.map((header, i) => (
            <TableHead key={i} className="text-primary-foreground font-bold uppercase">
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: loadingRows }).map((_, i) => (
              <TableRow key={i}>
                {headers.map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-8 w-full skeleton-red" /></TableCell>
                ))}
              </TableRow>
            ))
          : rows.map((row, i) => (
              <TableRow key={i} className="hover:bg-muted/50">
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
```

### FormInput.tsx

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, className, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="text-primary">{label}</Label>
      <Input
        className={cn("border-border focus:border-primary glow-red", error && "border-destructive", className)}
        {...props}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
```

### PremiumButton.tsx

```tsx
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "default" | "outline" | "destructive";
}

export function PremiumButton({ children, loading, className, variant = "default", ...props }: PremiumButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "font-bold uppercase tracking-wider glow-red hover:scale-105 transition-all",
        variant === "default" && "bg-primary hover:bg-accent text-primary-foreground",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

### Header.tsx

```tsx
import { Logo } from "./Logo";
import { UserNav } from "@/components/common/UserNav";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="bg-background/90 backdrop-blur border-b border-border sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <Logo size="sm" />
        <UserNav />
      </div>
    </header>
  );
}
```

### Sidebar.tsx

```tsx
import { Logo } from "./Logo";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Users, DollarSign, Dumbbell, Settings } from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", to: "/" },
  { icon: Users, label: "Usuarios", to: "/admin/users" },
  { icon: DollarSign, label: "Ventas", to: "/reception/pos" },
  { icon: Dumbbell, label: "Máquinas", to: "/admin/machines" },
  { icon: Settings, label: "Ajustes", to: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="bg-card w-64 border-r border-border min-h-screen p-4 flex flex-col">
      <Logo size="md" className="mb-8" />
      <nav className="space-y-2">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-primary/20 glow-red",
                isActive && "bg-primary/20 text-primary"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

---

## 🏗️ layout/ Layouts Full

### LandingLayout.tsx

```tsx
import { Background } from "@/components/common/Background";
import { Header } from "@/components/common/Header";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Background>
      <Header />
      <main className="container px-4 py-8">{children}</main>
    </Background>
  );
}
```

### UserLayout.tsx

```tsx
import { Background } from "@/components/common/Background";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";

export function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <Background className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="container px-6 py-8">{children}</main>
      </div>
    </Background>
  );
}
```

### AdminLayout.tsx (shared Recepción)

```tsx
import { UserLayout } from "./UserLayout";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
```

---

## ✅ Checklist UI Full

- [ ] Copiar globals.css + fonts + assets/logo.png
- [ ] Crear carpeta components/common/ + layout/ con códigos arriba
- [ ] npx shadcn-ui add button card table input skeleton label (base components usados)
- [ ] Test: Landing hero con Logo glow-red, DashboardCard en /my/routine

---

**Siguiente paso:** @deploy wrangler dev → LandingLayout + hero Iquique + common/ components skeleton. Planificación definitiva lista.
