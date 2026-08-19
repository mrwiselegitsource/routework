import React, { useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { auth } from '../lib/db';
import { User, Phone, Mail, ShieldCheck, Loader2 } from 'lucide-react';

export default function CustomerAccount() {
  const { profile } = useCustomerAuth();
  const [form, setForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    secondary_phone: profile?.secondary_phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await auth.updateCustomerProfile(profile.id, form);
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Account Details</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          
          {/* Email (Read Only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                disabled
                value={profile?.email}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Verified primary contact method
            </p>
          </div>

          <div className="border-t border-gray-100 pt-6"></div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Secondary Phone (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={form.secondary_phone}
                  onChange={(e) => setForm({ ...form, secondary_phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          {success && <p className="text-green-600 text-sm font-medium">Profile updated successfully!</p>}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0033a0] text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
