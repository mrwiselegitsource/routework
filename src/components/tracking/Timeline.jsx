import React from 'react';
import { PackageCheck, PackageOpen, Plane, Truck, MapPin, ShieldCheck, Box, Check, AlertTriangle } from 'lucide-react';

// Map specific step names to icons
const getStepIcon = (label) => {
  const l = label.toLowerCase();
  if (l.includes('confirmed')) return PackageCheck;
  if (l.includes('picked up')) return PackageOpen;
  if (l.includes('departed')) return Plane;
  if (l.includes('transit')) return Truck;
  if (l.includes('arrived')) return MapPin;
  if (l.includes('customs')) return ShieldCheck;
  if (l.includes('out for delivery')) return Truck;
  if (l.includes('delivered')) return Check;
  if (l.includes('failed') || l.includes('held') || l.includes('issue')) return AlertTriangle;
  return Box;
};

export default function Timeline({ steps }) {
  return (
    <div className="bg-white md:rounded-3xl shadow-sm border-y md:border border-gray-200 p-6 md:p-8">
      <h3 className="text-lg font-bold text-blue-900 mb-8 border-b border-gray-100 pb-4">Tracking History</h3>
      
      <div className="relative">
        {/* The connecting vertical line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 hidden md:block"></div>
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 md:hidden"></div>

        <div className="space-y-8 relative">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const Icon = getStepIcon(step.label);
            
            // Determine styles based on status
            let iconBg = 'bg-gray-100';
            let iconColor = 'text-gray-400';
            let ringStyle = '';
            let labelColor = 'text-gray-400';
            let lineStyle = 'border-dashed border-gray-200'; // Connecting line style to next step
            
            if (step.status === 'completed') {
              iconBg = 'bg-blue-600';
              iconColor = 'text-white';
              labelColor = 'text-gray-800';
              lineStyle = 'border-solid border-blue-600';
            } else if (step.status === 'current') {
              iconBg = 'bg-orange-500';
              iconColor = 'text-white';
              ringStyle = 'ring-4 ring-orange-100';
              labelColor = 'text-gray-900 font-bold';
              lineStyle = 'border-dashed border-gray-200';
            } else if (step.status === 'exception') {
              iconBg = 'bg-red-500';
              iconColor = 'text-white';
              ringStyle = 'ring-4 ring-red-100';
              labelColor = 'text-red-600 font-bold';
              lineStyle = 'border-dashed border-gray-200';
            }

            return (
              <div key={index} className="flex gap-4 md:gap-6 relative">
                
                {/* Connecting line piece (custom rendering to match the timeline) */}
                {!isLast && (
                  <div className={`absolute left-6 top-12 bottom-[-2rem] w-0 border-l-2 ${lineStyle} -translate-x-[1px] z-0`}></div>
                )}
                
                {/* Icon */}
                <div className="relative z-10 shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${iconBg} ${iconColor} ${ringStyle}`}>
                    <Icon size={20} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow pt-1">
                  <p className={`text-base md:text-lg mb-1 ${labelColor}`}>{step.label}</p>
                  
                  {step.date && (
                    <p className="text-sm text-gray-500 font-medium mb-1">{step.date} • {step.time}</p>
                  )}
                  
                  {step.location && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400"/>
                      {step.location}
                    </p>
                  )}
                  
                  {step.note && (
                    <div className="mt-2 text-sm bg-gray-50 p-3 rounded-lg text-gray-700 border border-gray-100">
                      {step.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
