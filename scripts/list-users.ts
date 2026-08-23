import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function main() {
  // Check if there are orphaned users remaining after our cleanup
  let allUsers: any[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data) break;
    allUsers.push(...data.users);
    if (data.users.length < 1000) break;
    page++;
  }
  
  const lineUsers = allUsers.filter(u => u.email && u.email.includes('@line.datewithsoul.local'));
  console.log("LINE auth users:", lineUsers.map(u => ({ id: u.id, email: u.email, created_at: u.created_at })));
  console.log("Total auth users:", allUsers.length);
}

main();
