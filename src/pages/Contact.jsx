import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/thank-you');
  };

  const toggleFaq = (index) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const faqs = [
    {
      question: "How do I track my parcel?",
      answer: "You can track your parcel by entering your tracking number on our Track & Trace page. The number is provided on your receipt."
    },
    {
      question: "What are your operating hours?",
      answer: "Most of our post offices are open Monday to Friday from 8:00 AM to 5:00 PM, and Saturdays from 9:00 AM to 2:00 PM."
    },
    {
      question: "How can I calculate postage costs?",
      answer: "Postage costs depend on the weight, dimensions, and destination of your parcel. Please visit your local post office for an accurate quote."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we offer both standard and express international shipping to over 200 countries worldwide."
    },
    {
      question: "What items are prohibited from being sent?",
      answer: "Prohibited items include hazardous materials, flammable liquids, explosives, and perishable goods not properly packaged. Check our terms and conditions for a full list."
    }
  ];

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-20">
      <Helmet>
        <title>Contact Us | Ghana Post</title>
        <meta name="description" content="Get in touch with Ghana Post. We are here to help with your postal and delivery needs." />
      </Helmet>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#0033a0] text-white">
        <div className="absolute inset-0">
          <img 
            src="/images/contact-hero.webp" 
            alt="Contact Us" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden w-full h-full bg-[#0033a0] flex-col items-center justify-center text-white/50 border border-white/20 backdrop-blur-sm">
            Missing Image: public/images/contact-hero.webp
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Contact Us</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            We're here to help. Reach out to our customer support team for any inquiries or assistance.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-16 mb-20">
          
          {/* Contact Form */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">Send us a Message</h2>
              <p className="text-gray-500 mb-8 font-medium">We aim to respond to all inquiries within 24 business hours.</p>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input type="text" required className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input type="email" required className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all" placeholder="john@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input type="text" required className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea rows="5" required className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none" placeholder="Your message here..."></textarea>
                </div>
                <button type="submit" className="bg-orange-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:shadow-orange-500/50 transition-all duration-300 flex items-center group w-full justify-center">
                  Send Message <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Cards */}
          <div className="w-full lg:w-2/5 space-y-6">
             <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex items-start gap-6 hover:bg-blue-100/50 transition-colors">
               <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/20">
                 <MapPin size={28} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-blue-900 mb-2">Head Office</h3>
                 <p className="text-gray-600 leading-relaxed">General Post Office<br/>Accra Central, GA-183-8164<br/>Ghana</p>
               </div>
             </div>

             <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100 flex items-start gap-6 hover:bg-orange-100/50 transition-colors">
               <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-lg shadow-orange-500/20">
                 <Phone size={28} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-orange-900 mb-2">Phone</h3>
                 <p className="text-gray-600 leading-relaxed font-medium">Main: +233 (0)302 668 138<br/>WhatsApp: +233 (0)542 527 004</p>
               </div>
             </div>

             <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 flex items-start gap-6 hover:bg-gray-100 transition-colors">
               <div className="bg-gray-800 text-white p-4 rounded-2xl shadow-lg shadow-gray-800/20">
                 <Mail size={28} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                 <p className="text-gray-600 leading-relaxed font-medium">info@ghanapost.com.gh</p>
               </div>
             </div>
          </div>
          
        </div>

        {/* Map and FAQs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Map Location */}
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-8">Our Location</h2>
            <div className="bg-white rounded-3xl p-2 shadow-xl shadow-gray-200/50 h-[400px]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.050302830303!2d-0.20743608462002306!3d5.545831535266885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf50a4b0c793c7%3A0x8979c5950b73b5f!2sGhana%20Post%20Company%20Limited!5e0!3m2!1sen!2sgh!4v1700000000000!5m2!1sen!2sgh" 
                width="100%" 
                height="100%" 
                style={{ border: 0, borderRadius: '1.5rem' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Ghana Post Headquarters Map"
              ></iframe>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-gray-800 pr-4">{faq.question}</span>
                    {openFaqIndex === index ? (
                      <Minus className="text-orange-500 flex-shrink-0" size={20} />
                    ) : (
                      <Plus className="text-gray-400 flex-shrink-0" size={20} />
                    )}
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaqIndex === index ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
