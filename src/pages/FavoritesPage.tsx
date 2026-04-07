import { useFavoritesStore } from '../stores/favorites.store';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore();

  if (favorites.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Votre liste de favoris est vide</h1>
        <p className="text-gray-600 mb-8">Cliquez sur le cœur pour ajouter des produits.</p>
        <Link to="/" className="bg-primary text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-all">
          Découvrir les produits
        </Link>
      </div>
    );
  }

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Vos Favoris</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {favorites.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
