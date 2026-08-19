import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { auth } from '../lib/db';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await auth.customerResetPassword(email);
      // We always show success even if the email wasn't found, to prevent email enumeration
      setSent(true);
    } catch (err) {
      console.error(err);
      // Still show success to prevent enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
          
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-gray-500 mb-8">
                If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
              </p>
              <Link to="/login" className="block w-full bg-gray-100 text-gray-800 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-gray-500">Enter your email and we'll send you a recovery link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                    placeholder="jane@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#0033a0] text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 flex justify-center items-center mt-6"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                Remembered your password?{' '}
                <Link to="/login" className="text-[#0033a0] font-bold hover:underline">
                  Log In
                </Link>
              </p>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
