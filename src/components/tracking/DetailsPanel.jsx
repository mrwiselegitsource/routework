import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function DetailsPanel({ trackingId, origin, destination, location, method, eta, paymentStatus }) {
  const isPaid = paymentStatus === 'Paid';
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white md:rounded-3xl shadow-sm border-y md:border border-gray-200 p-4 md:p-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-base font-bold text-[#0033a0] mb-3 pb-2 border-b border-gray-100 focus:outline-none"
      >
        <span>Shipment Details</span>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      
      {isExpanded && (
      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Tracking Number</p>
          <p className="text-sm font-semibold text-gray-800">{trackingId}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Shipping Method</p>
          <p className="text-sm font-semibold text-gray-800">{method}</p>
        </div>
        
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Origin</p>
          <p className="text-sm font-semibold text-gray-800">{origin}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Destination</p>
          <p className="text-sm font-semibold text-gray-800">{destination}</p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Current Location</p>
          <p className="text-sm font-semibold text-gray-800">{location}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Estimated Delivery</p>
          <p className="text-sm font-semibold text-gray-800">{eta}</p>
        </div>
        
        <div className="col-span-2 pt-3 mt-1 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Payment Status</p>
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {(paymentStatus || 'Pending').toUpperCase()}
          </span>
        </div>
      </div>
      )}
    </div>
  );
}
