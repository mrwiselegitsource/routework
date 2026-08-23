import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, X } from 'lucide-react';
import { db } from '../lib/db';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function News() {
  const [news, setNews] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    db.getNews().then(setNews);
  }, []);

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-20">
      <Helmet>
        <title>News & Updates | Ghana Post</title>
        <meta name="description" content="Stay up to date with the latest news, announcements, and updates from Ghana Post." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">News & Updates</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Discover the latest announcements, operational updates, and stories from Ghana Post.
        </p>
      </div>

      <div className="container mx-auto max-w-6xl px-4 mt-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className={`bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col transition-all ${isExpanded ? 'ring-2 ring-orange-500 scale-[1.02] md:col-span-2 lg:col-span-3 z-10' : 'hover:shadow-xl'}`}>
                {item.image_url && !isExpanded && (
                  <div className="h-48 overflow-hidden bg-gray-200 relative">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-2" />
                      {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    {isExpanded && (
                       <button onClick={() => setExpandedId(null)} className="text-gray-400 hover:text-gray-800 bg-gray-100 rounded-full p-1"><X size={16}/></button>
                    )}
                  </div>
                  
                  <h3 className={`${isExpanded ? 'text-3xl' : 'text-xl'} font-bold text-gray-900 mb-3 leading-snug transition-all`}>{item.title}</h3>
                  
                  {!isExpanded ? (
                    <>
                      <p className="text-gray-600 mb-6 flex-1">{item.excerpt}</p>
                      <div className="mt-auto">
                        <button onClick={() => setExpandedId(item.id)} className="text-orange-500 font-semibold flex items-center hover:text-orange-600 transition-colors group">
                          Read full story
                          <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="mt-4">
                      {item.image_url && (
                        <div className="w-full h-64 md:h-96 overflow-hidden bg-gray-200 relative mb-6 rounded-xl">
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                      <div className="prose prose-blue max-w-none text-gray-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {item.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {news.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              No news updates available at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
