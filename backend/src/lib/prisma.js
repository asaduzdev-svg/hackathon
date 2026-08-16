import { PrismaClient } from '@prisma/client'

// Serverless (Vercel) muhitida global hot-swap muammosini oldini olish.
// Aks holda har bir invocation yangi connection ochib, tezda DB pool tugaydi.
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma
}
