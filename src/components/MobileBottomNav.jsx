import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Package, ShoppingCart, Search, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCustomerMessages } from '../context/CustomerMessagesContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const CUSTOMER_LINKS = [
  { to: '/track', label: 'Track', icon: Search },
  { to: '/account/orders', label: 'My Orders', icon: Package },
  { to: '/account/messages', label: 'Inbox', icon: Mail },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/account', label: 'Account', icon: User, end: true },
];

export default function MobileBottomNav() {
  const { cart } = useCart();
  const { unreadCount } = useCustomerMessages();
  const { session } = useCustomerAuth();
  
  const isLoggedIn = !!session?.user;

  // For non-logged in users, we can just point Inbox/Orders/Account to the login page.
  // Or we can let the Protected Route logic handle the redirect.
  // Since they are ProtectedRoutes in App.jsx, clicking them will redirect to /login naturally.

  return (
    <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] sm:max-w-md">
      <div className="bg-white rounded-[2rem] shadow-lg border border-gray-100 flex items-center justify-around px-2 py-1.5">
        {CUSTOMER_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition-colors relative ${
                isActive ? 'text-[#0033a0]' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <link.icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
            <span className="text-[9px] font-bold tracking-tight">{link.label}</span>
            {link.to === '/cart' && cart?.items?.length > 0 && (
              <span className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            )}
            {link.to === '/account/messages' && unreadCount > 0 && isLoggedIn && (
              <span className="absolute top-0.5 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
