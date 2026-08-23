import { prisma } from '../lib/prisma';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    const users = await prisma.$queryRaw`SELECT id, email FROM auth.users LIMIT 5`;
    console.log("USERS:", users);
  } catch (err) {
    console.error("Prisma error:", err);
  }
}

main().finally(() => prisma.$disconnect());
