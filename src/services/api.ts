import axios from 'axios';
import { clearCustomerToken, getCustomerToken } from './customerAuth';

const baseURL = import.meta.env.PROD
  ? '/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  const token = getCustomerToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      clearCustomerToken();
      if (window.location.pathname.startsWith('/account')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);
