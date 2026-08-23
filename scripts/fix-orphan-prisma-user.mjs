import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// This script fixes the Prisma user record that has lineId set
// but the corresponding Supabase auth user was deleted externally.
// It anonymizes the lineId so the user can re-register.

const lineIdToFix = 'u5976c4328df7e2c7e2ff291ddc70d8f3';

async function main() {
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { Pool } = await import('pg');
  const { PrismaClient } = await import('../app/generated/prisma/index.js');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  const user = await (prisma as any).user.findFirst({ where: { lineId: lineIdToFix } });
  if (!user) {
    console.log("User not found with lineId:", lineIdToFix);
    await pool.end();
    return;
  }
  console.log("Found user:", user.id, user.email);

  const randomSuffix = Math.random().toString(36).substring(7);
  await (prisma as any).user.update({
    where: { id: user.id },
    data: {
      lineId: null,
      email: `deleted-${randomSuffix}@example.com`,
    }
  });
  console.log("Anonymized successfully. User can now re-register.");
  await pool.end();
}

main();
