import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function run() {
  const { data, error } = await supabase.from('public_order_lookup').select('*').limit(1)
  console.log('Lookup:', data, error)
  const { data: o2, error: e2 } = await supabase.from('orders').select('*').limit(1)
  console.log('Orders:', o2, e2)
}
run()
