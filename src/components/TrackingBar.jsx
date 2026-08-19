import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrackingBar() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/track?id=${trackingNumber.trim()}`);
    }
  };

  return (
    <div className="bg-[var(--color-paper)] relative z-20">
      <div className="container mx-auto px-4">
        {/* Floating container overlapping the bottom of the hero section */}
        <div className="max-w-4xl mx-auto bg-[#00287a] rounded-2xl shadow-2xl p-6 md:p-8 transform -translate-y-1/2">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Enter Tracking Number (e.g. RW-DEMO01)" 
              className="flex-1 px-6 py-4 rounded-xl text-lg text-gray-900 bg-white/95 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all font-body shadow-inner"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-[var(--color-brand-orange)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e65c00] transition-colors flex items-center justify-center min-w-[160px] shadow-lg shadow-orange-500/20"
            >
              <Search className="w-6 h-6 mr-2" />
              Track
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
