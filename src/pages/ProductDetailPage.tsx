import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types/product';
import { useCartStore } from '../stores/cart.store';
import { Plus, Minus, Heart } from 'lucide-react';
import { useFavoritesStore } from '../stores/favorites.store';
import { useToastStore } from '../stores/toast.store';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { addFavorite, isFavorite, removeFavorite } = useFavoritesStore();
  const addToast = useToastStore(s => s.add);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error('Failed to fetch product', err));
  }, [id]);

  if (!product) {
    return <div className="container py-12 text-center">Chargement...</div>;
  }

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      addToast({ type: 'success', message: 'Article ajouté au panier' });
    }
  };
  
  const handleToggleFavorite = () => {
    if (!product) return;
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
      addToast({ type: 'info', message: 'Retiré de vos favoris' });
    } else {
      addFavorite(product);
      addToast({ type: 'success', message: 'Ajouté à vos favoris' });
    }
  };

  return (
    <main className="container py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Product Image */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full object-contain mix-blend-multiply aspect-square" />
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-gray-500">Avril | SKU: C-BEAUTY-30598 | Code-barres: 3662217018222</p>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full my-3">Nouveauté</span>
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-2">Taxes incluses. <span className="text-primary font-bold">Frais de livraison</span> calculés lors du paiement.</p>
          </div>

          <div className="text-5xl font-bold text-gray-900">
            {product.price.toFixed(2)} MAD
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-full">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-gray-500 hover:text-primary"><Minus className="w-4 h-4" /></button>
              <span className="px-4 font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-gray-500 hover:text-primary"><Plus className="w-4 h-4" /></button>
            </div>
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-all shadow-lg shadow-primary/30"
            >
              Ajouter au panier
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleToggleFavorite} className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-full py-3 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <Heart className="w-5 h-5" /> {product && isFavorite(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <a href="#" className="font-bold text-blue-600 hover:underline">Voir les options</a>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="gift-wrap" className="h-5 w-5 rounded text-primary focus:ring-primary" />
            <label htmlFor="gift-wrap" className="font-medium text-gray-700">Ajoutez un emballage cadeau à votre commande</label>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
