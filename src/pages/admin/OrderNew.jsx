import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/db'
import { useAuth } from '../../context/AuthContext'

const FIELDS = [
  { name: 'item_name', label: 'Item name', required: true },
  { name: 'description', label: 'Description' },
  { name: 'sender_name', label: 'Sender name' },
  { name: 'sender_country', label: 'Sender country' },
  { name: 'amount_due', label: 'Amount due', type: 'number', required: true },
  { name: 'currency', label: 'Currency', default: 'GHS' },
  { name: 'estimated_delivery', label: 'Estimated delivery', type: 'date' },
  { name: 'support_phone', label: 'Support phone' },
]

export default function OrderNew() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [values, setValues] = useState({ currency: 'GHS' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  
  const fileInputRef = useRef(null)

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  function validate() {
    const next = {}
    for (const f of FIELDS) {
      if (f.required && !values[f.name]) next[f.name] = 'Required.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      const order = await db.createOrder(
        { ...values, amount_due: Number(values.amount_due) },
        profile?.id
      )
      
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
        {FIELDS.map((f) => (
          <div key={f.name} className={f.name === 'description' ? 'sm:col-span-2' : ''}>
            <label htmlFor={f.name} className="font-body text-xs font-semibold text-[var(--color-ink)]">
              {f.label}{f.required && ' *'}
            </label>
            <input
              id={f.name}
              type={f.type ?? 'text'}
              value={values[f.name] ?? ''}
              onChange={(e) => setField(f.name, e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm"
              style={{ borderColor: errors[f.name] ? 'var(--color-status-exception)' : 'var(--color-line)' }}
            />
            {errors[f.name] && <p className="mt-1 font-body text-xs" style={{ color: 'var(--color-status-exception)' }}>{errors[f.name]}</p>}
          </div>
        ))}
        
        <div className="sm:col-span-2 mt-4 border-t border-[var(--color-line)] pt-4">
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
          <p className="mt-1 font-body text-xs text-[var(--color-ink-soft)]">Optional. You can select multiple images or mp4 videos.</p>
        </div>

        {saveError && <p className="sm:col-span-2 font-body text-sm" style={{ color: 'var(--color-status-exception)' }}>{saveError}</p>}

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
