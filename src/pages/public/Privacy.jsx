import PageHeader from '../../components/layout/PageHeader'

export default function Privacy() {
  return (
    <div>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <div className="mx-auto max-w-3xl px-4 py-12 font-body text-sm leading-relaxed text-[var(--color-ink-soft)] sm:px-6">
        <p>[Insert real Privacy Policy text before launch — cover what recipient data is collected (Section 4: recipient_name, phone, address, region) and how it's used/retained.]</p>
      </div>
    </div>
  )
}
