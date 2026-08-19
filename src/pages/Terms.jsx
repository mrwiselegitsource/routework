import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Shield, CheckCircle, Scale, MessageSquare, AlertCircle, Printer, HelpCircle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Terms and Conditions | Ghana Post</title>
        <meta name="description" content="Official policies, legal guidelines, and customer advisories for Ghana Post services." />
      </Helmet>

      {/* Header */}
      <div className="bg-[#243B7A] text-white py-16 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          <div className="bg-orange-500/20 p-4 rounded-xl mb-6">
            <FileText className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Terms and <span className="text-orange-500">Conditions</span>
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Official policies, legal guidelines, and customer advisories for Ghana Post services.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-6xl mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column */}
          <div className="lg:w-5/12 flex flex-col gap-6">
            
            {/* Disclaimer Image */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
              <img 
                src="/images/disclaimer.jpg" 
                alt="Disclaimer for shipments to the United States" 
                className="w-full rounded-2xl shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full aspect-[4/5] bg-gray-100 rounded-2xl flex-col items-center justify-center text-gray-400 p-8 text-center border-2 border-dashed border-gray-200">
                <AlertCircle className="w-12 h-12 mb-4 text-orange-500" />
                <p className="font-bold mb-2 text-gray-700">DISCLAIMER</p>
                <p className="text-sm">Please place your disclaimer image at <strong>public/images/disclaimer.jpg</strong> to display it here.</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <Shield className="w-6 h-6 text-green-500 mb-3" />
                <h4 className="font-bold text-gray-900 mb-1">Secure Service</h4>
                <p className="text-xs text-gray-500">Your trust is our priority.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <AlertCircle className="w-6 h-6 text-orange-500 mb-3" />
                <h4 className="font-bold text-gray-900 mb-1">Clear Policy</h4>
                <p className="text-xs text-gray-500">Transparent guidelines.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <Scale className="w-6 h-6 text-blue-500 mb-3" />
                <h4 className="font-bold text-gray-900 mb-1">Legal Rights</h4>
                <p className="text-xs text-gray-500">Protecting all parties.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <FileText className="w-6 h-6 text-purple-500 mb-3" />
                <h4 className="font-bold text-gray-900 mb-1">Detailed Terms</h4>
                <p className="text-xs text-gray-500">Full service clarity.</p>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:w-7/12 flex flex-col gap-6 relative">
            
            {/* Chat Bubble Icon */}
            <button className="absolute -top-4 -right-4 bg-[#243B7A] text-white p-4 rounded-full shadow-xl hover:bg-blue-800 transition-colors z-10 hidden lg:block border-4 border-white">
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Customer Advisory Main Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
              {/* Orange left border strip */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
              
              <div className="p-8 md:p-10 pl-10 md:pl-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-50 text-blue-500 p-2 rounded-full">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Customer Advisory</h2>
                </div>

                <div className="text-gray-600 space-y-5 leading-relaxed text-[15px]">
                  <p>
                    <span className="float-left text-5xl font-extrabold text-[#243B7A] mr-3 mt-1 font-serif leading-none">T</span>
                    he information provided by Ghana Post is for general informational purposes only. While we strive to ensure accuracy and reliability, Ghana Post makes no warranties or representations of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, or services offered.
                  </p>
                  
                  <p>
                    Any reliance you place on such information is therefore strictly at your own risk. By using our services, you acknowledge and agree that Ghana Post is not responsible for circumstances beyond its control, including force majeure events, third-party delays, or technological disruptions.
                  </p>
                </div>

                <div className="mt-8 mb-8 border-l-4 border-blue-200 bg-blue-50/50 p-6 rounded-r-xl italic text-blue-900 font-medium">
                  Customers are advised to read and understand our full Terms and Conditions before engaging our services.
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-6 border-t border-gray-100 gap-4">
                  <span className="text-xs text-gray-400 font-medium tracking-wide">Last Updated: March 2024</span>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none bg-[#243B7A] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors">
                      Print Terms
                    </button>
                    <button className="flex-1 sm:flex-none bg-white text-[#243B7A] border-2 border-[#243B7A] px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                      Need Help?
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1f2937] text-white p-8 rounded-3xl shadow-sm">
                <h3 className="font-bold text-lg mb-3">Service Scope</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Our terms cover all postal, financial, and courier services provided by Ghana Post Company Limited nationwide.
                </p>
              </div>
              <div className="bg-orange-500 text-white p-8 rounded-3xl shadow-sm">
                <h3 className="font-bold text-lg mb-3">Compliance</h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Ghana Post adheres to international UPU standards and local regulatory guidelines for all operations.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Mobile Chat Bubble Icon */}
      <button className="fixed bottom-24 right-4 bg-[#243B7A] text-white p-4 rounded-full shadow-2xl hover:bg-blue-800 transition-colors z-50 lg:hidden border-2 border-white">
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}
