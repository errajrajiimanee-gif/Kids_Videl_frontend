import type { Product } from '../types/product';
import { useCartStore } from '../stores/cart.store';
import { useFavoritesStore } from '../stores/favorites.store';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMAD, getMockDiscountPercent } from '../utils/format';
import { useToastStore } from '../stores/toast.store';

interface Props {
  product: Product;
  showBadges?: boolean;
}

export default function ProductCard({ product, showBadges = true }: Props) {
  const { addItem } = useCartStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const discountPercent = getMockDiscountPercent(product.id);
  const hasDiscount = discountPercent > 0;
  const addToast = useToastStore(s => s.add);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
      addToast({ type: 'info', message: 'Retiré de vos favoris' });
    } else {
      addFavorite(product);
      addToast({ type: 'success', message: 'Ajouté à vos favoris' });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    addToast({ type: 'success', message: 'Article ajouté au panier' });
  };

  const originalPrice = hasDiscount ? Math.round(product.price / (1 - discountPercent / 100)) : product.price;

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
      <Link to={`/products/${product.id}`} className="relative block">
        <div className="relative aspect-square bg-gradient-to-b from-gray-50 to-white overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white font-bold py-2.5 rounded-full shadow-lg shadow-primary/20 hover:opacity-95"
            >
              Ajouter
            </button>
            <button
              onClick={handleFavoriteClick}
              className="w-11 h-11 rounded-full bg-white/95 border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-red-500"
              aria-label="Ajouter aux favoris"
            >
              <Heart className="w-5 h-5" fill={isFavorite(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {showBadges && hasDiscount && (
            <span className="absolute top-3 left-3 bg-secondary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-grow">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </h3>
          <button
            onClick={handleFavoriteClick}
            className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
              isFavorite(product.id)
                ? 'bg-red-50 border-red-100 text-red-500'
                : 'bg-white border-gray-200 text-gray-400 hover:text-red-500'
            }`}
            aria-label="Favoris"
          >
            <Heart className="w-4 h-4" fill={isFavorite(product.id) ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="flex flex-col">
            {hasDiscount ? (
              <div className="text-xs text-gray-400 line-through">{formatMAD(originalPrice)}</div>
            ) : (
              <div className="text-xs text-gray-400">&nbsp;</div>
            )}
            <div className="text-lg font-extrabold text-gray-900 leading-none">{formatMAD(product.price)}</div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-11 h-11 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 flex items-center justify-center"
            aria-label="Ajouter au panier"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
