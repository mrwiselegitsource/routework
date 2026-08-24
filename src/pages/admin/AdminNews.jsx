import { useEffect, useState } from 'react'
import { PlusCircle, Trash2, Edit } from 'lucide-react'
import { db } from '../../lib/db'
import { useAuth } from '../../context/AuthContext'

export default function AdminNews() {
  const [news, setNews] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [editItem, setEditItem] = useState(null)
  
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const { profile } = useAuth()

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = () => {
    db.getNews().then(setNews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      setError("Please fill out the Title, Excerpt, and Full Content fields.")
      return
    }

    try {
      if (editItem) {
        await db.updateNews(editItem.id, { title, excerpt, content, image_url: imageUrl || null })
      } else {
        await db.addNews({ title, excerpt, content, image_url: imageUrl || null }, profile?.id)
      }
      resetForm()
      fetchNews()
      setSuccess("Published successfully!")
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error publishing news:", err)
      setError("Failed to publish: " + err.message)
    }
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setTitle(item.title)
    setExcerpt(item.excerpt)
    setContent(item.content)
    setImageUrl(item.image_url || '')
    setIsAdding(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this news post?')) {
      await db.deleteNews(id)
      fetchNews()
    }
  }

  const resetForm = () => {
    setIsAdding(false)
    setEditItem(null)
    setTitle('')
    setExcerpt('')
    setContent('')
    setImageUrl('')
  }

  if (isAdding) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">{editItem ? 'Edit News' : 'Add News'}</h1>
          <button onClick={resetForm} className="text-gray-500 hover:text-gray-800">Cancel</button>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[var(--color-line)] max-w-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm font-medium">
              {success}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Short Summary)</label>
            <input type="text" value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Cover Image URL (Optional)</label>
            <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 outline-none" placeholder="https://..." />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Content (Supports Markdown)</label>
            <p className="text-xs text-gray-500 mb-2">You can add images in between paragraphs using: <code>![Description](https://image-url.com/img.png)</code></p>
            <textarea rows="10" value={content} onChange={e => setContent(e.target.value)} className="w-full p-2 border rounded-md font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none"></textarea>
          </div>
          <button type="button" onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors cursor-pointer text-white px-6 py-2 rounded-md font-semibold">
            {editItem ? 'Save Changes' : 'Publish Post'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">News & Announcements</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-md px-4 py-2 font-body text-sm font-semibold text-white"
          style={{ background: 'var(--color-brand-orange)' }}
        >
          <PlusCircle size={16} /> New Post
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-[var(--color-line)] bg-[var(--color-paper)]">
            <tr>
              <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Date</th>
              <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Title</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)] w-32">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 font-body text-sm text-[var(--color-ink)]">
                  {item.title}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {news.length === 0 && (
              <tr><td colSpan="3" className="p-4 text-center text-gray-500">No news posts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
