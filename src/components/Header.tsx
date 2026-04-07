import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useCartStore } from '../stores/cart.store';
import CartFlyout from './CartFlyout';
import { Heart, User } from 'lucide-react';
import { clearCustomerToken, isCustomerLoggedIn } from '../services/customerAuth';

interface SubCategory {
  id: number;
  name: string;
  image?: string;
}

interface Category {
  id: number;
  name: string;
  image?: string;
  subCategories: SubCategory[];
  displayType?: 'default' | 'highlight' | 'sale' | 'flag';
  color?: string;
}

export default function Header() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const totalItems = useCartStore(state => state.totalItems());
  const loggedIn = isCustomerLoggedIn();

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories', err));
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!accountRef.current || !target) return;
      if (!accountRef.current.contains(target)) setIsAccountOpen(false);
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('touchstart', onPointerDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('touchstart', onPointerDown);
    };
  }, []);

  const getCategoryClass = (category: Category) => {
    let baseClass = 'text-[11px] font-bold tracking-wider transition-colors px-4 py-2 rounded-md uppercase';
    if (category.displayType === 'sale' || category.name.toLowerCase() === 'soldes') {
      return `${baseClass} text-red-600 hover:text-red-700`;
    }
    return `${baseClass} text-gray-700 hover:text-primary`;
  };

  const hoveredCategory = hoveredCategoryId ? categories.find(c => c.id === hoveredCategoryId) : undefined;

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="container py-3 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src="/logo-kids-videl.jpeg" alt="Kids Videl" className="h-10 md:h-14 w-auto object-contain" />
        </Link>

        {/* Search Bar */}
        <div className="flex-grow max-w-2xl relative">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-6 pr-12 focus:ring-2 focus:ring-primary/10 focus:border-primary/20 focus:bg-white transition-all outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setIsAccountOpen(v => !v)}
              className="text-gray-700 hover:text-primary transition-colors flex items-center"
              aria-label="Compte"
            >
              <User className="h-6 w-6" />
            </button>
            {isAccountOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-[60]">
                <div className="px-4 py-3 bg-gray-50">
                  <div className="text-sm font-extrabold text-gray-900">Compte</div>
                  <div className="text-xs text-gray-500 mt-0.5">Accédez à votre espace</div>
                </div>
                <div className="h-px bg-gray-100" />
                {loggedIn ? (
                  <>
                    <Link to="/account" onClick={() => setIsAccountOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">Mon compte</Link>
                    <button
                      type="button"
                      onClick={() => { clearCustomerToken(); setIsAccountOpen(false); window.location.assign('/'); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsAccountOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">Se connecter</Link>
                    <Link to="/register" onClick={() => setIsAccountOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">S'inscrire</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/favorites" className="text-gray-700 hover:text-primary transition-colors" title="Favoris">
            <Heart className="h-6 w-6" />
          </Link>

          <button onClick={() => setIsCartOpen(true)} className="text-gray-700 hover:text-primary transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-secondary text-white text-xs flex items-center justify-center rounded-full border-2 border-white">{totalItems}</span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="border-t border-gray-100 relative" onMouseLeave={() => setHoveredCategoryId(null)}>
        <div className="overflow-x-auto no-scrollbar">
          <div className="container py-2 flex items-center justify-center gap-2 whitespace-nowrap scrollbar-hide">
            {categories.map((cat) => (
              <div key={cat.id} onMouseEnter={() => setHoveredCategoryId(cat.id)} className="relative">
                <Link
                  to={`/products?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                  className={getCategoryClass(cat)}
                  onClick={() => setHoveredCategoryId(null)}
                >
                  {cat.name}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Mega Menu Overlay */}
        {hoveredCategory && hoveredCategory.subCategories && hoveredCategory.subCategories.length > 0 && (
          <div 
            className="absolute left-0 right-0 top-full bg-white border-t border-gray-100 shadow-2xl z-50"
            onMouseEnter={() => setHoveredCategoryId(hoveredCategory.id)}
            onMouseLeave={() => setHoveredCategoryId(null)}
          >
            <div className="container py-10">
              <div className="grid grid-cols-4 lg:grid-cols-6 gap-8">
                <div className="col-span-1 lg:col-span-2 space-y-4 border-r border-gray-50 pr-8">
                  <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase">COLLECTION</div>
                  <div className="text-2xl font-black text-gray-900 leading-tight uppercase">{hoveredCategory.name}</div>
                  <div className="w-12 h-0.5 bg-primary/30"></div>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[220px]">
                    Découvrez notre sélection exclusive et nos nouveautés pour {hoveredCategory.name.toLowerCase()}.
                  </p>
                  <Link
                    to={`/products?category=${encodeURIComponent(hoveredCategory.name.toLowerCase())}`}
                    className="inline-flex items-center text-[10px] font-black tracking-[0.2em] uppercase text-gray-900 border-b-2 border-primary pb-1 hover:text-primary transition-all"
                  >
                    Tout explorer
                  </Link>
                </div>

                <div className="col-span-3 lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12 pl-4">
                  {hoveredCategory.subCategories.map(sub => (
                    <Link
                      key={sub.id}
                      to={`/products?category=${encodeURIComponent(hoveredCategory.name.toLowerCase())}&subCategory=${encodeURIComponent(sub.name.toLowerCase())}`}
                      className="group block"
                      onClick={() => setHoveredCategoryId(null)}
                    >
                      <div className="text-[13px] font-bold text-gray-800 group-hover:text-primary transition-colors uppercase tracking-tight">{sub.name}</div>
                      <div className="text-[10px] text-gray-400 group-hover:text-primary/60 transition-colors mt-1 uppercase tracking-widest font-bold">Voir plus</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CartFlyout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
