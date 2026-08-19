import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  { q: 'How do I track my package?', a: 'Enter your Order ID on the Track a Package page — no account required.' },
  { q: 'What does "Current Location" mean?', a: 'It\u2019s the latest status our team has logged for your shipment, not live GPS tracking.' },
  { q: 'How do I pay for my delivery?', a: 'Once your shipment has arrived, a payment step appears on your tracking page.' },
  { q: '[Add more real questions]', a: '[Replace with real answers before launch.]' },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div>
      <PageHeader eyebrow="FAQ" title="Frequently asked questions" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="divide-y divide-[var(--color-line)] rounded-xl border border-[var(--color-line)] bg-white">
          {FAQS.map((item, i) => {
            const open = openIndex === i
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="font-display text-sm font-bold text-[var(--color-ink)]">{item.q}</span>
                  <ChevronDown size={18} className={`text-[var(--color-ink-soft)] transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <p className="px-5 pb-4 font-body text-sm text-[var(--color-ink-soft)]">{item.a}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
