// ─── PasswordService — S: una sola responsabilidad: hash y comparación ──────────
// D: los servicios de negocio dependen de este contrato, no de bcrypt directamente.
// Para cambiar el algoritmo de hashing basta con modificar este archivo.

import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export const PasswordService = {
  async hash(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS)
  },

  async compare(plain, hashed) {
    return bcrypt.compare(plain, hashed)
  },

  // Genera una contraseña aleatoria inutilizable (para usuarios OAuth)
  generateRandom() {
    return Math.random().toString(36) + Date.now().toString(36)
  },
}
