import PageHeader from '../../components/layout/PageHeader'

export default function Products() {
  return (
    <div>
      <PageHeader
        eyebrow="Pricing"
        title="Products & pricing"
        lede="[Replace with real pricing tiers or a rate table once finalized.]"
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-white p-10 text-center">
          <p className="font-body text-sm text-[var(--color-ink-soft)]">
            Pricing table placeholder — build out plan/rate cards here.
          </p>
        </div>
      </div>
    </div>
  )
}
