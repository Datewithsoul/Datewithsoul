import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// Check if this auth user ID already has a row in public.User (Prisma)
async function main() {
  const orphanId = '5c44aa60-4420-4466-b49e-1d6192e2fb59';
  const orphanEmail = 'u5976c4328df7e2c7e2ff291ddc70d8f3@line.datewithsoul.local';
  const lineId = 'u5976c4328df7e2c7e2ff291ddc70d8f3';

  console.log("Deleting orphan auth user:", orphanId);
  const { error } = await supabaseAdmin.auth.admin.deleteUser(orphanId);
  if (error) console.error("Error:", error);
  else console.log("Deleted successfully");
}

main();
