import { useCartStore } from '../stores/cart.store';
import { useState } from 'react';
import { api } from '../services/api';
import { formatMAD } from '../utils/format';
import { CheckCircle2, MessageCircle, Mail, Home, ArrowRight, Sparkles, CreditCard, Wallet, Lock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [shippingCost, setShippingCost] = useState(20);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    postalCode: '',
    city: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<null | {
    orderId: number;
    mailTo: string;
    whatsappLink: string;
    adminEmail: string;
    adminWhatsApp: string;
    emailSent: boolean;
  }>(null);

  const total = totalPrice() + shippingCost;

  const handlePay = async () => {
    if (items.length === 0) return;
    setSubmitError(null);

    const nextErrors: Record<string, string> = {};
    const email = form.email.trim();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const address = form.address.trim();
    const city = form.city.trim();
    const phone = form.phone.trim();

    if (!email) nextErrors.email = 'Email obligatoire';
    else if (!email.includes('@')) nextErrors.email = 'Email invalide';
    if (!firstName) nextErrors.firstName = 'Prénom obligatoire';
    if (!lastName) nextErrors.lastName = 'Nom obligatoire';
    if (!address) nextErrors.address = 'Adresse obligatoire';
    if (!city) nextErrors.city = 'Ville obligatoire';
    if (!phone) nextErrors.phone = 'Téléphone obligatoire';

    if (paymentMethod === 'card') {
      if (!cardInfo.number) nextErrors.cardNumber = 'Numéro de carte obligatoire';
      if (!cardInfo.expiry) nextErrors.cardExpiry = 'Date d\'expiration obligatoire';
      if (!cardInfo.cvc) nextErrors.cardCvc = 'CVC obligatoire';
      if (!cardInfo.name) nextErrors.cardName = 'Nom sur la carte obligatoire';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        customer: {
          email,
          firstName,
          lastName,
          address,
          apartment: form.apartment.trim() || undefined,
          postalCode: form.postalCode.trim() || undefined,
          city,
          phone,
        },
        items: items.map(i => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        shippingCost,
        shippingMethod: shippingCost === 20 ? 'casablanca' : 'hors-casablanca',
        paymentMethod,
        cardInfo: paymentMethod === 'card' ? cardInfo : undefined,
      });

      setConfirmation({
        orderId: res.data.order.id,
        mailTo: res.data.notify.mailTo,
        whatsappLink: res.data.notify.whatsappLink,
        adminEmail: res.data.notify.adminEmail,
        adminWhatsApp: res.data.notify.adminWhatsApp,
        emailSent: Boolean(res.data.notify.email),
      });
      clearCart();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Erreur lors de la création de la commande';
      setSubmitError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <main className="bg-gray-50 min-h-[70vh] flex items-center">
        <div className="container py-12">
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Commande confirmée !</h1>
            <p className="text-gray-600 mb-8">
              Merci pour votre achat. Votre commande <span className="font-bold text-primary">#{confirmation.orderId}</span> a été enregistrée avec succès.
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Phone className="w-12 h-12" />
              </div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Confirmation de commande
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Appel de confirmation</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Un conseiller Videl Kids va vous appeler au <span className="text-primary font-bold">{form.phone}</span> pour valider votre commande avant l'expédition.
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-3 px-1">
                  <li className="flex gap-3 text-xs text-gray-600 font-medium">
                    <div className="w-5 h-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                    Traitement rapide de votre colis
                  </li>
                  <li className="flex gap-3 text-xs text-gray-600 font-medium">
                    <div className="w-5 h-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                    Livraison à domicile sécurisée
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={confirmation.whatsappLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold rounded-xl py-4 hover:opacity-90 transition-all shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  Nous contacter
                </a>
                <Link 
                  to="/" 
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-bold rounded-xl py-4 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
                >
                  <Home className="w-5 h-5" />
                  Retour à l'accueil
                </Link>
              </div>
              
              <p className="text-xs text-gray-400">
                Besoin d'aide ? Envoyez-nous un email à <a href={`mailto:${confirmation.adminEmail}`} className="underline hover:text-primary transition-colors">{confirmation.adminEmail}</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <div className="container grid md:grid-cols-2 gap-12 py-12">
        {/* Left Side: Form */}
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">Détails de facturation</h1>
          
          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contact</h2>
            <input
              type="email"
              placeholder="Adresse e-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full border rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email ? <div className="text-sm text-red-600 font-bold">{errors.email}</div> : null}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="newsletter" className="h-4 w-4 rounded text-primary focus:ring-primary" />
              <label htmlFor="newsletter" className="text-sm text-gray-600">Envoyez-moi des nouvelles et des offres par e-mail</label>
            </div>
          </div>

          {/* Shipping */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Livraison</h2>
            <select className="w-full border-gray-300 rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none bg-white">
              <option>Maroc</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Prénom"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className={`w-full border rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              />
              <input
                type="text"
                placeholder="Nom"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className={`w-full border rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {(errors.firstName || errors.lastName) ? (
              <div className="text-sm text-red-600 font-bold">{errors.firstName || errors.lastName}</div>
            ) : null}
            <input
              type="text"
              placeholder="Adresse"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={`w-full border rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.address ? <div className="text-sm text-red-600 font-bold">{errors.address}</div> : null}
            <input
              type="text"
              placeholder="Appartement, suite, etc. (optionnel)"
              value={form.apartment}
              onChange={(e) => setForm({ ...form, apartment: e.target.value })}
              className="w-full border-gray-300 rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Code postal (facultatif)"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="w-full border-gray-300 rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
              />
              <input
                type="text"
                placeholder="Ville"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={`w-full border rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {errors.city ? <div className="text-sm text-red-600 font-bold">{errors.city}</div> : null}
            <input
              type="tel"
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`w-full border rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone ? <div className="text-sm text-red-600 font-bold">{errors.phone}</div> : null}
          </div>

          {/* Shipping Method */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Mode d'expédition</h2>
            <div 
              className={`border rounded-md p-4 flex justify-between items-center cursor-pointer ${shippingCost === 20 ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
              onClick={() => setShippingCost(20)}
            >
              <label htmlFor="casa" className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  id="casa" 
                  name="shipping" 
                  className="h-4 w-4 text-primary focus:ring-primary" 
                  checked={shippingCost === 20}
                  onChange={() => setShippingCost(20)}
                />
                Casablanca
              </label>
              <span className="font-bold">20,00 MAD</span>
            </div>
            <div 
              className={`border rounded-md p-4 flex justify-between items-center cursor-pointer ${shippingCost === 40 ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
              onClick={() => setShippingCost(40)}
            >
              <label htmlFor="hors-casa" className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  id="hors-casa" 
                  name="shipping" 
                  className="h-4 w-4 text-primary focus:ring-primary" 
                  checked={shippingCost === 40}
                  onChange={() => setShippingCost(40)}
                />
                Hors Casablanca
              </label>
              <span className="font-bold">40,00 MAD</span>
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Paiement</h2>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              Toutes les transactions sont sécurisées et chiffrées.
            </p>
            
            <div className="space-y-3">
              {/* COD Option */}
              <div 
                className={`border rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-gray-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <Wallet className="w-5 h-5 text-gray-500" />
                    Paiement à la livraison (COD)
                  </div>
                </div>
              </div>

              {/* Card Option */}
              <div 
                className={`border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex justify-between items-center mb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-gray-300'}`}>
                      {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                    </div>
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      Carte bancaire
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <img src="/visacard.png" alt="Visa" className="h-5 w-auto object-contain" />
                    <img src="/mastercard.png" alt="Mastercard" className="h-5 w-auto object-contain" />
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Numéro de carte</label>
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardInfo.number}
                          onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19) })}
                          className={`w-full bg-white border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all ${errors.cardNumber ? 'border-red-500' : 'border-gray-200'}`}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiration (MM/AA)</label>
                          <input
                            type="text"
                            placeholder="MM/AA"
                            value={cardInfo.expiry}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, '');
                              if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                              setCardInfo({ ...cardInfo, expiry: v });
                            }}
                            className={`w-full bg-white border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all ${errors.cardExpiry ? 'border-red-500' : 'border-gray-200'}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CVC</label>
                          <input
                            type="text"
                            placeholder="123"
                            maxLength={3}
                            value={cardInfo.cvc}
                            onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value.replace(/\D/g, '') })}
                            className={`w-full bg-white border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all ${errors.cardCvc ? 'border-red-500' : 'border-gray-200'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom sur la carte</label>
                        <input
                          type="text"
                          placeholder="NOM PRENOM"
                          value={cardInfo.name}
                          onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value.toUpperCase() })}
                          className={`w-full bg-white border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all ${errors.cardName ? 'border-red-500' : 'border-gray-200'}`}
                        />
                      </div>
                    </div>
                    {(errors.cardNumber || errors.cardExpiry || errors.cardCvc || errors.cardName) && (
                      <p className="text-xs text-red-500 font-bold">Veuillez remplir correctement les informations de votre carte.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting || items.length === 0}
            onClick={handlePay}
            className="w-full bg-primary text-white font-bold py-4 px-6 rounded-md hover:opacity-90 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Traitement...' : 'Payer maintenant'}
          </button>
          {submitError ? <div className="text-sm text-red-600 font-bold">{submitError}</div> : null}
        </div>

        {/* Right Side: Order Summary */}
        <div className="bg-gray-50 p-8 rounded-2xl h-fit sticky top-24">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 py-4 border-b">
              <div className="relative">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-contain mix-blend-multiply rounded-lg bg-white border" />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 text-white text-xs flex items-center justify-center rounded-full">{item.quantity}</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold">{item.name}</h3>
              </div>
              <span className="font-bold">{(item.price * item.quantity).toFixed(2)} MAD</span>
            </div>
          ))}

          <div className="space-y-4 py-6 border-b">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span className="font-semibold">{formatMAD(totalPrice(), 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Expédition</span>
              <span className="font-semibold">{formatMAD(shippingCost, 2)}</span>
            </div>
          </div>

          <div className="flex justify-between font-bold text-2xl pt-6">
            <span>Total</span>
            <span>{formatMAD(total, 2)}</span>
          </div>

          {/* Loyalty points preview */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-amber-900 uppercase tracking-wider">Points fidélité</div>
              <div className="text-amber-700 mt-0.5">
                Gagnez <span className="font-black underline">{Math.floor(totalPrice() / 10)} points</span> avec cet achat !
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
