import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/db'
import { useAuth } from '../../context/AuthContext'

export default function OrderNew() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [regions, setRegions] = useState([])
  const [pricingRules, setPricingRules] = useState([])

  const [values, setValues] = useState({ 
    currency: 'GHS',
    upfront_fee: '',
    upfront_payment_status: 'paid',
    recipient_region: '',
    shipping_fee: '',
    shipping_payment_status: 'unpaid',
    item_name: '',
    description: '',
    sender_name: '',
    sender_country: '',
    delivery_duration_hours: '',
    support_phone: ''
  })
  
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  
  const fileInputRef = useRef(null)

  useEffect(() => {
    async function loadRegionsData() {
      try {
        const [r, prc] = await Promise.all([db.getRegions(), db.getDeliveryPricing()])
        setRegions(r || [])
        setPricingRules(prc || [])
      } catch (err) {
        console.error("Failed loading regions data", err)
      }
    }
    loadRegionsData()
  }, [])

  function setField(name, value) {
    setValues((v) => {
      const next = { ...v, [name]: value }
      
      // Auto-calculate shipping fee when recipient_region changes
      if (name === 'recipient_region') {
        const selectedReg = regions.find(r => r.name === value || r.id === value)
        if (selectedReg) {
          const pricing = pricingRules.find(p => p.region_id === selectedReg.id)
          if (pricing && pricing.home_delivery_fee) {
            next.shipping_fee = pricing.home_delivery_fee
          }
        }
      }
      return next
    })
  }

  // Calculate Receiver Amount Due dynamically
  const upfrontDue = values.upfront_payment_status === 'unpaid' ? (parseFloat(values.upfront_fee) || 0) : 0
  const shippingDue = values.shipping_payment_status === 'unpaid' ? (parseFloat(values.shipping_fee) || 0) : 0
  const calculatedAmountDue = upfrontDue + shippingDue

  function validate() {
    const next = {}
    if (!values.item_name) next.item_name = 'Required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      const orderData = {
        ...values,
        upfront_fee: Number(values.upfront_fee || 0),
        shipping_fee: Number(values.shipping_fee || 0),
        amount_due: calculatedAmountDue,
        delivery_duration_hours: values.delivery_duration_hours ? Number(values.delivery_duration_hours) : null
      }

      const order = await db.createOrder(orderData, profile?.id)
      
      // Upload media if any
      const files = fileInputRef.current?.files
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          await db.uploadOrderMediaFile(order.order_id, files[i])
        }
      }

      navigate(`/admin/orders/${order.order_id}`)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl pb-20">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">New order</h1>
      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4 rounded-xl border border-[var(--color-line)] bg-white p-6 sm:grid-cols-2">
        
        {/* Item Details */}
        <div className="sm:col-span-2">
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Item name *</label>
          <input
            type="text"
            value={values.item_name}
            onChange={(e) => setField('item_name', e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm"
            style={{ borderColor: errors.item_name ? 'var(--color-status-exception)' : 'var(--color-line)' }}
          />
          {errors.item_name && <p className="mt-1 font-body text-xs text-red-500">{errors.item_name}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Description</label>
          <textarea
            value={values.description}
            onChange={(e) => setField('description', e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm"
            rows={2}
          />
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Sender name</label>
          <input
            type="text"
            value={values.sender_name}
            onChange={(e) => setField('sender_name', e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm"
          />
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Sender country</label>
          <input
            type="text"
            value={values.sender_country}
            onChange={(e) => setField('sender_country', e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm"
          />
        </div>

        {/* Region & Automated Pricing Section */}
        <div className="sm:col-span-2 border-t border-[var(--color-line)] pt-4 mt-2">
          <h2 className="font-display text-sm font-bold text-[var(--color-ink)] mb-3">Destination & Delivery Fee Setup</h2>
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Recipient Region</label>
          <select
            value={values.recipient_region}
            onChange={(e) => setField('recipient_region', e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm bg-white"
          >
            <option value="">Select Region...</option>
            {regions.map(r => (
              <option key={r.id || r.name} value={r.name}>{r.name}</option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-gray-500">Selecting a region automatically fills regional delivery fee.</p>
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Shipping / Delivery Fee ({values.currency})</label>
          <input
            type="number"
            value={values.shipping_fee}
            onChange={(e) => setField('shipping_fee', e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm"
            placeholder="Auto-calculated from region"
          />
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Shipping Fee Payment Responsibility</label>
          <select
            value={values.shipping_payment_status}
            onChange={(e) => setField('shipping_payment_status', e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm bg-white"
          >
            <option value="unpaid">Receiver Pays Shipping (Collect on Delivery)</option>
            <option value="paid">Paid by Sender (Prepaid)</option>
          </select>
        </div>

        {/* Upfront Fee & Processing */}
        <div className="sm:col-span-2 border-t border-[var(--color-line)] pt-4 mt-2">
          <h2 className="font-display text-sm font-bold text-[var(--color-ink)] mb-3">Upfront & Processing Fee</h2>
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Upfront / Package Processing Fee ({values.currency})</label>
          <input
            type="number"
            value={values.upfront_fee}
            onChange={(e) => setField('upfront_fee', e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm"
            placeholder="e.g. 150"
          />
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Upfront Fee Status</label>
          <select
            value={values.upfront_payment_status}
            onChange={(e) => setField('upfront_payment_status', e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm bg-white"
          >
            <option value="paid">Paid by Sender (Upfront Settled)</option>
            <option value="unpaid">Unpaid (Receiver Must Pay)</option>
          </select>
        </div>

        {/* Live Calculation Preview */}
        <div className="sm:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
          <h3 className="font-display text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">Payment Summary Breakdown</h3>
          <div className="space-y-1 text-xs text-blue-950">
            <div className="flex justify-between">
              <span>Upfront Processing Fee:</span>
              <span className="font-semibold">{values.currency} {Number(values.upfront_fee || 0).toFixed(2)} ({values.upfront_payment_status === 'paid' ? 'Paid by Sender' : 'Receiver Owes'})</span>
            </div>
            <div className="flex justify-between">
              <span>Regional Shipping Fee:</span>
              <span className="font-semibold">{values.currency} {Number(values.shipping_fee || 0).toFixed(2)} ({values.shipping_payment_status === 'paid' ? 'Paid by Sender' : 'Receiver Owes'})</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200 font-bold text-sm text-blue-900">
              <span>Receiver Total Due (Checkout / Gateways):</span>
              <span>{values.currency} {calculatedAmountDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Duration & Support */}
        <div>
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Automated Delivery Timeframe (Hours)</label>
          <input
            type="number"
            value={values.delivery_duration_hours}
            onChange={(e) => setField('delivery_duration_hours', e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm"
            placeholder="e.g. 48 for 2 days"
          />
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-[var(--color-ink)]">Support phone</label>
          <input
            type="text"
            value={values.support_phone}
            onChange={(e) => setField('support_phone', e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-body text-sm"
          />
        </div>

        {/* Media Upload */}
        <div className="sm:col-span-2 mt-2 border-t border-[var(--color-line)] pt-4">
          <label className="font-body text-xs font-semibold text-[var(--color-ink)] block mb-1">
            Item Media (Images & Videos)
          </label>
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            accept="image/*,video/mp4" 
            className="w-full font-body text-sm text-[var(--color-ink-soft)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-line)] file:text-[var(--color-ink)] hover:file:bg-gray-200"
          />
          <p className="mt-1 font-body text-xs text-[var(--color-ink-soft)]">Optional. Select images or MP4 videos.</p>
        </div>

        {saveError && <p className="sm:col-span-2 font-body text-sm text-red-600">{saveError}</p>}

        <div className="sm:col-span-2 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md px-5 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--color-brand-orange)' }}
          >
            {saving ? 'Creating…' : 'Create order'}
          </button>
        </div>
      </form>
    </div>
  )
}
