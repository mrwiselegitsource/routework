import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function BusinessSolutionsPage() {
  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Business Solutions | Ghana Post</title>
        <meta name="description" content="Discover tailored logistics, e-commerce, and postal solutions designed to help your business grow with Ghana Post." />
      </Helmet>
      {/* Hero Section */}
      <div className="relative text-white py-24 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/business-hero.jpg" 
            alt="Business Solutions" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden w-full h-full bg-blue-900 flex-col items-center justify-center text-white/20">
            Missing Image: public/images/business-hero.jpg
          </div>
          <div className="absolute inset-0 bg-blue-900/85 mix-blend-multiply"></div>
        </div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Enterprise Logistics <br/><span className="text-orange-500">Simplified.</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed max-w-2xl">
              Partner with Ghana Post for scalable, secure, and nationwide delivery solutions tailored specifically for your business operations.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact-sales" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center">
                Contact Sales <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a href="#services" className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl transition-all backdrop-blur-sm border border-white/20">
                Explore Services
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-col md:flex-row gap-16 items-center mb-24">
          <div className="w-full md:w-1/2">
            <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] bg-gray-100 group relative">
               <img 
                 src="/images/business-operations.jpg" 
                 alt="Business Operations" 
                 className="w-full h-full object-cover"
                 onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
               />
               <div className="hidden w-full h-full flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-500 text-center font-medium">
                 Missing Image: public/images/business-operations.jpg
               </div>
               <div className="absolute inset-0 bg-blue-900/5 group-hover:bg-blue-900/10 transition-colors pointer-events-none"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Why Choose Ghana Post for Business?</h2>
            <div className="w-16 h-1.5 bg-orange-500 rounded-full mb-8"></div>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We understand that timely deliveries are the backbone of your business. Our corporate accounts offer priority handling, dedicated account managers, and integrated tracking APIs for your e-commerce platforms.
            </p>
            <ul className="space-y-4 mb-8">
              {['Dedicated Account Manager', 'Volume Discounts', 'API Integration for E-commerce', 'Monthly Invoicing Options'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-orange-500 w-6 h-6" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Pricing/Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-10 border border-orange-100 shadow-xl shadow-orange-100/50 flex flex-col">
              <h3 className="text-2xl font-bold text-orange-600 mb-2">Small Business</h3>
              <p className="text-gray-500 mb-8">For businesses shipping under 25 packages per week.</p>
              <ul className="space-y-3 mb-10 flex-grow">
                <li className="flex items-center gap-2"><CheckCircle2 className="text-orange-400 w-5 h-5"/> Standard tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-orange-400 w-5 h-5"/> Drop-off flexibility</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-orange-400 w-5 h-5"/> Basic support</li>
              </ul>
              <button className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center group">
                Get Started <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"/>
              </button>
           </div>
           
           <div className="bg-gradient-to-br from-blue-900 to-[#0f172a] rounded-3xl p-10 text-white shadow-xl shadow-blue-900/30 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-500 text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
              <h3 className="text-2xl font-bold text-white mb-2">Commercial Volume</h3>
              <p className="text-blue-200 mb-8">For operations shipping 25+ packages per week.</p>
              <ul className="space-y-3 mb-10 flex-grow text-blue-50">
                <li className="flex items-center gap-2"><CheckCircle2 className="text-blue-400 w-5 h-5"/> Dedicated account manager</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-blue-400 w-5 h-5"/> Scheduled pickups</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-blue-400 w-5 h-5"/> Volume-based discounts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-blue-400 w-5 h-5"/> Advanced API access</li>
              </ul>
              <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center group">
                Contact Sales <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"/>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
