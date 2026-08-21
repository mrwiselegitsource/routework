import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { db } from '../lib/db';
import { Trash2, MapPin, CheckCircle2, AlertTriangle, Loader2, ChevronRight, CreditCard, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import EditAddressModal from '../components/checkout/EditAddressModal';
import { saveAddressLocally, loadAddressLocally } from '../lib/local/address';

export default function Cart() {
  const { cart, removeFromCart, clearCart, loading: cartLoading } = useCart();
  const { profile } = useCustomerAuth();
  const navigate = useNavigate();

  const [regions, setRegions] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);

  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Master Shipping Address State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(() => {
    const saved = loadAddressLocally();
    return saved || {
      contactName: profile?.full_name || '',
      phone: profile?.phone || '',
      street: '',
      region: '',
      city: ''
    };
  });

  // Try to pre-fill address from the first cart item if available, ONLY if not loaded from local storage
  useEffect(() => {
    if (!shippingAddress.street && cart?.items && cart.items.length > 0) {
      const firstItemOrder = cart.items[0].order;
      if (firstItemOrder?.recipient_address) {
        const parts = firstItemOrder.recipient_address.split(',');
        setShippingAddress(prev => ({
          ...prev,
          contactName: firstItemOrder.recipient_name || prev.contactName,
          phone: firstItemOrder.recipient_phone || prev.phone,
          street: parts[0] ? parts[0].trim() : '',
          region: firstItemOrder.recipient_region || prev.region,
          city: parts.length > 1 ? parts[1].trim() : ''
        }));
      }
    }
  }, [cart?.items]);

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
    const regionName = shippingAddress.region;
    if (!regionName) return sum;

    const region = regions.find(r => r.name === regionName);
    if (!region) return sum;

    const pricing = pricingRules.find(p => p.region_id === region.id);
    if (pricing) {
      return sum + parseFloat(pricing.home_delivery_fee || 0);
    }
    return sum;
  }, 0);

  const totalDue = outstandingBalance + deliveryFee;

  const handleSaveAddress = (newAddress) => {
    setShippingAddress(newAddress);
    saveAddressLocally(newAddress);
    setIsEditingAddress(false);
  };

  const handleCheckout = async () => {
    if (!shippingAddress.street || !shippingAddress.region || !shippingAddress.phone || !shippingAddress.contactName) {
      setError("Please fill out the complete shipping address before placing the order.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setError(null);
    setCheckingOut(true);
    
    const formattedAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.region}, Ghana`;

    try {
      // Process all items in cart
      for (const item of items) {
        // Update the order in the database with the master address details
        await db.updateOrderDetails(item.order_id, {
          recipient_name: shippingAddress.contactName,
          recipient_phone: shippingAddress.phone,
          recipient_address: formattedAddress,
          recipient_region: shippingAddress.region
        });

        // 1. Mark as paid if it was unpaid
        if (item.order?.payment_status === 'unpaid') {
          await db.updatePaymentStatus(item.order_id, 'paid', `CART-${cart.id}`);
        }
        
        // 2. Add tracking event
        await db.addTrackingEvent(item.order_id, {
          status: 'delivery_arranged',
          location: 'Dispatch Center',
          description: `Payment completed. Delivery arranged for: ${formattedAddress}.`
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
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center animate-[fadeIn_0.5s_ease-out] mt-8 max-w-lg mx-auto">
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
    <div className="bg-[#f2f2f2] min-h-screen pb-24 md:py-8">
      {/* Mobile Header (AliExpress style) */}
      <div className="bg-white px-4 py-3 sticky top-0 z-10 md:hidden flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 mx-auto">Checkout</h1>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      <div className="max-w-3xl mx-auto px-3 md:px-4 space-y-3 pt-3 md:pt-0">
        
        <h1 className="text-3xl font-extrabold text-gray-900 hidden md:block mb-6">Checkout</h1>

        {!hasItems ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Cart is Empty</h3>
            <p className="text-gray-500">Track a shipment and claim it to proceed to checkout.</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Shipping Address Block */}
            <div 
              onClick={() => setIsEditingAddress(true)}
              className="bg-white rounded-2xl p-4 md:p-5 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div>
                <h2 className="text-sm font-bold text-gray-900 mb-2">Shipping address</h2>
                {shippingAddress.contactName ? (
                  <div className="space-y-1">
                    <p className="text-base font-bold text-gray-900">
                      {shippingAddress.contactName}
                    </p>
                    <p className="text-sm text-gray-500 font-mono">+233 {shippingAddress.phone}</p>
                    <p className="text-sm text-gray-500">
                      {shippingAddress.street}
                    </p>
                    <p className="text-sm text-gray-500">
                      {shippingAddress.city ? `${shippingAddress.city}, ` : ''}{shippingAddress.region}, Ghana
                    </p>
                  </div>
                ) : (
                  <p className="text-red-500 font-semibold text-sm">Please add a shipping address</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Payment Methods</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" className="w-5 h-5 text-[#ff3b30] focus:ring-[#ff3b30]" defaultChecked />
                  <CreditCard className="w-6 h-6 text-gray-600" />
                  <span className="font-semibold text-gray-800">Credit / Debit Card</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 opacity-50">
                  <input type="radio" name="payment" disabled className="w-5 h-5" />
                  <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center text-xs font-bold text-black">M</div>
                  <span className="font-semibold text-gray-800">Mobile Money (Coming Soon)</span>
                </label>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center">
                <span className="bg-yellow-100 text-yellow-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Choice</span>
                <span className="text-sm font-bold text-gray-900 ml-2">Shipped by RouteWorks</span>
              </div>
              
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4 bg-gray-50/30">
                    {item.media ? (
                      <img src={item.media.storage_path || item.media.public_url} alt="Item" className="w-24 h-24 object-cover rounded-lg bg-gray-50" onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                      <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 text-gray-300">
                        <MapPin className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm text-gray-900 line-clamp-2 leading-tight">
                          {item.order?.item_name || 'Unknown Item'}
                        </h3>
                        <button onClick={() => removeFromCart(item.order_id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-end">
                        {item.order?.payment_status === 'unpaid' ? (
                          <div>
                            <span className="font-extrabold text-gray-900">GH₵ {item.order.amount_due}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Shipment Paid</span>
                        )}
                        <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-full">Qty: 1</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-4 py-3 bg-white text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Shipping:</span>
                  <span className="font-bold text-gray-900">{deliveryFee > 0 ? `GH₵ ${deliveryFee.toFixed(2)}` : 'Free shipping'}</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">GH₵ {outstandingBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping fee</span>
                  <span className="font-semibold text-gray-900">{deliveryFee > 0 ? `GH₵ ${deliveryFee.toFixed(2)}` : 'Free'}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-6 text-center">
                Upon clicking 'Place order', I confirm I have read and acknowledged <span className="text-blue-500 cursor-pointer hover:underline">all terms and policies</span>.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      {hasItems && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 md:py-4 md:px-8 flex items-center justify-between z-20 md:max-w-3xl md:mx-auto md:rounded-t-2xl">
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-xl font-extrabold text-gray-900">GH₵ {totalDue.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="bg-[#ff3b30] hover:bg-[#ff1a10] text-white font-bold px-8 py-3 rounded-full shadow-lg transition-colors disabled:opacity-50 min-w-[140px] flex items-center justify-center gap-2 text-base"
          >
            {checkingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Place order'}
          </button>
        </div>
      )}

      <EditAddressModal 
        isOpen={isEditingAddress}
        onClose={() => setIsEditingAddress(false)}
        addressData={shippingAddress}
        onSave={handleSaveAddress}
        regions={regions}
      />
    </div>
  );
}
