// Local test backend's data layer. Same field names as the Postgres
// schema in Section 4 so the shape of the data is identical to what the
// real Supabase backend will return — only the storage mechanism differs.
import { table, uid, seedIfEmpty } from './store'

const EXCEPTION_STATUSES = ['delivery_attempt_failed', 'held_by_customs', 'address_issue', 'returned_to_sender']

function generateOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return `RW-${id}`
}

function sortByEventTimeDesc(a, b) {
  return new Date(b.event_time) - new Date(a.event_time)
}

function logActivity(userId, orderId, action) {
  table.activity = [{ id: uid('act'), user_id: userId, order_id: orderId, action, created_at: new Date().toISOString() }, ...table.activity]
}

export const localDb = {
  init() {
    seedIfEmpty()
  },

  async getOrders() {
    return [...table.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  async getOrder(orderId) {
    return table.orders.find((o) => o.order_id === orderId) ?? null
  },

  // Recipient-safe subset only — mirrors the `public_order_lookup` view
  // (Section 8) so /track never sees internal fields even in local mode.
  async getPublicOrder(orderId) {
    const o = table.orders.find((ord) => ord.order_id === orderId)
    if (!o) return null
    const {
      order_id, item_name, description, image_url, sender_name, sender_country,
      amount_due, currency, current_status, current_location, estimated_delivery,
      support_phone, payment_status, recipient_name,
    } = o
    return {
      order_id, item_name, description, image_url, sender_name, sender_country,
      amount_due, currency, current_status, current_location, estimated_delivery,
      support_phone, payment_status, recipient_name,
    }
  },

  async getTrackingEvents(orderId) {
    return table.events.filter((e) => e.order_id === orderId).sort(sortByEventTimeDesc)
  },

  async createOrder(fields, createdBy) {
    const order = {
      order_id: generateOrderId(),
      description: '', image_url: '', sender_name: '', sender_country: '',
      currency: 'GHS', estimated_delivery: null, support_phone: '',
      current_status: 'order_confirmed', current_location: '',
      payment_status: 'unpaid', payment_reference: null,
      recipient_name: '', recipient_phone: '', recipient_address: '', recipient_region: '',
      ...fields,
      created_by: createdBy,
      created_at: new Date().toISOString(),
    }
    table.orders = [order, ...table.orders]
    logActivity(createdBy, order.order_id, 'created_order')
    return order
  },

  async addTrackingEvent(orderId, { status, location, description }, addedBy) {
    const event = {
      id: uid('ev'),
      order_id: orderId,
      status,
      location,
      description,
      event_time: new Date().toISOString(),
      added_by: addedBy,
    }
    table.events = [event, ...table.events]
    // Rule #5: status is a timeline of events, never an overwrite — the
    // orders row is only a cached copy of the latest event.
    table.orders = table.orders.map((o) =>
      o.order_id === orderId ? { ...o, current_status: status, current_location: location } : o
    )
    logActivity(addedBy, orderId, 'updated_status')
    return event
  },

  async submitDeliveryDetails(orderId, details) {
    table.orders = table.orders.map((o) => (o.order_id === orderId ? { ...o, ...details } : o))
    logActivity(null, orderId, 'submitted_delivery_details')
    return this.getOrder(orderId)
  },

  async updatePaymentStatus(orderId, status, reference) {
    table.orders = table.orders.map((o) =>
      o.order_id === orderId ? { ...o, payment_status: status, payment_reference: reference ?? o.payment_reference } : o
    )
    logActivity(null, orderId, status === 'paid' ? 'mock_payment_completed' : 'payment_status_changed')
    return this.getOrder(orderId)
  },

  async getStaff() {
    return [...table.profiles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  async setStaffActive(id, active) {
    table.profiles = table.profiles.map((p) => (p.id === id ? { ...p, active } : p))
    return table.profiles.find((p) => p.id === id)
  },

  async getActivityLog() {
    const byId = Object.fromEntries(table.profiles.map((p) => [p.id, p.name]))
    return [...table.activity]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 100)
      .map((entry) => ({ ...entry, profiles: { name: byId[entry.user_id] ?? 'System' } }))
  },

  async updateOrder(orderId, fields) {
    table.orders = table.orders.map((o) => (o.order_id === orderId ? { ...o, ...fields } : o))
    logActivity(null, orderId, 'updated_order')
    return this.getOrder(orderId)
  },

  async getOrderMedia(orderId) {
    return table.media.filter((m) => m.order_id === orderId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  },

  async uploadOrderMediaFile(orderId, file) {
    // In local mode, we just create a local object URL to simulate upload
    const url = URL.createObjectURL(file)
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
    return this.addOrderMedia(orderId, mediaType, url)
  },

  async addOrderMedia(orderId, mediaType, storagePath) {

    const media = {
      id: uid('med'),
      order_id: orderId,
      media_type: mediaType,
      storage_path: storagePath,
      created_at: new Date().toISOString()
    }
    table.media = [...table.media, media]
    logActivity(null, orderId, 'added_media')
    return media
  },

  async deleteOrderMedia(mediaId) {
    table.media = table.media.filter((m) => m.id !== mediaId)
  },

  async getDashboardStats() {
    const orders = table.orders
    return {
      total: orders.length,
      unpaid: orders.filter((o) => o.payment_status === 'unpaid').length,
      exceptions: orders.filter((o) => EXCEPTION_STATUSES.includes(o.current_status)).length,
      delivered: orders.filter((o) => o.current_status === 'delivered').length,
    }
  },

  // --- STAFF ---
  async addStaff(fields) {
    const newStaff = {
      id: uid('staff'),
      ...fields,
      active: true,
      created_at: new Date().toISOString()
    }
    table.profiles = [newStaff, ...table.profiles]
    return newStaff
  },

  // --- NEWS ---
  async getNews() {
    return [...table.news].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },
  
  async getNewsById(id) {
    return table.news.find((n) => n.id === id) ?? null
  },

  async addNews(fields, authorId) {
    const newsItem = {
      id: uid('news'),
      ...fields,
      author_id: authorId,
      created_at: new Date().toISOString()
    }
    table.news = [newsItem, ...table.news]
    return newsItem
  },

  async updateNews(id, fields) {
    table.news = table.news.map((n) => (n.id === id ? { ...n, ...fields } : n))
    return this.getNewsById(id)
  },

  async deleteNews(id) {
    table.news = table.news.filter((n) => n.id !== id)
  },

  // --- ANALYTICS ---
  async logPageView(path, sessionId = 'anon') {
    const pv = {
      id: uid('pv'),
      path,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    }
    table.page_views = [pv, ...table.page_views]
    return pv
  },

  async getTrafficStats() {
    const pvs = table.page_views
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const viewsToday = pvs.filter(pv => new Date(pv.timestamp) >= today).length
    const uniqueVisitors = new Set(pvs.map(pv => pv.session_id)).size

    // Get top pages
    const pathCounts = pvs.reduce((acc, pv) => {
      acc[pv.path] = (acc[pv.path] || 0) + 1
      return acc
    }, {})
    
    const topPages = Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, views]) => ({ path, views }))

    return {
      totalViews: pvs.length,
      viewsToday,
      uniqueVisitors,
      topPages
    }
  }
}
