import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../lib/db'
import { useAuth } from '../../context/AuthContext'
import { statusMeta, STATUS_FLOW, EXCEPTION_STATUSES } from '../../data/statusIcons'
import { Trash2 } from 'lucide-react'

const ALL_STATUSES = [...STATUS_FLOW, ...EXCEPTION_STATUSES]

export default function OrderDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [order, setOrder] = useState(null)
  const [events, setEvents] = useState([])
  const [media, setMedia] = useState([])
  const [security, setSecurity] = useState(null)
  const [loading, setLoading] = useState(true)
  const isAdmin = profile?.role === 'admin'

  const [form, setForm] = useState({ status: 'in_transit', location: '', description: '' })
  const [savingEvent, setSavingEvent] = useState(false)
  const [formError, setFormError] = useState(null)

  const [editValues, setEditValues] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [orderData, eventData, mediaData, secData] = await Promise.all([
      db.getOrder(id), 
      db.getTrackingEvents(id),
      db.getOrderMedia(id),
      db.getOrderSecurity(id)
    ])
    setOrder(orderData)
    setEditValues({
      item_name: orderData?.item_name || '',
      description: orderData?.description || '',
      amount_due: orderData?.amount_due || 0,
      delivery_duration_hours: orderData?.delivery_duration_hours || ''
    })
    setEvents(eventData)
    setMedia(mediaData)
    setSecurity(secData)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleAddUpdate(e) {
    e.preventDefault()
    if (!form.status) {
      setFormError('Choose a status.')
      return
    }
    if (EXCEPTION_STATUSES.includes(form.status) && !form.reason) {
      setFormError('An override reason is required for exception statuses.')
      return
    }

    if (order?.current_status && !EXCEPTION_STATUSES.includes(form.status) && !EXCEPTION_STATUSES.includes(order.current_status)) {
      const currentIndex = STATUS_FLOW.indexOf(order.current_status)
      const newIndex = STATUS_FLOW.indexOf(form.status)
      if (newIndex > currentIndex + 1 || newIndex < currentIndex) {
        setFormError(`You must strictly follow the tracking sequence. The next status is ${statusMeta(STATUS_FLOW[currentIndex + 1] || order.current_status).label}.`);
        return
      }
    }

    setSavingEvent(true)
    setFormError(null)
    try {
      let finalDescription = form.description
      if (form.reason) {
        finalDescription = finalDescription ? `${finalDescription} (Reason: ${form.reason})` : `Reason: ${form.reason}`
      }

      await db.addTrackingEvent(id, { 
        status: form.status, 
        location: form.location, 
        description: finalDescription 
      }, profile?.id)

      if (form.notify !== false) {
        // Simulate sending notification
        console.log(`Sending notification to customer for order ${id} - Status: ${form.status}`)
        await db.addAuditLog({
          actor: profile?.id || 'system',
          action: 'sent_notification',
          resource: 'orders',
          resource_id: id,
          reason: `Notified customer of status change to ${form.status}`
        })
      }

      setForm({ status: form.status, location: '', description: '', notify: true, reason: '' })
      await load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSavingEvent(false)
    }
  }

  async function handleSaveDetails(e) {
    e.preventDefault()
    setSavingEdit(true)
    try {
      await db.updateOrder(id, {
        item_name: editValues.item_name,
        description: editValues.description,
        amount_due: Number(editValues.amount_due),
        delivery_duration_hours: editValues.delivery_duration_hours ? Number(editValues.delivery_duration_hours) : null
      })
      await load()
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleMarkPaid() {
    if (!window.confirm('Mark this order as paid manually?')) return
    try {
      await db.updatePaymentStatus(id, 'paid', 'MANUAL_CASH_OVERRIDE')
      await load()
    } catch(e) { alert(e.message) }
  }

  async function handleRegeneratePassword() {
    if (!window.confirm('Regenerate tracking password? The customer will need the new password to claim the shipment.')) return
    try {
      const newPass = await db.regenerateTrackingPassword(id)
      alert(`New password is: ${newPass}\n\nPlease communicate this to the customer securely.`)
      await load()
    } catch(err) { alert(err.message) }
  }

  async function handleUploadMedia(e) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        await db.uploadOrderMediaFile(id, files[i])
      }
      await load()
    } catch(err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDeleteMedia(mediaId, path) {
    if(!window.confirm('Delete this media?')) return
    try {
      await db.deleteOrderMedia(mediaId, path)
      await load()
    } catch(err) { alert(err.message) }
  }

  if (loading) return <p className="font-body text-sm text-[var(--color-ink-soft)]">Loading order…</p>
  if (!order) return <p className="font-body text-sm text-[var(--color-ink-soft)]">Order not found.</p>

  return (
    <div className="pb-20">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">{order.order_id}</h1>
      <p className="mt-1 font-body text-sm text-[var(--color-ink-soft)]">{order.item_name}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Edit Details */}
          <form onSubmit={handleSaveDetails} className="rounded-xl border border-[var(--color-line)] bg-white p-6">
            <h2 className="font-display text-sm font-bold text-[var(--color-ink)] mb-4">Edit Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Item Name</label>
                <input type="text" value={editValues.item_name} onChange={e => setEditValues({...editValues, item_name: e.target.value})} className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Description</label>
                <textarea value={editValues.description} onChange={e => setEditValues({...editValues, description: e.target.value})} rows={2} className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm" />
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Amount Due ({order.currency})</label>
                <input type="number" value={editValues.amount_due} onChange={e => setEditValues({...editValues, amount_due: e.target.value})} className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm" />
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Automated Timeframe (Hours)</label>
                <input type="number" value={editValues.delivery_duration_hours} onChange={e => setEditValues({...editValues, delivery_duration_hours: e.target.value})} className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm" placeholder="e.g. 48 for 2 days" />
              </div>
            </div>
            <button type="submit" disabled={savingEdit || !isAdmin} className={`mt-4 rounded-md px-4 py-2 font-body text-sm font-semibold text-white ${isAdmin ? 'bg-blue-900 hover:opacity-90' : 'bg-gray-400 cursor-not-allowed'} disabled:opacity-60`}>
              {savingEdit ? 'Saving...' : 'Save Details'}
            </button>
            {!isAdmin && <p className="text-xs text-gray-500 mt-2">Only administrators can edit order details.</p>}
          </form>

          {/* Event history */}
          <div className="rounded-xl border border-[var(--color-line)] bg-white p-6">
            <h2 className="font-display text-sm font-bold text-[var(--color-ink)]">Event history</h2>
            <ol className="mt-4 space-y-4">
              {events.map((ev) => {
                const meta = statusMeta(ev.status)
                return (
                  <li key={ev.id} className="border-b border-[var(--color-line)] pb-3 last:border-0 last:pb-0">
                    <p className="font-body text-sm font-semibold text-[var(--color-ink)]">{meta.label}</p>
                    <p className="font-body text-xs text-[var(--color-ink-soft)]">
                      {ev.location} · {new Date(ev.event_time).toLocaleString()}
                    </p>
                    {ev.description && <p className="mt-1 font-body text-sm text-[var(--color-ink-soft)]">{ev.description}</p>}
                  </li>
                )
              })}
              {events.length === 0 && <p className="font-body text-sm text-[var(--color-ink-soft)]">No events yet.</p>}
            </ol>
          </div>

          {/* Add update form */}
          <form onSubmit={handleAddUpdate} noValidate className="rounded-xl border border-[var(--color-line)] bg-white p-6">
            <h2 className="font-display text-sm font-bold text-[var(--color-ink)]">Add update</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="status" className="font-body text-xs font-semibold text-[var(--color-ink)]">Status</label>
                <select id="status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm border-[var(--color-line)]">
                  {ALL_STATUSES.map((s) => {
                    // Restrict dropdown options to current, next, or exceptions
                    let disabled = false;
                    if (order?.current_status && !EXCEPTION_STATUSES.includes(s) && !EXCEPTION_STATUSES.includes(order.current_status)) {
                      const currentIndex = STATUS_FLOW.indexOf(order.current_status);
                      const sIndex = STATUS_FLOW.indexOf(s);
                      if (sIndex > currentIndex + 1 || sIndex < currentIndex) {
                        disabled = true;
                      }
                    }
                    return (
                      <option key={s} value={s} disabled={disabled}>{statusMeta(s).label}</option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label htmlFor="location" className="font-body text-xs font-semibold text-[var(--color-ink)]">Location</label>
                <input id="location" type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm border-[var(--color-line)]" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="font-body text-xs font-semibold text-[var(--color-ink)]">Description</label>
                <textarea id="description" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm border-[var(--color-line)]" placeholder="e.g. Package has arrived in Ghana" />
              </div>
              {EXCEPTION_STATUSES.includes(form.status) && (
                <div className="sm:col-span-2">
                  <label htmlFor="reason" className="font-body text-xs font-semibold text-red-600">Override Reason (Required for Exceptions)</label>
                  <input id="reason" type="text" value={form.reason || ''} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm border-red-200 bg-red-50" placeholder="Reason for this exception status..." required />
                </div>
              )}
              <div className="sm:col-span-2 mt-2">
                <label className="flex items-center gap-2 font-body text-sm text-[var(--color-ink)] cursor-pointer">
                  <input type="checkbox" checked={form.notify !== false} onChange={(e) => setForm(f => ({ ...f, notify: e.target.checked }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  Notify customer via Email/SMS
                </label>
              </div>
            </div>
            {formError && <p className="mt-2 font-body text-sm" style={{ color: 'var(--color-status-exception)' }}>{formError}</p>}
            <button type="submit" disabled={savingEvent} className="mt-4 rounded-md px-5 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'var(--color-brand-orange)' }}>
              {savingEvent ? 'Saving…' : 'Add update'}
            </button>
          </form>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Media Section */}
          <div className="rounded-xl border border-[var(--color-line)] bg-white p-6">
            <h2 className="font-display text-sm font-bold text-[var(--color-ink)] mb-4">Item Media</h2>
            {media.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {media.map(m => (
                  <div key={m.id} className="relative group rounded-md overflow-hidden bg-gray-100 aspect-square">
                    {m.media_type === 'video' ? (
                      <video src={m.public_url || m.storage_path} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.public_url || m.storage_path} className="w-full h-full object-cover" />
                    )}
                    <button onClick={() => handleDeleteMedia(m.id, m.storage_path)} className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-[var(--color-ink-soft)] mb-4">No media uploaded yet.</p>
            )}
            
            <div>
               <input type="file" ref={fileInputRef} onChange={handleUploadMedia} multiple accept="image/*,video/mp4" className="hidden" id="upload-media" />
               <label htmlFor="upload-media" className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 px-4 py-2 rounded-md block text-center">
                 {uploading ? 'Uploading...' : 'Upload More Media'}
               </label>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-line)] bg-white p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-display text-sm font-bold text-[var(--color-ink)]">Shipment Status</h2>
              {order.payment_status === 'unpaid' && isAdmin && (
                <button onClick={handleMarkPaid} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200 transition">Mark Paid</button>
              )}
            </div>
            <dl className="space-y-2 font-body text-sm">
              <div className="flex justify-between"><dt className="text-[var(--color-ink-soft)]">Sender</dt><dd className="text-[var(--color-ink)]">{order.sender_name || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--color-ink-soft)]">Origin</dt><dd className="text-[var(--color-ink)]">{order.sender_country || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--color-ink-soft)]">Payment</dt><dd className="capitalize text-[var(--color-ink)] font-semibold">{order.payment_status}</dd></div>
            </dl>
          </div>

          <div className="rounded-xl border border-[var(--color-line)] bg-white p-6">
            <h2 className="font-display text-sm font-bold text-[var(--color-ink)]">Recipient & Claim</h2>
            <dl className="mt-3 space-y-2 font-body text-sm">
              <div className="flex justify-between"><dt className="text-[var(--color-ink-soft)]">Name</dt><dd className="text-[var(--color-ink)]">{order.recipient_name || 'Not yet claimed'}</dd></div>
              {order.recipient_phone && <div className="flex justify-between"><dt className="text-[var(--color-ink-soft)]">Phone</dt><dd className="text-[var(--color-ink)]">{order.recipient_phone}</dd></div>}
              {order.recipient_region && <div className="flex justify-between"><dt className="text-[var(--color-ink-soft)]">Region</dt><dd className="text-[var(--color-ink)]">{order.recipient_region}</dd></div>}
              {order.recipient_address && <div className="mt-2 text-[var(--color-ink)] bg-gray-50 p-2 rounded-md border border-gray-100">{order.recipient_address}</div>}
            </dl>
          </div>

          {/* Security Section */}
          <div className="rounded-xl border border-[var(--color-line)] bg-white p-6">
            <h2 className="font-display text-sm font-bold text-red-600">Order Security</h2>
            <div className="mt-3 text-sm text-[var(--color-ink-soft)]">
              {security?.protected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-md font-semibold text-xs border border-green-200">
                    Protected by Tracking Password
                  </div>
                  {security.lockedUntil && new Date(security.lockedUntil) > new Date() ? (
                    <div className="text-red-600 bg-red-50 p-2 rounded-md font-semibold text-xs border border-red-200">
                      Currently Locked Out (Too many attempts)
                    </div>
                  ) : security.failedAttempts > 0 ? (
                    <div className="text-orange-600 bg-orange-50 p-2 rounded-md font-semibold text-xs border border-orange-200">
                      {security.failedAttempts} Failed Claim Attempt(s)
                    </div>
                  ) : null}
                  {isAdmin ? (
                    <button onClick={handleRegeneratePassword} className="w-full mt-2 bg-red-50 text-red-700 border border-red-200 font-bold px-3 py-2 rounded-md hover:bg-red-100 transition-colors">
                      Regenerate Password
                    </button>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">Only administrators can regenerate passwords.</p>
                  )}
                </div>
              ) : (
                <p>No tracking password configured.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
