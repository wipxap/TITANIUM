# Titanium Gym API

Backend API en Cloudflare Workers con GCP Cloud SQL.

## Requisitos

- Node.js 18+
- Cuenta GCP con facturación activa
- Cuenta Cloudflare
- gcloud CLI instalado

## Setup Completo

### 1. Instalar dependencias

```bash
cd workers
npm install
```

### 2. Crear Cloud SQL en GCP

```bash
# Exportar tu proyecto GCP
export GCP_PROJECT_ID=tu-proyecto-id

# Ejecutar script de setup
npm run setup:gcp
```

Esto creará:
- Instancia PostgreSQL 15 en `southamerica-west1` (Santiago)
- Base de datos `titanium`
- Usuario `titanium_app`

**Guarda el connection string que se muestra al final.**

### 3. Configurar Hyperdrive en Cloudflare

```bash
# Crear Hyperdrive con el connection string de GCP
npx wrangler hyperdrive create titanium-db \
  --connection-string="postgresql://titanium_app:PASSWORD@IP:5432/titanium"
```

Copia el ID generado y pégalo en `wrangler.toml`:

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "TU_HYPERDRIVE_ID_AQUI"
```

### 4. Crear archivo .env local

```bash
cp .env.example .env
# Editar .env con tu DATABASE_URL
```

### 5. Ejecutar migrations

```bash
# Generar migrations desde schema
npm run db:generate

# Aplicar migrations
npm run db:push
```

### 6. Poblar datos iniciales

```bash
npm run db:seed
```

Esto creará:
- 3 planes (Básico, Premium, Titanium)
- 32 máquinas por grupo muscular
- Usuario admin (RUT: 11.111.111-1, Pass: TitaniumAdmin2026!)

### 7. Configurar secrets en Cloudflare

```bash
npx wrangler secret put LUCIA_PEPPER
# Ingresa un string aleatorio de 32+ caracteres

npx wrangler secret put GEMINI_API_KEY
# Ingresa tu API key de Google AI Studio
```

### 8. Ejecutar en desarrollo

```bash
npm run dev
```

API disponible en `http://localhost:8787`

### 9. Deploy a producción

```bash
npm run deploy
```

## Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/` | - | Health check |
| GET | `/public/stats` | - | Stats landing |
| GET | `/public/plans` | - | Planes públicos |
| GET | `/public/machines` | - | Máquinas públicas |
| POST | `/auth/login` | - | Login con RUT |
| POST | `/auth/register` | - | Registro |
| GET | `/auth/me` | ✅ | Usuario actual |
| GET | `/user/profile` | ✅ | Perfil usuario |
| GET | `/user/routines` | ✅ | Rutinas usuario |
| POST | `/user/checkin` | ✅ | Check-in QR |

## Arquitectura

```
workers/
├── src/
│   ├── db/
│   │   ├── schema.ts     # Drizzle schemas
│   │   └── index.ts      # Conexión DB
│   ├── lib/
│   │   ├── auth.ts       # Lucia + RUT validation
│   │   └── password.ts   # Argon2id
│   ├── middleware/
│   │   └── auth.ts       # Session middleware
│   ├── routes/
│   │   ├── auth.ts       # /auth/*
│   │   ├── public.ts     # /public/*
│   │   └── user.ts       # /user/*
│   ├── types.ts
│   └── index.ts          # Hono app
├── scripts/
│   ├── setup-gcp.sh      # Setup Cloud SQL
│   └── seed.ts           # Datos iniciales
└── wrangler.toml         # Config Workers
```
