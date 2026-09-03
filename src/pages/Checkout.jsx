import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { db } from '../lib/db';
import { MapPin, CheckCircle2, AlertTriangle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import EditAddressModal from '../components/checkout/EditAddressModal';
import { saveAddressLocally, loadAddressLocally } from '../lib/local/address';
import EverSendGateway from '../components/payments/EverSendGateway';
import { usePaymentSettings } from '../context/PaymentSettingsContext';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, removeFromCart, loading: cartLoading } = useCart();
  const { profile } = useCustomerAuth();
  const { settings: gwSettings } = usePaymentSettings();

  const selectedItemIds = location.state?.selectedItemIds || [];

  // Determine which gateways the admin has enabled
  const gatewayEnabled = {
    card: gwSettings?.card_enabled !== false,
    eversend: gwSettings?.eversend_enabled !== false,
    paypal: gwSettings?.paypal_enabled !== false,
  };

  const [regions, setRegions] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);

  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showEverSend, setShowEverSend] = useState(false);

  // Auto-select first enabled gateway whenever settings load/change
  useEffect(() => {
    if (!gwSettings) return;
    const order = ['card', 'eversend', 'paypal'];
    const first = order.find(id => gwSettings[`${id}_enabled`] !== false);
    if (first) setPaymentMethod(first);
  }, [gwSettings]);
  
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

  // Redirect to cart if no items selected
  useEffect(() => {
    if (!selectedItemIds.length) {
      navigate('/cart', { replace: true });
    }
  }, [selectedItemIds, navigate]);

  useEffect(() => {
    if (!shippingAddress.street && cart?.items && cart.items.length > 0) {
      const firstItemOrder = cart.items.find(i => selectedItemIds.includes(i.order_id))?.order;
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
  }, [cart?.items, selectedItemIds]);

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
  const selectedItems = items.filter(item => selectedItemIds.includes(item.order_id));

  const outstandingBalance = selectedItems.reduce((sum, item) => {
    if (item.order?.payment_status === 'paid') return sum;
    const amount = typeof item.order?.amount_due === 'number' 
      ? item.order.amount_due 
      : parseFloat(item.order?.amount_due || 0);
    return sum + amount;
  }, 0);

  const deliveryFee = selectedItems.reduce((sum, item) => {
    if (item.order?.shipping_payment_status === 'paid' || item.order?.payment_status === 'paid') return sum;
    // If order already has a preset shipping fee > 0, don't duplicate dynamic fee
    if (item.order?.shipping_fee > 0) return sum;

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

  const handleCheckoutClick = () => {
    if (!shippingAddress?.contactName) {
      setError('Please provide a shipping address before checkout.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    if (paymentMethod === 'eversend') {
      setShowEverSend(true);
    } else if (paymentMethod === 'card') {
      processNexusPayCheckout();
    } else {
      processCheckout();
    }
  };

  const processNexusPayCheckout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      const line_items = [{
        price_data: {
          unit_amount: Math.round(totalDue * 100)
        }
      }];
      
      const payload = {
        line_items,
        success_url: `${window.location.origin}/checkout/success`,
        cancel_url: `${window.location.origin}/cart`
      };

      const res = await fetch('https://nexuspay-gateway-post.vercel.app/api/checkout/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to initialize checkout session');
      const session = await res.json();
      
      localStorage.setItem('nexus_pending_checkout', JSON.stringify({
        shippingAddress,
        selectedItems,
        cartId: cart.id
      }));

      window.location.href = session.url;
    } catch (err) {
      console.error(err);
      setError('Checkout gateway unavailable. Please try again later.');
      setCheckingOut(false);
    }
  };

  const processCheckout = async (proofUrl = null) => {
    setCheckingOut(true);
    setError(null);
    
    const formattedAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.region}, Ghana`;

    try {
      for (const item of selectedItems) {
        await db.updateOrder(item.order_id, {
          recipient_name: shippingAddress.contactName,
          recipient_phone: shippingAddress.phone,
          recipient_address: formattedAddress,
          recipient_region: shippingAddress.region
        });

        if (item.order?.payment_status === 'unpaid') {
          if (paymentMethod === 'eversend') {
            await db.updatePaymentStatus(item.order_id, 'pending_verification', proofUrl ? `EVERSEND_PROOF_${proofUrl}` : `EVERSEND_CART-${cart.id}`);
          } else {
            await db.updatePaymentStatus(item.order_id, 'paid', `CART-${cart.id}`);
          }
        }
        
        await db.addTrackingEvent(item.order_id, {
          status: 'delivery_arranged',
          location: 'Dispatch Center',
          description: paymentMethod === 'eversend' 
            ? `Payment proof submitted. Delivery arranging pending verification for: ${formattedAddress}.`
            : `Payment completed. Delivery arranged for: ${formattedAddress}.`
        }, null);
        
        await removeFromCart(item.order_id);
      }

      setShowEverSend(false);
      setSuccess(true);
      setTimeout(() => navigate('/account/orders'), 3000);
    } catch (err) {
      console.error(err);
      setError('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (cartLoading || !selectedItemIds.length) {
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
    <div className="bg-[#f2f2f2] min-h-screen pb-24">
      <div className="bg-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 md:hidden">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 flex items-center gap-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
          <span className="text-lg font-bold text-gray-900">Checkout</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-2 pt-2 md:pt-4">
        <h1 className="text-2xl font-bold text-gray-900 hidden md:block px-4">Checkout</h1>

        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex gap-3 items-start md:mx-0 mx-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold mb-1">Important Anti-Fraud Warning</p>
            <p>Please ensure that you are only paying for shipments that rightfully belong to you. Attempting to claim or pay for someone else's shipment is considered theft. All claims are securely logged and fraudulent activities will be reported to the authorities.</p>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-2 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div 
          onClick={() => setIsEditingAddress(true)}
          className="bg-white px-4 py-3 flex justify-between items-center cursor-pointer"
        >
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">Shipping address</h2>
            {shippingAddress.contactName ? (
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {shippingAddress.contactName}
                </p>
                <p className="text-xs text-gray-500">+233 {shippingAddress.phone}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase">
                  {shippingAddress.city ? `${shippingAddress.city}, ` : ''}{shippingAddress.region}, {shippingAddress.street}
                </p>
              </div>
            ) : (
              <p className="text-[#ff3b30] font-semibold text-sm">Please add a shipping address</p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <div className="bg-white px-4 py-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Select Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* ── Credit / Debit Card ── */}
            {gatewayEnabled.card && (
              <div
                onClick={() => setPaymentMethod('card')}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === 'card'
                    ? 'border-[#ff3b30] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {paymentMethod === 'card' && (
                  <div className="absolute top-2 right-2 bg-[#ff3b30] rounded-full p-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex gap-2 items-center h-8 mb-1">
                  <img src="https://cdn.iconscout.com/icon/free/png-256/visa-3-226460.png" alt="Visa" className="h-4 object-contain" />
                  <img src="https://cdn.iconscout.com/icon/free/png-256/mastercard-2-226462.png" alt="Mastercard" className="h-6 object-contain" />
                </div>
                <span className={`font-bold ${paymentMethod === 'card' ? 'text-[#ff3b30]' : 'text-gray-700'}`}>Credit / Debit</span>
              </div>
            )}

            {/* ── EverSend ── */}
            {gatewayEnabled.eversend && (
              <div
                onClick={() => setPaymentMethod('eversend')}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === 'eversend'
                    ? 'border-[#0033a0] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {paymentMethod === 'eversend' && (
                  <div className="absolute top-2 right-2 bg-[#0033a0] rounded-full p-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="h-8 flex flex-col items-center mb-1">
                  <img src="https://eversend.co/assets/eversend-logo.png" alt="EverSend" className="h-6 object-contain mb-1" />
                  <div className="bg-[#40e0d0] text-gray-900 px-2 py-0.5 rounded text-[10px] font-bold">
                    MTN, Telecel, Tigo
                  </div>
                </div>
                <span className={`font-bold ${paymentMethod === 'eversend' ? 'text-[#0033a0]' : 'text-gray-700'}`}>EverSend</span>
              </div>
            )}

            {/* ── PayPal ── */}
            {gatewayEnabled.paypal && (
              <div
                onClick={() => setPaymentMethod('paypal')}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === 'paypal'
                    ? 'border-[#0079C1] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {paymentMethod === 'paypal' && (
                  <div className="absolute top-2 right-2 bg-[#0079C1] rounded-full p-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="h-8 flex items-center mb-1">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 object-contain" />
                </div>
                <span className={`font-bold ${paymentMethod === 'paypal' ? 'text-[#0079C1]' : 'text-gray-700'}`}>PayPal</span>
              </div>
            )}

          </div>
        </div>

        <div className="bg-white p-4 mt-2">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Order Summary</h2>
          <div className="space-y-2 mb-4 border-b border-gray-100 pb-4">
            {selectedItems.map(item => (
              <div key={item.order_id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 line-clamp-1 flex-1">{item.order?.item_name || 'Item'}</span>
                <span className="font-medium">
                  {item.order?.payment_status === 'unpaid' ? `GH₵ ${item.order.amount_due}` : 'Paid'}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">GH₵ {outstandingBalance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-4">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">{deliveryFee > 0 ? `GH₵ ${deliveryFee.toFixed(2)}` : 'Free'}</span>
          </div>
          <div className="flex justify-between items-center text-base pt-2 border-t border-gray-100">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-[#ff3b30]">GH₵ {totalDue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex items-center justify-between z-20 pb-safe">
        <div className="flex flex-col pl-2">
          <span className="text-xs text-gray-500">Total</span>
          <span className="text-lg font-bold text-[#ff3b30]">GH₵ {totalDue.toFixed(2)}</span>
        </div>
        <button 
          onClick={handleCheckoutClick}
          disabled={checkingOut || !shippingAddress?.contactName}
          className="bg-[#ff3b30] hover:bg-[#e0352b] text-white font-bold px-8 py-3 rounded-full disabled:opacity-50 min-w-[140px]"
        >
          {checkingOut ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `Pay GH₵ ${totalDue.toFixed(2)}`}
        </button>
      </div>

      {showEverSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl scrollbar-hide">
            <EverSendGateway 
              orderId={`CART-${cart.id}`}
              amountDue={totalDue}
              onSuccess={(url) => processCheckout(url)}
              onCancel={() => setShowEverSend(false)}
            />
          </div>
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
