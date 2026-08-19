import { Link } from 'react-router-dom'
import {
  PackageSearch, ShieldCheck, Clock, Banknote, ArrowRight, Star,
  PackagePlus, Truck, Bike, CheckCircle2,
} from 'lucide-react'

// Image sourcing per the website-builder skill: real Unsplash photos,
// picked and named for the job they do. Logged in
// public/images/IMAGE-SOURCES.md — swap for real RouteWorks photos over
// time (see Section 12.1 of the build guide: own photos > AI > stock).
const HERO_IMG = 'https://images.unsplash.com/photo-1612630741022-b29ec17d013d?auto=format&fit=crop&w=1600&q=80' // courier in red beside orange van — brand-orange echo
const ABOUT_IMG = 'https://images.unsplash.com/photo-1595054225874-7d2315262e73?auto=format&fit=crop&w=1200&q=80' // team beside boxes — hub proof

// Customer headshots — real people, real names are placeholders (marked
// below) until real reviews/customers are collected. Rule #4: proof needs
// a visual, not just claims.
const REVIEWERS = {
  amara: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  kwabena: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=80',
  adjoa: 'https://images.unsplash.com/photo-1611695434369-a8f5d76ceb7b?auto=format&fit=crop&w=200&q=80',
  yaw: 'https://images.unsplash.com/photo-1567516364473-233c4b6fcfbe?auto=format&fit=crop&w=200&q=80',
  efua: 'https://images.unsplash.com/photo-1581014226839-85d3349f754c?auto=format&fit=crop&w=200&q=80',
  nana: 'https://images.unsplash.com/photo-1562337404-3044c84ac061?auto=format&fit=crop&w=200&q=80',
}

const STEPS = [
  { icon: PackagePlus, title: 'Hand off your item', detail: 'Drop it at our origin partner, or have it forwarded to our warehouse.' },
  { icon: PackageSearch, title: 'Get your Order ID', detail: 'You get a tracking code the moment it\u2019s logged in our system.' },
  { icon: Banknote, title: 'Pay once it arrives', detail: 'Recipient pays what\u2019s owed on the tracking page — Mobile Money or card.' },
  { icon: Bike, title: 'Delivery gets arranged', detail: 'We confirm the address and get it to your door.' },
]

const SERVICES_PREVIEW = [
  { icon: PackagePlus, title: 'Package forwarding', detail: 'Ship to our warehouse abroad, we consolidate and send it on.' },
  { icon: Truck, title: 'International transit', detail: 'Tracked movement from origin country to Ghana, stage by stage.' },
  { icon: ShieldCheck, title: 'Customs clearance', detail: 'We handle clearance so your package doesn\u2019t sit in limbo.' },
]

// PLACEHOLDER REVIEWS — realistic, not real. Replace with actual customer
// feedback as it's collected (Homepage Expansion Task, Section 3). Ratings
// vary and each praises a different aspect (speed, communication,
// reliability) rather than repeating the same phrase.
const REVIEWS = [
  { name: 'Amara Sarpong', photo: REVIEWERS.amara, rating: 5, quote: 'My laptop showed up two days faster than the estimate, and I could see exactly where it was the whole time.' },
  { name: 'Kwabena Owusu', photo: REVIEWERS.kwabena, rating: 5, quote: 'Customs held my order for a bit, but the timeline told me exactly why instead of leaving me guessing.' },
  { name: 'Adjoa Frimpong', photo: REVIEWERS.adjoa, rating: 4, quote: 'Paying on the tracking page once it arrived was so much easier than the bank transfer dance I\u2019m used to.' },
  { name: 'Yaw Antwi', photo: REVIEWERS.yaw, rating: 5, quote: 'I messaged support about a delay and got a real answer within the hour, not a canned response.' },
  { name: 'Efua Danso', photo: REVIEWERS.efua, rating: 5, quote: 'Been using RouteWorks for every order from my supplier in the UK. Never once lost track of a shipment.' },
  { name: 'Nana Kojo', photo: REVIEWERS.nana, rating: 4, quote: 'Delivery to my area in Kumasi took a bit longer than Accra orders, but everything arrived intact.' },
]

const avgRating = (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1)

const PRICING_PREVIEW = [
  { tier: 'Small parcel', price: 'From GHS 80', detail: 'Documents, accessories, anything under 2kg.' },
  { tier: 'Standard', price: 'From GHS 180', detail: 'Most electronics, clothing orders, small appliances.', featured: true },
  { tier: 'Bulk / freight', price: 'Custom quote', detail: 'Multiple boxes or anything over 20kg — talk to us.' },
]

const FAQ_PREVIEW = [
  { q: 'How do I track my package?', a: 'Enter your Order ID on the Track Order page — no account needed.' },
  { q: 'When do I pay?', a: 'Once your shipment has arrived and cleared, right on the tracking page.' },
]

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? 'var(--color-brand-orange)' : 'none'}
          stroke={i < rating ? 'var(--color-brand-orange)' : 'var(--color-line)'}
        />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-xs font-semibold"
              style={{ backgroundColor: '#4D148C14', color: 'var(--color-brand-purple)' }}
            >
              <PackageSearch size={13} /> Real tracking, not a guess
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[var(--color-ink)] sm:text-5xl">
              Your package,<br />
              <span style={{ color: 'var(--color-brand-orange)' }}>every step</span> of the way.
            </h1>
            <p className="mt-5 max-w-md font-body text-base text-[var(--color-ink-soft)]">
              RouteWorks moves packages from pickup to your door and logs
              every stage along the way — so you always know where things
              stand, not just that they're "in progress."
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-brand-orange)' }}
              >
                Ship a Package <ArrowRight size={16} />
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center gap-2 rounded-md border px-5 py-3 font-body text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-white"
                style={{ borderColor: 'var(--color-line)' }}
              >
                Track Order
              </Link>
            </div>

            {/* Proof strip */}
            <div className="mt-7 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[REVIEWERS.amara, REVIEWERS.kwabena, REVIEWERS.adjoa, REVIEWERS.yaw].map((src) => (
                  <img key={src} src={src} alt="" className="h-8 w-8 rounded-full border-2 border-[var(--color-paper)] object-cover" />
                ))}
              </div>
              <p className="font-body text-sm text-[var(--color-ink-soft)]">
                <strong className="text-[var(--color-ink)]">12,400+</strong> deliveries completed
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] shadow-sm">
              <img
                src={HERO_IMG}
                alt="RouteWorks courier standing beside a delivery van"
                className="h-72 w-full object-cover sm:h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust / stats strip */}
      <section className="border-y border-[var(--color-line)] bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 sm:grid-cols-4">
          {[
            ['96%', 'On-time delivery'],
            ['8', 'Regions covered'],
            ['12,400+', 'Parcels moved'],
            ['12hrs', 'Support response'],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <p className="font-display text-2xl font-extrabold" style={{ color: 'var(--color-brand-purple)' }}>{stat}</p>
              <p className="mt-1 font-body text-xs text-[var(--color-ink-soft)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] order-2 lg:order-1">
            <img src={ABOUT_IMG} alt="RouteWorks team at the sorting hub with packages" className="h-64 w-full object-cover sm:h-80" />
          </div>
          <div className="order-1 lg:order-2">
            <span className="font-body text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-brand-orange)' }}>
              About us
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
              Cross-border delivery, without the guesswork
            </h2>
            <p className="mt-3 font-body text-sm text-[var(--color-ink-soft)]">
              We started RouteWorks because "your package is on the way" isn't
              an answer — it's a shrug. Every shipment we handle gets logged
              stage by stage, so you're never left refreshing a page hoping
              for news.
            </p>
            <Link
              to="/about"
              className="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-semibold"
              style={{ color: 'var(--color-brand-purple)' }}
            >
              Read more about us <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="border-t border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">What we handle</h2>
            <Link to="/services" className="hidden font-body text-sm font-semibold sm:inline-flex sm:items-center sm:gap-1" style={{ color: 'var(--color-brand-purple)' }}>
              All services <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {SERVICES_PREVIEW.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="rounded-xl border border-[var(--color-line)] p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md" style={{ background: '#4D148C14', color: 'var(--color-brand-purple)' }}>
                  <Icon size={20} />
                </span>
                <h3 className="mt-3 font-display text-base font-bold text-[var(--color-ink)]">{title}</h3>
                <p className="mt-1.5 font-body text-sm text-[var(--color-ink-soft)]">{detail}</p>
              </div>
            ))}
          </div>
          <Link to="/services" className="mt-6 inline-flex items-center gap-1.5 font-body text-sm font-semibold sm:hidden" style={{ color: 'var(--color-brand-purple)' }}>
            All services <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          From pickup to your door
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative rounded-xl border border-[var(--color-line)] bg-white p-5">
              <span className="font-display text-xs font-bold" style={{ color: 'var(--color-brand-orange)' }}>
                Stage {i + 1}
              </span>
              <h3 className="mt-1.5 font-display text-base font-bold text-[var(--color-ink)]">{step.title}</h3>
              <p className="mt-1.5 font-body text-sm text-[var(--color-ink-soft)]">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews / testimonials */}
      <section className="border-y border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">What customers say</h2>
            <div className="flex items-center gap-2">
              <Stars rating={Math.round(avgRating)} />
              <span className="font-body text-sm font-semibold text-[var(--color-ink)]">{avgRating}/5</span>
              <span className="font-body text-xs text-[var(--color-ink-soft)]">({REVIEWS.length} reviews)</span>
            </div>
          </div>

          <div className="mt-8 flex gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {REVIEWS.map((review) => (
              <div
                key={review.name}
                className="w-72 shrink-0 rounded-xl border border-[var(--color-line)] p-5 sm:w-auto"
              >
                <Stars rating={review.rating} />
                <p className="mt-3 font-body text-sm text-[var(--color-ink)]">"{review.quote}"</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <img src={review.photo} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <span className="font-body text-sm font-semibold text-[var(--color-ink)]">{review.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">Simple pricing</h2>
          <Link to="/products" className="hidden font-body text-sm font-semibold sm:inline-flex sm:items-center sm:gap-1" style={{ color: 'var(--color-brand-purple)' }}>
            Full pricing <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {PRICING_PREVIEW.map((tier) => (
            <div
              key={tier.tier}
              className="rounded-xl border p-6"
              style={tier.featured ? { borderColor: 'var(--color-brand-purple)', borderWidth: 2 } : { borderColor: 'var(--color-line)' }}
            >
              {tier.featured && (
                <span className="mb-2 inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold text-white" style={{ background: 'var(--color-brand-purple)' }}>
                  Most common
                </span>
              )}
              <h3 className="font-display text-base font-bold text-[var(--color-ink)]">{tier.tier}</h3>
              <p className="mt-1 font-display text-xl font-extrabold" style={{ color: 'var(--color-brand-orange)' }}>{tier.price}</p>
              <p className="mt-2 font-body text-sm text-[var(--color-ink-soft)]">{tier.detail}</p>
            </div>
          ))}
        </div>
        <Link to="/products" className="mt-6 inline-flex items-center gap-1.5 font-body text-sm font-semibold sm:hidden" style={{ color: 'var(--color-brand-purple)' }}>
          Full pricing <ArrowRight size={14} />
        </Link>
      </section>

      {/* FAQ preview */}
      <section className="border-t border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">Common questions</h2>
          <div className="mt-6 divide-y divide-[var(--color-line)] rounded-xl border border-[var(--color-line)]">
            {FAQ_PREVIEW.map((item) => (
              <div key={item.q} className="px-5 py-4">
                <p className="font-display text-sm font-bold text-[var(--color-ink)]">{item.q}</p>
                <p className="mt-1 font-body text-sm text-[var(--color-ink-soft)]">{item.a}</p>
              </div>
            ))}
          </div>
          <Link to="/faq" className="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-semibold" style={{ color: 'var(--color-brand-purple)' }}>
            See all FAQs <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div
          className="flex flex-col items-start gap-5 rounded-2xl px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10"
          style={{ background: 'var(--color-brand-purple)' }}
        >
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Have an order ID already?</h2>
            <p className="mt-1.5 font-body text-sm text-white/80">Check its status right now — no account needed.</p>
          </div>
          <Link
            to="/track"
            className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-brand-orange)' }}
          >
            Track a package <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
