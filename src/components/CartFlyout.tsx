import { useCartStore } from '../stores/cart.store';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import type { Product } from '../types/product';
import { formatMAD } from '../utils/format';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartFlyout({ isOpen, onClose }: Props) {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCartStore();
  const [removingIds, setRemovingIds] = useState<Record<number, boolean>>({});
  const [recommended, setRecommended] = useState<Product[]>([]);

  const cartIds = useMemo(() => new Set(items.map(i => i.id)), [items]);
  const total = totalPrice();

  useEffect(() => {
    if (!isOpen) return;
    api
      .get<Product[]>('/products')
      .then(res => {
        const next = res.data.filter(p => !cartIds.has(p.id)).slice(0, 3);
        setRecommended(next);
      })
      .catch(() => setRecommended([]));
  }, [isOpen, cartIds]);

  if (!isOpen) return null;

  const handleRemove = (productId: number) => {
    setRemovingIds(prev => ({ ...prev, [productId]: true }));
    window.setTimeout(() => {
      removeItem(productId);
      setRemovingIds(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }, 180);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold">Votre panier</h2>
            {totalItems() > 0 && (
              <span className="text-xs font-extrabold text-white bg-primary rounded-full px-2 py-1">
                {totalItems()}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
        </div>

        {totalItems() === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-600">Votre panier est vide.</p>
            <button onClick={onClose} className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-all">
              Commencer les achats
            </button>
          </div>
        ) : (
          <>
            <div className="flex-grow p-6 space-y-6 overflow-y-auto">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-extrabold text-gray-900">{formatMAD(total, 2)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Livraison calculée au paiement.</div>
              </div>

              {items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 transition-all duration-200 ${
                    removingIds[item.id] ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-20 h-20 object-contain mix-blend-multiply rounded-lg bg-gray-50 border"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-primary font-extrabold mt-1">{formatMAD(item.price, 2)}</p>
                    <div className="flex items-center border border-gray-200 rounded-full w-fit mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-gray-500"><Minus className="w-4 h-4" /></button>
                      <span className="px-2 font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-gray-500"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                </div>
              ))}

              {recommended.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-gray-900">Recommandés</div>
                    <Link to="/products" onClick={onClose} className="text-xs font-bold text-primary hover:opacity-80 inline-flex items-center gap-1">
                      Voir tout <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {recommended.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          useCartStore.getState().addItem(p);
                        }}
                        className="text-left bg-white border border-gray-100 rounded-2xl p-2 hover:border-primary/30 hover:shadow-sm transition-all"
                      >
                        <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden">
                          <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="mt-2 text-[11px] font-bold text-gray-700 line-clamp-2">{p.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatMAD(total, 2)}</span>
              </div>
              <Link to="/cart" onClick={onClose} className="block w-full text-center border border-primary text-primary font-bold py-3 rounded-full hover:bg-primary/5">
                Voir le panier
              </Link>
              <Link to="/checkout" onClick={onClose} className="block w-full text-center bg-primary text-white font-bold py-3 rounded-full hover:opacity-90 transition-all">
                Paiement
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
