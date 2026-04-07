import { useCartStore } from '../stores/cart.store';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCartStore();

  if (totalItems() === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-gray-600 mb-8">Parcourez nos catégories pour trouver votre bonheur !</p>
        <Link to="/" className="bg-primary text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-all">
          Continuer mes achats
        </Link>
      </div>
    );
  }

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Votre Panier</h1>
      <div className="grid md:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-6">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-contain mix-blend-multiply rounded-lg bg-gray-50" />
              <div className="flex-grow">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-primary font-bold mt-1">{item.price.toFixed(2)} MAD</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-full">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-gray-500 hover:text-primary"><Minus className="w-4 h-4" /></button>
                <span className="px-3 font-bold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-gray-500 hover:text-primary"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <h2 className="text-2xl font-bold mb-6 border-b pb-4">Résumé de la commande</h2>
          <div className="space-y-4">
            <div className="flex justify-between font-medium">
              <span>Sous-total</span>
              <span>{totalPrice().toFixed(2)} MAD</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Livraison</span>
              <span>Gratuite</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-4 border-t mt-4">
              <span>Total</span>
              <span>{totalPrice().toFixed(2)} MAD</span>
            </div>
          </div>
          <Link to="/checkout" className="block w-full text-center bg-primary text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-all mt-8">
            Passer à la caisse
          </Link>
        </div>
      </div>
    </main>
  );
}
