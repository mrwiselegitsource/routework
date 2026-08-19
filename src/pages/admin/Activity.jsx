import { useEffect, useState } from 'react'
import { db } from '../../lib/db'

export default function Activity() {
  const [log, setLog] = useState([])

  useEffect(() => {
    db.getActivityLog().then(setLog)
  }, [])

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Activity log</h1>
      <p className="mt-1 font-body text-sm text-[var(--color-ink-soft)]">Admin-only, read via RLS (Section 4).</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-[var(--color-line)] bg-[var(--color-paper)]">
            <tr>
              {['When', 'Who', 'Action', 'Order'].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {log.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)]">{new Date(entry.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)]">{entry.profiles?.name || '—'}</td>
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)]">{entry.action}</td>
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)]">{entry.order_id || '—'}</td>
              </tr>
            ))}
            {log.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center font-body text-sm text-[var(--color-ink-soft)]">No activity logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
