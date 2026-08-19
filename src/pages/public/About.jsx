import PageHeader from '../../components/layout/PageHeader'

export default function About() {
  return (
    <div>
      <PageHeader
        eyebrow="About"
        title="Why RouteWorks exists"
        lede="Cross-border package delivery usually means a customer hands over money and then waits, hoping. We built RouteWorks to close that gap."
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-5 font-body text-base leading-relaxed text-[var(--color-ink-soft)]">
          <p>
            [Company story goes here — how RouteWorks started, who it serves,
            and what makes the handoff between origin and destination
            reliable. Replace this with real copy before launch.]
          </p>
          <p>
            [Add a section on the team and facilities — this is a good spot
            for real photos per the image strategy in Section 12 of the
            build guide: team, fleet, and hub photos as they become
            available.]
          </p>
        </div>
      </div>
    </div>
  )
}
