const CUSTOMER_TOKEN_KEY = 'customer_token';
const CUSTOMER_TOKEN_EXPIRES_AT_KEY = 'customer_token_expires_at';

export function getCustomerToken(): string | null {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function setCustomerToken(params: { token: string; expiresAt?: string }) {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, params.token);
  if (params.expiresAt) localStorage.setItem(CUSTOMER_TOKEN_EXPIRES_AT_KEY, params.expiresAt);
}

export function clearCustomerToken() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_TOKEN_EXPIRES_AT_KEY);
}

export function isCustomerLoggedIn(): boolean {
  return Boolean(getCustomerToken());
}

