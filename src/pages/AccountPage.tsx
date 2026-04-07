import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, Package, Heart, LogOut, ChevronRight, Sparkles, ShoppingBag } from 'lucide-react';
import { clearCustomerToken } from '../services/customerAuth';
import ProductCard from '../components/ProductCard';
import { useFavoritesStore } from '../stores/favorites.store';
import { formatMAD } from '../utils/format';

type Me = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  points?: number;
};

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total: number;
  items: OrderItem[];
}

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { favorites } = useFavoritesStore();

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me');
      setMe(res.data);
    } catch (err) {
      console.error('Failed to fetch user data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      // Assuming there's a customer endpoint for orders
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleLogout = () => {
    clearCustomerToken();
    window.location.assign('/');
  };

  const points = me?.points || 0;
  const pointsToGift = 300 - points;

  return (
    <main className="container py-16 min-h-[80vh]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-72 space-y-4 flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <User className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-black text-gray-900 truncate">
                    {me ? `${me.firstName || ''} ${me.lastName || ''}`.trim() : 'Chargement...'}
                  </div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Client Privilège</div>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all font-bold ${activeTab === 'profile' ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5" />
                    <span className="text-sm">Mon Profil</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all font-bold ${activeTab === 'orders' ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5" />
                    <span className="text-sm">Mes Commandes</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all font-bold ${activeTab === 'favorites' ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Mes Favoris</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="h-px bg-gray-100 my-2"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 font-bold transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </nav>
            </div>

            {/* Loyalty Quick View */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] p-6 text-white shadow-lg shadow-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Club Fidélité</span>
              </div>
              <div className="text-3xl font-black mb-1">{points} pts</div>
              <p className="text-[10px] font-bold opacity-90 leading-tight">
                {pointsToGift > 0 
                  ? <>Plus que <span className="underline decoration-2 underline-offset-2">{pointsToGift} points</span> pour votre cadeau offert ! 🎁</>
                  : <>Félicitations ! Vous avez droit à votre cadeau offert ! 🎁🎁🎁</>
                }
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm min-h-[500px]">
              {activeTab === 'profile' && (
                <>
                  <h1 className="text-2xl font-black text-gray-900 mb-2">Informations Personnelles</h1>
                  <p className="text-sm text-gray-500 font-medium mb-8">Gérez vos coordonnées et vos préférences de sécurité.</p>

                  {loading ? (
                    <div className="space-y-6">
                      <div className="h-20 bg-gray-50 rounded-2xl animate-pulse"></div>
                      <div className="h-20 bg-gray-50 rounded-2xl animate-pulse"></div>
                    </div>
                  ) : me ? (
                    <div className="grid gap-6">
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Détails du profil</div>
                        <div className="space-y-4">
                          <div className="flex justify-between border-b border-gray-200/50 pb-3">
                            <span className="text-sm font-bold text-gray-500">Nom Complet</span>
                            <span className="text-sm font-black text-gray-900">{`${me.firstName || ''} ${me.lastName || ''}`.trim() || '—'}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-200/50 pb-3">
                            <span className="text-sm font-bold text-gray-500">Adresse Email</span>
                            <span className="text-sm font-black text-gray-900">{me.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-gray-500">Statut Compte</span>
                            <span className="text-[10px] font-black bg-green-100 text-green-600 px-2 py-1 rounded-md uppercase tracking-wider">Actif</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button className="bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-all active:scale-95">
                          Modifier mon profil
                        </button>
                      </div>
                    </div>
                  ) : (
                    <AccountErrorView />
                  )}
                </>
              )}

              {activeTab === 'orders' && (
                <>
                  <h1 className="text-2xl font-black text-gray-900 mb-2">Mes Commandes</h1>
                  <p className="text-sm text-gray-500 font-medium mb-8">Suivez l'état de vos achats récents.</p>

                  {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-gray-400">Chargement de vos commandes...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-gray-900">Aucune commande</h3>
                        <p className="text-sm text-gray-500">Vous n'avez pas encore passé de commande chez nous.</p>
                      </div>
                      <button onClick={() => window.location.assign('/')} className="bg-primary text-white font-black text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-xl mt-4">Commencer mon shopping</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border border-gray-100 rounded-2xl p-5 hover:border-primary/20 transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-sm font-black text-gray-900">Commande #{order.id}</div>
                              <div className="text-xs text-gray-400 font-bold uppercase mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                              order.status === 'confirmed' ? 'bg-green-100 text-green-600' : 
                              order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {order.status === 'confirmed' ? 'Confirmée' : order.status === 'cancelled' ? 'Annulée' : 'En attente'}
                            </span>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {order.items.map(item => (
                              <img key={item.id} src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-50" title={item.name} />
                            ))}
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                            <div className="text-sm font-black text-gray-900">{formatMAD(order.total, 2)}</div>
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Voir détails</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'favorites' && (
                <>
                  <h1 className="text-2xl font-black text-gray-900 mb-2">Mes Favoris</h1>
                  <p className="text-sm text-gray-500 font-medium mb-8">Retrouvez les articles que vous avez aimés.</p>

                  {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                        <Heart className="w-8 h-8 text-gray-300" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-gray-900">Liste vide</h3>
                        <p className="text-sm text-gray-500">Ajoutez des articles en cliquant sur le cœur.</p>
                      </div>
                      <button onClick={() => window.location.assign('/')} className="bg-primary text-white font-black text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-xl mt-4">Explorer la boutique</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {favorites.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AccountErrorView() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <LogOut className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-black text-gray-900">Session expirée</h3>
      <p className="text-sm text-gray-500 mt-1 mb-6">Veuillez vous reconnecter pour accéder à votre compte.</p>
      <button onClick={() => window.location.assign('/login')} className="bg-primary text-white font-black text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-xl">Se connecter</button>
    </div>
  );
}
