const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function test() {
  console.log("URL:", process.env.SUPABASE_URL);
  console.log("KEY exists:", !!process.env.SUPABASE_SECRET_KEY);
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  );

  const { data, error } = await supabase.storage.getBucket('class-media');
  console.log("Bucket:", data, error);
}

test();
