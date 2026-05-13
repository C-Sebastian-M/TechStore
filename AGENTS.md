# TechStore — AGENTS.md

## Project structure

Monorepo with two packages:

- `techstore-api/` — Node.js/Express REST API (ESM: `"type": "module"`)
- `techstore-frontend/` — React 19 + Vite + Tailwind CSS v4 SPA

## Backend — key facts

### Entrypoint and module loading
- `src/server.js` uses **dynamic `await import()`** for all modules. If you add a new module you must add an import there.
- Server middleware order is fixed: helmet → cors → parsers → rate-limit → routes → notFound → errorHandler.

### Architecture pattern
```
routes → controller → service → prisma (no repository layer in current code)
```
Each module in `src/modules/*/` owns its routes, controller, and service. There is no shared service layer beyond middleware and utilities.

### Standard service file split (inside a module)
- `*.routes.js` — Express Router, mounts middleware + calls controller
- `*.controller.js` — validates request with Zod, calls service, sends response
- `*.service.js` — business logic, calls prisma directly
- `*.validators.js` — Zod schemas

### SOLID helpers already present (unique to this project)
- `shared/errors/AppError.js` — domain error hierarchy: `NotFoundError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `TooManyRequestsError`. Use these instead of `new Error()` + manual statusCode.
- `shared/utils/TokenService.js` — wraps JWT sign/verify + cookie management. Do NOT call `jsonwebtoken` directly.
- `shared/utils/PasswordService.js` — wraps bcrypt hash/compare. Do NOT call `bcrypt` directly.
- `shared/middleware/auth.middleware.js` — exports `protect`, `adminOnly`, `optionalAuth`. The `protect` middleware reads JWT from httpOnly cookie first, then Bearer header as fallback.

### Auth flow
1. `POST /api/auth/register` — sends 6-digit code via email
2. `POST /api/auth/verify-email` — validates code, creates user, returns JWT (set as httpOnly cookie)
3. `POST /api/auth/login` — returns JWT in httpOnly cookie
4. JWT expires in `JWT_EXPIRES_IN` (default `1d`)

### Rate limiting (unique limits per route)
| Route | Window | Max |
|---|---|---|
| `/api/` (global) | 15 min | 300 |
| `/api/auth/login` | 15 min | 10 |
| `/api/auth/register` | 1 hour | 5 |
| `/api/auth/verify-email` | 15 min | 10 |
| `/api/contact` | 1 hour | 10 |

### Database
- Prisma ORM, PostgreSQL (URL from `DATABASE_URL` env)
- Prisma schema at `prisma/schema.prisma` — models: User, Address, Category, Product, Order, OrderItem, EmailVerification, Favorite
- Key Prisma queries to know: `@@unique([userId, productId])` on Favorite, `@@map()` renames tables to plural

### Commands
```bash
# API
npm run dev              # node --watch src/server.js
npm test                 # node --test
npm run db:migrate       # prisma migrate dev
npm run db:seed          # node prisma/seed.js
npm run db:studio        # prisma studio
npm run db:reset         # prisma migrate reset --force

# Frontend
npm run dev              # vite dev server (port 5173 by default)
npm run build            # vite build
```

### Business constants (must match backend)
Both sides define the same constants independently:
- API: `order.service.js` — TAX_RATE (0.19), SHIPPING_COST, FREE_SHIPPING_THRESHOLD, PROMO_CODES
- Frontend: `config/constants.js` — same values; must keep in sync

## Frontend — key facts

### Routing
- Single source of truth: `src/config/routes.js` exports `ROUTES` object. Use `ROUTES.PRODUCT(id)` instead of hardcoded strings.
- Store routes nested inside `StoreLayout` (has Header/Footer)
- Admin routes nested inside `AdminLayout` (separate sidebar layout)
- Admin imports come from `features/admin/index.js` barrel export

### State management
- `context/AuthContext.jsx` — user session, login/logout, `openLogin`/`openRegister` events
- `context/CartContext.jsx` — cart items persisted to localStorage
- Listen for custom events: `auth:open-login`, `auth:open-register`, `auth:logout`

### Services
Services are in `features/*/services/` and use `axios` (from `src/services/api.js`). Base URL from `VITE_API_URL` env (default `http://localhost:3001`).

### Tailwind CSS v4
Uses `@tailwindcss/vite` plugin (Tailwind v4, not v3). Config is done via CSS `@import "tailwindcss"` in `index.css`, **not** via `tailwind.config.js`.

### Important conventions
- Admin pages live in `features/admin/pages/`, not `pages/admin/`
- Shared UI components in `components/ui/` or `shared/components/ui/`
- Feature-specific components in `features/*/components/`
- Barrel re-exports in `features/*/index.js`
