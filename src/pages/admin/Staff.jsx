import { useEffect, useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { db } from '../../lib/db'

// Admin-only (RequireAuth adminOnly). Rule #9: deactivating a staff account
// is a high-stakes action and needs a confirm step before it happens.
export default function Staff() {
  const [staff, setStaff] = useState([])
  const [confirmId, setConfirmId] = useState(null)
  
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('staff')
  const [newEmail, setNewEmail] = useState('') // For remote creation context

  useEffect(() => {
    fetchStaff()
  }, [])

  function fetchStaff() {
    db.getStaff().then(setStaff)
  }

  async function toggleActive(id, active) {
    await db.setStaffActive(id, !active)
    setStaff((s) => s.map((p) => (p.id === id ? { ...p, active: !active } : p)))
    setConfirmId(null)
  }

  async function handleAddStaff(e) {
    e.preventDefault()
    // NOTE: In a real system, you would call a backend function to create auth user + profile.
    // Here we just insert into profile assuming the user can sign up or this acts as a stub.
    try {
      await db.addStaff({ name: newName, role: newRole, email: newEmail })
      fetchStaff()
      setIsAdding(false)
      setNewName('')
      setNewRole('staff')
      setNewEmail('')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Staff</h1>
          <p className="mt-1 font-body text-sm text-[var(--color-ink-soft)]">
            Every staff member has their own login — the shared passcode from the prototype is retired.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-md px-4 py-2 font-body text-sm font-semibold text-white"
            style={{ background: 'var(--color-brand-orange)' }}
          >
            <PlusCircle size={16} /> Add Staff
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mt-6 bg-white p-6 rounded-xl border border-[var(--color-line)] max-w-xl">
          <h2 className="font-display font-semibold mb-4 text-[var(--color-ink)]">Add New Staff Member</h2>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full p-2 border rounded-md">
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" className="bg-[var(--color-brand-orange)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-orange-600">Add Staff</button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-[var(--color-line)] bg-[var(--color-paper)]">
            <tr>
              {['Name', 'Role', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {staff.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)]">{p.name}</td>
                <td className="px-4 py-3 font-body text-sm capitalize text-[var(--color-ink)]">{p.role}</td>
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)]">{p.active ? 'Active' : 'Deactivated'}</td>
                <td className="px-4 py-3 text-right">
                  {confirmId === p.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="font-body text-xs text-[var(--color-ink-soft)]">Are you sure?</span>
                      <button onClick={() => toggleActive(p.id, p.active)} className="font-body text-xs font-semibold" style={{ color: 'var(--color-status-exception)' }}>Yes, {p.active ? 'deactivate' : 'reactivate'}</button>
                      <button onClick={() => setConfirmId(null)} className="font-body text-xs text-[var(--color-ink-soft)]">Cancel</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmId(p.id)} className="font-body text-xs font-semibold" style={{ color: 'var(--color-brand-purple)' }}>
                      {p.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center font-body text-sm text-[var(--color-ink-soft)]">No staff accounts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
