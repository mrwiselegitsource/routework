import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, PackageSearch } from 'lucide-react'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/products', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-paper)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md text-white"
            style={{ background: 'var(--color-brand-purple)' }}
          >
            <PackageSearch size={18} strokeWidth={2.25} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-[var(--color-ink)]">
            Route<span style={{ color: 'var(--color-brand-orange)' }}>Works</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `font-body text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--color-brand-purple)]'
                    : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <NavLink
            to="/track"
            className="rounded-md px-4 py-2 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-brand-orange)' }}
          >
            Track a package
          </NavLink>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-ink)] md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[var(--color-line)] px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-md px-2 py-2 font-body text-sm font-medium ${
                      isActive ? 'text-[var(--color-brand-purple)]' : 'text-[var(--color-ink-soft)]'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-1">
              <NavLink
                to="/track"
                onClick={() => setOpen(false)}
                className="block rounded-md px-4 py-2 text-center font-body text-sm font-semibold text-white"
                style={{ background: 'var(--color-brand-orange)' }}
              >
                Track a package
              </NavLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
