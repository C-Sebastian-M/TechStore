-- Agregar contador de intentos fallidos a email_verifications
-- Previene ataques de fuerza bruta sobre el código de 6 dígitos
ALTER TABLE "email_verifications" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
