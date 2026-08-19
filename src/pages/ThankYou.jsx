import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CheckCircle2, Home } from 'lucide-react';

export default function ThankYou() {
  return (
    <div className="bg-[#f8f9fc] min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <Helmet>
        <title>Thank You | Ghana Post</title>
        <meta name="description" content="Thank you for contacting Ghana Post." />
      </Helmet>
      
      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl shadow-gray-200/50 text-center max-w-lg w-full border border-gray-100">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="text-green-500 w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h1>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          Thank you for reaching out. We have received your message and our team will get back to you shortly.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center bg-blue-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-800 transition-colors w-full"
        >
          <Home className="mr-2" size={20} />
          Return Home
        </Link>
      </div>
    </div>
  );
}
