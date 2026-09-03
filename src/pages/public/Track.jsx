import { useState } from 'react'
import {
  Search, Phone, MessageCircle, Loader2, CheckCircle2, CreditCard,
  Package, MapPin, Clock, ChevronRight, AlertCircle, Truck, ArrowRight,
  ShieldCheck, Banknote, Star
} from 'lucide-react'
import { db, backendMode } from '../../lib/db'
import { simulatePayment } from '../../lib/payments'
import { statusMeta } from '../../data/statusIcons'
import EverSendGateway from '../../components/payments/EverSendGateway'
import { usePaymentSettings } from '../../context/PaymentSettingsContext'

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
    if (!id) { setError('Enter an order ID.'); return }
    setLoading(true)
    setError(null)
    setOrder(null)
    setEvents([])
    try {
      const data = await refresh(id)
      if (!data) setError('No order found with that ID. Double-check it and try again.')
    } catch {
      setError("We couldn't reach tracking right now. Please try again shortly.")
    } finally {
      setLoading(false)
    }
  }

  async function handlePaymentClick() {
    if (paymentMethod === 'eversend') { setShowEverSend(true) }
    else { handleSimulatePayment() }
  }

  async function handleEverSendSuccess() {
    setShowEverSend(false)
    await refresh(order.order_id)
  }

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

  const meta = order ? statusMeta(order.current_status) : null
  const StatusIcon = meta?.icon ?? Package

  // Status → progress step (0-4)
  const statusStep = order ? (() => {
    const s = order.current_status
    if (['delivered'].includes(s)) return 4
    if (['out_for_delivery'].includes(s)) return 3
    if (['arrived_destination', 'released_from_customs', 'customs_clearance'].includes(s)) return 2
    if (['in_transit', 'departed_origin'].includes(s)) return 1
    return 0
  })() : 0

  const steps = ['Order Placed', 'In Transit', 'Arrived', 'Out for Delivery', 'Delivered']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero search bar ──────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #001f6b 0%, #0033a0 60%, #1a4fc4 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white/20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 -translate-x-12 translate-y-12" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Package size={14} className="text-white" />
            </div>
            <span className="text-white/80 text-sm font-semibold tracking-wide uppercase">RouteWorks Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 leading-tight">
            Where's my package?
          </h1>
          <p className="text-blue-200 text-sm mb-6">Enter your order ID to get real-time updates.</p>

          {backendMode === 'local' && (
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5 text-white/80 text-xs mb-4 flex items-center gap-2">
              <Star size={12} className="text-yellow-300 flex-shrink-0" />
              Try: <strong className="text-white">RW-DEMO01</strong> (in transit) · <strong className="text-white">RW-DEMO02</strong> (ready to pay) · <strong className="text-white">RW-DEMO03</strong> (delivered)
            </div>
          )}

          <form onSubmit={handleTrack} noValidate>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  id="order-id"
                  type="text"
                  placeholder="e.g. RW-4F7K2Q"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-white text-gray-900 font-semibold text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#ff3b30] hover:bg-[#e0352b] active:scale-95 text-white font-bold px-5 py-3.5 rounded-xl shadow-lg transition-all duration-150 disabled:opacity-60 whitespace-nowrap"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                <span className="hidden sm:inline">Track</span>
              </button>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 bg-red-500/20 text-red-100 rounded-xl px-4 py-2.5 text-sm">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {order && (
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-3 pb-10">

          {/* STATUS CARD */}
          <div
            className="rounded-2xl shadow-sm overflow-hidden"
            style={{ background: '#fff' }}
          >
            {/* Colored top strip */}
            <div
              className="px-5 py-4 flex items-center gap-4"
              style={{ background: `var(--color-status-${meta?.color}, #0033a0)18` }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `var(--color-status-${meta?.color}, #0033a0)22`, color: `var(--color-status-${meta?.color}, #0033a0)` }}
              >
                <StatusIcon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">{order.order_id}</p>
                <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{meta?.label || 'Processing'}</h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{order.current_location || 'Location not yet logged'}</p>
              </div>
              <div
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: order.payment_status === 'paid' ? '#dcfce7' : '#fef3c7', color: order.payment_status === 'paid' ? '#15803d' : '#92400e' }}
              >
                {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-5 pt-3 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 relative">
                    {/* Connector line */}
                    {i < steps.length - 1 && (
                      <div
                        className="absolute top-3 left-1/2 right-0 h-0.5 -z-0"
                        style={{ width: '100%', background: i < statusStep ? '#0033a0' : '#e5e7eb' }}
                      />
                    )}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center z-10 text-xs font-bold flex-shrink-0 transition-all duration-500"
                      style={{
                        background: i <= statusStep ? '#0033a0' : '#e5e7eb',
                        color: i <= statusStep ? '#fff' : '#9ca3af',
                        transform: i === statusStep ? 'scale(1.2)' : 'scale(1)',
                        boxShadow: i === statusStep ? '0 0 0 3px #0033a022' : 'none'
                      }}
                    >
                      {i < statusStep ? <CheckCircle2 size={12} /> : i + 1}
                    </div>
                    <p
                      className="text-[9px] font-semibold mt-1 text-center leading-tight"
                      style={{ color: i <= statusStep ? '#0033a0' : '#9ca3af', maxWidth: '48px' }}
                    >
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick details grid */}
            <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                ['Item', order.item_name],
                ['From', order.sender_country || '—'],
                ['Est. Delivery', order.estimated_delivery || 'TBD'],
                ['Amount Due', order.amount_due ? `${order.currency} ${Number(order.amount_due).toFixed(2)}` : 'None'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5 leading-tight">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FEE BREAKDOWN CARD */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <Banknote size={16} className="text-[#0033a0]" />
              <span className="text-sm font-bold text-gray-800">Fee Breakdown</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Upfront / Package</p>
                <p className="text-base font-extrabold text-gray-900">{order.currency} {Number(order.upfront_fee || 0).toFixed(2)}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${order.upfront_payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.upfront_payment_status === 'paid' ? '✓ Paid by Sender' : '⚠ Owed on Delivery'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Shipping / Delivery</p>
                <p className="text-base font-extrabold text-gray-900">{order.currency} {Number(order.shipping_fee || 0).toFixed(2)}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${order.shipping_payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.shipping_payment_status === 'paid' ? '✓ Prepaid by Sender' : '⚠ Owed on Delivery'}
                </span>
              </div>
            </div>
            {order.amount_due > 0 && (
              <div className="mx-4 mb-4 bg-[#0033a0]/5 border border-[#0033a0]/10 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-[#0033a0]">Total You Owe</span>
                <span className="text-lg font-extrabold text-[#0033a0]">{order.currency} {Number(order.amount_due).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* TRACKING TIMELINE CARD */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <Clock size={16} className="text-[#0033a0]" />
              <span className="text-sm font-bold text-gray-800">Tracking History</span>
              <span className="ml-auto text-xs text-gray-400">{events.length} events</span>
            </div>
            <div className="p-4">
              {events.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No tracking events logged yet.</p>
              ) : (
                <ol className="relative">
                  {events.map((event, idx) => {
                    const evMeta = statusMeta(event.status)
                    const Icon = evMeta.icon
                    const isFirst = idx === 0
                    return (
                      <li key={event.id} className="flex gap-3 pb-4 relative">
                        {/* Vertical line */}
                        {idx < events.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200" />
                        )}
                        <div
                          className="relative z-10 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                          style={{
                            background: isFirst ? `var(--color-status-${evMeta.color}, #0033a0)` : `var(--color-status-${evMeta.color}, #6b7280)18`,
                            color: isFirst ? '#fff' : `var(--color-status-${evMeta.color}, #6b7280)`
                          }}
                        >
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-bold leading-snug ${isFirst ? 'text-gray-900' : 'text-gray-600'}`}>{evMeta.label}</p>
                            {isFirst && (
                              <span className="flex-shrink-0 text-[10px] font-bold bg-[#0033a0] text-white px-2 py-0.5 rounded-full">Latest</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {event.location} · {new Date(event.event_time).toLocaleString()}
                          </p>
                          {event.description && (
                            <p className="mt-1 text-xs text-gray-500 leading-relaxed">{event.description}</p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>
          </div>

          {/* SUPPORT CARD */}
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} className="text-[#0033a0]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Need help?</p>
              <p className="text-xs text-gray-500 truncate">{order.support_phone || 'Contact support'}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a href={`tel:${order.support_phone}`}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3 py-2 rounded-lg transition-colors"
              >
                <Phone size={13} /> Call
              </a>
              <a href="#"
                className="flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-800 font-bold text-xs px-3 py-2 rounded-lg transition-colors"
              >
                <MessageCircle size={13} /> WhatsApp
              </a>
            </div>
          </div>

          {/* ── PAYMENT STEP ──────────────────────────────────────────────── */}
          {showPaymentStep && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-dashed border-[#ff3b30]">
              <div className="bg-[#ff3b30]/5 px-5 py-3.5 border-b border-[#ff3b30]/20 flex items-center gap-2">
                <Banknote size={16} className="text-[#ff3b30]" />
                <div>
                  <p className="text-sm font-extrabold text-[#ff3b30]">Payment Required</p>
                  <p className="text-xs text-gray-500">Your package is ready — pay to arrange delivery</p>
                </div>
                <div className="ml-auto text-lg font-extrabold text-[#ff3b30]">
                  {order.currency} {Number(order.amount_due).toFixed(2)}
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                {gatewayEnabled.card && (
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#ff3b30] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-[#ff3b30]" />
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CreditCard size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Credit / Debit Card</p>
                      <p className="text-xs text-gray-400">Visa, Mastercard</p>
                    </div>
                    {paymentMethod === 'card' && <CheckCircle2 size={16} className="text-[#ff3b30] ml-auto" />}
                  </label>
                )}
                {gatewayEnabled.eversend && (
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'eversend' ? 'border-[#0033a0] bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="eversend" checked={paymentMethod === 'eversend'} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-[#0033a0]" />
                    <div className="w-8 h-8 bg-[#0033a0]/10 rounded-lg flex items-center justify-center text-xs font-extrabold text-[#0033a0]">E</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">EverSend Mobile Money</p>
                      <p className="text-xs text-gray-400">MTN, Telecel, Tigo</p>
                    </div>
                    {paymentMethod === 'eversend' && <CheckCircle2 size={16} className="text-[#0033a0] ml-auto" />}
                  </label>
                )}
              </div>

              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={handlePaymentClick}
                  disabled={paying}
                  className="w-full flex items-center justify-center gap-2 bg-[#ff3b30] hover:bg-[#e0352b] active:scale-[0.98] text-white font-extrabold py-4 rounded-xl text-base shadow-lg shadow-red-200 transition-all duration-150 disabled:opacity-60"
                >
                  {paying && <Loader2 size={18} className="animate-spin" />}
                  {paying ? 'Processing…' : `Pay ${order.currency} ${Number(order.amount_due).toFixed(2)}`}
                  {!paying && <ArrowRight size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* EverSend overlay */}
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

          {/* DELIVERY FORM */}
          {showDeliveryForm && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <Truck size={16} className="text-[#0033a0]" />
                <span className="text-sm font-bold text-gray-800">Delivery Details</span>
              </div>
              <form onSubmit={handleSubmitDelivery} noValidate className="p-4 space-y-3">
                {[['recipient_name', 'Full Name', 'text'], ['recipient_phone', 'Phone Number', 'tel'], ['recipient_region', 'Region', 'text']].map(([name, label, type]) => (
                  <div key={name}>
                    <label htmlFor={name} className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
                    <input
                      id={name} type={type}
                      value={deliveryForm[name]}
                      onChange={e => setDeliveryForm(f => ({ ...f, [name]: e.target.value }))}
                      className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0033a0] ${deliveryErrors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    />
                    {deliveryErrors[name] && <p className="mt-1 text-xs text-red-500">{deliveryErrors[name]}</p>}
                  </div>
                ))}
                <div>
                  <label htmlFor="recipient_address" className="block text-xs font-bold text-gray-700 mb-1">Delivery Address</label>
                  <input
                    id="recipient_address" type="text"
                    value={deliveryForm.recipient_address}
                    onChange={e => setDeliveryForm(f => ({ ...f, recipient_address: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0033a0] ${deliveryErrors.recipient_address ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                  />
                  {deliveryErrors.recipient_address && <p className="mt-1 text-xs text-red-500">{deliveryErrors.recipient_address}</p>}
                </div>
                <button
                  type="submit"
                  disabled={savingDelivery}
                  className="w-full bg-[#0033a0] hover:bg-[#002080] text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  {savingDelivery ? 'Saving…' : 'Confirm Delivery Details'}
                </button>
              </form>
            </div>
          )}

          {/* CONFIRMATION */}
          {showConfirmation && (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-green-300 p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-base">Delivery Confirmed!</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  We'll deliver to <strong>{order.recipient_name}</strong> at <strong>{order.current_location || 'the address on file'}</strong>. You'll see it move to "Out for Delivery" once it's on the way.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
