import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Loader2, Plus, Edit2, Check, X, MapPin } from 'lucide-react';

export default function AdminPickupPoints() {
  const [points, setPoints] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [editForm, setEditForm] = useState({ name: '', address: '', region_id: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', address: '', region_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [pts, regs] = await Promise.all([
      db.getPickupPoints(),
      db.getRegions()
    ]);
    setPoints(pts);
    setRegions(regs);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newForm.name.trim() || !newForm.region_id) return;
    await db.addPickupPoint({
      name: newForm.name.trim(),
      address: newForm.address.trim(),
      region_id: newForm.region_id
    });
    setNewForm({ name: '', address: '', region_id: '' });
    setIsAdding(false);
    loadData();
  }

  async function handleUpdate(id) {
    if (!editForm.name.trim() || !editForm.region_id) return;
    await db.updatePickupPoint(id, {
      name: editForm.name.trim(),
      address: editForm.address.trim(),
      region_id: editForm.region_id
    });
    setEditingId(null);
    loadData();
  }

  const getRegionName = (id) => regions.find(r => r.id === id)?.name || 'Unknown Region';

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#0033a0]" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pickup Points</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#0033a0] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-900"
        >
          <Plus size={16} /> Add Pickup Point
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <ul className="divide-y">
          {isAdding && (
            <li className="p-4 bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input 
                  type="text" 
                  value={newForm.name} 
                  onChange={(e) => setNewForm({...newForm, name: e.target.value})}
                  placeholder="Location Name"
                  className="px-3 py-2 border rounded-md"
                  autoFocus
                />
                <input 
                  type="text" 
                  value={newForm.address} 
                  onChange={(e) => setNewForm({...newForm, address: e.target.value})}
                  placeholder="Address details"
                  className="px-3 py-2 border rounded-md"
                />
                <select 
                  value={newForm.region_id} 
                  onChange={(e) => setNewForm({...newForm, region_id: e.target.value})}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Select Region...</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleAdd} className="px-4 py-2 bg-[#0033a0] text-white font-medium rounded-lg hover:bg-blue-900">Save</button>
              </div>
            </li>
          )}

          {points.map(p => (
            <li key={p.id} className="p-4 hover:bg-gray-50">
              {editingId === p.id ? (
                <div className="space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="px-3 py-2 border rounded-md"
                    />
                    <input 
                      type="text" 
                      value={editForm.address} 
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="px-3 py-2 border rounded-md"
                    />
                    <select 
                      value={editForm.region_id} 
                      onChange={(e) => setEditForm({...editForm, region_id: e.target.value})}
                      className="px-3 py-2 border rounded-md"
                    >
                      {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={() => handleUpdate(p.id)} className="px-4 py-2 bg-[#0033a0] text-white font-medium rounded-lg hover:bg-blue-900">Update</button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <MapPin size={16} className="text-[#0033a0]"/> {p.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{p.address}</p>
                    <p className="text-xs font-semibold text-gray-400 mt-2 uppercase tracking-wide">{getRegionName(p.region_id)}</p>
                  </div>
                  <button 
                    onClick={() => { setEditingId(p.id); setEditForm({ name: p.name, address: p.address, region_id: p.region_id }); }}
                    className="p-2 text-gray-400 hover:text-[#0033a0] hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </li>
          ))}
          {points.length === 0 && !isAdding && (
            <li className="p-8 text-center text-gray-500">No pickup points found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
