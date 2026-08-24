import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Download, Info, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

export default function RTI() {
  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-20">
      <Helmet>
        <title>Right to Information | Ghana Post</title>
        <meta name="description" content="Access information and manuals under the Right to Information Act at Ghana Post." />
      </Helmet>
      <div className="container mx-auto max-w-4xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-blue-900 text-white text-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 z-20"></div>
          {/* Hero Section */}
      <div className="relative text-white py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/rti-hero.webp" 
            alt="Right to Information" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden w-full h-full bg-blue-900 flex-col items-center justify-center text-white/20">
            Missing Image: public/images/rti-hero.webp
          </div>
          <div className="absolute inset-0 bg-blue-900/80 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10">
          <ShieldIcon className="w-16 h-16 mx-auto mb-6 text-orange-400 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Right to Information (RTI)</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Transparency and accountability at Ghana Post. Access public records and understand your rights under the RTI Act.
          </p>
        </div>
      </div>
        </div>

        {/* Content */}
        <div className="p-10 md:p-16">
          <div className="mb-12">
             <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-3">
               <Info className="text-orange-500" /> About RTI
             </h2>
             <p className="text-gray-600 leading-relaxed text-lg">
               The Right to Information (RTI) Act allows citizens to request access to information held by public institutions. At Ghana Post, we believe in an open relationship with the public, ensuring that non-exempt information is accessible upon request.
             </p>
          </div>

          <div className="mb-12">
             <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
               <FileText className="text-orange-500" /> Information Manuals
             </h2>
             <div className="space-y-4">
               {[1, 2, 3].map((num) => (
                 <div key={num} className="flex items-center justify-between p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group bg-gray-50 hover:bg-white">
                   <div className="flex items-center gap-4">
                     <div className="bg-blue-100 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                       <FileText size={20} />
                     </div>
                     <div>
                       <h4 className="font-bold text-gray-800">RTI Information Manual 202{num}</h4>
                       <p className="text-sm text-gray-500">PDF Document (2.4 MB)</p>
                     </div>
                   </div>
                   <button className="text-orange-500 font-semibold flex items-center gap-2 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors">
                     Download <Download size={18} />
                   </button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  );
}
