import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env")
  process.exit(1)
}

const regions = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North"
];

async function seed() {
  console.log("Seeding regions...");
  for (const name of regions) {
    const id = crypto.randomUUID();
    const res = await fetch(`${supabaseUrl}/rest/v1/regions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ id, name })
    });
    
    if (!res.ok) {
      const error = await res.json();
      if (error.code === '23505') {
        console.log(`Region ${name} already exists, skipping.`);
      } else {
        console.error(`Failed to insert ${name}:`, error.message || JSON.stringify(error));
      }
    } else {
      console.log(`Inserted: ${name}`);
    }
  }
  console.log("Done seeding regions.");
}

seed();
