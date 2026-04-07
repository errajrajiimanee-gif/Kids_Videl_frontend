import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Check, ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { useToastStore } from '../stores/toast.store';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      toast.add({
        type: 'success',
        title: 'Email envoyé',
        message: 'Un lien de réinitialisation a été envoyé à votre adresse.'
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Une erreur est survenue';
      toast.add({
        type: 'error',
        title: 'Erreur',
        message: Array.isArray(message) ? message.join(', ') : String(message)
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container py-20 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-black/5 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mot de passe oublié ?</h1>
            <p className="text-sm text-gray-500 font-medium max-w-[240px] mx-auto">
              {success 
                ? "Nous avons envoyé les instructions de réinitialisation." 
                : "Entrez votre email pour recevoir un lien de réinitialisation sécurisé."}
            </p>
          </div>

          {success ? (
            <div className="text-center py-4 space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
                <div className="relative w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <Check className="w-12 h-12" strokeWidth={3} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    Un email a été envoyé à <br/>
                    <span className="font-black text-gray-900">{email}</span>
                  </p>
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  Pensez à vérifier vos courriers indésirables (spams) si vous ne recevez rien d'ici 2 minutes.
                </p>
              </div>

              <div className="pt-6">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                  <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email de votre compte</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.5rem] pl-14 pr-6 py-4 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="w-full bg-primary text-white font-black rounded-[1.5rem] py-5 hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : 'Envoyer le lien'}
              </button>

              <div className="text-center pt-4">
                <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-primary transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
