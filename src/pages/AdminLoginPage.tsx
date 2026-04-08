import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { setAdminToken } from '../services/adminAuth';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await adminApi.post('/auth/admin/login', { username, password });
      setAdminToken({ token: res.data.token, expiresAt: res.data.expiresAt });
      navigate('/admin', { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Connexion impossible';
      setError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/vidy.png" alt="Videl Kids" className="h-10 w-auto object-contain" />
          <div>
            <div className="text-2xl font-extrabold text-gray-900">Admin</div>
            <div className="text-sm text-gray-500">Connexion sécurisée</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Nom d'utilisateur"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            autoComplete="username"
          />
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={submitting || !username.trim() || !password.trim()}
            className="w-full bg-primary text-white font-extrabold rounded-2xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
          {error ? <div className="text-sm text-red-600 font-bold">{error}</div> : null}
        </form>
      </div>
    </main>
  );
}

