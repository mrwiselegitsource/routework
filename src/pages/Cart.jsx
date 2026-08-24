import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { db } from '../lib/db';
import { Trash2, MapPin, CheckCircle2, AlertTriangle, Loader2, ChevronRight, CreditCard, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import EditAddressModal from '../components/checkout/EditAddressModal';
import { saveAddressLocally, loadAddressLocally } from '../lib/local/address';
import EverSendGateway from '../components/payments/EverSendGateway';

export default function Cart() {
  const { cart, removeFromCart, clearCart, loading: cartLoading } = useCart();
  const { profile } = useCustomerAuth();
  const navigate = useNavigate();

  const [regions, setRegions] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);

  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showEverSend, setShowEverSend] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  
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

  // Initialize selected items when cart items change
  useEffect(() => {
    if (cart?.items) {
      // Only set if we haven't selected anything yet, or if cart items have changed significantly
      setSelectedItemIds(cart.items.map(item => item.order_id));
    }
  }, [cart?.items?.length]);

  const items = cart?.items || [];
  const hasItems = items.length > 0;
  
  // Filter selected items
  const selectedItems = items.filter(item => selectedItemIds.includes(item.order_id));
  const hasSelectedItems = selectedItems.length > 0;

  // Calculate totals
  const outstandingBalance = selectedItems.reduce((sum, item) => {
    return sum + (item.order?.payment_status === 'unpaid' ? (parseFloat(item.order?.amount_due) || 0) : 0);
  }, 0);

  const deliveryFee = selectedItems.reduce((sum, item) => {
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
    } else {
      processCheckout();
    }
  };

  const processCheckout = async (proofUrl = null) => {
    setCheckingOut(true);
    setError(null);
    
    const formattedAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.region}, Ghana`;

    try {
      for (const item of selectedItems) {
        await db.updateOrderDetails(item.order_id, {
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

  const toggleItemSelection = (orderId) => {
    setSelectedItemIds(prev => 
      prev.includes(orderId) ? prev.filter(i => i !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map(i => i.order_id));
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
    <div className="bg-[#f2f2f2] min-h-screen pb-24">
      {/* Mobile Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 md:hidden">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 flex items-center gap-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
          <span className="text-lg font-bold text-gray-900">Checkout</span>
        </button>
      </div>

        <div className="max-w-3xl mx-auto space-y-2 pt-2 md:pt-4">
          <h1 className="text-2xl font-bold text-gray-900 hidden md:block px-4">Checkout</h1>

          {!hasItems ? (
            <div className="bg-white p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Cart is Empty</h3>
              <p className="text-gray-500">Track a shipment and claim it to proceed to checkout.</p>
            </div>
          ) : (
            <>
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

              {/* Shipping Address Block */}
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

              {/* Payment Methods */}
              <div className="bg-white px-4 py-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Select Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Credit Card */}
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

                  {/* EverSend */}
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
                    <div className="h-8 flex items-center mb-1">
                      <img src="https://eversend.co/assets/eversend-logo.png" alt="Eversend" className="h-6 object-contain" />
                    </div>
                    <span className={`font-bold ${paymentMethod === 'eversend' ? 'text-[#0033a0]' : 'text-gray-700'}`}>EverSend</span>
                  </div>

                  {/* PayPal */}
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

                </div>
              </div>

              {/* Items List */}
              <div className="bg-white pb-4 mt-2">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={toggleSelectAll}
                      className="flex items-center justify-center w-5 h-5 rounded border border-gray-300 focus:outline-none"
                    >
                      {selectedItemIds.length === items.length && (
                        <div className="w-full h-full bg-[#ff3b30] border-[#ff3b30] flex items-center justify-center rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                    <span className="text-sm font-bold text-gray-900">Select All Items</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{items.length} items</span>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.order_id} className="p-4 flex gap-4 items-center">
                      <button 
                        onClick={() => toggleItemSelection(item.order_id)}
                        className="flex items-center justify-center w-5 h-5 flex-shrink-0 rounded border border-gray-300 focus:outline-none"
                      >
                        {selectedItemIds.includes(item.order_id) && (
                          <div className="w-full h-full bg-[#ff3b30] border-[#ff3b30] flex items-center justify-center rounded">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight">
                            {item.order?.item_name || 'Unknown Item'}
                          </h3>
                        </div>
                        
                        <div className="mt-2 flex justify-between items-center">
                          {item.order?.payment_status === 'unpaid' ? (
                            <span className="font-bold text-gray-900">GH₵ {item.order.amount_due}</span>
                          ) : (
                            <span className="text-xs font-bold text-green-600">Shipment Paid</span>
                          )}
                        </div>
                      </div>

                      <div className="w-16 h-16 bg-gray-50 rounded border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.media ? (
                          <img src={item.media.storage_path || item.media.public_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-gray-300 flex items-center justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider">No Img</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 flex justify-between items-center mt-2">
                  <span className="text-sm font-bold text-gray-900">Shipping: {deliveryFee > 0 ? `GH₵ ${deliveryFee.toFixed(2)}` : 'Free shipping'}</span>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white p-4">
                <h2 className="text-sm font-bold text-gray-900 mb-2">Summary</h2>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">GH₵ {totalDue.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fixed Bottom Bar */}
        {hasItems && (
          <div className="fixed bottom-24 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-1 pl-2">
              <span className="text-lg font-bold text-gray-900">GH₵ {totalDue.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckoutClick}
              disabled={checkingOut || !hasSelectedItems || !shippingAddress?.contactName}
              className="bg-[#ff3b30] hover:bg-[#e0352b] text-white font-bold px-8 py-2.5 rounded-full disabled:opacity-50 min-w-[120px]"
            >
              {checkingOut ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `Checkout (${selectedItems.length})`}
            </button>
          </div>
        )}

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
