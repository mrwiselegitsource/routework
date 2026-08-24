import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Eye, Shield, CheckCircle2, Award, ChevronRight, Home, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-[#f8f9fc] min-h-screen">
      <Helmet>
        <title>About Us | Ghana Post</title>
        <meta name="description" content="Learn about the history, vision, and mission of Ghana Post, and meet our dedicated team." />
      </Helmet>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="container mx-auto max-w-7xl flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:text-orange-500 transition-colors flex items-center">
            <Home size={14} className="mr-1" /> Home
          </Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-gray-800 font-medium">About Us</span>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600">
        <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
            <p className="text-lg md:text-xl leading-relaxed text-blue-50">
              Ghana Post was incorporated by an Act of Parliament, Act 505 in August 1995, thereby formally separating it from Ghana Telecom Company. By this Act of Incorporation, the corporation was expected to operate on sound commercial lines, and to be self-supporting.
            </p>
          </div>
          <div className="md:w-1/2">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
              <img 
                src="/images/about-hero-building.webp" 
                alt="Ghana Post Building" 
                className="w-full h-auto object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div className="hidden w-full h-[300px] bg-white/10 flex-col items-center justify-center text-white/50 border border-white/20 backdrop-blur-sm">
                Missing Image: public/images/about-hero-building.webp
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History & Growth Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-start mb-4">
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center shadow-sm">
            <ArrowRight className="w-4 h-4 mr-2" /> Our History
          </span>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            <div>
              <h2 className="text-4xl font-bold text-[#0f172a] mb-2">Delivering Excellence</h2>
              <h2 className="text-4xl font-bold text-orange-500 mb-6">Since 1995</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                In July 1999, Ghana Postal Services Corporation was converted to a limited liability company. This structure allows the company, in the current legal and regulatory operating environment as a state-owned enterprise, to operate commercially as a competitive commercial entity.
              </p>
            </div>
            
            <div className="bg-blue-50/50 rounded-2xl p-6 border-l-4 border-blue-600 shadow-sm mt-auto">
              <div className="flex items-start gap-4">
                <div className="bg-white p-2 rounded-full shadow-sm text-blue-600">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0f172a] mb-2">Nationwide Reach</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    As an inherently designated operator with a network of 300+ post offices across the country, Ghana Post has an unparalleled wide coverage level connecting communities locally and internationally.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/40 border border-gray-100 flex-1">
              <p className="text-gray-700 text-lg leading-relaxed">
                Over the past 4 years, the company has seen significant growth through innovation and the introduction of new services and expansion of its fleet. The digital branch of the Post Offices has been at the core of the turnaround strategy, allowing the Company flexibility to easily add on new services, while the introduction of digital addresses by the government has allowed enhanced delivery of items and parcels.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-orange-500 border-y border-r border-y-gray-100 border-r-gray-100">
              <p className="text-gray-700 text-md leading-relaxed">
                Our online platform, Ghpostpay, was launched in 2019 to enhance diverse financial and commercial accessibility.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Identity */}
      <div className="bg-blue-50/30 py-20 border-y border-blue-100/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-2 block">WHO WE ARE</span>
            <h2 className="text-4xl font-extrabold text-[#0f172a] mb-4">Core Identity</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Ghana Post identifies these commitments to define the standard of service we deliver to our customers daily.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/40 border border-blue-50 text-center flex flex-col items-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mb-6">
                <img src="/images/icon-mission.svg" alt="Mission Icon" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-[#0f172a] mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide Prompt, Reliable, Definite and secure communication and financial solutions that turn all our new & old customers to fans!!
              </p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/40 border border-orange-50 text-center flex flex-col items-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mb-6">
                <img src="/images/icon-vision.svg" alt="Vision Icon" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-[#0f172a] mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the No. 1 brand in commercially focused and customer driven organization.
              </p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/40 border border-purple-50 text-center flex flex-col items-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mb-6">
                <img src="/images/icon-values.svg" alt="Values Icon" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-[#0f172a] mb-6">Core Values</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-semibold text-gray-700">Teamwork</span>
                <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-semibold text-gray-700">Reliability</span>
                <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-semibold text-gray-700">Drive</span>
                <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-semibold text-gray-700">Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Objectives */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-xl shadow-gray-200/40 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0f172a]">Key Objectives</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-1" />
              <p className="text-gray-700 font-medium">To transform the organization into a profitable, self-sustaining entity from the government purse.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-1" />
              <p className="text-gray-700 font-medium">Improve mail delivery.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-1" />
              <p className="text-gray-700 font-medium">Provide reliable, affordable and accessible services across the country through our traditional network.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-1" />
              <p className="text-gray-700 font-medium">Provide enhanced agency and financial services to all our customers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Awards & Recognition */}
      <div className="bg-[#0f172a] py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
              <Award className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-4xl font-extrabold mb-6">Awards & Recognition</h2>
            <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
              In the year 2018, past records in performance of postal administration, Ghana Post was evaluated to <span className="text-orange-400 font-bold">57th worldwide</span> and a further evaluation of <span className="text-orange-400 font-bold">1st in Africa</span> for the year 2019. Ghana Post was ranked the 59th best administration among the 190 cooperative members of the UPU globally.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Best Public Sector Campaign - Universal Postal Union e-Commerce",
              "Excellence in Innovation - Universal Postal Union e-Commerce",
              "Public Sector Campaign of the Year (PR) by PR - Society 1st Africa",
              "Public Relations Public Sector Unit of the year",
              "Most Secure and Seamless Online Payments (e-commerce) by 2019 Ghana IT and Telecom Awards",
              "Excellence in Internal Audit Technology - GIA"
            ].map((award, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4 hover:bg-white/10 transition-colors">
                <Award className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
                <p className="text-blue-100 text-sm font-medium leading-relaxed">{award}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership */}
      <div className="bg-[#f8f9fc] py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-2 block">OUR TEAM</span>
            <h2 className="text-4xl font-extrabold text-[#0f172a]">Leadership</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            
            {/* Leader 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/40 text-center flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-6 relative">
                <img src="/images/leader-rita.webp" alt="Rita Odilia" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="hidden w-full h-full bg-gray-200 flex-col items-center justify-center text-gray-400 text-xs text-center p-2">Missing<br/>Image</div>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-1">RITA ODILIA</h3>
              <p className="text-orange-500 font-semibold text-xs tracking-wider uppercase">DEPUTY MANAGING DIRECTOR</p>
            </div>

            {/* Leader 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/40 text-center flex flex-col items-center relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-[#0033a0] rounded-b-lg"></div>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-6 relative">
                <img src="/images/leader-stephen.webp" alt="Stephen Kingsley Boadu Edo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="hidden w-full h-full bg-gray-200 flex-col items-center justify-center text-gray-400 text-xs text-center p-2">Missing<br/>Image</div>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-1 uppercase">Stephen Kingsley<br/>Boadu Edo</h3>
              <p className="text-orange-500 font-semibold text-xs tracking-wider uppercase">ACT. MANAGING DIRECTOR</p>
            </div>

            {/* Leader 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/40 text-center flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-6 relative">
                <img src="/images/leader-kwesi.webp" alt="Kwesi Owusu Abrokwa" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="hidden w-full h-full bg-gray-200 flex-col items-center justify-center text-gray-400 text-xs text-center p-2">Missing<br/>Image</div>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-1 uppercase">Kwesi Owusu Abrokwa</h3>
              <p className="text-orange-500 font-semibold text-xs tracking-wider uppercase">CHIEF COMMERCIAL OFFICER</p>
            </div>

          </div>
        </div>
      </div>

      {/* Team Photo Section Placeholder */}
      <div className="bg-white py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-2 block">OUR PEOPLE</span>
            <h2 className="text-4xl font-extrabold text-[#0f172a]">The Faces Behind the Service</h2>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-100 relative h-[400px] md:h-[600px] flex items-center justify-center bg-gray-100">
            <img 
              src="/images/team-photo.svg" 
              alt="Ghana Post Team" 
              className="w-full h-full object-cover absolute inset-0"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-full h-full flex-col items-center justify-center text-gray-500 z-10 relative">
              <Users size={64} className="mb-4 text-gray-400" />
              <p className="font-semibold text-lg">Team Photo Goes Here</p>
              <p className="text-sm">Please add <code className="bg-gray-200 px-2 py-1 rounded">team-photo.svg</code> to <code className="bg-gray-200 px-2 py-1 rounded">public/images/</code></p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
