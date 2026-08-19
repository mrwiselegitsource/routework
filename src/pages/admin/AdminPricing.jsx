import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Loader2, Plus, Edit2, Check, X, Banknote } from 'lucide-react';

export default function AdminPricing() {
  const [pricing, setPricing] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [editForm, setEditForm] = useState({ home_delivery_fee: 0, pickup_fee: 0, region_id: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ home_delivery_fee: 0, pickup_fee: 0, region_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [prices, regs] = await Promise.all([
      db.getDeliveryPricing(),
      db.getRegions()
    ]);
    setPricing(prices);
    setRegions(regs);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newForm.region_id) return;
    await db.addDeliveryPricing({
      home_delivery_fee: Number(newForm.home_delivery_fee),
      pickup_fee: Number(newForm.pickup_fee),
      region_id: newForm.region_id
    });
    setNewForm({ home_delivery_fee: 0, pickup_fee: 0, region_id: '' });
    setIsAdding(false);
    loadData();
  }

  async function handleUpdate(id) {
    if (!editForm.region_id) return;
    await db.updateDeliveryPricing(id, {
      home_delivery_fee: Number(editForm.home_delivery_fee),
      pickup_fee: Number(editForm.pickup_fee),
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
        <h1 className="text-2xl font-bold text-gray-900">Delivery Pricing</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#0033a0] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-900"
        >
          <Plus size={16} /> Add Pricing Rule
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <ul className="divide-y">
          {isAdding && (
            <li className="p-4 bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select 
                  value={newForm.region_id} 
                  onChange={(e) => setNewForm({...newForm, region_id: e.target.value})}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Select Region...</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Home Delivery (GH₵)</label>
                  <input 
                    type="number" 
                    value={newForm.home_delivery_fee} 
                    onChange={(e) => setNewForm({...newForm, home_delivery_fee: e.target.value})}
                    className="px-3 py-2 border rounded-md w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Pickup Fee (GH₵)</label>
                  <input 
                    type="number" 
                    value={newForm.pickup_fee} 
                    onChange={(e) => setNewForm({...newForm, pickup_fee: e.target.value})}
                    className="px-3 py-2 border rounded-md w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleAdd} className="px-4 py-2 bg-[#0033a0] text-white font-medium rounded-lg hover:bg-blue-900">Save</button>
              </div>
            </li>
          )}

          {pricing.map(p => (
            <li key={p.id} className="p-4 hover:bg-gray-50">
              {editingId === p.id ? (
                <div className="space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select 
                      value={editForm.region_id} 
                      onChange={(e) => setEditForm({...editForm, region_id: e.target.value})}
                      className="px-3 py-2 border rounded-md"
                      disabled
                    >
                      {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Home Delivery (GH₵)</label>
                      <input 
                        type="number" 
                        value={editForm.home_delivery_fee} 
                        onChange={(e) => setEditForm({...editForm, home_delivery_fee: e.target.value})}
                        className="px-3 py-2 border rounded-md w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Pickup Fee (GH₵)</label>
                      <input 
                        type="number" 
                        value={editForm.pickup_fee} 
                        onChange={(e) => setEditForm({...editForm, pickup_fee: e.target.value})}
                        className="px-3 py-2 border rounded-md w-full"
                      />
                    </div>
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
                      <Banknote size={16} className="text-green-600"/> {getRegionName(p.region_id)}
                    </h3>
                    <div className="mt-2 flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs font-semibold uppercase">Home Delivery</span>
                        <span className="font-mono text-gray-900">GH₵ {p.home_delivery_fee}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs font-semibold uppercase">Pickup Point</span>
                        <span className="font-mono text-gray-900">GH₵ {p.pickup_fee}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setEditingId(p.id); setEditForm({ home_delivery_fee: p.home_delivery_fee, pickup_fee: p.pickup_fee, region_id: p.region_id }); }}
                    className="p-2 text-gray-400 hover:text-[#0033a0] hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </li>
          ))}
          {pricing.length === 0 && !isAdding && (
            <li className="p-8 text-center text-gray-500">No pricing rules found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
