import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { db } from '../lib/db';

export default function NewsSnippet() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    db.getNews().then(data => setNews(data.slice(0, 5))); // Show top 5
  }, []);

  if (news.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4">Latest News & Updates</h2>
            <p className="text-lg text-gray-600">Stay informed with what's happening at Ghana Post.</p>
          </div>
          <Link to="/news" className="text-orange-500 font-semibold flex items-center hover:text-orange-600 transition-colors mt-4 md:mt-0">
            View All News <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>

        <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {news.map((item) => (
            <div key={item.id} className="min-w-[300px] md:min-w-[350px] max-w-[350px] snap-center bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col flex-shrink-0">
              {item.image_url && (
                <div className="h-40 overflow-hidden bg-gray-200 relative">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Calendar size={12} className="mr-1" />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.excerpt}</p>
                <div className="mt-auto">
                  <Link to="/news" className="text-orange-500 text-sm font-semibold flex items-center hover:text-orange-600 transition-colors">
                    Read more <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
