import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/User?select=id,lineId,email,name`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': process.env.SUPABASE_SECRET_KEY!,
      'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY!}`,
    }
  });
  
  const result = await response.json();
  console.log("All users:", JSON.stringify(result, null, 2));
}

main();
