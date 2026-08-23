import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Clean up orphaned/test records that block re-registration
// These are Prisma User rows with no corresponding auth.users

const orphanedIds = [
  '2858b297-9fce-4361-95e5-813e9499463c', // email: u55fbfe...@line (blocks Sirikarn re-register)
  '5c44aa60-4420-4466-b49e-1d6192e2fb59', // email: u5976c...@line (blocks other user)
  '34accb2f-4094-47dd-8ca2-f8defb2aad1e', // testuser123@line (test data)
  '3eefcb48-a480-4780-aae2-36623e8835ce', // testdelete...@line (test data)
  '9bd716cc-5c99-423b-925d-d038408aa44f', // Sirikarn - auth user deleted, lineId still set
];

async function main() {
  for (const id of orphanedIds) {
    const randomSuffix = Math.random().toString(36).substring(7);
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/User?id=eq.${id}`;
    
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
        email: `deleted-${randomSuffix}@example.com`,
      })
    });
    
    const result = await response.json();
    console.log(`${id}:`, result.length > 0 ? `anonymized (${result[0].name})` : 'not found');
  }
  console.log("\nDone! All orphaned records cleaned up.");
}

main();
