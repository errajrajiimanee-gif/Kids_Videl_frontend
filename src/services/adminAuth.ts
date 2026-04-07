const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_TOKEN_EXPIRES_AT_KEY = 'admin_token_expires_at';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(params: { token: string; expiresAt?: string }) {
  localStorage.setItem(ADMIN_TOKEN_KEY, params.token);
  if (params.expiresAt) localStorage.setItem(ADMIN_TOKEN_EXPIRES_AT_KEY, params.expiresAt);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_EXPIRES_AT_KEY);
}

export function isAdminTokenPresent(): boolean {
  return Boolean(getAdminToken());
}

