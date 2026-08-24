import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, X, User, LogOut, Package, ShoppingCart, ChevronDown, UserPlus, LogIn, Mail } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCustomerMessages } from '../context/CustomerMessagesContext';
import { auth } from '../lib/db';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { session, profile } = useCustomerAuth();
  const { unreadCount } = useCustomerMessages();

  const isLoggedIn = !!session?.user;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    await auth.customerSignOut();
    setIsProfileOpen(false);
    navigate('/');
  }

  // Get user initials for avatar
  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/images/logo-horizontal.png" 
              alt="Logo" 
              className="h-[40px] w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-[150px] h-[40px] bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded border-dashed border-2 border-gray-300">
              Missing: public/images/logo-horizontal.png
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
        <div className="flex items-center gap-3">
          {/* Track Parcel CTA */}
          <Link 
            to="/track" 
            className="hidden md:flex bg-[#0033a0] hover:bg-blue-800 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-colors items-center shadow-md shadow-blue-900/20"
          >
            Track Parcel
          </Link>

          {/* Profile / Auth Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              id="profile-menu-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`relative flex items-center gap-2 rounded-full border-2 transition-all duration-200 ${
                isLoggedIn
                  ? 'border-[#0033a0]/20 hover:border-[#0033a0]/50 pr-2 pl-1 py-1'
                  : 'border-gray-200 hover:border-orange-400 p-2'
              }`}
              aria-label="User menu"
            >
              {isLoggedIn && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white z-10"></span>
              )}
              {isLoggedIn && initials ? (
                <div className="w-7 h-7 rounded-full bg-[#0033a0] text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </div>
              ) : (
                <User size={20} className="text-gray-600" />
              )}
              {isLoggedIn && (
                <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-[fadeIn_0.15s_ease-out] z-50">
                {isLoggedIn ? (
                  <>
                    {/* Logged in header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-[#0033a0] to-[#001b57] text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 text-white text-sm font-bold flex items-center justify-center">
                          {initials || <User size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{profile?.name || 'My Account'}</p>
                          <p className="text-blue-200 text-xs truncate">{session.user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link to="/account" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
                        <User size={16} className="text-[#0033a0]" />
                        My Account
                      </Link>
                      <Link to="/account/messages" className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail size={16} className="text-[#0033a0]" />
                          Inbox
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link to="/account/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
                        <Package size={16} className="text-[#0033a0]" />
                        My Shipments
                      </Link>
                      <Link to="/cart" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
                        <ShoppingCart size={16} className="text-[#0033a0]" />
                        My Cart
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Guest header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-[#0033a0] to-[#001b57] text-white text-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                        <User size={20} />
                      </div>
                      <p className="font-bold text-sm">Welcome to RouteWorks</p>
                      <p className="text-blue-200 text-xs mt-0.5">Sign in to track & manage shipments</p>
                    </div>
                    <div className="p-3 space-y-2">
                      <Link
                        to="/login"
                        state={{ returnTo: location.pathname + location.search }}
                        className="flex items-center justify-center gap-2 w-full bg-[#0033a0] hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                      >
                        <LogIn size={16} />
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        state={{ returnTo: location.pathname + location.search }}
                        className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                      >
                        <UserPlus size={16} />
                        Create Account
                      </Link>
                    </div>
                    <p className="text-center text-xs text-gray-400 pb-3">Free · No credit card needed</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="lg:hidden text-gray-700 hover:text-orange-500 transition-colors ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-1 z-40">
          <Link to="/about" className="text-[#0f172a] font-semibold hover:text-[#0033a0] transition-colors py-3 border-b border-gray-50">About Us</Link>
          <Link to="/services" className="text-[#0f172a] font-semibold hover:text-[#0033a0] transition-colors py-3 border-b border-gray-50">Operations</Link>
          <Link to="/news" className="text-[#0f172a] font-semibold hover:text-[#0033a0] transition-colors py-3 border-b border-gray-50">News</Link>
          <Link to="/rti" className="text-[#0f172a] font-semibold hover:text-[#0033a0] transition-colors py-3 border-b border-gray-50">Corporate Information</Link>
          <Link to="/careers" className="text-[#0f172a] font-semibold hover:text-[#0033a0] transition-colors py-3 border-b border-gray-50">Careers</Link>

          <div className="pt-3 flex flex-col gap-2">
            <Link to="/track" className="bg-[#0033a0] text-white font-bold text-center px-4 py-3 rounded-xl">Track Parcel</Link>
            {isLoggedIn ? (
              <>
                <Link to="/account" className="bg-gray-100 text-[#0f172a] font-bold text-center px-4 py-3 rounded-xl">My Account</Link>
                <Link to="/account/orders" className="bg-gray-100 text-[#0f172a] font-bold text-center px-4 py-3 rounded-xl">My Shipments</Link>
                <button onClick={handleSignOut} className="bg-red-50 text-red-600 font-bold text-center px-4 py-3 rounded-xl">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" state={{ returnTo: location.pathname + location.search }} className="bg-gray-100 text-[#0f172a] font-bold text-center px-4 py-3 rounded-xl">Sign In</Link>
              </>
            )}
            {profile?.role === 'admin' && (
              <Link to="/admin" className="text-gray-400 font-medium text-center text-xs py-2">Admin Dashboard</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
