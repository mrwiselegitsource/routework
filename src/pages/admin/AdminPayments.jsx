import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../lib/db';
import { Loader2, DollarSign, CheckCircle2, Clock, CreditCard, ToggleLeft, ToggleRight, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePaymentSettings } from '../../context/PaymentSettingsContext';

// ─── Gateway toggle card ────────────────────────────────────────────────────
function GatewayCard({ id, label, description, logo, accentColor, bgColor, enabled, saving, onToggle }) {
  return (
    <div
      className={`relative rounded-2xl border-2 p-5 transition-all duration-300 ${
        enabled
          ? `border-[${accentColor}] bg-gradient-to-br from-white to-[${bgColor}]`
          : 'border-gray-200 bg-gray-50 opacity-70'
      }`}
      style={{
        borderColor: enabled ? accentColor : undefined,
        background: enabled
          ? `linear-gradient(135deg, #ffffff, ${bgColor})`
          : undefined,
      }}
    >
      {/* Status badge */}
      <span
        className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${
          enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
        }`}
      >
        {enabled ? 'Active' : 'Disabled'}
      </span>

      <div className="flex items-start gap-4">
        {/* Logo / icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: bgColor }}
        >
          {logo}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">
          {enabled ? 'Visible to customers at checkout' : 'Hidden from customers'}
        </span>
        <button
          onClick={() => onToggle(id, !enabled)}
          disabled={saving}
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}`}
          className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            saving ? 'opacity-50 cursor-wait' : 'cursor-pointer'
          } ${
            enabled
              ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700 focus:ring-gray-400'
          }`}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : enabled ? (
            <ToggleRight size={16} />
          ) : (
            <ToggleLeft size={16} />
          )}
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const { settings, saveSettings } = usePaymentSettings();
  const [localSettings, setLocalSettings] = useState(null);
  const [saving, setSaving] = useState(null); // id of the gateway being saved
  const [saved, setSaved] = useState(false);

  // Sync local settings from context once loaded
  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    db.getOrders().then(data => {
      setOrders(data);
      setOrdersLoading(false);
    });
  }, []);

  const handleToggle = useCallback(async (gatewayId, newValue) => {
    if (!localSettings) return;
    setSaving(gatewayId);
    const next = { ...localSettings, [`${gatewayId}_enabled`]: newValue };
    setLocalSettings(next);
    try {
      await saveSettings(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // revert on error
      setLocalSettings(localSettings);
    } finally {
      setSaving(null);
    }
  }, [localSettings, saveSettings]);

  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.delivery_fee || 0), 0);
  const pendingRevenue = orders.filter(o => o.payment_status === 'unpaid').reduce((sum, o) => sum + (o.delivery_fee || 0), 0);

  if (!localSettings) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0033a0]" />
      </div>
    );
  }

  const gateways = [
    {
      id: 'card',
      label: 'Credit / Debit Card',
      description: 'Visa, Mastercard, and other cards via NexusPay gateway. Instant confirmation.',
      accentColor: '#ff3b30',
      bgColor: '#fff0ef',
      logo: <CreditCard size={22} className="text-[#ff3b30]" />,
    },
    {
      id: 'eversend',
      label: 'EverSend (Mobile Money)',
      description: 'MTN MoMo, Telecel, and Tigo Cash. Perfect for local Ghanaian customers.',
      accentColor: '#0033a0',
      bgColor: '#eff3ff',
      logo: (
        <img
          src="https://eversend.co/assets/eversend-logo.png"
          alt="EverSend"
          className="h-5 object-contain"
          onError={e => { e.target.style.display = 'none'; }}
        />
      ),
    },
    {
      id: 'paypal',
      label: 'PayPal',
      description: 'International payments via PayPal. Best for diaspora and overseas senders.',
      accentColor: '#0079C1',
      bgColor: '#e8f4fd',
      logo: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
          alt="PayPal"
          className="h-5 object-contain"
          onError={e => { e.target.style.display = 'none'; }}
        />
      ),
    },
  ];

  const enabledCount = gateways.filter(g => localSettings[`${g.id}_enabled`]).length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments &amp; Gateways</h1>
          <p className="text-sm text-gray-500 mt-1">Manage revenue and control which payment methods customers see.</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold animate-[fadeIn_0.3s_ease-out]">
            <CheckCircle2 size={16} />
            Settings saved
          </div>
        )}
      </div>

      {/* ── Revenue cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Collected Revenue</p>
            <p className="text-2xl font-bold text-gray-900">GH₵ {totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending Payments</p>
            <p className="text-2xl font-bold text-gray-900">GH₵ {pendingRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* ── Gateway control panel ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0033a0]/10 flex items-center justify-center">
              <ShieldCheck size={18} className="text-[#0033a0]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Payment Gateway Controls</h2>
              <p className="text-xs text-gray-500">Changes take effect immediately for all customers.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            <Zap size={12} />
            {enabledCount}/{gateways.length} active
          </div>
        </div>

        {enabledCount === 0 && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
            <AlertTriangle size={16} />
            Warning: All gateways are disabled. Customers cannot complete checkout!
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {gateways.map(g => (
            <GatewayCard
              key={g.id}
              {...g}
              enabled={!!localSettings[`${g.id}_enabled`]}
              saving={saving === g.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      {/* ── Transactions table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">All Transactions</h2>
        </div>
        {ordersLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#0033a0]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o.order_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/admin/orders/${o.order_id}`} className="text-[#0033a0] font-medium hover:underline">
                        {o.order_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{o.recipient_name || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">GH₵ {(parseFloat(o.delivery_fee) || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {o.payment_status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 size={12} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Clock size={12} /> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
