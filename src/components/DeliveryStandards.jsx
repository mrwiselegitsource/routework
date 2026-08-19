import React from 'react';

const STANDARDS = [
  { continent: 'Africa', ems: '7 - 14 days', parcel: '10 - 20 days', registered: '10 - 20 days' },
  { continent: 'Asia', ems: '7 days', parcel: '10 - 14 days', registered: '10 - 14 days' },
  { continent: 'Australia', ems: '7 days', parcel: '10 - 14 days', registered: '10 - 14 days' },
  { continent: 'North America', ems: '7 days', parcel: '10 - 14 days', registered: '10 - 14 days' },
  { continent: 'South America', ems: '7 days', parcel: '10 - 14 days', registered: '10 - 14 days' },
  { continent: 'Europe', ems: '7 days', parcel: '10 - 14 days', registered: '10 - 14 days' },
];

export default function DeliveryStandards() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-2 block">Timeline</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0033a0] mb-4">Our Delivery Standards</h2>
          <div className="w-16 h-1 bg-[#0055ff] mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            For any information or complaints kindly call or whatsapp GhanaPost customer service on{' '}
            <span className="font-bold text-[#0033a0]">054 252 7004</span> |{' '}
            <span className="font-bold text-[#0033a0]">059 403 4811</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#1b3b9b] text-white text-left uppercase tracking-wider text-sm">
                  <th className="py-5 px-8 font-bold">Continents</th>
                  <th className="py-5 px-8 font-bold">EMS</th>
                  <th className="py-5 px-8 font-bold">Parcel</th>
                  <th className="py-5 px-8 font-bold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {STANDARDS.map((row, idx) => (
                  <tr key={row.continent} className="hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-8 font-bold text-gray-800">{row.continent}</td>
                    <td className="py-5 px-8 text-gray-600 font-medium">{row.ems}</td>
                    <td className="py-5 px-8 text-gray-600 font-medium">{row.parcel}</td>
                    <td className="py-5 px-8 text-gray-600 font-medium">{row.registered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
