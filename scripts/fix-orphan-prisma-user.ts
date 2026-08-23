import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const lineIdToFix = 'u5976c4328df7e2c7e2ff291ddc70d8f3';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// Use fetch directly to call Supabase REST API to update the user
async function main() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/User?lineId=eq.${lineIdToFix}`;
  const randomSuffix = Math.random().toString(36).substring(7);
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SECRET_KEY!,
      'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY!}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      lineId: null,
      email: `deleted-${randomSuffix}@example.com`
    })
  });
  
  const result = await response.json();
  console.log("Result:", result);
}

main();
