import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Loader2, Plus, Edit2, Check, X } from 'lucide-react';

export default function AdminRegions() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadRegions();
  }, []);

  async function loadRegions() {
    setLoading(true);
    const data = await db.getRegions();
    setRegions(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    await db.addRegion({ name: newName.trim() });
    setNewName('');
    setIsAdding(false);
    loadRegions();
  }

  async function handleUpdate(id) {
    if (!editName.trim()) return;
    await db.updateRegion(id, { name: editName.trim() });
    setEditingId(null);
    loadRegions();
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#0033a0]" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Regions</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#0033a0] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-900"
        >
          <Plus size={16} /> Add Region
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <ul className="divide-y">
          {isAdding && (
            <li className="p-4 flex items-center gap-4 bg-blue-50">
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New Region Name"
                className="flex-1 px-3 py-2 border rounded-md"
                autoFocus
              />
              <button onClick={handleAdd} className="p-2 text-green-600 hover:bg-green-100 rounded-md"><Check size={20} /></button>
              <button onClick={() => setIsAdding(false)} className="p-2 text-red-600 hover:bg-red-100 rounded-md"><X size={20} /></button>
            </li>
          )}

          {regions.map(r => (
            <li key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              {editingId === r.id ? (
                <div className="flex items-center gap-4 w-full">
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                    autoFocus
                  />
                  <button onClick={() => handleUpdate(r.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-md"><Check size={20} /></button>
                  <button onClick={() => setEditingId(null)} className="p-2 text-red-600 hover:bg-red-100 rounded-md"><X size={20} /></button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-gray-900">{r.name}</span>
                  <button 
                    onClick={() => { setEditingId(r.id); setEditName(r.name); }}
                    className="p-2 text-gray-400 hover:text-[#0033a0] hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </>
              )}
            </li>
          ))}
          {regions.length === 0 && !isAdding && (
            <li className="p-8 text-center text-gray-500">No regions found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
