import React from 'react';
import { useStore } from '../context/StoreContext';
import { Instagram, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActivePage, setActiveInfoModal, setCategoryFilter } = useStore();

  const handleCategoryNav = (cat: string) => {
    setCategoryFilter(cat);
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappHref = `https://wa.me/${(settings?.whatsapp_number || '+212637898783').replace(/[^\d]/g, '')}`;

  return (
    <footer className="bg-[#111111] text-[#F5F3EF] border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#222222]">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-serif text-2xl tracking-[0.25em] font-medium text-[#F5F3EF] block">
              4YM <span className="text-[#C8A96B]">|</span> MAISON
            </span>
            <p className="font-serif italic text-base text-[#C8A96B]">
              Wear Your Identity.
            </p>
            <p className="text-xs text-[#8A8A8A] max-w-sm leading-relaxed font-light">
              Maison marocaine de création de bijoux contemporains, montres minimalistes et maroquinerie d'exception. Livraison offerte et paiement en espèces à la livraison au Maroc.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings?.instagram_url || 'https://instagram.com/4ym.store'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1c1c1c] border border-[#333333] flex items-center justify-center text-[#C8A96B] hover:text-white hover:border-[#C8A96B] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1c1c1c] border border-[#333333] flex items-center justify-center text-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 1: Shop Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F3EF] mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8A8A8A]">
              <li>
                <button
                  onClick={() => handleCategoryNav('all')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Tous les articles
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('watches')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Montres & Horlogerie
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('girls')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Collection Femme
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('boys')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Collection Homme
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('autres_accessoires')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Autres Accessoires
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('cat-jewelry')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Bijoux & Or
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Services & Informative Modals */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F3EF] mb-4">
              Service Client
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8A8A8A]">
              <li>
                <button
                  onClick={() => setActiveInfoModal('delivery')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Livraison gratuite au Maroc
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('returns')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Retours & Échanges (7j)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('faq')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Foire Aux Questions (FAQ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('contact')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Contact & Conciergerie
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Maison */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F3EF] mb-4">
              Maison 4YM
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8A8A8A]">
              <li>
                <button
                  onClick={() => setActiveInfoModal('about')}
                  className="hover:text-[#C8A96B] transition-colors cursor-pointer"
                >
                  Notre Histoire & Savoir-Faire
                </button>
              </li>
              <li>
                <a
                  href={settings?.instagram_url || 'https://instagram.com/4ym.store'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C8A96B] transition-colors block"
                >
                  Instagram : @4ym.store
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C8A96B] transition-colors block"
                >
                  WhatsApp Officiel
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#555555] gap-4">
          <p>{settings?.footer_text || '© 2026 4YM | Maison. Tous droits réservés. Wear Your Identity.'}</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Paiement en espèces à la livraison (COD)</span>
            <span aria-hidden="true">·</span>
            <span>Royaume du Maroc</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
