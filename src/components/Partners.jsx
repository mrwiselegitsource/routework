import React, { useState } from 'react';

export default function Partners() {
  // We define 15 slots for partners. 
  // If the user uploads '1.png' through '15.png' in the public/images/partners/ folder, they will automatically show.
  // Missing ones will simply be hidden via the onError handler, requiring ZERO code changes to update!
  const partnerSlots = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <section className="py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="container mx-auto px-4 text-center mb-16 relative z-10 bg-white">
        <span className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-2 block">Partnerships</span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0033a0] mb-4">Our Trusted Clients & Partners</h2>
        <div className="w-16 h-1 bg-[#0055ff] mx-auto mb-6"></div>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Building lasting relationships with industry leaders to deliver secure, 
          innovative, and nationwide postal solutions across Ghana.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative flex overflow-x-hidden w-full group">
        
        {/* We duplicate the track to create a seamless infinite sliding effect */}
        {[1, 2].map((trackIndex) => (
          <div 
            key={`track-${trackIndex}`}
            className="flex items-center gap-6 animate-marquee whitespace-nowrap px-3"
            style={{ minWidth: '100%' }}
          >
            {partnerSlots.map((num) => (
              <div 
                key={`partner-${num}`} 
                className="w-48 h-32 flex-shrink-0 flex items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <img 
                  src={`/images/partners/${num}.avif`} 
                  alt={`Partner ${num}`} 
                  className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
                  // Magic trick: If the image doesn't exist, we hide the entire container completely!
                  onError={(e) => {
                    e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        ))}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}
