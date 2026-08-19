// Supabase-backed data layer, matching the same function shapes as
// src/lib/local/db.js. Reads go through `public_order_lookup` for the
// recipient-facing path and RLS-protected tables everywhere else, per
// Sections 4 and 8 of the build guide.
import { supabase } from '../supabaseClient'

function generateOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return `RW-${id}`
}

export const remoteDb = {
  init() {},

  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('order_id, item_name, recipient_name, current_status, payment_status, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getOrder(orderId) {
    const { data, error } = await supabase.from('orders').select('*').eq('order_id', orderId).maybeSingle()
    if (error) throw error
    return data
  },

  async getPublicOrder(orderId) {
    const { data, error } = await supabase.from('public_order_lookup').select('*').eq('order_id', orderId).maybeSingle()
    if (error) throw error
    return data
  },

  async getTrackingEvents(orderId) {
    const { data, error } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('order_id', orderId)
      .order('event_time', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async createOrder(fields, createdBy) {
    const orderId = generateOrderId()
    const { data, error } = await supabase
      .from('orders')
      .insert({ order_id: orderId, current_status: 'order_confirmed', ...fields, created_by: createdBy })
      .select()
      .single()
    if (error) throw error
    await supabase.from('activity_log').insert({ user_id: createdBy, order_id: orderId, action: 'created_order' })
    return data
  },

  async addTrackingEvent(orderId, { status, location, description }, addedBy) {
    const { data, error } = await supabase
      .from('tracking_events')
      .insert({ order_id: orderId, status, location, description, added_by: addedBy })
      .select()
      .single()
    if (error) throw error
    await supabase.from('orders').update({ current_status: status, current_location: location }).eq('order_id', orderId)
    await supabase.from('activity_log').insert({ user_id: addedBy, order_id: orderId, action: 'updated_status' })
    return data
  },

  async submitDeliveryDetails(orderId, details) {
    const { error } = await supabase.from('orders').update(details).eq('order_id', orderId)
    if (error) throw error
    return this.getOrder(orderId)
  },

  async updatePaymentStatus(orderId, status, reference) {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status, ...(reference ? { payment_reference: reference } : {}) })
      .eq('order_id', orderId)
    if (error) throw error
    return this.getOrder(orderId)
  },

  async getStaff() {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async setStaffActive(id, active) {
    const { data, error } = await supabase.from('profiles').update({ active }).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async getActivityLog() {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    return data ?? []
  },

  async updateOrder(orderId, fields) {
    const { data, error } = await supabase.from('orders').update(fields).eq('order_id', orderId).select().single()
    if (error) throw error
    await supabase.from('activity_log').insert({ user_id: null, order_id: orderId, action: 'updated_order' })
    return data
  },

  async getOrderMedia(orderId) {
    const { data, error } = await supabase.from('order_media').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
    if (error) throw error
    
    // Convert storage_path to public URL if it doesn't start with http
    return (data ?? []).map(m => {
      if (m.storage_path.startsWith('http')) return m
      const { data: publicUrlData } = supabase.storage.from('order-media').getPublicUrl(m.storage_path)
      return { ...m, public_url: publicUrlData.publicUrl }
    })
  },

  async uploadOrderMediaFile(orderId, file) {
    const ext = file.name.split('.').pop()
    const filename = `${Math.random().toString(36).substring(2, 15)}.${ext}`
    const path = `${orderId}/${filename}`
    
    const { error: uploadError } = await supabase.storage.from('order-media').upload(path, file)
    if (uploadError) throw uploadError

    const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
    return this.addOrderMedia(orderId, mediaType, path)
  },

  async addOrderMedia(orderId, mediaType, storagePath) {
    const { data, error } = await supabase.from('order_media').insert({ order_id: orderId, media_type: mediaType, storage_path: storagePath }).select().single()
    if (error) throw error
    return data
  },

  async deleteOrderMedia(mediaId, storagePath) {
    if (storagePath && !storagePath.startsWith('http')) {
      await supabase.storage.from('order-media').remove([storagePath])
    }
    const { error } = await supabase.from('order_media').delete().eq('id', mediaId)
    if (error) throw error
  },

  async getDashboardStats() {
    const { data, error } = await supabase.from('orders').select('payment_status, current_status')
    if (error) throw error
    const rows = data ?? []
    const EXCEPTION_STATUSES = ['delivery_attempt_failed', 'held_by_customs', 'address_issue', 'returned_to_sender']
    return {
      total: rows.length,
      unpaid: rows.filter((o) => o.payment_status === 'unpaid').length,
      exceptions: rows.filter((o) => EXCEPTION_STATUSES.includes(o.current_status)).length,
      delivered: rows.filter((o) => o.current_status === 'delivered').length,
    }
  },

  // --- STAFF ---
  async addStaff(fields) {
    const { data, error } = await supabase.from('profiles').insert({ ...fields, active: true }).select().single()
    if (error) throw error
    return data
  },

  // --- NEWS ---
  async getNews() {
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },
  
  async getNewsById(id) {
    const { data, error } = await supabase.from('news').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data
  },

  async addNews(fields, authorId) {
    const { data, error } = await supabase.from('news').insert({ ...fields, author_id: authorId }).select().single()
    if (error) throw error
    return data
  },

  async updateNews(id, fields) {
    const { data, error } = await supabase.from('news').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async deleteNews(id) {
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (error) throw error
  },

  // --- ANALYTICS ---
  async logPageView(path, sessionId = 'anon') {
    const { data, error } = await supabase.from('page_views').insert({ path, session_id: sessionId }).select().single()
    if (error) throw error
    return data
  },

  async getTrafficStats() {
    const { data, error } = await supabase.from('page_views').select('*')
    if (error) throw error
    const pvs = data ?? []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const viewsToday = pvs.filter(pv => new Date(pv.timestamp) >= today).length
    const uniqueVisitors = new Set(pvs.map(pv => pv.session_id)).size

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
