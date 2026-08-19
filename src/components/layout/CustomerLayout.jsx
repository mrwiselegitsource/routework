import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, Package, ShoppingCart, Search, LogOut } from 'lucide-react';
import { auth } from '../../lib/db';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import Navbar from '../Navbar';
import Footer from '../Footer';

const CUSTOMER_LINKS = [
  { to: '/track', label: 'Track', icon: Search },
  { to: '/account/orders', label: 'My Orders', icon: Package },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/account', label: 'Account', icon: User, end: true },
];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { profile } = useCustomerAuth();
  const { cart } = useCart();

  const handleLogout = async () => {
    await auth.customerSignOut();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / Top Nav for mobile */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
              <div className="mb-6 hidden md:block text-center">
                <div className="w-16 h-16 bg-blue-100 text-[#0033a0] rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8" />
                </div>
                <h2 className="font-bold text-gray-900 text-lg">{profile?.name}</h2>
                <p className="text-sm text-gray-500">{profile?.email}</p>
              </div>

              <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                {CUSTOMER_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap justify-between ${
                        isActive
                          ? 'bg-[#0033a0] text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </div>
                    {link.to === '/cart' && cart?.items?.length > 0 && (
                      <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {cart.items.length}
                      </span>
                    )}
                  </NavLink>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors text-left whitespace-nowrap"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <Outlet />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
