# Mensaje de commit final

Copia y pega esto en la terminal:

```bash
cd C:\Users\sebas\Downloads\TechStore_v4

git add .

git commit -m "docs: documentación final y cierre del proyecto académico

Documentación completa agregada para el cierre del proyecto TechStore v4.

README.md — nuevo archivo con:
  - Descripción del proyecto y stack tecnológico completo
  - Diagrama de arquitectura de directorios
  - Reglas de negocio implementadas (IVA, envío, reordenar, imágenes, aislamiento por cuenta)
  - Tabla de slots del configurador y cómo funciona dinámicamente
  - Instrucciones de setup local paso a paso
  - Variables de entorno documentadas (backend y frontend)
  - Resultados de evaluación SQuaRE con tabla de puntajes

Comentarios internos — añadidos o mejorados en:
  Backend:
    - server.js: secciones numeradas y explicadas (trust proxy, helmet, CORS, rate limit, etc.)
    - auth.service.js: flujo de 2 pasos documentado, decisiones de diseño SOLID
    - auth.validators.js: reglas de validación explicadas por campo
    - order.service.js: transacción ACID documentada, cálculo de totales explicado
    - promo.service.js: reemplaza PROMO_CODES hardcodeado, ahora gestionado desde admin
    - product.service.js: lógica de includeInactive y filtrado por isActive documentada
    - image.service.js: diferencia dev/prod (disco vs Data URL) explicada
    - upload.controller.js: por qué memoryStorage y no diskStorage
    - AppError.js: jerarquía de errores con principio Open/Closed
    - auth.middleware.js: estrategia dual cookie+header explicada
    - TokenService.js: por qué httpOnly y cuándo usar sameSite:none
    - PasswordService.js: timing attack en login explicado

  Frontend:
    - AuthContext.jsx: flujo de 2 pasos, API pública documentada
    - CartContext.jsx: estrategia de persistencia por usuario documentada
    - cartService.js: regla de envío vacío, cálculo de totales
    - PCConfigurator.jsx: SLOT_TO_CATEGORY, EXTRA_META, buildKey por usuario
    - MyOrders.jsx: lógica de reordenar por estado, STATUS_CONFIG
    - configurator.js: SLOTS, checkCompatibility, calcBuildScore explicados

Archivos de configuración:
  - vercel.json (API y frontend)
  - .env.example (API y frontend)
  - .gitignore actualizado con uploads/

Evaluación académica:
  - Calidad del Software Workshop - Final.xlsx completado con 93 evaluaciones
    basadas en el estado real del proyecto (puntaje total: 7.39/10 SQuaRE)

BREAKING: ninguno — solo documentación y comentarios, sin cambios de lógica."

git push origin main
```
