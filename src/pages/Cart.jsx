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

  const [regions, setRegions] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);

  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const r = await db.getRegions();
      const prc = await db.getDeliveryPricing();
      setRegions(r);
      setPricingRules(prc);
    }
    loadConfig();
  }, []);

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  // Calculate totals
  const outstandingBalance = items.reduce((sum, item) => {
    return sum + (item.order?.payment_status === 'unpaid' ? (parseFloat(item.order?.amount_due) || 0) : 0);
  }, 0);

  const deliveryFee = items.reduce((sum, item) => {
    const regionName = item.order?.recipient_region;
    const address = item.order?.recipient_address || '';
    if (!regionName) return sum;

    const region = regions.find(r => r.name === regionName);
    if (!region) return sum;

    const pricing = pricingRules.find(p => p.region_id === region.id);
    if (pricing) {
      if (address.startsWith('PICKUP POINT:')) {
        return sum + parseFloat(pricing.pickup_fee || 0);
      } else {
        return sum + parseFloat(pricing.home_delivery_fee || 0);
      }
    }
    return sum;
  }, 0);

  const totalDue = outstandingBalance + deliveryFee;

  const handleCheckout = async () => {
    setError(null);
    setCheckingOut(true);
    try {
      // Process all items in cart
      for (const item of items) {
        // 1. Mark as paid if it was unpaid
        if (item.order?.payment_status === 'unpaid') {
          await db.updatePaymentStatus(item.order_id, 'paid', `CART-${cart.id}`);
        }
        
        // 2. Add tracking event
        await db.addTrackingEvent(item.order_id, {
          status: 'delivery_arranged',
          location: 'Dispatch Center',
          description: `Payment completed. Delivery arranged for: ${item.order?.recipient_address}.`
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
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 mb-8">Your shipments have been fully claimed and delivery is being arranged.</p>
        <p className="text-sm text-gray-400">Redirecting to your orders...</p>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

      {!hasItems ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Cart is Empty</h3>
          <p className="text-gray-500">Track a shipment and claim it to proceed to checkout.</p>
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
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">Delivery To:</p>
                    <p className="text-sm text-gray-500">{item.order?.recipient_address}</p>
                    <p className="text-sm text-gray-500">{item.order?.recipient_region}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Shipment Balances</span>
                  <span className="font-semibold">GH₵ {outstandingBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fees</span>
                  <span className="font-semibold">GH₵ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-extrabold text-gray-900">
                  <span>Total Due Today</span>
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
                disabled={checkingOut}
                className="w-full bg-[#0033a0] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                Pay GH₵ {totalDue.toFixed(2)}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Secure checkout process
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
