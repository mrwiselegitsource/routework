import React from 'react';
import { Package, Truck, ShieldCheck, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StatusHeader({ status, location, eta, trackingId }) {
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
    <div className="bg-white md:rounded-3xl shadow-sm md:shadow-lg border-y md:border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 mb-8">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center shrink-0 shadow-inner ${bgColor} ${textColor}`}>
        <StatusIcon size={48} strokeWidth={1.5} />
      </div>
      
      <div className="flex-grow text-center md:text-left">
        <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight mb-2 ${textColor}`}>
          {status.toUpperCase()}
        </h2>
        <div className="flex flex-col gap-1 text-gray-600 text-sm md:text-base">
          <p className="flex items-center justify-center md:justify-start gap-1">
            <MapPin size={16} className="text-gray-400" />
            <span className="font-semibold">Current Location:</span> {location}
          </p>
          <p>
            <span className="font-semibold">Estimated Delivery:</span> {eta}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-center md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
        <p className="text-xl font-bold text-blue-900 font-mono tracking-widest">{trackingId}</p>
      </div>
    </div>
  );
}
