const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function test() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  );

  const fileBuffer = Buffer.from('test');
  const { data, error } = await supabase.storage
    .from('class-media')
    .upload('test/test.txt', fileBuffer, {
      upsert: true,
      contentType: 'text/plain'
    });
    
  console.log('Upload:', data, error);
  
  if (data) {
    const { data: publicUrlData } = supabase.storage
      .from('class-media')
      .getPublicUrl(data.path);
    console.log('Public URL:', publicUrlData);
  }
}

test();
