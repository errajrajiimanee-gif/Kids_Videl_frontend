import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { clearAdminToken } from '../services/adminAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="container py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo-kids-videl.jpeg" alt="Kids Videl" className="h-12 w-auto object-contain" />
            <div>
              <div className="text-sm font-extrabold text-gray-900">Administration</div>
              <div className="text-xs text-gray-500">Gestion du backoffice</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-bold text-gray-700 hover:text-primary transition-colors">
              Retour au site
            </Link>

            <div className="relative">
              <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full pl-3 pr-2 py-2 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm">
                  A
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-extrabold text-gray-900 leading-tight">Admin</div>
                  <div className="text-xs text-gray-500 leading-tight">Profil</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                  <button className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
                    <User className="w-4 h-4" />
                    Mon profil
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </button>
                  <div className="h-px bg-gray-100" />
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                    onClick={() => {
                      clearAdminToken();
                      window.location.assign('/admin/login');
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">{children}</main>
    </div>
  );
}
