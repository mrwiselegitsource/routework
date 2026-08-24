import React from 'react';
import { Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1e2a4a] text-white pt-16 border-t-4 border-orange-500">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Logo & Contact Info */}
          <div className="flex flex-col">
            <Link to="/">
              <img 
                src="/images/logo-horizontal.png" 
                alt="Ghana Post Logo" 
                className="h-[50px] w-auto object-contain mb-8 bg-white p-2 rounded" 
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
              />
              <div className="hidden text-2xl font-bold text-white mb-8 tracking-wide">
                GHANA POST
              </div>
            </Link>
            
            <ul className="space-y-6">
              <li className="flex items-start">
                <MapPin className="text-orange-500 w-5 h-5 mr-4 mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm leading-relaxed">
                  Head Office: General Post Office<br />
                  Accra Central, Ghana
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="text-orange-500 w-5 h-5 mr-4 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Call us on: +233 (0)302 668 138</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-orange-500 w-5 h-5 mr-4 flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@ghanapost.com.gh</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:pl-8">
            <h3 className="text-lg font-bold mb-6 text-white tracking-wider border-b border-white/20 pb-4 inline-block">Company</h3>
            <ul className="space-y-4">
              <li><Link to="/careers" className="text-gray-300 hover:text-white transition-colors text-sm">Working at Ghana Post</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/news" className="text-gray-300 hover:text-white transition-colors text-sm">News & Updates</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors text-sm">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-wider border-b border-white/20 pb-4 inline-block">Services</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">E-commerce & Business</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Financial Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Postal Solutions</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-wider border-b border-white/20 pb-4 inline-block">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/track" className="bg-[#0033a0] text-white px-4 py-2 rounded-full text-xs font-bold inline-block hover:bg-blue-800 transition-colors mb-2">Track & Trace</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm block">Post Code Finder</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm block">Provide website feedback</a></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Social Icons */}
          <div className="flex space-x-3">
            <a href="#" className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all text-gray-300 hover:text-white">
              <FaFacebookF size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all text-gray-300 hover:text-white">
              <FaTwitter size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all text-gray-300 hover:text-white">
              <FaLinkedinIn size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all text-gray-300 hover:text-white">
              <FaInstagram size={14} />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-gray-400 text-xs text-center">
            &copy; {new Date().getFullYear()} Ghana Post Company Limited. All Rights Reserved.
          </div>

          {/* Back to Top */}
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded transition-colors"
          >
            BACK TO TOP <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
