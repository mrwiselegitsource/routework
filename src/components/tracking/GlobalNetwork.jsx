import React, { useState, useEffect } from 'react';

const COUNTRIES = [
  { name: 'Ghana', code: 'gh' },
  { name: 'United Kingdom', code: 'gb' },
  { name: 'United States', code: 'us' },
  { name: 'China', code: 'cn' },
  { name: 'Nigeria', code: 'ng' },
  { name: 'South Africa', code: 'za' },
  { name: 'Germany', code: 'de' },
  { name: 'Canada', code: 'ca' },
  { name: 'Australia', code: 'au' },
];

export default function GlobalNetwork() {
  // We have exactly 9 distinct countries now, so index 4 is the absolute center.
  const [items, setItems] = useState(COUNTRIES);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Start the sliding animation
      setIsTransitioning(true);

      // 2. Wait for CSS transition to finish, then silently reset positions
      setTimeout(() => {
        setIsTransitioning(false);
        setItems(prev => {
          const newItems = [...prev];
          const first = newItems.shift(); // Remove from start
          newItems.push(first);           // Add to end
          return newItems;
        });
      }, 700); // 700ms matches the CSS transition duration

    }, 3000); // Slide every 3 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Calculate slide distance (item width + gap)
  // Item width: 128px (w-32)
  // Gap: 32px (gap-8)
  // Total shift = 160px
  const slideDistance = 160;

  return (
    <div className="py-16 overflow-hidden bg-gray-50 border-t border-gray-100 mt-12 relative">
      <div className="container mx-auto px-4 text-center mb-12">
        <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3">Our Global Shipping Network</h3>
        <p className="text-gray-500 font-body max-w-2xl mx-auto">
          We seamlessly connect your parcels to and from over 200 destinations worldwide. Reliable tracking across borders.
        </p>
      </div>

      <div className="relative w-full mx-auto flex justify-center items-center h-56 px-4">
        {/* Track Container */}
        <div 
          className="flex items-center gap-8"
          style={{
            transform: isTransitioning ? `translateX(-${slideDistance}px)` : 'translateX(0px)',
            transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none'
          }}
        >
          {items.map((country, index) => {
            // Index 4 is the center when not transitioning
            // Index 5 becomes the center during transition
            const isCenter = isTransitioning ? index === 5 : index === 4;
            
            let scaleClass = "scale-75";
            let opacityClass = "opacity-40 grayscale";
            let zIndexClass = "z-0";
            let innerRingClass = "border-transparent";
            
            if (isCenter) {
              scaleClass = "scale-150 -translate-y-4";
              opacityClass = "opacity-100 shadow-2xl drop-shadow-2xl";
              zIndexClass = "z-20";
              innerRingClass = "border-white ring-4 ring-white";
            } else if ((!isTransitioning && (index === 3 || index === 5)) || (isTransitioning && (index === 4 || index === 6))) {
              scaleClass = "scale-100";
              opacityClass = "opacity-80";
              zIndexClass = "z-10";
            }

            return (
              <div 
                // We use a combination of country code and index for key to force React to update classes smoothly
                key={`${country.code}-${index}`} 
                className={`relative flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${scaleClass} ${opacityClass} ${zIndexClass} w-32`}
              >
                {/* We apply the ring and border exclusively to this rounded wrapper */}
                <div className={`rounded-xl overflow-hidden shadow-lg bg-white border-2 w-full transition-all duration-700 ease-in-out ${innerRingClass}`}>
                  <img 
                    src={`https://flagcdn.com/w160/${country.code}.png`}
                    alt={country.name}
                    className="w-full h-20 object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Name tag that only appears when center */}
                <div 
                  className={`absolute -bottom-8 whitespace-nowrap bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded transition-opacity duration-700 ${isCenter ? 'opacity-100' : 'opacity-0'}`}
                >
                  {country.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
