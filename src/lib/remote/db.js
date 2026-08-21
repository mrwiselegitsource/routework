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

  async applyDynamicStatuses(orders) {
    if (!orders || (Array.isArray(orders) && orders.length === 0)) return orders;
    const isArray = Array.isArray(orders);
    const orderList = isArray ? orders : [orders];
    const orderIds = orderList.map(o => o.order_id);
    
    const { data: events } = await supabase
      .from('tracking_events')
      .select('order_id, status, event_time')
      .in('order_id', orderIds)
      .eq('added_by', 'system_automation')
      .order('event_time', { ascending: false });
      
    if (!events || events.length === 0) return orders;
    
    const now = new Date();
    const latestActiveEvent = {};
    for (const e of events) {
      if (e.event_time && new Date(e.event_time) <= now) {
        if (!latestActiveEvent[e.order_id] || new Date(e.event_time) > new Date(latestActiveEvent[e.order_id].event_time)) {
          latestActiveEvent[e.order_id] = e;
        }
      }
    }
    
    const updated = orderList.map(o => {
      const active = latestActiveEvent[o.order_id];
      if (active) {
        return { ...o, current_status: active.status };
      }
      return o;
    });
    
    return isArray ? updated : updated[0];
  },

  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('order_id, item_name, recipient_name, current_status, payment_status, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return this.applyDynamicStatuses(data ?? [])
  },

  async getOrder(orderId) {
    const { data, error } = await supabase.from('orders').select('*').eq('order_id', orderId).maybeSingle()
    if (error) throw error
    return this.applyDynamicStatuses(data)
  },

  async getPublicOrder(orderId) {
    const { data, error } = await supabase.from('public_order_lookup').select('*').eq('order_id', orderId).maybeSingle()
    if (error) throw error
    return this.applyDynamicStatuses(data)
  },

  async getTrackingEvents(orderId) {
    const { data, error } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('order_id', orderId)
      .order('event_time', { ascending: false })
    if (error) throw error
    
    const now = new Date();
    // Return only events that have already occurred
    return (data ?? []).filter(e => e.event_time ? new Date(e.event_time) <= now : true);
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

  async sendNotification(orderId, type, message) {
    // Invoke the edge function. 
    // If it fails (e.g., Twilio not configured, or function not deployed yet), we catch it gracefully.
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: { orderId, type, message }
      });
      if (error) console.error("Edge function error:", error);
      return data;
    } catch (e) {
      console.warn("Could not send notification. Check edge function deployment.", e);
      return null;
    }
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

    // Trigger automations RPC (mocking the fact that in Supabase this would be a database trigger)
    try {
      await supabase.rpc('trigger_automations', { p_order_id: orderId, p_status: status })
    } catch(err) {
      console.warn("RPC trigger_automations not available in this mock remote backend yet.", err)
    }

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
    
    // Automation trigger: if marked paid, schedule the 7 automated tracking events based on delivery_duration_hours
    if (status === 'paid') {
      const order = await this.getOrder(orderId);
      if (order && order.delivery_duration_hours && order.delivery_duration_hours > 0) {
        // Calculate the estimated delivery time
        const now = new Date();
        const durationMs = order.delivery_duration_hours * 60 * 60 * 1000;
        const estDelivery = new Date(now.getTime() + durationMs);
        
        // Update order with payment_time and estimated_delivery
        await supabase.from('orders').update({
          payment_time: now.toISOString(),
          estimated_delivery: estDelivery.toISOString()
        }).eq('order_id', orderId);
        
        // Schedule 7 linear tracking events spaced evenly
        const statuses = [
          'order_confirmed',
          'package_prepared',
          'departed_origin',
          'in_transit',
          'arrived_destination',
          'out_for_delivery',
          'delivered'
        ];
        
        // Calculate the intervals
        const interval = durationMs / (statuses.length - 1);
        
        // Check if there are already automated events to prevent duplication
        const existingEvents = await this.getTrackingEvents(orderId);
        if (existingEvents.length < statuses.length) {
          for (let i = 0; i < statuses.length; i++) {
            const eventTime = new Date(now.getTime() + (interval * i));
            
            // Map location and description for the demo based on status
            let location = '';
            let description = '';
            switch(statuses[i]) {
              case 'order_confirmed': description = 'Order and payment confirmed'; break;
              case 'package_prepared': description = 'Package sorted and prepared for dispatch'; break;
              case 'departed_origin': description = 'Package departed origin sorting center'; break;
              case 'in_transit': description = 'Package is in transit to destination region'; break;
              case 'arrived_destination': description = 'Package arrived at local delivery center'; break;
              case 'out_for_delivery': description = 'Courier is out for delivery'; break;
              case 'delivered': description = 'Package delivered successfully'; break;
            }
            
            await supabase.from('tracking_events').insert({
              order_id: orderId,
              status: statuses[i],
              location,
              description,
              added_by: 'system_automation',
              event_time: eventTime.toISOString()
            });
          }
        }
      }
    }
    
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
    const id = `${orderId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const { data, error } = await supabase.from('order_media').insert({ id, order_id: orderId, media_type: mediaType, storage_path: storagePath }).select().single()
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
    const { data, error } = await supabase.from('orders').select('order_id, payment_status, current_status')
    if (error) throw error
    const rows = await this.applyDynamicStatuses(data ?? [])
    const EXCEPTION_STATUSES = ['delivery_attempt_failed', 'held_by_customs', 'address_issue', 'returned_to_sender']
    return {
      total: rows.length,
      unpaid: rows.filter((o) => o.payment_status === 'unpaid').length,
      exceptions: rows.filter((o) => EXCEPTION_STATUSES.includes(o.current_status)).length,
      delivered: rows.filter((o) => o.current_status === 'delivered').length,
      inTransit: rows.filter((o) => o.current_status === 'in_transit' || o.current_status === 'departed_origin').length,
      arrivingSoon: rows.filter((o) => o.current_status === 'arrived_destination' || o.current_status === 'released_from_customs').length,
      outForDelivery: rows.filter((o) => o.current_status === 'out_for_delivery').length,
      delayed: rows.filter((o) => o.current_status === 'delayed').length,
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
    // Fetch the order's security fields (requires anon SELECT policy on orders)
    const { data: order, error } = await supabase
      .from('orders')
      .select('tracking_protected, tracking_password_hash, failed_attempts, locked_until')
      .eq('order_id', trackingNumber)
      .maybeSingle()

    if (error) throw error
    if (!order) return { success: false, locked: false, remainingAttempts: 0 }

    // Check if currently locked
    if (order.locked_until && new Date(order.locked_until) > new Date()) {
      return { success: false, locked: true, lockedUntil: order.locked_until }
    }

    // Hash the entered password using Web Crypto API (SHA-256 → hex)
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password))
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const success = order.tracking_password_hash === hashHex

    // Record the attempt via SECURITY DEFINER function (bypasses RLS for the UPDATE)
    await supabase.rpc('record_tracking_attempt', { p_order_id: trackingNumber, p_success: success })

    if (success) return { success: true }

    const newAttempts = (order.failed_attempts || 0) + 1
    if (newAttempts >= 3) {
      return { success: false, locked: true, lockedUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString() }
    }
    return { success: false, locked: false, remainingAttempts: 3 - newAttempts }
  },

  async getOrderSecurity(orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select('tracking_protected, failed_attempts, locked_until, password_created_at')
      .eq('order_id', orderId)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return {
      protected: !!data.tracking_protected,
      failedAttempts: data.failed_attempts || 0,
      lockedUntil: data.locked_until,
      passwordCreatedAt: data.password_created_at
    }
  },

  async regenerateTrackingPassword(orderId) {
    const newPassword = await this.generateTrackingPassword()
    
    // Hash password using Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(newPassword)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { error } = await supabase
      .from('orders')
      .update({
        tracking_password_hash: hashHex,
        password_created_at: new Date().toISOString(),
        failed_attempts: 0,
        locked_until: null
      })
      .eq('order_id', orderId)
      
    if (error) throw error
    await supabase.from('audit_logs').insert({ 
      actor: 'system', 
      action: 'regenerated_password', 
      resource: 'orders', 
      resource_id: orderId, 
      reason: 'Manual regeneration' 
    })
    return newPassword
  },

  async getGuestOrderPreview(orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select('order_id, item_name, current_status, current_location, estimated_delivery, order_media(storage_path, media_type)')
      .eq('order_id', orderId)
      .maybeSingle()
      
    if (error) throw error
    if (!data) return null
    
    let previewImage = null
    if (data.order_media && data.order_media.length > 0) {
      const media = data.order_media
      const img = media.find(m => m.media_type === 'image') || media[0]
      if (img.storage_path.startsWith('http')) {
        previewImage = img.storage_path
      } else {
        const { data: publicUrlData } = supabase.storage.from('order-media').getPublicUrl(img.storage_path)
        previewImage = publicUrlData.publicUrl
      }
    }

    return {
      order_id: data.order_id,
      item_name: data.item_name,
      current_status: data.current_status,
      current_location: data.current_location,
      estimated_delivery: data.estimated_delivery,
      preview_image: previewImage
    }
  },

  // --- REGIONS & DELIVERY ---
  async getRegions() {
    const { data, error } = await supabase.from('regions').select('*').order('name')
    if (error) throw error
    return data ?? []
  },
  async getPickupPoints(regionId) {
    let query = supabase.from('pickup_points').select('*').order('name')
    if (regionId) query = query.eq('region_id', regionId)
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },
  async getDeliveryPricing(regionId) {
    let query = supabase.from('delivery_pricing').select('*')
    if (regionId) query = query.eq('region_id', regionId)
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },
  async addRegion(fields) {
    const id = crypto.randomUUID()
    const { data, error } = await supabase.from('regions').insert({ id, ...fields }).select().single()
    if (error) throw error
    return data
  },
  async updateRegion(id, fields) {
    const { data, error } = await supabase.from('regions').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async addPickupPoint(fields) {
    const id = crypto.randomUUID()
    const { data, error } = await supabase.from('pickup_points').insert({ id, ...fields }).select().single()
    if (error) throw error
    return data
  },
  async updatePickupPoint(id, fields) {
    const { data, error } = await supabase.from('pickup_points').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async addDeliveryPricing(fields) {
    const id = crypto.randomUUID()
    const { data, error } = await supabase.from('delivery_pricing').insert({ id, ...fields }).select().single()
    if (error) throw error
    return data
  },
  async updateDeliveryPricing(id, fields) {
    const { data, error } = await supabase.from('delivery_pricing').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  // --- CUSTOMERS ---
  async getCustomers() {
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },
  async getCustomerOrders(customerId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },
  async getCustomer(id) {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data
  },
  async createCustomer(fields) {
    const { data, error } = await supabase.from('customers').insert(fields).select().single()
    if (error) throw error
    return data
  },
  async updateCustomer(id, fields) {
    const { data, error } = await supabase.from('customers').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  // --- CART ---
  async getCart(customerId) {
    const { data, error } = await supabase
      .from('carts')
      .select('*, cart_items(*)')
      .eq('customer_id', customerId)
      .maybeSingle()
    if (error) throw error
    if (!data) return { items: [] }
    return { ...data, items: data.cart_items ?? [] }
  },
  async addToCart(customerId, orderId) {
    // Upsert cart
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .upsert({ customer_id: customerId }, { onConflict: 'customer_id' })
      .select()
      .single()
    if (cartError) throw cartError

    // Insert item
    const { error: itemError } = await supabase
      .from('cart_items')
      .insert({ cart_id: cart.id, order_id: orderId })
    if (itemError) throw itemError

    return this.getCart(customerId)
  },
  async removeFromCart(customerId, orderId) {
    const cart = await this.getCart(customerId)
    if (cart && cart.id) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .match({ cart_id: cart.id, order_id: orderId })
      if (error) throw error
    }
    return this.getCart(customerId)
  },
  async clearCart(customerId) {
    const cart = await this.getCart(customerId)
    if (cart && cart.id) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)
      if (error) throw error
    }
    return this.getCart(customerId)
  },

  // --- AUDIT ---
  async addAuditLog(entry) {
    const { data, error } = await supabase.from('audit_logs').insert(entry).select().single()
    if (error) throw error
    return data
  },
  async getAuditLogs(filters = {}) {
    let query = supabase.from('audit_logs').select('*').order('timestamp', { ascending: false })
    if (filters.resource) query = query.eq('resource', filters.resource)
    if (filters.resource_id) query = query.eq('resource_id', filters.resource_id)
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  // --- AUTOMATIONS ---
  async getAutomationRules() {
    const { data, error } = await supabase.from('automation_rules').select('*').order('created_at')
    if (error) throw error
    return data ?? []
  },
  async updateAutomationRule(id, fields) {
    const { data, error } = await supabase.from('automation_rules').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async processAutomations() {
    // In a real environment, this would be a Supabase Edge Function or cron job.
    // For this mock remote backend, we call an RPC function we assume exists,
    // or we handle it via a manual RPC wrapper. Since we don't have the RPC,
    // we just return 0 to prevent errors during frontend testing.
    return 0
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
