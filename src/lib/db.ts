import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Force a completely fresh connection every time in development
const createPrismaClient = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    __internal: {
      engine: {
        connectionLimit: 1
      }
    }
  } as any)
}

// Always create fresh client to avoid cached readonly connections
export const db = createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  // Disconnect old client if exists
  if (globalForPrisma.prisma) {
    globalForPrisma.prisma.$disconnect().catch(() => {})
  }
  globalForPrisma.prisma = db
}
