import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import { Mail, Phone, MessageCircle } from 'lucide-react'

export default function Contact() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function validate() {
    const next = {}
    if (!values.name.trim()) next.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.'
    if (!values.message.trim()) next.message = 'Enter a message.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    // TODO: wire to a real endpoint (e.g. a Supabase table or email service).
    setSubmitted(true)
  }

  return (
    <div>
      <PageHeader eyebrow="Contact" title="Get in touch" lede="Questions about a shipment, pricing, or partnering with RouteWorks — reach out below." />
      <div className="mx-auto grid max-w-4xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Phone size={18} className="mt-0.5" style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <p className="font-display text-sm font-bold text-[var(--color-ink)]">Phone</p>
              <p className="font-body text-sm text-[var(--color-ink-soft)]">[Add support number]</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageCircle size={18} className="mt-0.5" style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <p className="font-display text-sm font-bold text-[var(--color-ink)]">WhatsApp</p>
              <p className="font-body text-sm text-[var(--color-ink-soft)]">[Add WhatsApp link]</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail size={18} className="mt-0.5" style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <p className="font-display text-sm font-bold text-[var(--color-ink)]">Email</p>
              <p className="font-body text-sm text-[var(--color-ink-soft)]">[Add support email]</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-[var(--color-line)] bg-white p-6">
            <p className="font-display text-base font-bold text-[var(--color-ink)]">Message sent</p>
            <p className="mt-1.5 font-body text-sm text-[var(--color-ink-soft)]">We'll get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-xl border border-[var(--color-line)] bg-white p-6">
            <div>
              <label htmlFor="name" className="font-body text-xs font-semibold text-[var(--color-ink)]">Name</label>
              <input
                id="name"
                type="text"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm"
                style={{ borderColor: errors.name ? 'var(--color-status-exception)' : 'var(--color-line)' }}
              />
              {errors.name && <p className="mt-1 font-body text-xs" style={{ color: 'var(--color-status-exception)' }}>{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="font-body text-xs font-semibold text-[var(--color-ink)]">Email</label>
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm"
                style={{ borderColor: errors.email ? 'var(--color-status-exception)' : 'var(--color-line)' }}
              />
              {errors.email && <p className="mt-1 font-body text-xs" style={{ color: 'var(--color-status-exception)' }}>{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="message" className="font-body text-xs font-semibold text-[var(--color-ink)]">Message</label>
              <textarea
                id="message"
                rows={4}
                value={values.message}
                onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm"
                style={{ borderColor: errors.message ? 'var(--color-status-exception)' : 'var(--color-line)' }}
              />
              {errors.message && <p className="mt-1 font-body text-xs" style={{ color: 'var(--color-status-exception)' }}>{errors.message}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-md px-4 py-2.5 font-body text-sm font-semibold text-white"
              style={{ background: 'var(--color-brand-orange)' }}
            >
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
