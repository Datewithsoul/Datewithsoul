import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function main() {
  let page = 1;
  let allUsers: any[] = [];
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.error(error);
      break;
    }
    allUsers.push(...data.users);
    if (data.users.length < 1000) break;
    page++;
  }
  
  const orphaned = allUsers.filter(u => u.email && u.email.includes('@line.datewithsoul.local'));
  console.log("Orphaned LINE users in Auth:", orphaned.map(u => ({ id: u.id, email: u.email })));
}

main();
