import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Check, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de réinitialisation manquant.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Réinitialisation impossible';
      setError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token && !success) {
    return (
      <main className="container py-20 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 text-center">
          <h2 className="text-xl font-black text-red-600 mb-4">Lien invalide</h2>
          <p className="text-gray-500 mb-8">Ce lien de réinitialisation est invalide ou a expiré.</p>
          <a href="/forgot-password" className="btn-primary inline-block">Demander un nouveau lien</a>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-20 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-black text-gray-900">Nouveau mot de passe</h1>
          <p className="text-sm text-gray-500 font-medium">Définissez votre nouveau mot de passe sécurisé.</p>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10" strokeWidth={3} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900">C'est fait !</h3>
              <p className="text-sm text-gray-600">Votre mot de passe a été réinitialisé avec succès.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-white font-black rounded-2xl py-4 hover:shadow-xl hover:shadow-primary/20 transition-all uppercase tracking-widest"
            >
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
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

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 pr-12 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !password.trim() || !confirmPassword.trim()}
              className="w-full bg-primary text-white font-black rounded-2xl py-4 hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest mt-2"
            >
              {submitting ? 'Mise à jour...' : 'Changer mon mot de passe'}
            </button>

            {error ? <div className="text-sm font-bold text-red-600 text-center">{error}</div> : null}
          </form>
        )}
      </div>
    </main>
  );
}
