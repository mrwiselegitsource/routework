import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Phone, MapPin } from 'lucide-react';

export default function ClaimGate({ paymentStatus, claimStatus, amountDue, onPay, onSubmitClaim }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', region: 'Greater Accra' });

  if (paymentStatus === 'Unpaid') {
    return (
      <div className="bg-red-50/50 rounded-3xl border border-red-100 p-8 mt-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard size={32} />
        </div>
        <h3 className="text-2xl font-bold text-red-800 mb-2">Payment Required</h3>
        <p className="text-red-600/80 mb-6 max-w-md mx-auto">
          You must pay the outstanding balance before you can claim this item and provide delivery details.
        </p>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 max-w-sm mx-auto mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Amount Due</p>
          <p className="text-4xl font-extrabold text-gray-900">GH₵ {amountDue}</p>
        </div>
        
        {/* Mock Payment Input */}
        <div className="max-w-sm mx-auto space-y-4">
          <input type="text" placeholder="Mobile Money Number" className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200" />
          <button 
            onClick={onPay}
            className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-700 transition-colors">
            Pay GH₵ {amountDue} Now
          </button>
        </div>
      </div>
    );
  }

  if (claimStatus === 'Claimed') {
    return (
      <div className="bg-green-50/50 rounded-3xl border border-green-100 p-8 mt-8 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Delivery Details Received</h3>
        <p className="text-green-700/80 mb-6 max-w-md mx-auto">
          We'll be in touch to arrange final delivery to the address provided.
        </p>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 max-w-md mx-auto text-left space-y-3">
           <p className="text-sm"><span className="font-semibold text-gray-500">Name:</span> Kwame Osei</p>
           <p className="text-sm"><span className="font-semibold text-gray-500">Phone:</span> +233 54 123 4567</p>
           <p className="text-sm"><span className="font-semibold text-gray-500">Address:</span> 12 Independence Ave</p>
           <p className="text-sm"><span className="font-semibold text-gray-500">Region:</span> Greater Accra</p>
        </div>
      </div>
    );
  }

  // Paid, but Not Claimed yet
  return (
    <div className="bg-blue-50/30 rounded-3xl border border-blue-100 p-8 md:p-10 mt-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <MapPin size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-blue-900">Where should we deliver it?</h3>
          <p className="text-gray-600">Please provide your details to claim this shipment.</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmitClaim(form); }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-5 py-4 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-5 py-4 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="+233 54 000 0000" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Region</label>
          <select value={form.region} onChange={e => setForm({...form, region: e.target.value})} className="w-full px-5 py-4 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
            <option>Greater Accra</option>
            <option>Ashanti</option>
            <option>Central</option>
            <option>Eastern</option>
            <option>Western</option>
            <option>Volta</option>
            <option>Northern</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address</label>
          <textarea required rows="3" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-5 py-4 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none" placeholder="123 Main Street, House No..."></textarea>
        </div>

        <button type="submit" className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors">
          Submit Delivery Details
        </button>
      </form>
    </div>
  );
}
