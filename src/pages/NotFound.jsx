import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-[#f8f9fc] min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Helmet>
        <title>404 - Page Not Found | Ghana Post</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Helmet>
      
      <div className="text-center max-w-lg">
        <h1 className="text-9xl font-extrabold text-blue-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center bg-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
        >
          <Home className="mr-2" size={20} />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
