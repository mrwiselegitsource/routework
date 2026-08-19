import React from 'react';

export default function DetailsPanel({ trackingId, origin, destination, location, method, eta, paymentStatus }) {
  const isPaid = paymentStatus === 'Paid';

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
      <h3 className="text-lg font-bold text-blue-900 mb-6 border-b border-gray-100 pb-4">Shipment Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tracking Number</p>
          <p className="font-semibold text-gray-800">{trackingId}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Shipping Method</p>
          <p className="font-semibold text-gray-800">{method}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Origin</p>
          <p className="font-semibold text-gray-800">{origin}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Destination</p>
          <p className="font-semibold text-gray-800">{destination}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Location</p>
          <p className="font-semibold text-gray-800">{location}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estimated Delivery</p>
          <p className="font-semibold text-gray-800">{eta}</p>
        </div>
        
        <div className="md:col-span-2 pt-4 mt-2 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Payment Status</p>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {paymentStatus.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
