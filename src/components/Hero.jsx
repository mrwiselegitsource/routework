import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Globe, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const HERO_IMAGES = [
  '/images/hero-bg.jpg',
  '/images/hero-2.jpg',
  '/images/hero-3.jpg'
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-[#0033a0] overflow-hidden min-h-[600px] flex items-center">
      <div className="container mx-auto px-4 relative z-10 py-12 lg:py-20 flex flex-col lg:flex-row items-center">
        
        {/* Left Side Content */}
        <div className="w-full lg:w-1/2 text-white pr-0 lg:pr-12">
          <div className="inline-block border border-orange-500 rounded-full px-4 py-1 mb-6">
            <span className="text-orange-400 font-bold text-xs tracking-widest uppercase">Welcome to Ghana Post</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Fast, Secure &<br/>
            <span className="text-[#ffb81c]">Reliable Postal<br/>Services</span>
          </h1>
          
          <p className="text-lg mb-10 text-white/90 max-w-lg leading-relaxed">
            Whether local or international, we ensure safe and timely deliveries. Track your shipments, enjoy express courier services, and experience seamless postal solutions tailored to your needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to="/about" className="inline-flex bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all duration-300 items-center justify-center group">
              Learn About Us
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/track" className="inline-flex bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 items-center justify-center">
              Track Parcel
            </Link>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/20 pt-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center">
              <div className="bg-white/10 p-2 rounded-lg mr-3">
                <MapPin className="text-orange-400 w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg">360+</div>
                <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">Post Offices</div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center">
              <div className="bg-white/10 p-2 rounded-lg mr-3">
                <Globe className="text-yellow-400 w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg">24/7</div>
                <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">Parcel Tracking</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center">
              <div className="bg-white/10 p-2 rounded-lg mr-3">
                <ShieldCheck className="text-green-400 w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg">100%</div>
                <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">Security of Parcels</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Carousel */}
        <div className="w-full lg:w-1/2 mt-12 lg:mt-0 relative h-[400px] lg:h-[500px]">
          {HERO_IMAGES.map((src, index) => (
            <div 
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img 
                src={src} 
                alt={`Hero image ${index + 1}`} 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
                onError={(e) => { 
                  e.target.style.display = 'none'; 
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                }}
              />
              <div className="hidden w-full h-full bg-slate-800 flex-col items-center justify-center text-white/20 rounded-2xl">
                Missing Image: {src}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
