import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function Cart() {
  // Placeholder for Phase 5
  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Your Cart</h1>
      <p className="text-gray-500 mb-8">Review items before checkout.</p>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-[#0033a0]" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Cart is Empty</h3>
        <p className="text-gray-500">Add shipments to your cart to checkout and claim them.</p>
      </div>
    </div>
  );
}
