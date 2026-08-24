import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Careers() {
  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-20">
      <Helmet>
        <title>Careers | Ghana Post</title>
        <meta name="description" content="Join Ghana Post and help us deliver excellence. Explore career opportunities with us." />
      </Helmet>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600">
        <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Careers</h1>
            <p className="text-lg md:text-xl leading-relaxed text-blue-50 mb-8">
              Discover the rewards of a truly engaging workplace. Our people are the heart, spirit, and future of Ghana Post.
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors inline-flex items-center">
              Find your role <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
          <div className="md:w-1/2">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
              <img 
                src="/images/careers-hero.webp" 
                alt="Ghana Post Team" 
                className="w-full h-auto object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div className="hidden w-full h-[300px] bg-white/10 flex-col items-center justify-center text-white/50 border border-white/20 backdrop-blur-sm">
                Missing Image: public/images/careers-hero.webp
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-extrabold text-[#0033a0] mb-4">Start your future here</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join a workplace that is supportive, welcoming, and inclusive as we deliver more to all Ghanaians. Your career journey starts here.
        </p>
      </div>

      {/* Feature 1 */}
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-12 max-w-6xl">
        <div className="md:w-1/2">
          <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <img 
              src="/images/careers-wellbeing.webp" 
              alt="Well-being" 
              className="w-full h-auto object-cover"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-full h-[300px] bg-gray-200 flex-col items-center justify-center text-gray-400">
              Missing Image: public/images/careers-wellbeing.webp
            </div>
          </div>
        </div>
        <div className="md:w-1/2">
          <h3 className="text-2xl font-bold text-[#0033a0] mb-4 border-b-2 border-orange-500 pb-2 inline-block">We care about your well-being</h3>
          <p className="text-gray-600 leading-relaxed">
            We pride ourselves on creating a safe space for all our employees to bring their full selves to work. As team members, you'll enjoy a range of health coverage, disability, and benefit plans.
          </p>
        </div>
      </div>

      {/* Feature 2 */}
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row-reverse items-center gap-12 max-w-6xl">
        <div className="md:w-1/2">
          <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <img 
              src="/images/careers-growth.webp" 
              alt="Career Growth" 
              className="w-full h-auto object-cover"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-full h-[300px] bg-gray-200 flex-col items-center justify-center text-gray-400">
              Missing Image: public/images/careers-growth.webp
            </div>
          </div>
        </div>
        <div className="md:w-1/2 text-left">
          <h3 className="text-2xl font-bold text-[#0033a0] mb-4 border-b-2 border-orange-500 pb-2 inline-block">We foster your career growth</h3>
          <p className="text-gray-600 leading-relaxed">
            You'll find the support you need to expand your career, explore new roles, find your voice, and feel valued for your contributions.
          </p>
        </div>
      </div>

      {/* Interested in joining us */}
      <div className="container mx-auto px-4 py-20 text-center max-w-6xl">
        <h2 className="text-3xl font-extrabold text-[#0033a0] mb-2">Interested in joining us?</h2>
        <p className="text-gray-500 mb-12">Start applying below simple steps</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: 1, text: "Are while training our post sample jobs" },
            { step: 2, text: "Prescreen meeting upon reaching an open role" },
            { step: 3, text: "An update alert to the mobile device on post an filling yourself to location, documents become available" },
            { step: 4, text: "When the perfect job for you becomes available, apply via ghana post careers portal from local post jobs" }
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0033a0] font-bold text-xl flex items-center justify-center mb-6">
                {item.step}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* What you can expect */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h2 className="text-2xl font-bold text-[#0033a0] mb-8">What you can expect</h2>
        
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          <div className="lg:w-2/3 bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-200">
            <p className="font-semibold text-gray-800 mb-6">Here are the next steps once you've applied:</p>
            <ul className="space-y-6">
              {[
                "You will get an email confirming your application was received.",
                "Your application will be reviewed by our team, and those selected for an interview are contacted.",
                "Selected candidates are interviewed by our hiring board.",
                "Successful candidates are invited to participate in the next step of our hiring process.",
                "Once an offer is accepted, the onboarding is scheduled for you to join us."
              ].map((text, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-4 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-800 text-sm italic">
              "Be authentic in your interview! We emphasize connecting personally with candidates over ensuring you fit a specific mold, tell us your truths, we'll listen."
            </div>
          </div>

          <div className="lg:w-1/3 bg-[#1e3a8a] rounded-3xl p-10 flex flex-col justify-center items-center text-center shadow-xl shadow-blue-900/20 text-white">
            <h3 className="text-2xl font-bold mb-4">Come work with us</h3>
            <p className="text-blue-200 mb-8 text-sm leading-relaxed">
              Grow your career and take pride in helping deliver a stronger Ghana. We'd love to have you join us.
            </p>
            <button className="bg-white text-[#1e3a8a] hover:bg-gray-100 font-bold py-3 px-8 rounded-lg shadow-lg transition-colors">
              Apply now <ArrowRight className="inline-block ml-1 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
