-- Agregar campo googleAuth a usuarios
-- Identifica cuentas creadas con Google OAuth (no tienen contraseña real)
ALTER TABLE "users" ADD COLUMN "googleAuth" BOOLEAN NOT NULL DEFAULT false;
