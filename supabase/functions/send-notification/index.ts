import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { orderId, type, message, customerPhone } = await req.json()

    // 1. Authenticate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 2. Fetch Customer Phone if not provided
    let phone = customerPhone
    if (!phone) {
      const { data: order } = await supabaseClient.from('orders').select('recipient_phone').eq('order_id', orderId).single()
      phone = order?.recipient_phone
    }

    if (!phone) throw new Error('No phone number available to send SMS')

    // 3. Send SMS via Twilio
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
      const twilioParams = new URLSearchParams()
      twilioParams.append('To', phone)
      twilioParams.append('From', TWILIO_PHONE_NUMBER)
      twilioParams.append('Body', message)

      const twilioRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
        },
        body: twilioParams.toString()
      })

      if (!twilioRes.ok) {
        throw new Error(`Twilio Error: ${await twilioRes.text()}`)
      }
    } else {
      console.warn('Twilio credentials not found. Notification skipped in development.')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, status: 200 }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
