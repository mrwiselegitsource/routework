import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { db } from '../lib/db';
import { useCart } from '../context/CartContext';

export default function CheckoutSuccess() {
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { removeFromCart } = useCart();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processPayment = async () => {
      try {
        const pendingData = localStorage.getItem('nexus_pending_checkout');
        if (!pendingData) {
          throw new Error('No pending checkout data found.');
        }

        const { shippingAddress, selectedItems, cartId } = JSON.parse(pendingData);
        
        if (!shippingAddress || !selectedItems || selectedItems.length === 0) {
          throw new Error('Invalid checkout data.');
        }

        const formattedAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.region}, Ghana`;

        for (const item of selectedItems) {
          await db.updateOrder(item.order_id, {
            recipient_name: shippingAddress.contactName,
            recipient_phone: shippingAddress.phone,
            recipient_address: formattedAddress,
            recipient_region: shippingAddress.region
          });

          if (item.order?.payment_status === 'unpaid') {
            await db.updatePaymentStatus(item.order_id, 'paid', `CART-${cartId}`);
          }
          
          await db.addTrackingEvent(item.order_id, {
            status: 'delivery_arranged',
            location: 'Dispatch Center',
            description: `Payment completed. Delivery arranged for: ${formattedAddress}.`
          }, null);
          
          await removeFromCart(item.order_id);
        }

        localStorage.removeItem('nexus_pending_checkout');
        setStatus('success');
        
        // Redirect to orders after 3 seconds
        setTimeout(() => {
          navigate('/account/orders');
        }, 3000);

      } catch (err) {
        console.error(err);
        setStatus('error');
        setErrorMsg(err.message || 'Failed to process payment successfully.');
      }
    };

    processPayment();
  }, [navigate, removeFromCart]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center pt-24 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</h1>
            <p className="text-gray-500">Please wait while we confirm your payment with NexusPay.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 mb-6">Your order has been placed and delivery is being arranged.</p>
            <p className="text-sm text-gray-400 animate-pulse">Redirecting to your orders...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-500 mb-6">{errorMsg}</p>
            <button 
              onClick={() => navigate('/cart')}
              className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Return to Cart
            </button>
          </>
        )}
      </div>
    </div>
  );
}
