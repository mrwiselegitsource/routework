import PageHeader from '../../components/layout/PageHeader'
import { PackagePlus, Truck, ShieldCheck, Bike } from 'lucide-react'

const SERVICES = [
  { icon: PackagePlus, title: 'Package forwarding', detail: '[Describe intake and consolidation service.]' },
  { icon: Truck, title: 'International transit', detail: '[Describe shipping lanes / carriers used.]' },
  { icon: ShieldCheck, title: 'Customs clearance', detail: '[Describe how clearance is handled.]' },
  { icon: Bike, title: 'Last-mile delivery', detail: '[Describe local delivery coverage areas.]' },
]

export default function Services() {
  return (
    <div>
      <PageHeader
        eyebrow="Services"
        title="What RouteWorks handles for you"
        lede="From the moment your package is picked up to the moment it reaches your door."
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {SERVICES.map(({ icon: Icon, title, detail }) => (
            <div key={title} className="rounded-xl border border-[var(--color-line)] bg-white p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-md" style={{ background: '#4D148C14', color: 'var(--color-brand-purple)' }}>
                <Icon size={20} />
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-[var(--color-ink)]">{title}</h3>
              <p className="mt-1.5 font-body text-sm text-[var(--color-ink-soft)]">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
