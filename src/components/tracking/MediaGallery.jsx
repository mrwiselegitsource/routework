import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

export default function MediaGallery({ media = [] }) {
  if (!media || media.length === 0) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    const children = container.querySelectorAll('.snap-center');
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [media]);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6">
      {/* Main Display Area (Swipable) */}
      <div 
        ref={containerRef}
        className="relative aspect-video bg-gray-100 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {media.map((item, idx) => (
          <div 
            key={item.storage_path || idx} 
            data-index={idx}
            className="w-full shrink-0 snap-center h-full flex items-center justify-center relative"
          >
            {item.media_type === 'video' ? (
              <video 
                src={item.public_url || item.storage_path}
                controls
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img 
                src={item.public_url || item.storage_path} 
                alt={`Media ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {media.length > 1 && (
        <div className="flex justify-center gap-1.5 p-3 bg-white">
          {media.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-4 bg-[#0033a0]' : 'w-1.5 bg-gray-200'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
