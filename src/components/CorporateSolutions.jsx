import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CorporateSolutions() {
  return (
    <div className="w-full bg-[#F2FBF8] py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="col-span-1 md:pr-8">
            <span className="text-orange-500 font-bold tracking-wider uppercase text-sm mb-3 block">Corporate Solutions</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-6 leading-tight">Are you shipping for your business?</h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-6"></div>
            <p className="text-lg text-gray-700 leading-relaxed text-left">
              Whether you're just starting out, expanding, or aiming for new heights, our scalable courier and freight solutions are here to help make your business goals a reality.
            </p>
          </div>
          
          <div className="col-span-1 h-full">
            <div className="h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-500/20 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 group border border-orange-400">
              <div>
                <h3 className="text-2xl font-bold mb-4 drop-shadow-sm">I ship under 25 packages per week</h3>
                <a href="/businesssolutions" className="inline-flex items-center text-orange-50 font-semibold hover:text-white transition-colors mb-8 group-hover:underline decoration-2 underline-offset-4">
                  Go to Solutions for Small Business 
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              <div className="flex justify-center mt-auto bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20 h-[190px]">
                <img 
                  src="/images/small.svg" 
                  alt="Small Business" 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className="hidden w-full h-full flex-col items-center justify-center border-dashed border-2 border-white/40 text-white/80 rounded-xl font-medium text-center">
                  Missing Image: public/images/small.svg
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 h-full">
            <div className="h-full bg-gradient-to-br from-blue-900 to-[#0f172a] rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 group border border-blue-800">
              <div>
                <h3 className="text-2xl font-bold mb-4 drop-shadow-sm">I ship 25+ packages per week</h3>
                <a href="/businesssolutions" className="inline-flex items-center text-blue-200 font-semibold hover:text-white transition-colors mb-8 group-hover:underline decoration-2 underline-offset-4">
                  Go to commercial solutions 
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              <div className="flex justify-center mt-auto bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 h-[190px]">
                <img 
                  src="/images/commercial.svg" 
                  alt="Commercial Business" 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className="hidden w-full h-full flex-col items-center justify-center border-dashed border-2 border-white/40 text-white/80 rounded-xl font-medium text-center">
                  Missing Image: public/images/commercial.svg
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
