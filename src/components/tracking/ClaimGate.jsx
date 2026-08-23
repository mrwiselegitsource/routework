import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShoppingCart, Loader2, MapPin, AlertTriangle, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { db } from '../../lib/db';
import { Link, useNavigate } from 'react-router-dom';

export default function ClaimGate({ trackingId, paymentStatus, claimStatus, amountDue, recipientDetails }) {
  const { cart, addToCart, loading } = useCart();
  const { profile } = useCustomerAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const [deliveryMode, setDeliveryMode] = useState('pickup'); // 'pickup' | 'home'
  const [regions, setRegions] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);

  const [form, setForm] = useState({
    regionId: '',
    pickupPointId: '',
    address: ''
  });
  const [error, setError] = useState(null);

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

  const isInCart = cart?.items?.some(i => i.order_id === trackingId);
  const filteredPickupPoints = pickupPoints.filter(p => p.region_id === form.regionId && p.active !== false);

  let deliveryFee = 0;
  if (form.regionId) {
    const pricing = pricingRules.find(p => p.region_id === form.regionId);
    if (pricing) {
      deliveryFee = deliveryMode === 'home' ? pricing.home_delivery_fee : pricing.pickup_fee;
    }
  }

  const handleClaimAndAddToCart = async () => {
    setError(null);
    if (!profile?.id) {
      // Redirect to login with returnTo state to come back here
      navigate('/login', { state: { returnTo: `/track?trackingId=${trackingId}` } });
      return;
    }
    if (deliveryMode === 'pickup' && !form.pickupPointId) {
      setError('Please select a pickup point.');
      return;
    }
    if (deliveryMode === 'home' && !form.address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }

    setAdding(true);
    try {
      const regionName = regions.find(r => r.id === form.regionId)?.name || '';
      let finalAddress = form.address;
      if (deliveryMode === 'pickup') {
        const point = pickupPoints.find(p => p.id === form.pickupPointId);
        finalAddress = `PICKUP POINT: ${point?.name} - ${point?.address}`;
      }

      // Save delivery details to order
      await db.submitDeliveryDetails(trackingId, {
        recipient_name: profile.name,
        recipient_phone: profile.phone,
        recipient_region: regionName,
        recipient_address: finalAddress,
        customer_id: profile.id
      });

      // Add to cart
      await addToCart(trackingId);
      
      // Navigate to cart for payment
      navigate('/cart');
    } catch (err) {
      console.error("Claim Error:", err);
      setError(`Failed to claim shipment: ${err.message || 'Unknown error'}`);
    } finally {
      setAdding(false);
    }
  };

  if (claimStatus === 'Claimed') {
    return (
      <div className="bg-green-50/50 rounded-3xl border border-green-100 p-6 md:p-8 mt-8 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Delivery Scheduled</h3>
        <p className="text-green-700/80 mb-6 max-w-md mx-auto">
          This shipment has been claimed and delivery is being processed.
        </p>
        {recipientDetails && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 w-full mx-auto text-left space-y-3 mb-4">
             <p className="text-sm"><span className="font-semibold text-gray-500">Name:</span> {recipientDetails.recipient_name}</p>
             <p className="text-sm"><span className="font-semibold text-gray-500">Phone:</span> {recipientDetails.recipient_phone}</p>
             <p className="text-sm"><span className="font-semibold text-gray-500">Address:</span> {recipientDetails.recipient_address}</p>
             <p className="text-sm"><span className="font-semibold text-gray-500">Region:</span> {recipientDetails.recipient_region}</p>
          </div>
        )}
        
        {paymentStatus === 'Unpaid' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <h4 className="font-bold text-red-800 mb-2">Payment Required</h4>
            <p className="text-sm text-red-700 mb-4">You have an outstanding balance for this shipment.</p>
            <button 
              onClick={async () => {
                setAdding(true);
                try {
                  await addToCart(trackingId);
                  navigate('/cart');
                } catch (err) {
                  setError('Failed to process payment request.');
                } finally {
                  setAdding(false);
                }
              }}
              disabled={adding || loading}
              className="bg-[#ff3b30] hover:bg-[#ff1a10] text-white font-bold py-3 px-6 rounded-xl w-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              Pay Outstanding Balance
            </button>
            {error && <p className="text-red-600 text-sm font-semibold mt-2">{error}</p>}
          </div>
        )}
      </div>
    );
  }

  // Not Claimed yet
  return (
    <div className="mt-4 bg-white p-4 animate-slide-up border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b border-gray-100 pb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Delivery Preferences</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setDeliveryMode('pickup')}
          className={`flex items-center gap-2 p-2 border transition-all ${
            deliveryMode === 'pickup'
              ? 'border-[#0033a0] bg-blue-50/30'
              : 'border-gray-200'
          }`}
        >
          <div className={`p-1 ${deliveryMode === 'pickup' ? 'text-[#0033a0]' : 'text-gray-400'}`}>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-gray-900">Pickup</div>
          </div>
        </button>
        <button
          onClick={() => setDeliveryMode('home')}
          className={`flex items-center gap-2 p-2 border transition-all ${
            deliveryMode === 'home'
              ? 'border-[#0033a0] bg-blue-50/30'
              : 'border-gray-200'
          }`}
        >
          <div className={`p-1 ${deliveryMode === 'home' ? 'text-[#0033a0]' : 'text-gray-400'}`}>
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-gray-900">Home</div>
          </div>
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Region</label>
          <select 
            value={form.regionId}
            onChange={(e) => setForm({ ...form, regionId: e.target.value, pickupPointId: '' })}
            className="w-full p-2 border border-gray-200 text-sm focus:border-[#0033a0] focus:outline-none"
          >
            {regions.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {deliveryMode === 'pickup' ? (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Select Location</label>
            <select 
              value={form.pickupPointId}
              onChange={(e) => setForm({ ...form, pickupPointId: e.target.value })}
              className="w-full p-2 border border-gray-200 text-sm focus:border-[#0033a0] focus:outline-none"
            >
              <option value="">-- Choose a location --</option>
              {filteredPickupPoints.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {filteredPickupPoints.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No active pickup points.</p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Address</label>
            <textarea 
              rows="2"
              placeholder="Detailed delivery address..."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2 border border-gray-200 text-sm focus:border-[#0033a0] focus:outline-none resize-none"
            ></textarea>
          </div>
        )}
        
        {error && (
          <div className="p-2 bg-red-50 text-red-700 mb-4 border border-red-100 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Delivery Fee</span>
          <span className="text-lg font-bold text-gray-900">
            {deliveryFee === 0 ? 'FREE' : `GH₵ ${deliveryFee.toFixed(2)}`}
          </span>
        </div>
        <button 
          onClick={handleClaimAndAddToCart}
          disabled={adding || loading || (deliveryMode === 'pickup' ? !form.pickupPointId : !form.address)}
          className="bg-[#ff3b30] hover:bg-[#e0352b] text-white font-bold px-6 py-2 rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
            <>Claim <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
