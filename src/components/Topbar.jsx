import React from 'react';
import { MapPin, Clock, Mail, Phone } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="bg-[#0f172a] text-white/70 py-2.5 hidden md:block border-b border-white/5">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
              <MapPin size={14} />
            </div>
            <span className="text-xs font-medium tracking-wide">Accra Central, GA-183-8164</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
              <Clock size={14} />
            </div>
            <span className="text-xs font-medium tracking-wide">Mon - Fri: 8:00 AM - 5:00 PM</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <a href="mailto:info@ghanapost.com.gh" className="flex items-center gap-2 group hover:text-white transition-colors">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
              <Mail size={14} />
            </div>
            <span className="text-xs font-medium tracking-wide">info@ghanapost.com.gh</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="tel:+233302668138" className="flex items-center gap-2 group hover:text-white transition-colors">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                <Phone size={14} />
              </div>
              <span className="text-xs font-medium tracking-wide">+233 (0)302 668 138</span>
            </a>
            <a href="https://wa.me/233542527004" className="flex items-center gap-2 group hover:text-white transition-colors border-l border-white/10 pl-6">
              {/* Using phone icon for whatsapp for now */}
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                <Phone size={14} /> 
              </div>
              <span className="text-xs font-medium tracking-wide text-green-400">+233 (0)542 527 004</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
