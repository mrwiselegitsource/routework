import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#f8f9fc] min-h-screen py-16">
      <Helmet>
        <title>Privacy Policy | Ghana Post</title>
        <meta name="description" content="Privacy Policy for Ghana Post." />
      </Helmet>
      
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100 prose prose-blue max-w-none">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: August 2026</p>
          
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                Welcome to Ghana Post. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website or otherwise when you contact us.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Name and Contact Data</li>
                <li>Credentials and Passwords</li>
                <li>Payment Data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p>
                We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing Your Information</h2>
              <p>
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
              <p>
                If you have questions or comments about this notice, you may email us at info@ghanapost.com.gh or by post to:
              </p>
              <p className="mt-4 font-medium">
                General Post Office<br />
                Accra Central, GA-183-8164<br />
                Ghana
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
