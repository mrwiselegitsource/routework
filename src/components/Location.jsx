import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Location() {
  return (
    <div className="bg-[#F2FBF8] py-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-50/50 skew-x-12 transform origin-bottom pointer-events-none"></div>
      <div className="container mx-auto max-w-7xl flex flex-col-reverse md:flex-row gap-12 items-center relative z-10">
        <div className="w-full md:w-1/2 md:pr-8">
          <span className="text-orange-500 font-bold tracking-wider uppercase text-sm mb-3 block">Location</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-blue-900 leading-tight tracking-tight">Find a Post Office</h2>
          <div className="w-16 h-1.5 bg-blue-600 rounded-full mb-6"></div>
          <p className="mb-8 text-gray-600 text-lg leading-relaxed text-justify">
            Easily locate your nearest post office, access essential contact information, and receive step-by-step directions for a hassle-free visit. Whether you need to send a package, pick up mail, or inquire about services, we’re here to help you find the best route.
          </p>
          <div>
            <a href="https://ghanapostgps.com/map/">
              <button className="bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:shadow-orange-500/50 transition-all duration-300 flex items-center group">
                Search Post Office
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </a>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-100 group bg-white p-8 h-[350px]">
            <img 
              src="/images/geolocation.png" 
              alt="Geolocation" 
              className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-full h-[400px] bg-gray-200 flex-col items-center justify-center text-gray-500 font-medium">
              Missing Image: public/images/geolocation.png
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
