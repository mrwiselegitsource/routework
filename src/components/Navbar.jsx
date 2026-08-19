import React, { useState } from 'react';
import { Menu, Search, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-[40px] w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-[150px] h-[40px] bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded border-dashed border-2 border-gray-300">
              Missing: public/images/logo.png
            </div>
          </Link>
        </div>
        
        {/* Main Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <Link to="/about" className="text-[#0f172a] font-semibold text-sm hover:text-[#0033a0] transition-colors">About Us</Link>
          <Link to="/services" className="text-[#0f172a] font-semibold text-sm hover:text-[#0033a0] transition-colors">Operations</Link>

          <Link to="/news" className="text-[#0f172a] font-semibold text-sm hover:text-[#0033a0] transition-colors">News</Link>
          <Link to="/rti" className="text-[#0f172a] font-semibold text-sm hover:text-[#0033a0] transition-colors">Corporate Information</Link>
          <Link to="/careers" className="text-[#0f172a] font-semibold text-sm hover:text-[#0033a0] transition-colors">Careers</Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <Link 
            to="/track" 
            className="hidden md:flex bg-[#0033a0] hover:bg-blue-800 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-colors items-center shadow-md shadow-blue-900/20"
          >
            Track Parcel
          </Link>
          <button className="text-gray-700 hover:text-orange-500 transition-colors">
            <Search size={20} />
          </button>
          <Link to="/admin" className="text-gray-700 hover:text-orange-500 transition-colors block">
            <User size={20} />
          </Link>
          <button 
            className="lg:hidden text-gray-700 hover:text-orange-500 transition-colors ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-4 z-40">
          <Link to="/about" className="text-[#0f172a] font-semibold hover:text-[#0033a0] transition-colors pb-2 border-b border-gray-50">About Us</Link>
          <Link to="/services" className="text-[#0f172a] font-semibold hover:text-[#0033a0] transition-colors pb-2 border-b border-gray-50">Operations</Link>

          <Link to="/news" className="text-[#0f172a] font-semibold hover:text-[#0033a0] transition-colors pb-2 border-b border-gray-50">News</Link>
          <Link to="/rti" className="text-[#0f172a] font-semibold hover:text-[#0033a0] transition-colors pb-2 border-b border-gray-50">Corporate Information</Link>
          <Link to="/careers" className="text-[#0f172a] font-semibold hover:text-[#0033a0] transition-colors pb-2 border-b border-gray-50">Careers</Link>
          <Link to="/track" className="bg-[#0033a0] text-white font-bold text-center px-4 py-3 rounded-xl mt-2">Track Parcel</Link>
          <Link to="/admin" className="text-orange-500 font-bold hover:text-orange-600 transition-colors mt-2 text-center">Admin Dashboard</Link>
        </div>
      )}
    </nav>
  );
}
