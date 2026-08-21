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
    const { cartId, customerPhone, messageBody, imageUrls } = await req.json()

    // 1. Authenticate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    if (!customerPhone) throw new Error('Customer phone is required for cart reminders')

    // Prepare message
    let finalMessage = messageBody || "Hi! You left some items in your RouteWorks cart. Don't forget to complete your purchase!";
    
    // Twilio supports MMS (sending images) in US/Canada. For global SMS, we usually append image links.
    if (imageUrls && imageUrls.length > 0) {
      finalMessage += `\nCheck it out here: ${imageUrls[0]}`
    }

    // Send SMS via Twilio
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
      const twilioParams = new URLSearchParams()
      twilioParams.append('To', customerPhone)
      twilioParams.append('From', TWILIO_PHONE_NUMBER)
      twilioParams.append('Body', finalMessage)
      
      // If we wanted to send actual MMS (media):
      // if (imageUrls && imageUrls.length > 0) { twilioParams.append('MediaUrl', imageUrls[0]) }

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
      console.warn('Twilio credentials not found. Abandoned cart reminder skipped.')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Cart reminder sent' }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, status: 200 }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
