import React, { useState, useEffect, useMemo } from 'react';
import { PackageSearch, Package, MapPin, Loader2, ArrowRight, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function CustomerOrders() {
  const { profile } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediaMap, setMediaMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, delivered, exceptions

  useEffect(() => {
    async function loadOrders() {
      if (!profile?.id) return;
      try {
        const data = await db.getCustomerOrders(profile.id);
        setOrders(data);
        
        // Load first image for each order
        const map = {};
        for (const o of data) {
          const media = await db.getOrderMedia(o.order_id);
          if (media && media.length > 0) {
            const img = media.find(m => m.media_type === 'image') || media[0];
            map[o.order_id] = img.public_url || img.storage_path;
          }
        }
        setMediaMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [profile?.id]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (o.item_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      if (filter === 'active') {
        matchesFilter = !['delivered', 'delivery_attempt_failed', 'returned_to_sender', 'held_by_customs'].includes(o.current_status);
      } else if (filter === 'delivered') {
        matchesFilter = o.current_status === 'delivered';
      } else if (filter === 'exceptions') {
        matchesFilter = ['delivery_attempt_failed', 'returned_to_sender', 'held_by_customs', 'address_issue'].includes(o.current_status);
      }

      return matchesSearch && matchesFilter;
    });
  }, [orders, searchTerm, filter]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#0033a0]" /></div>;
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-500">Manage and track all your shipments.</p>
        </div>
        <Link to="/track" className="bg-orange-100 text-orange-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-orange-200 transition-colors text-center shadow-sm">
          Track New Shipment
        </Link>
      </div>

      {orders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['all', 'active', 'delivered', 'exceptions'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                  filter === f ? 'bg-[#0033a0] text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search ID or name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0033a0] transition-colors"
            />
          </div>
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't claimed any shipments yet. Track a shipment and add it to your cart to claim it.</p>
          <Link to="/track" className="inline-block bg-[#0033a0] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-900 transition-colors shadow-lg">
            Track a Shipment
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No shipments found matching your search and filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-shadow">
              
              {mediaMap[order.order_id] ? (
                <Link to={`/track?id=${order.order_id}`} className="shrink-0 block group">
                  <img src={mediaMap[order.order_id].startsWith('http') ? mediaMap[order.order_id] : mediaMap[order.order_id]} alt="Preview" className="w-full md:w-32 h-32 object-cover rounded-xl bg-gray-50 group-hover:opacity-80 transition-opacity" />
                </Link>
              ) : (
                <Link to={`/track?id=${order.order_id}`} className="w-full md:w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-300 shrink-0 hover:bg-gray-100 transition-colors">
                  <Package className="w-8 h-8" />
                </Link>
              )}

              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{order.item_name || 'Unknown Item'}</h3>
                    <p className="text-sm text-gray-500 font-mono tracking-wider">{order.order_id}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap self-start ${
                    order.current_status === 'delivered' ? 'bg-green-100 text-green-700' :
                    ['delivery_attempt_failed', 'held_by_customs', 'address_issue'].includes(order.current_status) ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.current_status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{order.recipient_address || 'Address pending'}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Link 
                    to={`/track?id=${order.order_id}`}
                    className="flex items-center gap-2 text-[#0033a0] font-bold text-sm hover:text-blue-800 transition-colors"
                  >
                    View Status & Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
