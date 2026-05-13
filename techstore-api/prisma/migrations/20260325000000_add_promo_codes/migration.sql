-- Tabla de códigos promocionales administrables desde el panel
-- Reemplaza el objeto literal hardcodeado en order.service.js
CREATE TABLE "promo_codes" (
  "id"         TEXT NOT NULL,
  "code"       TEXT NOT NULL,
  "discount"   DOUBLE PRECISION NOT NULL,
  "isActive"   BOOLEAN NOT NULL DEFAULT true,
  "maxUses"    INTEGER,
  "usedCount"  INTEGER NOT NULL DEFAULT 0,
  "expiresAt"  TIMESTAMP(3),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- Migrar los códigos existentes hardcodeados
INSERT INTO "promo_codes" ("id", "code", "discount", "isActive", "updatedAt") VALUES
  (gen_random_uuid()::text, 'TECHSTORE10', 0.10, true, NOW()),
  (gen_random_uuid()::text, 'BIENVENIDO',  0.15, true, NOW()),
  (gen_random_uuid()::text, 'GAMING2025',  0.05, true, NOW());
