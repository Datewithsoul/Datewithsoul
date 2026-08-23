import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function main() {
  const usersToDelete = [
    '9bd716cc-5c99-423b-925d-d038408aa44f',
    '4e961d41-644e-46ec-bb11-2ad643525629'
  ];
  
  for (const id of usersToDelete) {
    console.log("Deleting", id);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) console.error("Error deleting", id, error);
    else console.log("Deleted", id);
  }
}

main();
