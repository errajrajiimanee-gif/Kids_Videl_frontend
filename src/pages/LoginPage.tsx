import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../services/api';
import { setCustomerToken } from '../services/customerAuth';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="container py-20 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-black text-gray-900">Bon retour !</h1>
          <p className="text-sm text-gray-500 font-medium">Connectez-vous pour suivre vos commandes.</p>
        </div>

        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSubmitting(true);
            try {
              const res = await api.post('/auth/login', { email, password });
              setCustomerToken({ token: res.data.token, expiresAt: res.data.expiresAt });
              navigate('/account', { replace: true });
            } catch (err: any) {
              const message = err?.response?.data?.message || 'Connexion impossible';
              setError(Array.isArray(message) ? message.join(', ') : String(message));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mot de passe</label>
              <Link to="/forgot-password" className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-80">
              Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 pr-12 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={submitting || !email.trim() || !password.trim()}
            className="w-full bg-primary text-white font-black rounded-2xl py-4 hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
          
          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-grow h-px bg-gray-100"></div>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">OU</span>
            <div className="flex-grow h-px bg-gray-100"></div>
          </div>

          <button
            type="button"
            className="w-full bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl py-3.5 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
            onClick={() => {
              const root = window.location.origin;
              const clientId = "949464706197-5afglq40oqf3erm1u7jb8i2iissi9qhm.apps.googleusercontent.com";
              const redirectUri = `${root}/auth/google/callback`;
              const scope = "email profile";
              const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&include_granted_scopes=true&state=standard_login`;
              window.location.assign(url);
            }}
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continuer avec Google
          </button>
          
          {error ? <div className="text-sm font-bold text-red-600 text-center">{error}</div> : null}
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Pas de compte ?{' '}
          <Link to="/register" className="font-extrabold text-primary hover:opacity-80">
            S'inscrire
          </Link>
        </div>
      </div>
    </main>
  );
}
