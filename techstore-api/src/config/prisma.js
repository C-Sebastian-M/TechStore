import { PrismaClient } from '@prisma/client'

// Patrón Singleton: una sola instancia de PrismaClient en toda la app
// En desarrollo Node --watch reinicia el proceso, esto evita conexiones duplicadas

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
})

export default prisma
