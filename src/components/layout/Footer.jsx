import { Link } from 'react-router-dom'
import { PackageSearch, Phone, MessageCircle } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--color-line)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md text-white"
                style={{ background: 'var(--color-brand-purple)' }}
              >
                <PackageSearch size={16} strokeWidth={2.25} />
              </span>
              <span className="font-display text-base font-bold text-[var(--color-ink)]">
                RouteWorks
              </span>
            </Link>
            <p className="mt-3 max-w-xs font-body text-sm text-[var(--color-ink-soft)]">
              Package forwarding and last-mile delivery, tracked from pickup to your door.
            </p>
          </div>

          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wide text-[var(--color-ink-soft)]">
              Company
            </h3>
            <ul className="mt-3 space-y-2 font-body text-sm">
              <li><Link to="/about" className="text-[var(--color-ink)] hover:text-[var(--color-brand-purple)]">About</Link></li>
              <li><Link to="/services" className="text-[var(--color-ink)] hover:text-[var(--color-brand-purple)]">Services</Link></li>
              <li><Link to="/products" className="text-[var(--color-ink)] hover:text-[var(--color-brand-purple)]">Pricing</Link></li>
              <li><Link to="/contact" className="text-[var(--color-ink)] hover:text-[var(--color-brand-purple)]">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wide text-[var(--color-ink-soft)]">
              Support
            </h3>
            <ul className="mt-3 space-y-2 font-body text-sm">
              <li><Link to="/track" className="text-[var(--color-ink)] hover:text-[var(--color-brand-purple)]">Track a package</Link></li>
              <li><Link to="/faq" className="text-[var(--color-ink)] hover:text-[var(--color-brand-purple)]">FAQ</Link></li>
              <li><Link to="/contact" className="text-[var(--color-ink)] hover:text-[var(--color-brand-purple)]">Contact us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wide text-[var(--color-ink-soft)]">
              Legal
            </h3>
            <ul className="mt-3 space-y-2 font-body text-sm">
              <li><Link to="/terms" className="text-[var(--color-ink)] hover:text-[var(--color-brand-purple)]">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-[var(--color-ink)] hover:text-[var(--color-brand-purple)]">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--color-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs text-[var(--color-ink-soft)]">
            © {year} RouteWorks. All rights reserved.
          </p>
          <div className="flex items-center gap-4 font-body text-xs text-[var(--color-ink-soft)]">
            <span className="inline-flex items-center gap-1.5">
              <Phone size={14} /> Support line on the Contact page
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle size={14} /> WhatsApp available per shipment
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
