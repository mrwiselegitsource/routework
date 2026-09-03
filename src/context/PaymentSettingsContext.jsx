import React, { createContext, useContext, useState, useCallback } from 'react';
import { loadPaymentSettings, savePaymentSettingsLocally } from '../lib/local/paymentSettings';

const DEFAULT_SETTINGS = { card_enabled: true, eversend_enabled: true, paypal_enabled: true };

const PaymentSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  saveSettings: () => {},
});

export function PaymentSettingsProvider({ children }) {
  // Read from localStorage synchronously on first render — no async needed,
  // no DB call, no risk of a save-failure reverting the toggle.
  const [settings, setSettings] = useState(() => loadPaymentSettings());

  const saveSettings = useCallback((next) => {
    setSettings(next);
    savePaymentSettingsLocally(next);
  }, []);

  return (
    <PaymentSettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </PaymentSettingsContext.Provider>
  );
}

export function usePaymentSettings() {
  return useContext(PaymentSettingsContext);
}
