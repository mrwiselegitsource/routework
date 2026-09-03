import { useState } from 'react'
import { Search, Phone, MessageCircle, Loader2, CheckCircle2, CreditCard } from 'lucide-react'
import { db, backendMode } from '../../lib/db'
import { simulatePayment } from '../../lib/payments'
import { statusMeta } from '../../data/statusIcons'
import EverSendGateway from '../../components/payments/EverSendGateway'
import { usePaymentSettings } from '../../context/PaymentSettingsContext'

// Full spec: Section 6 of the build guide. Reads through db.getPublicOrder
// (which mirrors the recipient-safe `public_order_lookup` view even in
// local mode — see src/lib/local/db.js) rather than any raw order table.
export default function Track() {
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)
  const [events, setEvents] = useState([])

  const [paying, setPaying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [showEverSend, setShowEverSend] = useState(false)

  const { settings: gwSettings } = usePaymentSettings()
  const gatewayEnabled = {
    card: gwSettings?.card_enabled !== false,
    eversend: gwSettings?.eversend_enabled !== false,
  }
  
  const [deliveryForm, setDeliveryForm] = useState({ recipient_name: '', recipient_phone: '', recipient_address: '', recipient_region: '' })
  const [deliveryErrors, setDeliveryErrors] = useState({})
  const [savingDelivery, setSavingDelivery] = useState(false)

  async function refresh(id) {
    const [orderData, eventData] = await Promise.all([db.getPublicOrder(id), db.getTrackingEvents(id)])
    setOrder(orderData)
    setEvents(eventData)
    return orderData
  }

  async function handleTrack(e) {
    e.preventDefault()
    const id = orderId.trim().toUpperCase()
    if (!id) {
      setError('Enter an order ID.')
      return
    }
    setLoading(true)
    setError(null)
    setOrder(null)
    setEvents([])
    try {
      const data = await refresh(id)
      if (!data) setError('No order found with that ID. Double-check it and try again.')
    } catch {
      setError('We couldn\u2019t reach tracking right now. Please try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePaymentClick() {
    if (paymentMethod === 'eversend') {
      setShowEverSend(true);
    } else {
      handleSimulatePayment();
    }
  }

  async function handleEverSendSuccess(proofUrl) {
    setShowEverSend(false);
    await refresh(order.order_id); // Order is now pending_verification
  }

  // Mock payment — see src/lib/payments.js. This never touches a real card
  // or Mobile Money network; it just flips payment_status after a short
  // delay so the rest of the flow (delivery details, confirmation) is
  // fully testable before Paystack (Section 8) exists.
  async function handleSimulatePayment() {
    setPaying(true)
    try {
      await simulatePayment(order.order_id)
      await refresh(order.order_id)
    } finally {
      setPaying(false)
    }
  }

  function validateDelivery() {
    const next = {}
    if (!deliveryForm.recipient_name.trim()) next.recipient_name = 'Enter your name.'
    if (!deliveryForm.recipient_phone.trim()) next.recipient_phone = 'Enter a phone number.'
    if (!deliveryForm.recipient_address.trim()) next.recipient_address = 'Enter a delivery address.'
    if (!deliveryForm.recipient_region.trim()) next.recipient_region = 'Enter your region.'
    setDeliveryErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmitDelivery(e) {
    e.preventDefault()
    if (!validateDelivery()) return
    setSavingDelivery(true)
    try {
      await db.submitDeliveryDetails(order.order_id, deliveryForm)
      await refresh(order.order_id)
    } finally {
      setSavingDelivery(false)
    }
  }

  const hasArrivedOrLater = order && ['released_from_customs', 'out_for_delivery', 'delivered', 'customs_clearance', 'arrived_destination'].includes(order.current_status)
  const showPaymentStep = order && order.payment_status === 'unpaid' && hasArrivedOrLater
  const showDeliveryForm = order && order.payment_status === 'paid' && !order.recipient_name
  const showConfirmation = order && order.payment_status === 'paid' && Boolean(order.recipient_name)

  return (
    <div>
      <div className="border-b border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            Track your package
          </h1>
          <p className="mt-3 font-body text-base text-[var(--color-ink-soft)]">
            Enter the order ID from your confirmation message.
          </p>
          {backendMode === 'local' && (
            <p className="mt-2 font-body text-xs text-[var(--color-ink-soft)]">
              Local test mode — try <strong>RW-DEMO01</strong> (in transit), <strong>RW-DEMO02</strong> (ready to pay), <strong>RW-DEMO03</strong> (delivered), or <strong>RW-DEMO04</strong> (held by customs).
            </p>
          )}
          <form onSubmit={handleTrack} noValidate className="mt-6 flex gap-2">
            <label htmlFor="order-id" className="sr-only">Order ID</label>
            <input
              id="order-id"
              type="text"
              placeholder="e.g. RW-4F7K2Q"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 rounded-md border px-4 py-2.5 font-body text-sm"
              style={{ borderColor: error ? 'var(--color-status-exception)' : 'var(--color-line)' }}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'var(--color-brand-orange)' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Track Package
            </button>
          </form>
          {error && <p className="mt-2 font-body text-sm" style={{ color: 'var(--color-status-exception)' }}>{error}</p>}
        </div>
      </div>

      {order && (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {/* Status header */}
          <div className="rounded-xl border border-[var(--color-line)] bg-white p-6">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
              {order.item_name}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-[var(--color-ink)]">
              {statusMeta(order.current_status).label}
            </h2>
            <p className="mt-1.5 font-body text-sm text-[var(--color-ink-soft)]">
              Latest update: {order.current_location || 'Not yet logged'}
              {order.estimated_delivery && ` · Estimated delivery ${order.estimated_delivery}`}
            </p>
          </div>

          {/* Timeline */}
          <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-white p-6">
            <h3 className="font-display text-sm font-bold text-[var(--color-ink)]">Tracking history</h3>
            <ol className="mt-4 space-y-5">
              {events.map((event) => {
                const meta = statusMeta(event.status)
                const Icon = meta.icon
                return (
                  <li key={event.id} className="flex gap-3">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `var(--color-status-${meta.color})1a`, color: `var(--color-status-${meta.color})` }}
                    >
                      <Icon size={15} />
                    </span>
                    <div>
                      <p className="font-display text-sm font-bold text-[var(--color-ink)]">{meta.label}</p>
                      <p className="font-body text-xs text-[var(--color-ink-soft)]">
                        {event.location} · {new Date(event.event_time).toLocaleString()}
                      </p>
                      {event.description && (
                        <p className="mt-1 font-body text-sm text-[var(--color-ink-soft)]">{event.description}</p>
                      )}
                    </div>
                  </li>
                )
              })}
              {events.length === 0 && (
                <p className="font-body text-sm text-[var(--color-ink-soft)]">No tracking events logged yet.</p>
              )}
            </ol>
          </div>

          {/* Fee Breakdown Card */}
          <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-white p-6">
            <h3 className="font-display text-sm font-bold text-[var(--color-ink)] mb-3">Shipment Fee & Payment Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body mb-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[var(--color-ink-soft)] uppercase font-semibold block mb-1">Upfront / Package Fee</span>
                <span className="text-sm font-bold text-[var(--color-ink)]">
                  {order.currency} {Number(order.upfront_fee || 0).toFixed(2)}
                </span>
                <span className={`block mt-1 text-[11px] font-bold ${order.upfront_payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                  • {order.upfront_payment_status === 'paid' ? 'Paid by Sender' : 'Owed on Delivery'}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[var(--color-ink-soft)] uppercase font-semibold block mb-1">Shipping / Delivery Fee</span>
                <span className="text-sm font-bold text-[var(--color-ink)]">
                  {order.currency} {Number(order.shipping_fee || 0).toFixed(2)}
                </span>
                <span className={`block mt-1 text-[11px] font-bold ${order.shipping_payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                  • {order.shipping_payment_status === 'paid' ? 'Prepaid by Sender' : 'Owed on Delivery'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 pt-4 border-t border-[var(--color-line)]">
              {[
                ['Order ID', order.order_id],
                ['Origin', order.sender_country],
                ['Current location', order.current_location],
                ['Overall Status', order.payment_status === 'paid' ? 'Paid' : 'Unpaid'],
                ['Receiver Total Due', `${order.currency} ${Number(order.amount_due || 0).toFixed(2)}`],
                ['Estimated delivery', order.estimated_delivery],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{label}</p>
                  <p className="mt-0.5 font-body text-sm font-bold text-[var(--color-ink)]">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[var(--color-line)] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-sm font-bold text-[var(--color-ink)]">Need help with this shipment?</p>
              <p className="mt-0.5 font-body text-sm text-[var(--color-ink-soft)]">{order.support_phone || 'Support number on file'}</p>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${order.support_phone}`} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 font-body text-xs font-semibold" style={{ borderColor: 'var(--color-line)' }}>
                <Phone size={14} /> Call
              </a>
              <a href="#" className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 font-body text-xs font-semibold" style={{ borderColor: 'var(--color-line)' }}>
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>

          {/* Payment step */}
          {showPaymentStep && (
            <div className="mt-6 rounded-xl border-2 border-dashed p-6" style={{ borderColor: 'var(--color-brand-orange)' }}>
              <p className="font-display text-sm font-bold text-[var(--color-ink)]">Payment due</p>
              <p className="mt-1 font-body text-sm text-[var(--color-ink-soft)] mb-4">
                {order.currency} {order.amount_due} — your shipment has arrived and is ready for delivery once this is settled.
              </p>
              
              <div className="space-y-3 mb-4">
                {gatewayEnabled.card && (
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 bg-white">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-[var(--color-brand-orange)] focus:ring-[var(--color-brand-orange)]"
                    />
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <span className="font-semibold text-gray-800">Credit / Debit Card</span>
                  </label>
                )}
                {gatewayEnabled.eversend && (
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 bg-white">
                    <input
                      type="radio"
                      name="payment"
                      value="eversend"
                      checked={paymentMethod === 'eversend'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-[#0033a0] focus:ring-[#0033a0]"
                    />
                    <div className="w-6 h-6 bg-[#0033a0] rounded flex items-center justify-center text-xs font-bold text-white">E</div>
                    <span className="font-semibold text-gray-800">EverSend (Mobile Money)</span>
                  </label>
                )}
              </div>

              <button
                type="button"
                onClick={handlePaymentClick}
                disabled={paying}
                className="mt-4 inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'var(--color-brand-orange)' }}
              >
                {paying && <Loader2 size={16} className="animate-spin" />}
                {paying ? 'Processing…' : 'Proceed to Payment'}
              </button>
            </div>
          )}

          {showEverSend && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl scrollbar-hide">
                <EverSendGateway 
                  orderId={order.order_id}
                  amountDue={order.amount_due}
                  onSuccess={handleEverSendSuccess}
                  onCancel={() => setShowEverSend(false)}
                />
              </div>
            </div>
          )}

          {/* Delivery details — shown once payment is confirmed and no
              delivery details are on file yet (Section 6, item 7) */}
          {showDeliveryForm && (
            <form onSubmit={handleSubmitDelivery} noValidate className="mt-6 rounded-xl border border-[var(--color-line)] bg-white p-6">
              <p className="font-display text-sm font-bold text-[var(--color-ink)]">Where should we deliver this?</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  ['recipient_name', 'Full name'],
                  ['recipient_phone', 'Phone number'],
                  ['recipient_region', 'Region'],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label htmlFor={name} className="font-body text-xs font-semibold text-[var(--color-ink)]">{label}</label>
                    <input
                      id={name}
                      type="text"
                      value={deliveryForm[name]}
                      onChange={(e) => setDeliveryForm((f) => ({ ...f, [name]: e.target.value }))}
                      className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm"
                      style={{ borderColor: deliveryErrors[name] ? 'var(--color-status-exception)' : 'var(--color-line)' }}
                    />
                    {deliveryErrors[name] && <p className="mt-1 font-body text-xs" style={{ color: 'var(--color-status-exception)' }}>{deliveryErrors[name]}</p>}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label htmlFor="recipient_address" className="font-body text-xs font-semibold text-[var(--color-ink)]">Delivery address</label>
                  <input
                    id="recipient_address"
                    type="text"
                    value={deliveryForm.recipient_address}
                    onChange={(e) => setDeliveryForm((f) => ({ ...f, recipient_address: e.target.value }))}
                    className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm"
                    style={{ borderColor: deliveryErrors.recipient_address ? 'var(--color-status-exception)' : 'var(--color-line)' }}
                  />
                  {deliveryErrors.recipient_address && <p className="mt-1 font-body text-xs" style={{ color: 'var(--color-status-exception)' }}>{deliveryErrors.recipient_address}</p>}
                </div>
              </div>
              <button
                type="submit"
                disabled={savingDelivery}
                className="mt-4 rounded-md px-5 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'var(--color-brand-orange)' }}
              >
                {savingDelivery ? 'Saving…' : 'Confirm delivery details'}
              </button>
            </form>
          )}

          {/* Confirmation — shown once delivery details are on file */}
          {showConfirmation && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border p-6" style={{ borderColor: 'var(--color-status-done)', background: '#15803D0d' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--color-status-done)' }} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-display text-sm font-bold text-[var(--color-ink)]">Delivery details confirmed</p>
                <p className="mt-1 font-body text-sm text-[var(--color-ink-soft)]">
                  We'll deliver to {order.recipient_name} at {order.current_location || 'the address on file'}. You'll see it move to "Out for Delivery" here once it's on the way.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
