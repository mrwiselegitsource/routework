import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Loader2, Settings, Play, Pause, AlertTriangle } from 'lucide-react';
import { statusMeta } from '../../data/statusIcons';

export default function AdminAutomations() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await db.getAutomationRules();
    setRules(data);
    setLoading(false);
  }

  async function toggleRule(id, currentStatus) {
    await db.updateAutomationRule(id, { active: !currentStatus });
    loadData();
  }

  async function togglePaymentReq(id, currentStatus) {
    await db.updateAutomationRule(id, { requires_payment: !currentStatus });
    loadData();
  }

  async function runAutomations() {
    setProcessing(true);
    try {
      const processed = await db.processAutomations();
      alert(`Processed ${processed} pending automation(s).`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#0033a0]" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-[#0033a0]" /> Automation Engine
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure automated tracking status transitions.</p>
        </div>
        <button 
          onClick={runAutomations}
          disabled={processing}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
        >
          {processing ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
          Run Automations Now
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6 flex gap-3 text-sm">
        <AlertTriangle className="shrink-0" />
        <div>
          <strong>How it works:</strong> When a manual update triggers a rule, a pending automation is scheduled. The system will automatically execute it after the delay expires. Manual status overrides on an order will cancel any pending automations to prevent conflicts.
        </div>
      </div>

      <div className="grid gap-4">
        {rules.map(rule => {
          const triggerMeta = statusMeta(rule.trigger_status);
          const actionMeta = statusMeta(rule.action_status);
          
          return (
            <div key={rule.id} className={`bg-white rounded-lg shadow border p-5 ${!rule.active ? 'opacity-70 border-gray-200' : 'border-blue-200'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded uppercase">
                      Trigger: {triggerMeta.label}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-sm font-semibold text-gray-600">
                      Wait {rule.delay_hours} hours
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="px-2 py-1 bg-blue-100 text-[#0033a0] text-xs font-bold rounded uppercase">
                      Action: {actionMeta.label}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-100 text-sm mb-4">
                    <div className="font-semibold text-gray-900 mb-1">Updates order with:</div>
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <div className="text-gray-500">Location:</div>
                      <div className="font-medium">{rule.action_location}</div>
                      <div className="text-gray-500">Description:</div>
                      <div className="font-medium">{rule.action_description}</div>
                    </div>
                  </div>
                </div>
                
                <div className="md:ml-6 flex flex-col items-end gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => toggleRule(rule.id, rule.active)}
                    className={`w-full md:w-auto px-4 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 ${
                      rule.active 
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    {rule.active ? <Pause size={16} /> : <Play size={16} />}
                    {rule.active ? 'Pause Rule' : 'Enable Rule'}
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 mt-1 flex items-center gap-2">
                <label className="flex items-center gap-2 font-body text-sm text-[var(--color-ink)] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rule.requires_payment} 
                    onChange={() => togglePaymentReq(rule.id, rule.requires_payment)} 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  Requires order to be marked as Paid before executing
                </label>
              </div>
            </div>
          );
        })}
        {rules.length === 0 && (
          <div className="text-center p-8 bg-white rounded-lg border border-gray-200 text-gray-500">
            No automation rules configured.
          </div>
        )}
      </div>
    </div>
  );
}
