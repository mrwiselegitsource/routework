/**
 * Payment gateway settings stored in localStorage.
 * This is intentionally NOT stored in the DB — the admin's gateway
 * on/off preferences are device-local config, so they work instantly
 * in every environment without needing a Supabase table.
 */

const KEY = 'routeworks_payment_settings';
const DEFAULTS = { card_enabled: true, eversend_enabled: true, paypal_enabled: true };

export function loadPaymentSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePaymentSettingsLocally(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // storage full / private mode — ignore
  }
}
