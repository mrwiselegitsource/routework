import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShoppingCart, Loader2, MapPin } from 'lucide-react';
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
  const filteredPickupPoints = pickupPoints.filter(p => p.region_id === form.regionId && p.is_active);

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
      console.error(err);
      setError('Failed to claim shipment. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  if (claimStatus === 'Claimed') {
    return (
      <div className="bg-green-50/50 md:rounded-3xl border-y md:border border-green-100 p-6 md:p-8 mt-8 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Delivery Scheduled</h3>
        <p className="text-green-700/80 mb-6 max-w-md mx-auto">
          This shipment has been claimed and delivery is being processed.
        </p>
        {recipientDetails && (
          <div className="bg-white md:rounded-2xl p-6 shadow-sm border-y md:border border-green-100 w-full mx-auto text-left space-y-3">
             <p className="text-sm"><span className="font-semibold text-gray-500">Name:</span> {recipientDetails.recipient_name}</p>
             <p className="text-sm"><span className="font-semibold text-gray-500">Phone:</span> {recipientDetails.recipient_phone}</p>
             <p className="text-sm"><span className="font-semibold text-gray-500">Address:</span> {recipientDetails.recipient_address}</p>
             <p className="text-sm"><span className="font-semibold text-gray-500">Region:</span> {recipientDetails.recipient_region}</p>
          </div>
        )}
      </div>
    );
  }

  // Not Claimed yet
  return (
    <div className="bg-blue-50/30 md:rounded-3xl border-y md:border border-blue-100 p-6 md:p-10 mt-8 text-center">
      <div className="w-16 h-16 bg-blue-100 text-[#0033a0] rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingCart size={32} />
      </div>
      
      <h3 className="text-2xl font-bold text-blue-900 mb-2">Ready to Claim?</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Select your delivery preferences below to claim this shipment and proceed to payment.
      </p>

      {/* Location Selection Form inside ClaimGate */}
      <div className="bg-white md:rounded-2xl shadow-sm border-y md:border border-gray-100 p-6 text-left w-full mx-auto mb-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0033a0]" /> Delivery Details
        </h4>
        
        <div className="space-y-4">
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

          {error && <p className="text-red-500 text-sm font-semibold mt-2">{error}</p>}
        </div>
      </div>

      <div className="bg-white md:rounded-2xl p-4 shadow-sm border-y md:border border-gray-100 w-full mx-auto mb-6 flex flex-col gap-2 text-left">
        {paymentStatus === 'Unpaid' && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              Shipment Balance
            </span>
            <span className="font-bold text-gray-900">GH₵ {amountDue}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            Delivery Fee
          </span>
          <span className="font-bold text-gray-900">GH₵ {(parseFloat(deliveryFee) || 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
          <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
            Total Due Today
          </span>
          <span className="font-bold text-[#0033a0] text-lg">
            GH₵ {((paymentStatus === 'Unpaid' ? (parseFloat(amountDue) || 0) : 0) + (parseFloat(deliveryFee) || 0)).toFixed(2)}
          </span>
        </div>
      </div>

      {isInCart ? (
        <Link 
          to="/cart"
          className="inline-flex items-center justify-center w-full bg-green-500 text-white font-bold py-4 md:rounded-xl shadow-lg hover:bg-green-600 transition-colors gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Added to Cart — Proceed to Checkout
        </Link>
      ) : (
        <button 
          onClick={handleClaimAndAddToCart}
          disabled={adding || loading}
          className="w-full mx-auto bg-orange-500 text-white font-bold py-4 md:rounded-xl shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
          Claim & Add to Cart
        </button>
      )}
    </div>
  );
}
