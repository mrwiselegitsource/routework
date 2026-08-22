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
    <div className="bg-white overflow-hidden mb-6">
      {/* Main Display Area (Swipable) */}
      <div 
        ref={containerRef}
        className="relative aspect-[4/5] md:aspect-square bg-gray-50 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
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
                className="w-full h-full object-contain"
              />
            )}
          </div>
        ))}
      </div>

      {/* Thumbnail Previews */}
      {media.length > 1 && (
        <div className="flex justify-start gap-2 p-3 bg-white overflow-x-auto scrollbar-hide">
          {media.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                const container = containerRef.current;
                if (container) {
                  const scrollWidth = container.scrollWidth;
                  const itemWidth = scrollWidth / media.length;
                  container.scrollTo({ left: itemWidth * idx, behavior: 'smooth' });
                }
              }}
              className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                activeIndex === idx ? 'border-[#0033a0] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {item.media_type === 'video' ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <Play className="w-6 h-6 text-white opacity-70" />
                </div>
              ) : (
                <img 
                  src={item.public_url || item.storage_path} 
                  alt={`Thumbnail ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
