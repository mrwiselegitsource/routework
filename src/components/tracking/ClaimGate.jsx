import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShoppingCart, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

export default function ClaimGate({ trackingId, paymentStatus, claimStatus, amountDue, recipientDetails }) {
  const { cart, addToCart, loading } = useCart();
  const [adding, setAdding] = useState(false);

  const isInCart = cart?.items?.some(i => i.order_id === trackingId);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(trackingId);
    } catch (err) {
      console.error(err);
      alert('Must be logged in to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (claimStatus === 'Claimed') {
    return (
      <div className="bg-green-50/50 rounded-3xl border border-green-100 p-8 mt-8 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Delivery Scheduled</h3>
        <p className="text-green-700/80 mb-6 max-w-md mx-auto">
          This shipment has been claimed and delivery is being processed.
        </p>
        {recipientDetails && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 max-w-md mx-auto text-left space-y-3">
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
    <div className="bg-blue-50/30 rounded-3xl border border-blue-100 p-8 md:p-10 mt-8 text-center">
      <div className="w-16 h-16 bg-blue-100 text-[#0033a0] rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingCart size={32} />
      </div>
      
      <h3 className="text-2xl font-bold text-blue-900 mb-2">Ready to Claim?</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Add this shipment to your cart to select your delivery preferences and complete the claim process.
      </p>

      {paymentStatus === 'Unpaid' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 max-w-sm mx-auto mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold text-red-600 flex items-center gap-2">
            <CreditCard size={18} /> Payment Required
          </span>
          <span className="font-bold text-gray-900">GH₵ {amountDue}</span>
        </div>
      )}

      {isInCart ? (
        <Link 
          to="/cart"
          className="inline-flex items-center justify-center w-full max-w-sm bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-600 transition-colors gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Added to Cart — Proceed to Checkout
        </Link>
      ) : (
        <button 
          onClick={handleAddToCart}
          disabled={adding || loading}
          className="w-full max-w-sm mx-auto bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
          Add to Cart
        </button>
      )}
    </div>
  );
}
