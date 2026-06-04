# TechStore v4 — E-commerce de Componentes PC

Proyecto académico final desarrollado para la asignatura **Calidad del Software**.  
E-commerce fullstack especializado en componentes de PC, con configurador inteligente de builds,  
panel de administración completo y evaluación de usabilidad bajo el modelo **SQuaRE (ISO/IEC 25010)**.

---

## Stack tecnológico

### Backend — `techstore-api/`
| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | 4.x | Framework HTTP |
| Prisma | 5.x | ORM |
| PostgreSQL | 14+ | Base de datos |
| JWT + bcryptjs | — | Autenticación y hashing |
| Zod | 3.x | Validación de esquemas |
| Multer + Sharp | — | Upload y optimización de imágenes |
| Nodemailer | — | Envío de emails |
| Helmet + CORS | — | Seguridad HTTP |

### Frontend — `techstore-frontend/`
| Tecnología | Versión | Rol |
|---|---|---|
| React | 19.x | UI |
| Vite | 6.x | Bundler |
| React Router DOM | 7.x | Enrutamiento SPA |
| Tailwind CSS | 4.x | Estilos |

---

## Arquitectura

```
TechStore_v4/
├── techstore-api/              # REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js       # Singleton de PrismaClient
│   │   ├── modules/            # Arquitectura modular (un módulo = una entidad)
│   │   │   ├── auth/           # Registro, login, Google OAuth, perfil, direcciones
│   │   │   ├── products/       # Catálogo, categorías, favoritos
│   │   │   ├── orders/         # Pedidos, códigos promocionales
│   │   │   ├── admin/          # Dashboard, CRUD de admin
│   │   │   ├── contact/        # Formulario de contacto
│   │   │   ├── upload/         # Upload y optimización de imágenes
│   │   │   └── users/          # Gestión de usuarios (admin)
│   │   ├── shared/
│   │   │   ├── errors/         # Jerarquía de errores de dominio (AppError)
│   │   │   ├── middleware/     # auth.middleware, error.middleware
│   │   │   └── utils/          # TokenService (JWT), PasswordService (bcrypt)
│   │   └── server.js           # Punto de entrada, middlewares globales
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos de la BD
│   │   └── seed.js             # Datos iniciales (admin, categorías, productos)
│   ├── uploads/products/       # Imágenes subidas (excluido de Git)
│   └── vercel.json             # Configuración de despliegue
│
└── techstore-frontend/         # SPA React
    ├── src/
    │   ├── pages/              # Una página por ruta
    │   │   ├── Home.jsx        # Hero, tabs de productos, CTA
    │   │   ├── ProductList.jsx # Catálogo con filtros y paginación
    │   │   ├── ProductDetail.jsx # Detalle, agregar al carrito/configurador
    │   │   ├── ShopCart.jsx    # Carrito con resumen y código promo
    │   │   ├── Payment.jsx     # Formulario de checkout
    │   │   ├── OrderConfirmation.jsx
    │   │   ├── PCConfigurator.jsx # Configurador de PC con blueprint SVG
    │   │   ├── Profile.jsx     # Perfil de usuario con stats reales
    │   │   ├── MyOrders.jsx    # Historial de pedidos con tracker
    │   │   ├── Favorites.jsx   # Lista de deseos
    │   │   └── admin/          # Panel de administración
    │   │       ├── AdminLayout.jsx     # Guard + sidebar colapsable
    │   │       ├── AdminDashboard.jsx  # KPIs, pedidos recientes, bajo stock
    │   │       ├── AdminProducts.jsx   # CRUD de productos + upload de imágenes
    │   │       ├── AdminCategories.jsx # CRUD de categorías
    │   │       ├── AdminOrders.jsx     # Gestión de pedidos
    │   │       └── AdminUsers.jsx      # Gestión de usuarios
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Sesión de usuario (JWT + localStorage)
    │   │   └── CartContext.jsx  # Carrito persistente por cuenta (localStorage)
    │   ├── services/            # Capa de comunicación con la API
    │   │   ├── api.js           # Cliente HTTP central con auth dual (cookie + header)
    │   │   ├── authService.js
    │   │   ├── productService.js
    │   │   ├── orderService.js
    │   │   ├── cartService.js   # Cálculo de totales, IVA, envío, promos
    │   │   ├── adminService.js  # Servicios admin + upload de imágenes
    │   │   └── contactService.js
    │   ├── constants/           # Constantes del negocio
    │   │   └── index.js         # SHIPPING_COST, FREE_SHIPPING_THRESHOLD, PROMO_CODES, etc.
    │   └── data/
    │       └── configurator.js  # SLOTS, checkCompatibility, calcBuildScore
    └── vercel.json              # Rewrites para SPA en Vercel
```

---

## Reglas de negocio implementadas

### Precios y envío
- **IVA:** 19% sobre el subtotal descontado (estándar Colombia)
- **Envío:** $24.99 USD fijo cuando el subtotal < $150 USD
- **Envío gratis:** subtotal descontado ≥ $150 USD
- **Carrito vacío:** envío = $0 (no muestra costo hasta agregar productos)

### Códigos promocionales
Los promos se gestionan desde el panel admin (modelo `PromoCode` en BD).  
Soportan: porcentaje de descuento, límite de usos, fecha de expiración.

### Reordenar pedidos
Solo disponible en estados `PAYMENT_CONFIRMED` y `PREPARING`.  
En `SHIPPED` y `DELIVERED` el botón aparece deshabilitado con mensaje explicativo.  
En `RECEIVED` y `CANCELLED` no se muestra.

### Imágenes de productos
El backend recibe cualquier imagen (JPG, PNG, WebP, GIF ≤ 5MB),  
la convierte a **WebP 800×800 px calidad 82%** usando Sharp,  
y la sirve desde `/uploads/products/`. En producción serverless (Vercel),  
el resultado se devuelve como Data URL base64.

### Aislamiento de datos por cuenta
- **Carrito:** persiste en `localStorage` con clave `cart_<userId>`
- **Build del configurador:** persiste en `localStorage` con clave `pc_build_<userId>`
- Al hacer logout la memoria se limpia; al volver a loguear se restaura el estado
- Los usuarios guest (no autenticados) no tienen persistencia

---

## Configurador de PC

El configurador permite armar una PC desde 8 slots de componentes:

| Slot | Categoría en BD | Obligatorio |
|---|---|---|
| CPU | `procesadores` | ✅ |
| Placa madre | `placas-madre` | ✅ |
| RAM | `memorias-ram` | ✅ |
| GPU | `tarjetas-de-video` | ✅ |
| Almacenamiento | `almacenamiento` | ✅ |
| Fuente de poder | `fuentes-de-poder` | ✅ |
| Gabinete | `gabinetes` | ✅ |
| Cooling | `enfriamiento` | No |

Los componentes se cargan dinámicamente de la API — agregar un producto  
en el panel admin con la categoría correcta es suficiente para que aparezca en el configurador.

**Compatibilidad:** El sistema verifica socket CPU-Placa madre, tipo de RAM,  
TDP vs wattaje de la fuente y form factor del gabinete.

**Presets:** 3 builds predefinidos (Gaming Extremo, Workstation Pro, Budget Build)  
generados con los productos reales de la BD.

---

## Setup local

### Prerrequisitos
- Node.js ≥ 18
- PostgreSQL corriendo localmente
- (Opcional) cuenta de Gmail para envío de emails

### Backend

```bash
cd techstore-api

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL, JWT_SECRET y datos de SMTP

# 3. Ejecutar migraciones y seed
npx prisma migrate dev
node prisma/seed.js

# 4. Iniciar en desarrollo
npm run dev
```

La API queda en `http://localhost:3001`.  
Credenciales del admin por defecto: `admin@techstore.com / admin123`

### Frontend

```bash
cd techstore-frontend

# 1. Instalar dependencias
npm install

# 2. Variables de entorno (opcional — apunta a localhost:3001 por defecto)
echo 'VITE_API_URL=http://localhost:3001/api' > .env

# 3. Iniciar en desarrollo
npm run dev
```

La app queda en `http://localhost:5173`.

---

## Variables de entorno

### Backend (`.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexión PostgreSQL | `postgresql://user:pass@localhost:5432/techstore` |
| `JWT_SECRET` | Clave secreta para firmar tokens | String aleatorio ≥ 32 chars |
| `JWT_EXPIRES_IN` | Duración del token | `7d` |
| `CLIENT_URL` | URL del frontend (CORS) | `http://localhost:5173` |
| `NODE_ENV` | Entorno | `development` / `production` |
| `TAX_RATE` | IVA (opcional, default 0.19) | `0.19` |
| `SHIPPING_COST` | Costo de envío (opcional, default 24.99) | `24.99` |
| `FREE_SHIPPING_THRESHOLD` | Umbral envío gratis (opcional, default 150) | `150` |
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_USER` | Email remitente | `tu@gmail.com` |
| `SMTP_PASS` | Contraseña de aplicación | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Nombre y email del remitente | `TechStore <tu@gmail.com>` |
| `GOOGLE_CLIENT_ID` | ID de cliente OAuth Google (opcional) | — |

### Frontend (`.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:3001/api` |

---

## Evaluación SQuaRE

El proyecto fue evaluado con el **Modelo de Usabilidad SQuaRE (ISO/IEC 25010)**  
en el archivo `Calidad del Software Workshop - Final.xlsx`.

### Resultados obtenidos

| Característica | Puntaje | Cumplimiento |
|---|---|---|
| Facilidad de entendimiento | 8.44 / 10 | 84.4% |
| Facilidad de aprendizaje | 8.58 / 10 | 85.8% |
| Facilidad de uso | 6.48 / 10 | 64.8% |
| Facilidad de ayuda | 6.75 / 10 | 67.5% |
| Accesibilidad técnica | 8.20 / 10 | 82.0% |
| Grado de atracción | 8.80 / 10 | 88.0% |
| Adherencia a normas | 4.33 / 10 | 43.3% |
| Efectividad en uso | 7.50 / 10 | 75.0% |
| Eficiencia en uso | 8.00 / 10 | 80.0% |
| Satisfacción en uso | 8.92 / 10 | 89.2% |
| Usabilidad adherida a normas | 6.67 / 10 | 66.7% |

**Total usabilidad SQuaRE: 7.39 / 10**

La baja puntuación en "Adherencia a normas" se explica por que criterios como  
"conformidad a portales gubernamentales" y "gobierno en línea" no aplican  
al modelo de negocio de una tienda de componentes PC.

---

## Autores

Proyecto académico — Ingeniería de Sistemas  
Asignatura: Calidad del Software
