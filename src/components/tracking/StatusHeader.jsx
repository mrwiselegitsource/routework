import React from 'react';
import { Package, Truck, ShieldCheck, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StatusHeader({ status, location, eta, etaTime, trackingId }) {
  // Determine color and icon based on status string
  let StatusIcon = Package;
  let bgColor = 'bg-amber-100';
  let textColor = 'text-amber-600';
  
  const s = status.toUpperCase();
  if (s.includes('TRANSIT')) {
    StatusIcon = Truck;
    bgColor = 'bg-amber-100';
    textColor = 'text-amber-600';
  } else if (s.includes('CUSTOMS')) {
    StatusIcon = ShieldCheck;
    bgColor = 'bg-amber-100';
    textColor = 'text-amber-600';
  } else if (s.includes('DELIVERED')) {
    StatusIcon = CheckCircle;
    bgColor = 'bg-green-100';
    textColor = 'text-green-600';
  } else if (s.includes('CLAIMED') || s.includes('ARRANGED')) {
    StatusIcon = CheckCircle;
    bgColor = 'bg-purple-100';
    textColor = 'text-purple-600';
  } else if (s.includes('FAILED') || s.includes('ISSUE') || s.includes('HELD')) {
    StatusIcon = AlertTriangle;
    bgColor = 'bg-red-100';
    textColor = 'text-red-600';
  }

  return (
    <div className="bg-white md:rounded-2xl shadow-sm border-y md:border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
      
      {/* Left side: Icon + Status + Location */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgColor} ${textColor}`}>
          <StatusIcon size={24} strokeWidth={2} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <h2 className={`text-lg md:text-xl font-extrabold tracking-tight leading-none ${textColor}`}>
              {status.toUpperCase()}
            </h2>
            <div className="sm:hidden text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-none">Tracking</p>
              <p className="text-sm font-bold text-blue-900 font-mono">{trackingId}</p>
            </div>
          </div>
          <p className="flex items-center text-gray-600 text-xs md:text-sm mt-1">
            <MapPin size={14} className="text-gray-400 mr-1" />
            <span className="font-semibold mr-1">Location:</span> {location}
          </p>
        </div>
      </div>

      {/* Right side: ETA + Tracking ID (Desktop) */}
      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
        <div className="bg-gray-50 rounded px-3 py-1.5 border border-gray-100">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 font-bold">Estimated Delivery</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-gray-900">{eta}</span>
            {etaTime && <span className="text-xs font-medium text-gray-500">{etaTime}</span>}
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Tracking Number</p>
          <p className="text-sm font-bold text-blue-900 font-mono">{trackingId}</p>
        </div>
      </div>
      
    </div>
  );
}
