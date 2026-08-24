import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function BusinessSolutions() {
  return (
    <div className="bg-white py-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/30 -skew-x-12 transform origin-top pointer-events-none"></div>
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row gap-12 items-center relative z-10">
        <div className="w-full md:w-1/2">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-100 group">
            <img 
              src="/images/pc.webp" 
              alt="Business Solutions" 
              className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105 bg-gray-200"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-full h-[400px] bg-gray-200 flex-col items-center justify-center text-gray-500 font-medium">
              Missing Image: public/images/pc.webp
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
          </div>
        </div>
        <div className="w-full md:w-1/2 md:pl-8">
          <span className="text-orange-500 font-bold tracking-wider uppercase text-sm mb-3 block">Corporate Services</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-blue-900 leading-tight tracking-tight">Business Solutions</h2>
          <div className="w-16 h-1.5 bg-blue-600 rounded-full mb-6"></div>
          <p className="mb-8 text-gray-600 text-lg leading-relaxed text-justify">
            Our range of services to help your business includes reliable dedicated delivery to ensure your products reach their destination on time, customized Contract EMS for tailored emergency management solutions that meet your unique needs, and fast-tracked Priority Services designed to keep your critical operations running smoothly. We're committed to supporting your business with efficient and dependable solutions.
          </p>
          <div>
            <a href="/businesssolutions">
              <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/50 transition-all duration-300 flex items-center group">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
