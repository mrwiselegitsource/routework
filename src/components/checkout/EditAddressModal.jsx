import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export default function EditAddressModal({ isOpen, onClose, addressData, onSave, regions }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    contactName: addressData?.contactName || '',
    phone: addressData?.phone || '',
    street: addressData?.street || '',
    region: addressData?.region || '',
    city: addressData?.city || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full h-full md:h-auto max-w-lg md:rounded-2xl shadow-xl overflow-hidden flex flex-col md:max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Edit shipping address</h2>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 md:p-6 flex-1">
          <form id="addressForm" onSubmit={handleSave} className="space-y-6">
            
            {/* Contact Information */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Contact information</h3>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    name="contactName"
                    required
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full px-4 pt-6 pb-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white outline-none transition-colors peer"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#0033a0]">
                    Contact name*
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <div className="w-1/3 relative">
                    <input
                      type="text"
                      disabled
                      value="+233"
                      className="w-full px-4 pt-6 pb-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                    />
                    <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500">
                      Country code
                    </label>
                  </div>
                  <div className="w-2/3 relative">
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 pt-6 pb-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white outline-none transition-colors peer"
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#0033a0]">
                      Mobile number*
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Address</h3>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full px-4 pt-6 pb-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white outline-none transition-colors peer"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#0033a0]">
                    Street, house/apartment/unit*
                  </label>
                </div>

                <div className="relative">
                  <select
                    name="region"
                    required
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-4 pt-6 pb-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white outline-none transition-colors appearance-none peer"
                  >
                    <option value="" disabled></option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                  <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500">
                    State/Province (Region)*
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 pt-6 pb-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0033a0] focus:bg-white outline-none transition-colors peer"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#0033a0]">
                    City*
                  </label>
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* Footer Fixed Save Button */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button 
            form="addressForm"
            type="submit"
            className="w-full bg-[#ff3b30] hover:bg-[#ff1a10] text-white font-bold text-lg py-3 rounded-full transition-colors"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
