import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useEffect, useState } from 'react';
import type { Product } from '../types/product';
import Slider from '../components/Slider';
import { api } from '../services/api';
import { BadgeCheck, Gift, ShieldCheck, CreditCard, Sparkles, HelpCircle, CreditCard as CardIcon, X, Check } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  image?: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string; logo: string }[]>([]);

  useEffect(() => {
    api
      .get<Product[]>('/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    api
      .get<Category[]>('/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    api
      .get<{ id: number; name: string; logo: string }[]>('/brands')
      .then(res => setBrands(res.data))
      .catch(() => setBrands([]));
  }, []);

  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [loyaltyForm, setLoyaltyForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [loyaltySubmitting, setLoyaltySubmitting] = useState(false);
  const [loyaltySuccess, setLoyaltySuccess] = useState(false);

  const handleLoyaltySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoyaltySubmitting(true);
    try {
      await api.post('/loyalty', loyaltyForm);
      setLoyaltySuccess(true);
      setLoyaltyForm({ firstName: '', lastName: '', email: '', phone: '' });
      setTimeout(() => {
        setLoyaltySuccess(false);
        setIsLoyaltyModalOpen(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to register loyalty member', err);
      alert('Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoyaltySubmitting(false);
    }
  };

  const bestSellers = products.slice(0, 10);
  const promotions = products.filter(p => p.id % 3 === 0).slice(0, 10);
  const popularCategories = categories.slice(0, 10);

  return (
    <main className="flex flex-col gap-12 pb-16">
      <Slider />

      <section className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-gray-900">Paiement sécurisé</div>
              <div className="text-xs text-gray-500">Garantie et fiche produit</div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-gray-900">Livraison offerte</div>
              <div className="text-xs text-gray-500">Voir nos conditions</div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-gray-900">Produits certifiés</div>
              <div className="text-xs text-gray-500">Garantie et fiche produit</div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-gray-900">Confidentialité</div>
              <div className="text-xs text-gray-500">de vos données personnelles</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Catégories populaires</h2>
          </div>
          <Link to="/products" className="text-primary font-bold text-sm hover:opacity-80 transition-opacity">
            Voir tout
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto py-2 scrollbar-hide no-scrollbar">
          {popularCategories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name.toLowerCase())}`}
              className="flex-shrink-0 flex flex-col items-center gap-3 group"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 shadow-sm">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80'}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary transition-colors text-center max-w-[100px]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Best sellers</h2>
          <Link to="/products" className="text-primary font-bold text-sm border-b-2 border-primary pb-0.5 hover:opacity-80 transition-opacity">
            Voir tout
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl aspect-[3/4] border border-gray-100" />
          ))}
        </div>
      </section>

      <section className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Promotions</h2>
          <Link to="/products" className="text-primary font-bold text-sm hover:opacity-80 transition-opacity">
            Voir tout
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {promotions.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl aspect-[3/4] border border-gray-100" />
          ))}
        </div>
      </section>

      <section className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Marques populaires</h2>
          <Link to="/products" className="text-primary font-bold text-sm hover:opacity-80 transition-opacity">
            Explorer
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                <img src={brand.logo} alt={brand.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="text-sm font-extrabold text-gray-800">{brand.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mt-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Help Banner */}
          <a 
            href="https://wa.me/212666011062" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative overflow-hidden bg-gradient-to-r from-sky-100 to-blue-50 rounded-[2rem] p-8 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all border border-blue-100"
          >
            <div className="space-y-2 relative z-10">
              <div className="w-8 h-0.5 bg-blue-400"></div>
              <h3 className="text-2xl font-black text-blue-900">Besoin d'aide?</h3>
              <p className="text-blue-700 font-medium">Vous avez des questions ?</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200/50 blur-3xl rounded-full scale-150"></div>
              <HelpCircle className="w-20 h-20 text-blue-400 relative z-10 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
            </div>
          </a>

          {/* Loyalty Banner */}
          <div 
            onClick={() => setIsLoyaltyModalOpen(true)}
            className="relative overflow-hidden bg-gradient-to-r from-pink-100 to-rose-50 rounded-[2rem] p-8 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all border border-rose-100"
          >
            <div className="space-y-2 relative z-10">
              <div className="w-8 h-0.5 bg-rose-400"></div>
              <h3 className="text-2xl font-black text-rose-900">Club de fidélité</h3>
              <p className="text-rose-700 font-medium">300 points = un cadeau offert ! 🎁</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-rose-200/50 blur-3xl rounded-full scale-150"></div>
              <CardIcon className="w-20 h-20 text-rose-400 relative z-10 group-hover:rotate-12 transition-transform duration-500" strokeWidth={1.5} />
            </div>
          </div>
        </div     >
      </section>

      {/* Loyalty Modal */}
      {isLoyaltyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="relative h-32 bg-gradient-to-r from-pink-400 to-rose-400 flex items-center justify-center">
              <button 
                onClick={() => setIsLoyaltyModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <CardIcon className="w-16 h-16 text-white/90" strokeWidth={1.5} />
            </div>
            
            <div className="p-8">
              {loyaltySuccess ? (
                <div className="text-center py-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10" strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Bienvenue au club !</h3>
                  <p className="text-gray-600">Votre inscription a été validée avec succès. Vous recevrez bientôt vos premiers avantages.</p>
                </div>
              ) : (
                <form onSubmit={handleLoyaltySubmit} className="space-y-5">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-black text-gray-900">Inscrivez-vous</h3>
                    <p className="text-rose-600 font-bold mt-1 italic">300 points accumulés = Un cadeau offert ! 🎁</p>
                    <p className="text-gray-500 mt-2 text-sm">Gagnez des points à chaque achat et profitez d'offres exclusives.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
                      <input 
                        type="text" 
                        required 
                        value={loyaltyForm.firstName}
                        onChange={e => setLoyaltyForm({...loyaltyForm, firstName: e.target.value})}
                        placeholder="Ex: Sara"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 focus:bg-white outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom</label>
                      <input 
                        type="text" 
                        required 
                        value={loyaltyForm.lastName}
                        onChange={e => setLoyaltyForm({...loyaltyForm, lastName: e.target.value})}
                        placeholder="Ex: Alami"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 focus:bg-white outline-none transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      type="email" 
                      required 
                      value={loyaltyForm.email}
                      onChange={e => setLoyaltyForm({...loyaltyForm, email: e.target.value})}
                      placeholder="votre@email.com"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 focus:bg-white outline-none transition-all" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone</label>
                    <input 
                      type="text" 
                      required 
                      value={loyaltyForm.phone}
                      onChange={e => setLoyaltyForm({...loyaltyForm, phone: e.target.value})}
                      placeholder="06 00 00 00 00"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 focus:bg-white outline-none transition-all" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loyaltySubmitting}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black py-4 rounded-2xl hover:shadow-xl hover:shadow-rose-500/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 uppercase tracking-widest"
                  >
                    {loyaltySubmitting ? 'Inscription...' : 'Rejoindre le club'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <a
        href="https://wa.me/212666011062"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.321 1.441 5.078 1.442 5.463.003 9.9-4.432 9.903-9.896.002-2.65-1.03-5.142-2.906-7.019-1.875-1.877-4.366-2.91-7.017-2.911-5.465 0-9.9 4.435-9.9 9.9-.001 1.765.506 3.486 1.467 4.965l-.999 3.648 3.768-.989z" />
        </svg>
      </a>
    </main>
  );
}
