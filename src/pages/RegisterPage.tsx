import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../services/api';
import { setCustomerToken } from '../services/customerAuth';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="container py-20 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-black text-gray-900">Rejoignez-nous</h1>
          <p className="text-sm text-gray-500 font-medium">Créez votre compte en quelques secondes.</p>
        </div>

        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSubmitting(true);
            try {
              const res = await api.post('/auth/register', { email, password, firstName, lastName });
              setCustomerToken({ token: res.data.token, expiresAt: res.data.expiresAt });
              navigate('/account', { replace: true });
            } catch (err: any) {
              const message = err?.response?.data?.message || 'Inscription impossible';
              setError(Array.isArray(message) ? message.join(', ') : String(message));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
              <input
                type="text"
                placeholder="Ex: Sara"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom</label>
              <input
                type="text"
                placeholder="Ex: Alami"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

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
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="8 caractères minimum"
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
            disabled={submitting || !email.trim() || !password.trim() || password.trim().length < 8}
            className="w-full bg-primary text-white font-black rounded-2xl py-4 hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest mt-2"
          >
            {submitting ? 'Création...' : 'Créer mon compte'}
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
              const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&include_granted_scopes=true&state=standard_register`;
              window.location.assign(url);
            }}
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            S'inscrire avec Google
          </button>

          {error ? <div className="text-sm font-bold text-red-600 text-center">{error}</div> : null}
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-extrabold text-primary hover:opacity-80">
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
