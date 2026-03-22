# TechStore API

REST API para TechStore — Node.js + Express + Prisma + PostgreSQL

## Stack
- **Runtime**: Node.js 22 (ES Modules)
- **Framework**: Express 4
- **ORM**: Prisma 5
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT + bcrypt
- **Validación**: Zod
- **Upload de imágenes**: Multer + Sharp (optimización automática a WebP)

## Setup rápido

```bash
# 1. Instalar dependencias (incluye multer y sharp para upload de imágenes)
npm install multer sharp

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL

# 3. Generar cliente Prisma
npm run db:generate

# 4. Crear tablas en la BD
npm run db:migrate

# 5. Poblar con datos iniciales
npm run db:seed

# 6. Levantar el servidor
npm run dev
```

## Variables de entorno (.env)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://postgres:pass@localhost:5432/techstore_db` |
| `PORT` | Puerto del servidor | `3001` |
| `JWT_SECRET` | Clave secreta para firmar tokens | String aleatorio largo |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `CLIENT_URL` | URL del frontend (para CORS) | `http://localhost:5173` |

---

## Endpoints de la API

Base URL: `http://localhost:3001/api`

### 🔓 Autenticación (públicos)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión → devuelve token |

### 👤 Perfil (requieren token)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/auth/me` | Obtener perfil propio |
| PUT | `/auth/me` | Actualizar nombre, teléfono, fecha de nacimiento |
| PUT | `/auth/me/password` | Cambiar contraseña |
| POST | `/auth/me/addresses` | Agregar dirección |
| PUT | `/auth/me/addresses/:id` | Editar dirección |
| DELETE | `/auth/me/addresses/:id` | Eliminar dirección |

### 📦 Productos (públicos)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/products` | Listar con filtros y paginación |
| GET | `/products/categories` | Listar categorías |
| GET | `/products/:id` | Detalle de un producto |

#### Query params de GET /products
```
?page=1&limit=12&category=procesadores&search=ryzen&minPrice=100&maxPrice=500&sortBy=price&sortOrder=asc
```

### ❤️ Favoritos (requieren token)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/products/me/favorites` | Listar mis favoritos |
| POST | `/products/:id/favorite` | Agregar/quitar de favoritos (toggle) |

### 🛒 Pedidos (requieren token)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/orders` | Crear pedido |
| GET | `/orders` | Mis pedidos |
| GET | `/orders/:id` | Detalle de un pedido |

#### Body de POST /orders
```json
{
  "items": [
    { "productId": "cuid_aqui", "qty": 1 }
  ],
  "shipping": {
    "fullName": "Alex Rodriguez",
    "address": "Calle 72 # 10-34",
    "city": "Bogotá",
    "country": "Colombia"
  },
  "paymentMethod": "card",
  "promoCode": "TECHSTORE10"
}
```

### 🔒 Admin (requieren token + rol ADMIN)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/products` | Crear producto |
| PUT | `/products/:id` | Editar producto |
| DELETE | `/products/:id` | Desactivar producto |
| GET | `/orders/admin/all` | Todos los pedidos |
| PATCH | `/orders/:id/status` | Cambiar estado del pedido |
| GET | `/users` | Listar todos los usuarios |
| GET | `/users/:id` | Ver usuario con sus pedidos |

---

## Cómo autenticarse

```javascript
// 1. Login
const res = await fetch('http://localhost:3001/api/auth/login', {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ email: 'alex@techstore.com', password: 'user123' })
})
const { token } = await res.json()

// 2. Usar el token en peticiones protegidas
const orders = await fetch('http://localhost:3001/api/orders', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

## Usuarios del seed

| Email | Password | Rol |
|---|---|---|
| `admin@techstore.com` | `admin123` | ADMIN |
| `alex@techstore.com` | `user123` | CUSTOMER |

## Códigos promocionales

| Código | Descuento |
|---|---|
| `TECHSTORE10` | 10% |
| `BIENVENIDO` | 15% |
| `GAMING2025` | 5% |
