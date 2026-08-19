import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerOrders() {
  // Placeholder for Phase 4
  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-500">Manage and track all your shipments.</p>
        </div>
        <Link to="/track" className="bg-orange-100 text-orange-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-orange-200 transition-colors">
          Track New Shipment
        </Link>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <PackageSearch className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Coming Soon</h3>
        <p className="text-gray-500">Order history will be available in the next update.</p>
      </div>
    </div>
  );
}
