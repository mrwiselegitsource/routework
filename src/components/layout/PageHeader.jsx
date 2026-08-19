// Consistent header block for the lighter public pages (About, Services,
// FAQ, Terms, etc.) so they share one rhythm instead of each inventing
// its own spacing.
export default function PageHeader({ eyebrow, title, lede }) {
  return (
    <div className="border-b border-[var(--color-line)] bg-white">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        {eyebrow && (
          <span className="font-body text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-brand-orange)' }}>
            {eyebrow}
          </span>
        )}
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          {title}
        </h1>
        {lede && <p className="mt-4 font-body text-base text-[var(--color-ink-soft)]">{lede}</p>}
      </div>
    </div>
  )
}
