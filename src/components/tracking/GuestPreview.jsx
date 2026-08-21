import React from 'react';
import { Eye, MapPin, Clock, Package, UserPlus, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuestPreview({ preview, media, onLogin, onSignup }) {
  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      {/* Preview Card */}
      <div className="bg-white md:rounded-3xl shadow-sm md:shadow-xl border-y md:border border-gray-100 overflow-hidden mb-6">

        {/* Preview Image */}
        {media && (
          <div className="relative h-56 md:h-72 overflow-hidden bg-gray-100">
            <img
              src={media.storage_path || media.public_url}
              alt={preview.item_name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute top-4 left-4">
              <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Guest Preview
              </span>
            </div>
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Item Name */}
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{preview.item_name}</h2>

          {/* Status */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-[#0033a0]" />
              <span className="text-gray-500">Status:</span>
              <span className="font-bold text-gray-800 capitalize">
                {preview.current_status?.replace(/_/g, ' ')}
              </span>
            </div>
            {preview.current_location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-gray-500">Location:</span>
                <span className="font-bold text-gray-800">{preview.current_location}</span>
              </div>
            )}
            {preview.estimated_delivery && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-gray-500">ETA:</span>
                <span className="font-bold text-gray-800">{preview.estimated_delivery}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-400 font-mono">
            Tracking: {preview.order_id}
          </div>
        </div>
      </div>

      {/* CTA Card */}
      <div className="bg-gradient-to-br from-[#0033a0] to-[#001b57] md:rounded-3xl shadow-sm md:shadow-xl p-8 text-center text-white">
        <h3 className="text-xl font-extrabold mb-2">Want full access?</h3>
        <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto">
          Create an account to view full details, gallery, tracking timeline, and claim this item.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/signup"
            state={{ returnTo: `/track?id=${preview.order_id}` }}
            className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
          >
            <UserPlus className="w-5 h-5" />
            Create Account
          </Link>
          <Link
            to="/login"
            state={{ returnTo: `/track?id=${preview.order_id}` }}
            className="bg-white/10 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/20"
          >
            <LogIn className="w-5 h-5" />
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
