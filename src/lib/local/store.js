// Local test backend — a tiny localStorage-backed "database" that mirrors
// the Supabase schema in Section 4 of the build guide field-for-field.
// This exists purely so the app is testable end to end before a real
// Supabase project exists. Nothing here is meant to ship — swap
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env and db.js routes
// every call to the real backend instead, with zero component changes.

const PREFIX = 'routeworks_local_'
const KEYS = {
  profiles: `${PREFIX}profiles`,
  orders: `${PREFIX}orders`,
  events: `${PREFIX}tracking_events`,
  activity: `${PREFIX}activity_log`,
  media: `${PREFIX}order_media`,
  news: `${PREFIX}news`,
  page_views: `${PREFIX}page_views`,
  session: `${PREFIX}session`,
  seeded: `${PREFIX}seeded_v1`,
}

export function uid(prefix = '') {
  const rand = Math.random().toString(36).slice(2, 10)
  return prefix ? `${prefix}_${rand}` : rand
}

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const table = {
  get profiles() { return read(KEYS.profiles) },
  set profiles(v) { write(KEYS.profiles, v) },
  get orders() { return read(KEYS.orders) },
  set orders(v) { write(KEYS.orders, v) },
  get events() { return read(KEYS.events) },
  set events(v) { write(KEYS.events, v) },
  get activity() { return read(KEYS.activity) },
  set activity(v) { write(KEYS.activity, v) },
  get media() { return read(KEYS.media) },
  set media(v) { write(KEYS.media, v) },
  get news() { return read(KEYS.news) },
  set news(v) { write(KEYS.news, v) },
  get page_views() { return read(KEYS.page_views) },
  set page_views(v) { write(KEYS.page_views, v) },
}

export function getSession() {
  try {
    const raw = localStorage.getItem(KEYS.session)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(session) {
  if (session) localStorage.setItem(KEYS.session, JSON.stringify(session))
  else localStorage.removeItem(KEYS.session)
}

function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

// Seeds enough data to exercise every screen: an in-transit unpaid order,
// one that's arrived and ready to pay, one fully delivered/paid, and one
// sitting in an exception state — plus two staff logins.
export function seedIfEmpty() {
  if (localStorage.getItem(KEYS.seeded)) return

  const admin = {
    id: 'seed-admin',
    name: 'Ama Owusu',
    phone: '+233 24 000 0001',
    email: 'admin@routeworks.test',
    role: 'admin',
    active: true,
    created_at: hoursAgo(24 * 30),
    _password: 'admin123',
  }
  const staff = {
    id: 'seed-staff',
    name: 'Kojo Mensah',
    phone: '+233 24 000 0002',
    email: 'staff@routeworks.test',
    role: 'staff',
    active: true,
    created_at: hoursAgo(24 * 20),
    _password: 'staff123',
  }
  table.profiles = [admin, staff]

  const orders = [
    {
      order_id: 'RW-DEMO01',
      item_name: 'MacBook Air 13"',
      description: 'Laptop, forwarded from a US warehouse.',
      image_url: '',
      sender_name: 'Jane (Amazon US)',
      sender_country: 'United States',
      amount_due: 450,
      currency: 'GHS',
      current_status: 'in_transit',
      current_location: 'In transit — Accra-bound flight',
      estimated_delivery: null,
      support_phone: '+233 24 000 0001',
      payment_status: 'unpaid',
      payment_reference: null,
      recipient_name: '',
      recipient_phone: '',
      recipient_address: '',
      recipient_region: '',
      created_by: admin.id,
      created_at: hoursAgo(72),
    },
    {
      order_id: 'RW-DEMO02',
      item_name: 'Skincare bundle',
      description: 'Small parcel, cleared and released — ready for payment.',
      image_url: '',
      sender_name: 'Sephora US',
      sender_country: 'United States',
      amount_due: 180,
      currency: 'GHS',
      current_status: 'released_from_customs',
      current_location: 'RouteWorks hub, Accra',
      estimated_delivery: null,
      support_phone: '+233 24 000 0001',
      payment_status: 'unpaid',
      payment_reference: null,
      recipient_name: '',
      recipient_phone: '',
      recipient_address: '',
      recipient_region: '',
      created_by: admin.id,
      created_at: hoursAgo(48),
    },
    {
      order_id: 'RW-DEMO03',
      item_name: 'Phone case (bulk, x20)',
      description: 'Delivered and paid — full happy-path example.',
      image_url: '',
      sender_name: 'CaseMate',
      sender_country: 'United Kingdom',
      amount_due: 210,
      currency: 'GHS',
      current_status: 'delivered',
      current_location: 'Delivered to recipient',
      estimated_delivery: null,
      support_phone: '+233 24 000 0001',
      payment_status: 'paid',
      payment_reference: 'MOCK-PAY-9F21A',
      recipient_name: 'Esi Boateng',
      recipient_phone: '+233 20 111 2222',
      recipient_address: '12 Ring Road Close',
      recipient_region: 'Greater Accra',
      created_by: staff.id,
      created_at: hoursAgo(120),
    },
    {
      order_id: 'RW-DEMO04',
      item_name: 'Auto parts (brake pads)',
      description: 'Flagged by customs — exception-state example.',
      image_url: '',
      sender_name: 'AutoZone US',
      sender_country: 'United States',
      amount_due: 320,
      currency: 'GHS',
      current_status: 'held_by_customs',
      current_location: 'Kotoka customs bay',
      estimated_delivery: null,
      support_phone: '+233 24 000 0001',
      payment_status: 'unpaid',
      payment_reference: null,
      recipient_name: '',
      recipient_phone: '',
      recipient_address: '',
      recipient_region: '',
      created_by: admin.id,
      created_at: hoursAgo(96),
    },
  ]
  table.orders = orders

  const events = [
    // RW-DEMO01 — in transit
    { id: uid('ev'), order_id: 'RW-DEMO01', status: 'order_confirmed', location: 'Origin warehouse, USA', description: 'Order confirmed and queued for prep.', event_time: hoursAgo(70), added_by: admin.id },
    { id: uid('ev'), order_id: 'RW-DEMO01', status: 'package_prepared', location: 'Origin warehouse, USA', description: 'Package weighed and boxed.', event_time: hoursAgo(65), added_by: admin.id },
    { id: uid('ev'), order_id: 'RW-DEMO01', status: 'picked_up', location: 'Origin warehouse, USA', description: 'Picked up by carrier.', event_time: hoursAgo(60), added_by: admin.id },
    { id: uid('ev'), order_id: 'RW-DEMO01', status: 'departed_origin', location: 'JFK Airport, USA', description: 'Departed origin country.', event_time: hoursAgo(40), added_by: staff.id },
    { id: uid('ev'), order_id: 'RW-DEMO01', status: 'in_transit', location: 'In transit — Accra-bound flight', description: 'En route to Ghana.', event_time: hoursAgo(10), added_by: staff.id },

    // RW-DEMO02 — arrived, ready to pay
    { id: uid('ev'), order_id: 'RW-DEMO02', status: 'order_confirmed', location: 'Origin warehouse, USA', description: 'Order confirmed.', event_time: hoursAgo(46), added_by: admin.id },
    { id: uid('ev'), order_id: 'RW-DEMO02', status: 'in_transit', location: 'In transit', description: 'En route to Ghana.', event_time: hoursAgo(30), added_by: admin.id },
    { id: uid('ev'), order_id: 'RW-DEMO02', status: 'arrived_destination', location: 'Kotoka International Airport', description: 'Arrived in destination country.', event_time: hoursAgo(20), added_by: staff.id },
    { id: uid('ev'), order_id: 'RW-DEMO02', status: 'customs_clearance', location: 'Kotoka customs bay', description: 'Undergoing customs clearance.', event_time: hoursAgo(12), added_by: staff.id },
    { id: uid('ev'), order_id: 'RW-DEMO02', status: 'released_from_customs', location: 'RouteWorks hub, Accra', description: 'Cleared and released — awaiting payment.', event_time: hoursAgo(4), added_by: staff.id },

    // RW-DEMO03 — delivered
    { id: uid('ev'), order_id: 'RW-DEMO03', status: 'order_confirmed', location: 'Origin warehouse, UK', description: 'Order confirmed.', event_time: hoursAgo(118), added_by: staff.id },
    { id: uid('ev'), order_id: 'RW-DEMO03', status: 'in_transit', location: 'In transit', description: 'En route to Ghana.', event_time: hoursAgo(90), added_by: staff.id },
    { id: uid('ev'), order_id: 'RW-DEMO03', status: 'released_from_customs', location: 'RouteWorks hub, Accra', description: 'Cleared and released.', event_time: hoursAgo(60), added_by: staff.id },
    { id: uid('ev'), order_id: 'RW-DEMO03', status: 'out_for_delivery', location: 'Accra', description: 'Out for delivery.', event_time: hoursAgo(30), added_by: staff.id },
    { id: uid('ev'), order_id: 'RW-DEMO03', status: 'delivered', location: 'Ring Road Close, Accra', description: 'Delivered and signed for.', event_time: hoursAgo(28), added_by: staff.id },

    // RW-DEMO04 — held by customs
    { id: uid('ev'), order_id: 'RW-DEMO04', status: 'order_confirmed', location: 'Origin warehouse, USA', description: 'Order confirmed.', event_time: hoursAgo(94), added_by: admin.id },
    { id: uid('ev'), order_id: 'RW-DEMO04', status: 'in_transit', location: 'In transit', description: 'En route to Ghana.', event_time: hoursAgo(70), added_by: admin.id },
    { id: uid('ev'), order_id: 'RW-DEMO04', status: 'arrived_destination', location: 'Kotoka International Airport', description: 'Arrived in destination country.', event_time: hoursAgo(50), added_by: staff.id },
    { id: uid('ev'), order_id: 'RW-DEMO04', status: 'held_by_customs', location: 'Kotoka customs bay', description: 'Held pending additional documentation.', event_time: hoursAgo(20), added_by: staff.id },
  ]
  table.events = events

  table.activity = [
    { id: uid('act'), user_id: admin.id, order_id: 'RW-DEMO01', action: 'created_order', created_at: hoursAgo(70) },
    { id: uid('act'), user_id: staff.id, order_id: 'RW-DEMO02', action: 'updated_status', created_at: hoursAgo(4) },
    { id: uid('act'), user_id: staff.id, order_id: 'RW-DEMO03', action: 'updated_status', created_at: hoursAgo(28) },
  ]

  table.media = [
    { id: uid('med'), order_id: 'RW-DEMO01', media_type: 'image', storage_path: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&w=800&q=80', created_at: hoursAgo(70) },
    { id: uid('med'), order_id: 'RW-DEMO01', media_type: 'image', storage_path: 'https://images.unsplash.com/photo-1522273400909-fd1a8f77637e?ixlib=rb-4.0.3&w=800&q=80', created_at: hoursAgo(70) },
    { id: uid('med'), order_id: 'RW-DEMO01', media_type: 'video', storage_path: 'https://www.w3schools.com/html/mov_bbb.mp4', created_at: hoursAgo(69) },
  ]

  table.news = [
    {
      id: uid('news'),
      title: 'Ghana Post Expands E-Commerce Logistics',
      excerpt: 'We are thrilled to announce a new suite of e-commerce delivery solutions tailored for local SMEs.',
      content: 'We are thrilled to announce a new suite of e-commerce delivery solutions tailored for local SMEs. This expansion includes discounted bulk shipping rates, seamless API integrations for popular e-commerce platforms, and dedicated account managers for businesses shipping over 100 parcels a month.',
      image_url: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-4.0.3&w=800&q=80',
      created_at: hoursAgo(24 * 5),
      author_id: admin.id
    },
    {
      id: uid('news'),
      title: 'New Tracking System Goes Live',
      excerpt: 'Experience real-time package tracking with our newly upgraded RouteWorks platform.',
      content: 'Experience real-time package tracking with our newly upgraded RouteWorks platform. Customers can now see exact timestamps, locations, and even photos of their packages at key transit hubs.',
      image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&w=800&q=80',
      created_at: hoursAgo(24 * 12),
      author_id: admin.id
    },
    {
      id: uid('news'),
      title: 'Holiday Shipping Deadlines',
      excerpt: 'Make sure your gifts arrive on time! Review our holiday shipping deadlines.',
      content: 'Make sure your gifts arrive on time! Review our holiday shipping deadlines. Standard shipping cutoff is Dec 15th, while express delivery cutoff is Dec 21st.',
      image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?ixlib=rb-4.0.3&w=800&q=80',
      created_at: hoursAgo(24 * 20),
      author_id: staff.id
    }
  ]

  table.page_views = [
    { id: uid('pv'), path: '/', timestamp: hoursAgo(2), session_id: 'mock-session-1' },
    { id: uid('pv'), path: '/track', timestamp: hoursAgo(1), session_id: 'mock-session-2' },
    { id: uid('pv'), path: '/contact', timestamp: hoursAgo(5), session_id: 'mock-session-3' },
    { id: uid('pv'), path: '/', timestamp: hoursAgo(24), session_id: 'mock-session-4' },
    { id: uid('pv'), path: '/services', timestamp: hoursAgo(48), session_id: 'mock-session-5' },
  ]

  localStorage.setItem(KEYS.seeded, '1')
}

export function resetLocalData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  seedIfEmpty()
}
