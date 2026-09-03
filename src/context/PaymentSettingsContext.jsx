import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';

const DEFAULT_SETTINGS = { card_enabled: true, eversend_enabled: true, paypal_enabled: true };

const PaymentSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  saveSettings: async () => {},
  refresh: async () => {},
});

export function PaymentSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await db.getPaymentSettings();
      setSettings(data ?? DEFAULT_SETTINGS);
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const saveSettings = useCallback(async (next) => {
    setSettings(next); // Optimistic update ensures NO BLINKING in the UI
    try {
      await db.updatePaymentSettings(next);
    } catch (e) {
      console.error('Failed to sync payment settings to database:', e);
      // We don't revert the state here to prevent UI flicker, but the DB
      // must have the app_settings table created for this to work globally.
    }
  }, []);

  return (
    <PaymentSettingsContext.Provider value={{ settings, loading, saveSettings, refresh }}>
      {children}
    </PaymentSettingsContext.Provider>
  );
}

export function usePaymentSettings() {
  return useContext(PaymentSettingsContext);
}
