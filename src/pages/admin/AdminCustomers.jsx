import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Users2, Search } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getCustomers().then(c => {
      setCustomers(c);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        {loading ? <p>Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {customers.map(c => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3">{c.email}</td>
                    <td className="py-3">{c.phone}</td>
                    <td className="py-3">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan="4" className="py-4 text-center text-gray-500">No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
