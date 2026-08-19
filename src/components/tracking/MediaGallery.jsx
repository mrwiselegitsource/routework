import React, { useState } from 'react';
import { Play, Image as ImageIcon } from 'lucide-react';

export default function MediaGallery({ media = [] }) {
  if (!media || media.length === 0) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = media[activeIndex];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      {/* Main Display Area */}
      <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
        {activeMedia.media_type === 'video' ? (
          <video 
            key={activeMedia.storage_path}
            src={activeMedia.public_url || activeMedia.storage_path}
            controls
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <img 
            src={activeMedia.public_url || activeMedia.storage_path} 
            alt="Item" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Thumbnails (only show if there's more than 1 item) */}
      {media.length > 1 && (
        <div className="p-4 bg-gray-50 flex gap-4 overflow-x-auto border-t border-gray-100">
          {media.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeIndex === idx ? 'border-orange-500 shadow-md ring-2 ring-orange-200' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              {item.media_type === 'video' ? (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                  <Play size={24} />
                </div>
              ) : (
                <img 
                  src={item.public_url || item.storage_path} 
                  className="w-full h-full object-cover"
                  alt={`Thumbnail ${idx + 1}`}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
