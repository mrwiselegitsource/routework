import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("No creds");
  process.exit(1);
}

async function check() {
  const regRes = await fetch(`${supabaseUrl}/rest/v1/regions`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const regions = await regRes.json();
  
  const puRes = await fetch(`${supabaseUrl}/rest/v1/pickup_points`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const pickups = await puRes.json();
  
  console.log("Regions:");
  console.table(regions);
  
  console.log("Pickups:");
  console.table(pickups);
}
check();
