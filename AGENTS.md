# TechStore — AGENTS.md

## Project structure

Monorepo with two packages:

- `techstore-api/` — Node.js/Express REST API (ESM: `"type": "module"`)
- `techstore-frontend/` — React 19 + Vite + Tailwind CSS v4 SPA

## Backend — key facts

### Entrypoint and module loading
- `src/server.js` uses **dynamic `await import()`** for all modules inside a try-catch. If you add a new module you **must** add an import there (lines 15-24).
- This pattern captures module errors at startup, failing fast with clear error messages (`❌ ERROR AL IMPORTAR MÓDULOS`).
- Server middleware order is fixed: helmet → cors → parsers → rate-limit → routes → notFound → errorHandler.
- Each module (auth, products, orders, admin, contact, upload) mounts at its own `/api/*` prefix in lines 105-110.

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
npm test                 # node --test (see app.test.js for patterns)
npm run db:migrate       # prisma migrate dev
npm run db:seed          # node prisma/seed.js (base categories + users)
npm run db:seed-personal # node prisma/seed-personal.js
npm run db:studio        # prisma studio
npm run db:reset         # prisma migrate reset --force

# Frontend
npm run dev              # vite dev server (port 5173 by default)
npm run build            # vite build
```

### Testing patterns
- Uses Node.js built-in `test` module + `supertest` for HTTP testing
- File: `app.test.js` shows patterns: `describe` → `test` → `supertest(app).get/post(...)`
- Key: Always test protected routes with `.expect(401)` and validate response shape
- Services are not unit-tested; focus on integration tests via API routes

### Environment setup
Create a `.env` file in `techstore-api/` (copy from prod settings):
```
DATABASE_URL=postgresql://user:pass@localhost:5432/techstore_dev
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
RECAPTCHA_SECRET=your-recaptcha-secret (optional for dev)
SMTP_FROM=noreply@techstore.local (optional)
```

### Business constants (must match backend)
Both sides define the same constants independently:
- API: `order.service.js` — TAX_RATE (0.19), SHIPPING_COST, FREE_SHIPPING_THRESHOLD, PROMO_CODES
- Frontend: `config/constants.js` — same values; must keep in sync
- ⚠️ Recent refactoring (commit e4360fb) removed validators services; validators now live inline in controllers with Zod schemas

### Recent patterns to know
- **Promo code management** — `promo.service.js` handles validation & discount calculation; always validate codes server-side
- **Validators refactoring** — As of latest commits, Zod schemas are in `*.validators.js` but validators services layer was removed. Controllers call Zod directly.
- **Google OAuth** — Auth supports both traditional password + Google OAuth; `googleAuth` boolean on User model flags OAuth-registered users
- **Module loading robustness** — Dynamic imports fail with clear stack traces (not silent failures); always check server startup logs if a new module doesn't load

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

### Common service patterns to follow
- Services export async functions, not classes (e.g., `export const getProducts = async (params) => ...`)
- All API errors are caught and re-thrown with user-friendly messages
- Services live in `features/*/services/`, shared helpers in `src/services/`
- Contexts live in `features/*/context/` (not shared globally unless truly universal like Auth)

### Tailwind CSS v4
Uses `@tailwindcss/vite` plugin (Tailwind v4, not v3). Config is done via CSS `@import "tailwindcss"` in `index.css`, **not** via `tailwind.config.js`.

### Important conventions
- Admin pages live in `features/admin/pages/`, not `pages/admin/`
- Shared UI components in `components/ui/` or `shared/components/ui/`
- Feature-specific components in `features/*/components/`
- Barrel re-exports in `features/*/index.js`

## Common pitfalls for AI agents

**Backend**
- Don't create new modules without adding imports in `src/server.js` (lines 15-24) — the server won't load them
- Don't call `jsonwebtoken` or `bcryptjs` directly — use `TokenService` and `PasswordService` wrappers
- Don't forget to extend `AppError` for new error types; don't use generic `Error()` + manual statusCode
- When adding promo code logic, validate codes server-side; client can't be trusted

**Frontend**
- Don't hardcode routes — use `ROUTES` object from `config/routes.js`
- Don't replicate cart or auth logic — they live in contexts and are singleton-like
- Tailwind is v4 (CSS config via `index.css`, not `tailwind.config.js`)
- When adding pages, check if they should live in `pages/`, `pages/{feature}/`, or `features/{feature}/pages/` based on whether they're feature-scoped
