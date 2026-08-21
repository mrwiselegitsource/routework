import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { auth } from '../lib/db';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CustomerSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [signupMethod, setSignupMethod] = useState('email'); // 'email' | 'phone'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', otp: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (signupMethod === 'email') {
        if (form.password !== form.confirm) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const { error: signUpError } = await auth.customerSignUp({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        });
        if (signUpError) throw signUpError;
      } else {
        if (!otpSent) {
          // Send OTP via phone
          const { error: sendError } = await auth.customerSignInWithOtp({ phone: form.phone });
          if (sendError) throw sendError;
          setOtpSent(true);
          setLoading(false);
          return; // Wait for OTP
        } else {
          // Verify OTP
          const { error: verifyError } = await auth.customerVerifyOtp({ phone: form.phone, token: form.otp });
          if (verifyError) throw verifyError;
          
          // Note: In a real app, you might want to immediately update their profile with `form.name` 
          // right after OTP verification succeeds, since our mock auth just creates a 'New Customer'.
        }
      }

      const returnTo = location.state?.returnTo || '/account';
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-500">Track and manage your RouteWorks shipments.</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setSignupMethod('email'); setOtpSent(false); setError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${signupMethod === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Email
            </button>
            <button
              onClick={() => { setSignupMethod('phone'); setError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${signupMethod === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Phone Number
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {signupMethod === 'email' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                    placeholder="+233 20 000 0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </>
            ) : (
              <>
                {!otpSent ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                        placeholder="+233 20 000 0000"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      required
                      value={form.otp}
                      onChange={(e) => setForm({ ...form, otp: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all text-center tracking-[0.5em] font-mono text-xl"
                      placeholder="••••••"
                      maxLength={6}
                    />
                    <button type="button" onClick={() => setOtpSent(false)} className="mt-2 text-xs text-[#0033a0] hover:underline font-semibold">Change phone number</button>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (signupMethod === 'email' ? (!form.email || !form.password) : (otpSent ? !form.otp : !form.phone))}
              className="w-full bg-[#0033a0] text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 flex justify-center items-center mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (signupMethod === 'phone' && !otpSent ? 'Send OTP' : 'Sign Up')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" state={{ returnTo: location.state?.returnTo }} className="text-[#0033a0] font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
