import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 bg-white">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/logo-kids-videl.jpeg" alt="Videl Kids" className="h-12 w-auto object-contain" />
          </Link>
          <p className="text-sm text-gray-600 leading-relaxed">
            Boutique dédiée aux produits bébé, maman et enfant. Qualité, sécurité et sérénité pour les familles au Maroc.
          </p>
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-primary/10 flex items-center justify-center text-gray-500 hover:text-primary transition-colors" aria-label="Facebook">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M13 3h4a1 1 0 0 1 1 1v4h-3a2 2 0 0 0-2 2v3h5l-1 4h-4v7h-4v-7H6v-4h3V9a6 6 0 0 1 6-6z"/></svg>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-primary/10 flex items-center justify-center text-gray-500 hover:text-primary transition-colors" aria-label="Instagram">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm0 2h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3zm5 2.8A5.2 5.2 0 1 0 17.2 12 5.2 5.2 0 0 0 12 6.8zm0 2A3.2 3.2 0 1 1 8.8 12 3.2 3.2 0 0 1 12 8.8zm5.6-.9a1.1 1.1 0 1 0 1.1-1.1 1.1 1.1 0 0 0-1.1 1.1z"/></svg>
            </a>
            <a href="https://wa.me/212666011062" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-primary/10 flex items-center justify-center text-gray-500 hover:text-primary transition-colors" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M.057 24l1.687-6.163A11.94 11.94 0 0 1 0 11.944C0 5.345 5.373 0 11.98 0 18.588 0 24 5.345 24 11.944c0 6.6-5.412 11.944-12.02 11.944-1.99 0-3.95-.5-5.69-1.447L.057 24zm6.29-4.143c1.59.943 3.32 1.44 5.08 1.441 5.46.003 9.9-4.432 9.9-9.896.002-2.65-1.03-5.142-2.906-7.019C15.55 2.509 13.06 1.476 10.41 1.475c-5.46 0-9.9 4.435-9.9 9.9-.001 1.765.506 3.486 1.467 4.965l-.999 3.648 3.768-.989z"/></svg>
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <div className="font-bold text-gray-900">Boutique</div>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <Link to="/products" className="hover:text-primary">Tous les produits</Link>
            <Link to="/favorites" className="hover:text-primary">Favoris</Link>
            <Link to="/cart" className="hover:text-primary">Panier</Link>
            <Link to="/account" className="hover:text-primary">Mon compte</Link>
          </div>
        </div>

        <div className="space-y-3">
          <div className="font-bold text-gray-900">Aide</div>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <Link to="/checkout" className="hover:text-primary">Paiement & Livraison</Link>
            <a className="hover:text-primary" href="#">Retours & Échanges</a>
            <a className="hover:text-primary" href="#">FAQ</a>
          </div>
        </div>

        <div className="space-y-3">
          <div className="font-bold text-gray-900">Contact</div>
          <div className="text-sm text-gray-600 space-y-2">
            <div>WhatsApp: 06 66 01 10 62</div>
            <div>Email: contact@videlkids.ma</div>
            <div>Casablanca, Maroc</div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div>© {new Date().getFullYear()} Videl Kids. Tous droits réservés.</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-primary" href="#">Mentions légales</a>
            <a className="hover:text-primary" href="#">Confidentialité</a>
            <a className="hover:text-primary" href="#">Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
