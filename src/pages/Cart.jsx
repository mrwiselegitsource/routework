import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { db } from '../lib/db';
import { Trash2, MapPin, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function Cart() {
  const { cart, removeFromCart, clearCart, loading: cartLoading } = useCart();
  const { profile } = useCustomerAuth();
  const navigate = useNavigate();

  const [deliveryMode, setDeliveryMode] = useState('pickup'); // 'pickup' | 'home'
  const [regions, setRegions] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);

  const [form, setForm] = useState({
    regionId: '',
    pickupPointId: '',
    address: ''
  });

  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const r = await db.getRegions();
      const p = await db.getPickupPoints();
      const prc = await db.getDeliveryPricing();
      setRegions(r);
      setPickupPoints(p);
      setPricingRules(prc);
      if (r.length > 0) {
        setForm(prev => ({ ...prev, regionId: r[0].id }));
      }
    }
    loadConfig();
  }, []);

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  // Calculate totals
  // 1. Outstanding shipment balances
  const outstandingBalance = items.reduce((sum, item) => {
    return sum + (item.order?.payment_status === 'unpaid' ? (item.order?.amount_due || 0) : 0);
  }, 0);

  // 2. Delivery Fees
  let deliveryFee = 0;
  if (hasItems && form.regionId) {
    const pricing = pricingRules.find(p => p.region_id === form.regionId);
    if (pricing) {
      deliveryFee = deliveryMode === 'home' ? pricing.home_delivery_fee : pricing.pickup_fee;
    }
  }

  const totalDue = outstandingBalance + deliveryFee;

  const filteredPickupPoints = pickupPoints.filter(p => p.region_id === form.regionId && p.is_active);

  const handleCheckout = async () => {
    setError(null);
    if (deliveryMode === 'pickup' && !form.pickupPointId) {
      setError('Please select a pickup point.');
      return;
    }
    if (deliveryMode === 'home' && !form.address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }

    setCheckingOut(true);
    try {
      const regionName = regions.find(r => r.id === form.regionId)?.name || '';
      
      let finalAddress = form.address;
      if (deliveryMode === 'pickup') {
        const point = pickupPoints.find(p => p.id === form.pickupPointId);
        finalAddress = `PICKUP POINT: ${point?.name} - ${point?.address}`;
      }

      // Process all items in cart
      for (const item of items) {
        // 1. Mark as paid if it was unpaid
        if (item.order?.payment_status === 'unpaid') {
          await db.updatePaymentStatus(item.order_id, 'paid', `CART-${cart.id}`);
        }
        
        // 2. Update delivery details
        await db.submitDeliveryDetails(item.order_id, {
          recipient_name: profile.name,
          recipient_phone: profile.phone,
          recipient_region: regionName,
          recipient_address: finalAddress,
          customer_id: profile.id
        });

        // 3. Add tracking event
        await db.addTrackingEvent(item.order_id, {
          status: 'delivery_arranged',
          location: 'Dispatch Center',
          description: `Recipient claimed shipment via cart. Delivery mode: ${deliveryMode === 'pickup' ? 'Pickup' : 'Home'}.`
        }, null);
      }

      await clearCart();
      setSuccess(true);
      setTimeout(() => navigate('/account/orders'), 3000);
    } catch (err) {
      console.error(err);
      setError('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (cartLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#0033a0]" /></div>;
  }

  if (success) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center animate-[fadeIn_0.5s_ease-out]">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Claim Successful!</h2>
        <p className="text-gray-500 mb-8">Your shipments have been claimed and delivery is being arranged.</p>
        <p className="text-sm text-gray-400">Redirecting to your orders...</p>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Cart</h1>

      {!hasItems ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Cart is Empty</h3>
          <p className="text-gray-500">Track a shipment and add it to your cart to claim it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                
                {item.media ? (
                  <img src={item.media.storage_path || item.media.public_url} alt="Shipment preview" className="w-full md:w-32 h-32 object-cover rounded-xl bg-gray-50" onError={(e) => e.target.style.display = 'none'} />
                ) : (
                  <div className="w-full md:w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-300">
                    <MapPin className="w-8 h-8" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.order?.item_name || 'Unknown Item'}</h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">ID: {item.order_id}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.order_id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                      {item.order?.current_status?.replace(/_/g, ' ')}
                    </span>
                    {item.order?.payment_status === 'unpaid' ? (
                      <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
                        Outstanding: GH₵ {item.order.amount_due}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                        Shipment Paid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6">Delivery Details</h3>

              {/* Delivery Options */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Region</label>
                  <select 
                    value={form.regionId}
                    onChange={(e) => setForm({ ...form, regionId: e.target.value, pickupPointId: '' })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:outline-none"
                  >
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('pickup')}
                    className={`py-3 px-2 rounded-xl text-sm font-semibold transition-colors border-2 ${
                      deliveryMode === 'pickup' 
                        ? 'bg-[#0033a0] border-[#0033a0] text-white' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#0033a0]/30'
                    }`}
                  >
                    Pickup Point
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('home')}
                    className={`py-3 px-2 rounded-xl text-sm font-semibold transition-colors border-2 ${
                      deliveryMode === 'home' 
                        ? 'bg-[#0033a0] border-[#0033a0] text-white' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#0033a0]/30'
                    }`}
                  >
                    Home Delivery
                  </button>
                </div>

                {deliveryMode === 'pickup' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Location</label>
                    <select 
                      value={form.pickupPointId}
                      onChange={(e) => setForm({ ...form, pickupPointId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:outline-none"
                    >
                      <option value="">-- Choose a location --</option>
                      {filteredPickupPoints.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    {filteredPickupPoints.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">No active pickup points in this region.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                    <textarea 
                      rows="3"
                      placeholder="Enter detailed delivery address..."
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:outline-none resize-none"
                    ></textarea>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-100 pt-6 space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Shipment Balances</span>
                  <span className="font-semibold">GH₵ {outstandingBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">GH₵ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-extrabold text-gray-900">
                  <span>Total Due</span>
                  <span>GH₵ {totalDue.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2 mb-6">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkingOut || (deliveryMode === 'pickup' && !form.pickupPointId) || (deliveryMode === 'home' && !form.address.trim())}
                className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkingOut && <Loader2 className="w-5 h-5 animate-spin" />}
                {totalDue > 0 ? `Pay & Claim Items` : `Claim Items (Free)`}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
