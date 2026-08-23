import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function main() {
  // Test: try to create a test user and see exact error
  const testEmail = `testdelete${Date.now()}@line.datewithsoul.local`;
  console.log("Creating test user:", testEmail);
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: 'testPassword123',
    email_confirm: true,
    user_metadata: { name: 'Test User', avatar_url: '' }
  });

  if (error) {
    console.error("EXACT ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS, user id:", data.user.id);
    // cleanup
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    if (delErr) console.error("Cleanup error:", delErr);
    else console.log("Cleanup done");
  }
}

main();
