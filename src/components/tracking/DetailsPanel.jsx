import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function DetailsPanel({ 
  trackingId, 
  origin, 
  destination, 
  location, 
  method, 
  eta, 
  paymentStatus,
  upfrontFee = 0,
  upfrontStatus = 'paid',
  shippingFee = 0,
  shippingStatus = 'unpaid',
  amountDue = 0
}) {
  const isPaid = paymentStatus === 'paid' || paymentStatus === 'Paid';
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white md:rounded-3xl shadow-sm border-y md:border border-gray-200 p-4 md:p-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-base font-bold text-[#0033a0] mb-3 pb-2 border-b border-gray-100 focus:outline-none"
      >
        <span>Shipment Fee & Tracking Details</span>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      
      {isExpanded && (
      <div className="space-y-4">
        {/* Fee Breakdown Box */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Responsibility Breakdown</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Upfront / Package Fee:</span>
              <div className="text-right">
                <span className="font-bold text-gray-900 mr-2">GH₵ {Number(upfrontFee).toFixed(2)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${upfrontStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                  {upfrontStatus === 'paid' ? 'Paid by Sender' : 'Owed on Delivery'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Shipping / Delivery Fee:</span>
              <div className="text-right">
                <span className="font-bold text-gray-900 mr-2">GH₵ {Number(shippingFee).toFixed(2)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${shippingStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                  {shippingStatus === 'paid' ? 'Prepaid by Sender' : 'Receiver Pays'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold text-sm text-[#0033a0]">
              <span>Total Receiver Amount Due:</span>
              <span>GH₵ {Number(amountDue).toFixed(2)}</span>
            </div>
          </div>
        </div>

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
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
              {(paymentStatus || 'Pending').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
