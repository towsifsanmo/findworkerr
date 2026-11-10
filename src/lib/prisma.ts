import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';


const connectionString =
  process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  __connStr: string | undefined;
};

// If previously cached pool was created with a different or obsolete connection string, reset it
if (globalForPrisma.pgPool && globalForPrisma.__connStr !== connectionString) {
  try {
    globalForPrisma.pgPool.end();
  } catch (e) {}
  globalForPrisma.pgPool = undefined;
  globalForPrisma.prisma = undefined;
}
globalForPrisma.__connStr = connectionString;

export const pool = globalForPrisma.pgPool ?? new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pool;
}

export default prisma;

