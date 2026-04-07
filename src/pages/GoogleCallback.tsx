import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { setCustomerToken } from '../services/customerAuth';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    // Google sends token in the fragment: #access_token=...
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');

    if (!accessToken) {
      console.error('No access token found in URL fragment');
      navigate('/login', { replace: true });
      return;
    }

    const loginWithGoogle = async () => {
      try {
        console.log('Attempting Google login with token:', accessToken.substring(0, 10) + '...');
        const res = await api.post('/auth/google-login', { token: accessToken });
        console.log('Google login response:', res.data);
        setCustomerToken({ token: res.data.token, expiresAt: res.data.expiresAt });
        navigate('/account', { replace: true });
      } catch (err: any) {
        console.error('Google login failed details:', {
          status: err?.response?.status,
          data: err?.response?.data,
          url: err?.config?.url,
          baseURL: err?.config?.baseURL
        });
        navigate('/login', { replace: true });
      }
    };

    loginWithGoogle();
  }, [navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-bold text-gray-900">Connexion avec Google...</h2>
        <p className="text-gray-500">Veuillez patienter pendant que nous validons votre session.</p>
      </div>
    </div>
  );
}
