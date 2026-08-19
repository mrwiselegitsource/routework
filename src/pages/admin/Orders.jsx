import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { db } from '../../lib/db'
import { statusMeta } from '../../data/statusIcons'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    db.getOrders()
      .then((data) => { if (active) setOrders(data) })
      .catch((err) => console.warn('[orders]', err.message))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = orders.filter((o) =>
    `${o.order_id} ${o.item_name} ${o.recipient_name}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Orders</h1>
        <Link to="/admin/orders/new" className="rounded-md px-4 py-2 font-body text-sm font-semibold text-white" style={{ background: 'var(--color-brand-orange)' }}>
          + New order
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-md border bg-white px-3 py-2" style={{ borderColor: 'var(--color-line)' }}>
        <Search size={16} className="text-[var(--color-ink-soft)]" />
        <input
          type="text"
          placeholder="Search by order ID, item, or recipient…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full font-body text-sm outline-none"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-[var(--color-line)] bg-[var(--color-paper)]">
            <tr>
              {['Order ID', 'Item', 'Recipient', 'Status', 'Payment'].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {filtered.map((order) => (
              <tr key={order.order_id} className="hover:bg-[var(--color-paper)]">
                <td className="px-4 py-3">
                  <Link to={`/admin/orders/${order.order_id}`} className="font-body text-sm font-semibold" style={{ color: 'var(--color-brand-purple)' }}>
                    {order.order_id}
                  </Link>
                </td>
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)]">{order.item_name}</td>
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)]">{order.recipient_name || '—'}</td>
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)]">{statusMeta(order.current_status).label}</td>
                <td className="px-4 py-3 font-body text-sm capitalize text-[var(--color-ink)]">{order.payment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="px-4 py-8 text-center font-body text-sm text-[var(--color-ink-soft)]">No orders yet.</p>
        )}
        {loading && (
          <p className="px-4 py-8 text-center font-body text-sm text-[var(--color-ink-soft)]">Loading orders…</p>
        )}
      </div>
    </div>
  )
}
