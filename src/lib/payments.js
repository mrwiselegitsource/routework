// Payment is intentionally mocked end to end. Per Section 8 of the build
// guide, the real flow is:
//   POST /api/orders/:orderId/pay        → Express, initiates a Paystack charge
//   POST /api/webhooks/paystack          → Express, verifies + marks order paid
// Neither exists yet, and that's fine — nothing else in the app depends on
// them being real. `simulatePayment` below stands in for both: it marks the
// order paid locally (or in Supabase, if configured) after a short delay,
// with a clearly-fake reference so it's never mistaken for a real charge.
//
// To go live: replace the body of `simulatePayment` with a call to the
// Express endpoint above, and delete the "mock" language from Track.jsx.
import { db } from './db'

export const PAYMENTS_ARE_MOCKED = true

export async function simulatePayment(orderId) {
  await new Promise((resolve) => setTimeout(resolve, 900)) // stand-in for network + webhook round trip
  const reference = `MOCK-PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  return db.updatePaymentStatus(orderId, 'paid', reference)
}
