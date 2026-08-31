import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { MapPin, CheckCircle2, AlertTriangle, Loader2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, loading: cartLoading } = useCart();
  const navigate = useNavigate();

  const [selectedItemIds, setSelectedItemIds] = useState([]);
  
  // Initialize selected items when cart items change
  useEffect(() => {
    if (cart?.items) {
      // Only set if we haven't selected anything yet
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

  const handleCheckoutClick = () => {
    navigate('/checkout', { state: { selectedItemIds } });
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

  return (
    <div className="bg-[#f2f2f2] min-h-screen pb-24">
      {/* Mobile Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 md:hidden">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 flex items-center gap-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
          <span className="text-lg font-bold text-gray-900">Cart</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-2 pt-2 md:pt-4">
        <h1 className="text-2xl font-bold text-gray-900 hidden md:block px-4">Your Cart</h1>

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
                <p>Please ensure that you are only paying for shipments that rightfully belong to you. Attempting to claim or pay for someone else's shipment is considered theft.</p>
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
                        <img src={item.media.public_url || item.media.storage_path} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-300 flex items-center justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider">No Img</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal Summary */}
            <div className="bg-white p-4">
              <h2 className="text-sm font-bold text-gray-900 mb-2">Summary</h2>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-900">Items Subtotal</span>
                <span className="font-bold text-gray-900">GH₵ {outstandingBalance.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Shipping fees will be calculated at checkout based on your address.</p>
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      {hasItems && (
        <div className="fixed bottom-24 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex items-center justify-between z-20 pb-safe">
          <div className="flex flex-col pl-2">
            <span className="text-xs text-gray-500">Items Subtotal</span>
            <span className="text-lg font-bold text-[#ff3b30]">GH₵ {outstandingBalance.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckoutClick}
            disabled={!hasSelectedItems}
            className="bg-[#ff3b30] hover:bg-[#e0352b] text-white font-bold px-8 py-3 rounded-full disabled:opacity-50 min-w-[140px]"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}
