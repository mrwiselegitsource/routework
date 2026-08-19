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
    const EXCEPTION_STATUSES = ['delivery_attempt_failed', 'held_by_customs', 'address_issue', 'returned_to_sender']
    return {
      total: orders.length,
      unpaid: orders.filter((o) => o.payment_status === 'unpaid').length,
      exceptions: orders.filter((o) => EXCEPTION_STATUSES.includes(o.current_status)).length,
      delivered: orders.filter((o) => o.current_status === 'delivered').length,
      inTransit: orders.filter((o) => o.current_status === 'in_transit' || o.current_status === 'departed_origin').length,
      arrivingSoon: orders.filter((o) => o.current_status === 'arrived_destination' || o.current_status === 'released_from_customs').length,
      outForDelivery: orders.filter((o) => o.current_status === 'out_for_delivery').length,
      delayed: orders.filter((o) => o.current_status === 'delayed').length,
    }
  },


  // --- TRACKING SECURITY ---
  async generateTrackingPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let p1 = '', p2 = ''
    for (let i = 0; i < 4; i++) p1 += chars[Math.floor(Math.random() * chars.length)]
    for (let i = 0; i < 4; i++) p2 += chars[Math.floor(Math.random() * chars.length)]
    return `RW-${p1}-${p2}`
  },

  async verifyTrackingPassword(trackingNumber, password) {
    const o = table.orders.find((ord) => ord.order_id === trackingNumber)
    if (!o) return { success: false, locked: false, remainingAttempts: 0, lockedUntil: null }
    if (!o.tracking_protected) return { success: true, locked: false }

    const now = new Date()
    if (o.locked_until && new Date(o.locked_until) > now) {
      return { success: false, locked: true, remainingAttempts: 0, lockedUntil: o.locked_until }
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (o._tracking_password === password || btoa(password) === o.tracking_password_hash || hashHex === o.tracking_password_hash) {
      table.orders = table.orders.map((ord) => 
        ord.order_id === trackingNumber ? { ...ord, failed_attempts: 0, locked_until: null } : ord
      )
      return { success: true, locked: false }
    }

    const failed_attempts = (o.failed_attempts || 0) + 1
    const locked = failed_attempts >= 3
    const locked_until = locked ? new Date(now.getTime() + 15 * 60000).toISOString() : null
    table.orders = table.orders.map((ord) => 
      ord.order_id === trackingNumber ? { ...ord, failed_attempts, locked_until } : ord
    )

    return { 
      success: false, 
      locked, 
      remainingAttempts: Math.max(0, 3 - failed_attempts), 
      lockedUntil: locked_until 
    }
  },

  async getOrderSecurity(orderId) {
    const o = table.orders.find((ord) => ord.order_id === orderId)
    if (!o) return null
    return {
      protected: !!o.tracking_protected,
      failedAttempts: o.failed_attempts || 0,
      lockedUntil: o.locked_until,
      passwordCreatedAt: o.password_created_at
    }
  },

  async regenerateTrackingPassword(orderId) {
    const newPassword = await this.generateTrackingPassword()
    const encoder = new TextEncoder()
    const data = encoder.encode(newPassword)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    table.orders = table.orders.map((ord) => 
      ord.order_id === orderId ? { 
        ...ord, 
        _tracking_password: newPassword,
        tracking_password_hash: hashHex,
        password_created_at: new Date().toISOString(),
        failed_attempts: 0,
        locked_until: null
      } : ord
    )
    await this.addAuditLog({ actor: 'system', action: 'regenerated_password', resource: 'orders', resource_id: orderId, reason: 'Manual regeneration' })
    return newPassword
  },

  async getGuestOrderPreview(orderId) {
    const o = table.orders.find((ord) => ord.order_id === orderId)
    if (!o) return null
    const media = table.media.filter((m) => m.order_id === orderId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    return {
      order_id: o.order_id,
      item_name: o.item_name,
      current_status: o.current_status,
      current_location: o.current_location,
      estimated_delivery: o.estimated_delivery,
      preview_image: media.length > 0 ? (media.find(m => m.media_type === 'image')?.storage_path || media[0].storage_path) : null
    }
  },

  // --- REGIONS & DELIVERY ---
  async getRegions() { return [...table.regions] },
  async getPickupPoints(regionId) { 
    const pts = table.pickup_points
    return regionId ? pts.filter(p => p.region_id === regionId) : [...pts]
  },
  async getDeliveryPricing(regionId) {
    const prc = table.delivery_pricing
    return regionId ? prc.filter(p => p.region_id === regionId) : [...prc]
  },
  async addRegion(fields) {
    const r = { id: uid('reg'), ...fields, created_at: new Date().toISOString() }
    table.regions = [r, ...table.regions]
    return r
  },
  async updateRegion(id, fields) {
    table.regions = table.regions.map(r => r.id === id ? { ...r, ...fields } : r)
    return table.regions.find(r => r.id === id)
  },
  async addPickupPoint(fields) {
    const p = { id: uid('pu'), ...fields, created_at: new Date().toISOString() }
    table.pickup_points = [p, ...table.pickup_points]
    return p
  },
  async updatePickupPoint(id, fields) {
    table.pickup_points = table.pickup_points.map(p => p.id === id ? { ...p, ...fields } : p)
    return table.pickup_points.find(p => p.id === id)
  },
  async addDeliveryPricing(fields) {
    const p = { id: uid('prc'), ...fields, created_at: new Date().toISOString() }
    table.delivery_pricing = [p, ...table.delivery_pricing]
    return p
  },
  async updateDeliveryPricing(id, fields) {
    table.delivery_pricing = table.delivery_pricing.map(p => p.id === id ? { ...p, ...fields } : p)
    return table.delivery_pricing.find(p => p.id === id)
  },

  // --- CUSTOMERS ---
  async getCustomers() { return [...table.customers] },
  async getCustomer(id) { return table.customers.find(c => c.id === id) || null },
  async createCustomer(fields) {
    const c = { id: uid('cus'), ...fields, created_at: new Date().toISOString() }
    table.customers = [c, ...table.customers]
    return c
  },
  async updateCustomer(id, fields) {
    table.customers = table.customers.map(c => c.id === id ? { ...c, ...fields } : c)
    return table.customers.find(c => c.id === id)
  },

  // --- CART ---
  async getCart(customerId) {
    let cart = table.carts.find(c => c.customer_id === customerId)
    if (!cart) return { items: [] }
    const items = table.cart_items.filter(i => i.cart_id === cart.id)
    return { ...cart, items }
  },
  async addToCart(customerId, orderId) {
    let cart = table.carts.find(c => c.customer_id === customerId)
    if (!cart) {
      cart = { id: uid('crt'), customer_id: customerId, created_at: new Date().toISOString() }
      table.carts = [cart, ...table.carts]
    }
    const item = { id: uid('ci'), cart_id: cart.id, order_id: orderId, added_at: new Date().toISOString() }
    table.cart_items = [item, ...table.cart_items]
    return this.getCart(customerId)
  },
  async removeFromCart(customerId, orderId) {
    const cart = table.carts.find(c => c.customer_id === customerId)
    if (cart) {
      table.cart_items = table.cart_items.filter(i => !(i.cart_id === cart.id && i.order_id === orderId))
    }
    return this.getCart(customerId)
  },
  async clearCart(customerId) {
    const cart = table.carts.find(c => c.customer_id === customerId)
    if (cart) {
      table.cart_items = table.cart_items.filter(i => i.cart_id !== cart.id)
    }
    return this.getCart(customerId)
  },

  // --- AUDIT ---
  async addAuditLog(entry) {
    const log = { id: uid('aud'), ...entry, timestamp: new Date().toISOString() }
    table.audit_logs = [log, ...table.audit_logs]
    return log
  },
  async getAuditLogs(filters = {}) {
    let logs = [...table.audit_logs]
    if (filters.resource) logs = logs.filter(l => l.resource === filters.resource)
    if (filters.resource_id) logs = logs.filter(l => l.resource_id === filters.resource_id)
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
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
