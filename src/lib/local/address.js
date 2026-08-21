const STORAGE_KEY = 'routeworks_shipping_address';

export function saveAddressLocally(address) {
  if (!address) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(address));
  } catch (err) {
    console.error('Error saving address to local storage', err);
  }
}

export function loadAddressLocally() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error loading address from local storage', err);
    return null;
  }
}
