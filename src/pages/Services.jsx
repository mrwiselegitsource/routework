import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Package, Truck, Mailbox, Globe, ShieldCheck, Clock, ChevronRight, Home } from 'lucide-react';

const services = [
  { icon: Package, title: 'EMS', description: 'Express Mail Service for documents and merchandise. Fast and reliable.' },
  { icon: Truck, title: 'Parcels', description: 'Affordable domestic and international parcel delivery solutions.' },
  { icon: Mailbox, title: 'Registered Mail', description: 'Secure delivery for important documents with tracking and signature.' },
  { icon: Globe, title: 'International Services', description: 'Connect with over 200 countries worldwide through our global network.' },
  { icon: ShieldCheck, title: 'Financial Services', description: 'Convenient money transfer and financial solutions at our branches.' },
  { icon: Clock, title: 'Priority Services', description: 'Same-day and next-day delivery options for urgent shipments.' }
];

export default function Services() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Our Services | Ghana Post</title>
        <meta name="description" content="Explore the wide range of postal, logistics, and financial services offered by Ghana Post." />
      </Helmet>
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="container mx-auto max-w-7xl flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:text-orange-500 transition-colors flex items-center">
            <Home size={14} className="mr-1" /> Home
          </Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-gray-800 font-medium">Services</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative text-white py-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/services-hero.webp" 
            alt="Our Services" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden w-full h-full bg-[#0033a0] flex-col items-center justify-center text-white/50 border border-white/20 backdrop-blur-sm">
            Missing Image: public/images/services-hero.webp
          </div>
          <div className="absolute inset-0 bg-[#0033a0]/80 mix-blend-multiply"></div>
        </div>
        <div className="container mx-auto px-4 py-24 relative z-10 text-center">
          <span className="text-orange-500 font-bold tracking-widest uppercase text-sm mb-4 block">WHAT WE DO</span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Our Services</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light">
            Comprehensive logistics, postal, and digital solutions tailored to meet your personal and business needs.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
      </div>

      {/* Services Grid */}
      <div className="container mx-auto max-w-7xl px-4 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group border border-gray-100">
              <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                <service.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
              <div className="mt-8">
                <a href="#" className="text-orange-500 font-semibold group-hover:text-blue-900 transition-colors flex items-center">
                  Learn More <span className="ml-2">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
