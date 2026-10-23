import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;

const createPrismaClient = () => new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString })) });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientClass: typeof PrismaClient | undefined;
};

// In dev the client is cached on globalThis to survive hot reloads. After
// `prisma generate` the PrismaClient class is a new module, so a cached
// instance from the old class would reject new fields; replace it.
const isStale = globalForPrisma.prismaClientClass !== PrismaClient;
const disconnectStaleClient = async (client: PrismaClient) => {
  try {
    await client.$disconnect();
  } catch {
    // Old connections close on their own; nothing to recover
  }
};
if (globalForPrisma.prisma && isStale) void disconnectStaleClient(globalForPrisma.prisma);

export const prisma =
  (!isStale && globalForPrisma.prisma) || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaClientClass = PrismaClient;
}
