import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  {
    name: "Kwame Mensah",
    role: "Small Business Owner",
    content: "Ghana Post has transformed how I deliver goods to my customers. Their EMS service is incredibly reliable and the tracking system gives both me and my customers peace of mind.",
    rating: 5
  },
  {
    name: "Abena Osei",
    role: "E-commerce Entrepreneur",
    content: "I've been using their e-commerce fulfillment services for a year now. The rates are very competitive and the staff at the Accra Central branch are always so helpful.",
    rating: 5
  },
  {
    name: "David Tetteh",
    role: "Regular Customer",
    content: "Sent a package to my daughter in the UK. It arrived faster than expected and in perfect condition. Great service from the team!",
    rating: 4
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Real experiences from businesses and individuals who rely on our postal and logistics services every day.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col h-full">
              <div className="flex text-orange-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-orange-500" : "text-gray-300"} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 flex-grow italic">"{review.content}"</p>
              <div>
                <h4 className="font-bold text-[#0f172a]">{review.name}</h4>
                <p className="text-sm text-gray-500">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
