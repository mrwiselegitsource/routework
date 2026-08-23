import React from 'react';
import { Routes, Route, Outlet, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Package } from 'lucide-react';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { CartProvider } from './context/CartContext';
import TrackingProvider from './components/TrackingProvider';
import Topbar from './components/Topbar';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Home from './pages/Home';
import Services from './pages/Services';
import BusinessSolutionsPage from './pages/BusinessSolutionsPage';
import RTI from './pages/RTI';
import Contact from './pages/Contact';
import Track from './pages/Track';
import About from './pages/About';
import Careers from './pages/Careers';
import News from './pages/News';
import NotFound from './pages/NotFound';
import ThankYou from './pages/ThankYou';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

// Customer Layout and Guards
import CustomerLayout from './components/layout/CustomerLayout';
import RequireCustomerAuth from './components/auth/RequireCustomerAuth';

// Customer Auth Pages
import CustomerSignup from './pages/CustomerSignup';
import CustomerLogin from './pages/CustomerLogin';
import ForgotPassword from './pages/ForgotPassword';

// Customer Protected Pages
import CustomerAccount from './pages/CustomerAccount';
import CustomerOrders from './pages/CustomerOrders';
import CustomerMessages from './pages/CustomerMessages';
import Cart from './pages/Cart';

import { CustomerMessagesProvider } from './context/CustomerMessagesContext';

// Admin imports
import RequireAuth from './components/auth/RequireAuth';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import OrderNew from './pages/admin/OrderNew';
import OrderDetail from './pages/admin/OrderDetail';
import AdminNews from './pages/admin/AdminNews';
import Staff from './pages/admin/Staff';
import Activity from './pages/admin/Activity';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminRegions from './pages/admin/AdminRegions';
import AdminPickupPoints from './pages/admin/AdminPickupPoints';
import AdminPricing from './pages/admin/AdminPricing';
import AdminAutomations from './pages/admin/AdminAutomations';

import Footer from './components/Footer';

function PublicAppLayout() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col relative pb-16 md:pb-0">
      <Topbar />
      <Navbar />
      <main className="flex-1 animate-[fadeIn_0.8s_ease-out]">
        <Outlet />
      </main>
      <Footer />
      
      {/* Floating Bottom Nav for Mobile */}
      <MobileBottomNav />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <TrackingProvider>
          <CustomerMessagesProvider>
            <Routes>
              {/* Public Facing Routes */}
              <Route element={<PublicAppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/businesssolutions" element={<BusinessSolutionsPage />} />
                <Route path="/rti" element={<RTI />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/track" element={<Track />} />
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/news" element={<News />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Customer Auth Routes */}
              <Route path="/signup" element={<CustomerSignup />} />
              <Route path="/login" element={<CustomerLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Customer Protected Routes */}
              <Route element={<RequireCustomerAuth><CustomerLayout /></RequireCustomerAuth>}>
                <Route path="/account" element={<CustomerAccount />} />
                <Route path="/account/orders" element={<CustomerOrders />} />
                <Route path="/account/messages" element={<CustomerMessages />} />
                <Route path="/cart" element={<Cart />} />
              </Route>

              {/* Admin Panel Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/new" element={<OrderNew />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="regions" element={<RequireAuth adminOnly><AdminRegions /></RequireAuth>} />
                <Route path="pickup-points" element={<RequireAuth adminOnly><AdminPickupPoints /></RequireAuth>} />
                <Route path="pricing" element={<RequireAuth adminOnly><AdminPricing /></RequireAuth>} />
                <Route path="automations" element={<RequireAuth adminOnly><AdminAutomations /></RequireAuth>} />
                <Route path="staff" element={<RequireAuth adminOnly><Staff /></RequireAuth>} />
                <Route path="activity" element={<RequireAuth adminOnly><Activity /></RequireAuth>} />
              </Route>
            </Routes>
          </CustomerMessagesProvider>
        </TrackingProvider>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;
