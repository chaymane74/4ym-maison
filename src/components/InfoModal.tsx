import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Truck, ShieldCheck, HelpCircle, Mail, Phone, MapPin, Instagram, MessageCircle } from 'lucide-react';

export const InfoModal: React.FC = () => {
  const { activeInfoModal, setActiveInfoModal, settings } = useStore();

  if (!activeInfoModal) return null;

  const handleClose = () => setActiveInfoModal(null);

  const titles: Record<string, string> = {
    about: 'À PROPOS DE 4YM | MAISON',
    delivery: 'LIVRAISON & EXPÉDITION AU MAROC',
    returns: 'RETOURS & ÉCHANGES',
    faq: 'FOIRE AUX QUESTIONS (FAQ)',
    contact: 'SERVICE CLIENT & CONCIERGERIE',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-[#E5E1D8] shadow-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8] mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8A96B] font-semibold block mb-1">
              4YM · Informations Officielles
            </span>
            <h3 className="font-serif text-2xl font-light text-[#111111]">
              {titles[activeInfoModal]}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:text-[#C8A96B] transition-colors cursor-pointer text-[#8A8A8A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on modal type */}
        <div className="text-sm text-[#444444] leading-relaxed space-y-4">
          {activeInfoModal === 'about' && (
            <>
              <p className="font-serif italic text-base text-[#111111]">
                "Wear Your Identity."
              </p>
              <p>
                <strong>4YM | Maison</strong> est une marque marocaine de bijoux, montres et accessoires de luxe contemporain. Fondée avec la conviction que le style est l'expression la plus sincère de l'individualité, notre atelier conçoit des pièces minimalistes, nobles et pérennes.
              </p>
              <p>
                Chaque création célèbre un équilibre subtil entre la rigueur géométrique moderne et la chaleur des dorures et cuirs traditionnels marocains.
              </p>
              <div className="p-4 bg-[#F5F3EF] border border-[#E5E1D8] mt-4">
                <p className="text-xs text-[#111111] font-semibold mb-1">Notre Engagement Authenticité :</p>
                <p className="text-xs text-[#666666]">
                  Nos pièces sont fabriquées selon des cahiers des charges précis avec des matériaux nobles (dorure 18k, cuir pleine fleur véritable, acier 316L, verres minéraux traités). Nous garantissons la conformité exacte de chaque pièce reçue.
                </p>
              </div>
            </>
          )}

          {activeInfoModal === 'delivery' && (
            <>
              <div className="flex items-center gap-3 p-4 bg-[#F5F3EF] border border-[#E5E1D8]">
                <Truck className="w-6 h-6 text-[#C8A96B] shrink-0" />
                <div>
                  <p className="font-semibold text-xs text-[#111111] uppercase tracking-wider">
                    Livraison Gratuite Partout au Maroc
                  </p>
                  <p className="text-xs text-[#666666]">
                    Aucun frais caché. Vous réglez uniquement le prix des articles lors de la livraison en espèces (COD).
                  </p>
                </div>
              </div>

              <h4 className="font-semibold text-[#111111] text-xs uppercase tracking-wider pt-2">
                Délais d'expédition :
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#555555]">
                <li><strong>Casablanca & Mohammedia :</strong> 24 heures ouvrées.</li>
                <li><strong>Rabat, Marrakech, Tanger, Fès, Meknès :</strong> 24h à 48 heures.</li>
                <li><strong>Agadir, Oujda, Tétouan, El Jadida & autres villes :</strong> 48h à 72 heures.</li>
              </ul>

              <h4 className="font-semibold text-[#111111] text-xs uppercase tracking-wider pt-2">
                Déroulement de la livraison :
              </h4>
              <p className="text-xs text-[#555555]">
                Notre livreur partenaire vous contacte par téléphone ou WhatsApp avant de se présenter à votre adresse pour convenir de l'heure exacte.
              </p>
            </>
          )}

          {activeInfoModal === 'returns' && (
            <>
              <div className="flex items-center gap-3 p-4 bg-[#F5F3EF] border border-[#E5E1D8]">
                <ShieldCheck className="w-6 h-6 text-[#C8A96B] shrink-0" />
                <div>
                  <p className="font-semibold text-xs text-[#111111] uppercase tracking-wider">
                    Garantie Sérénité 7 Jours
                  </p>
                  <p className="text-xs text-[#666666]">
                    Vous disposez de 7 jours après réception de votre commande pour demander un échange ou un retour.
                  </p>
                </div>
              </div>

              <h4 className="font-semibold text-[#111111] text-xs uppercase tracking-wider pt-2">
                Conditions de retour :
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#555555]">
                <li>L'article doit être neuf, non porté et intact.</li>
                <li>La pièce doit être retournée dans son emballage d'origine (écrin velours 4YM).</li>
                <li>Le bon de livraison ou le numéro de commande #4YM-XXXX doit être joint.</li>
              </ul>
              <p className="text-xs text-[#555555]">
                Pour initier un échange ou un retour, contactez simplement notre service client sur WhatsApp en précisant votre numéro de commande.
              </p>
            </>
          )}

          {activeInfoModal === 'faq' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#FAF9F6] border border-[#E5E1D8]">
                <p className="font-semibold text-[#111111] mb-1">
                  1. Comment fonctionne le paiement à la livraison (COD) ?
                </p>
                <p className="text-[#666666]">
                  Vous passez votre commande sans entrer de coordonnées bancaires. Lorsque le livreur arrive chez vous, vous réglez le montant exact de votre commande en dirhams marocains (espèces).
                </p>
              </div>

              <div className="p-3 bg-[#FAF9F6] border border-[#E5E1D8]">
                <p className="font-semibold text-[#111111] mb-1">
                  2. Les bijoux résistent-ils à l'eau ?
                </p>
                <p className="text-[#666666]">
                  Nos pièces en acier et laiton doré 18 carats sont traitées par placage sous vide haute résistance (PVD), résistant aux éclaboussures et à l'usage quotidien. Pour préserver leur éclat éclatant sur le long terme, évitez le contact prolongé avec parfums et produits chimiques.
                </p>
              </div>

              <div className="p-3 bg-[#FAF9F6] border border-[#E5E1D8]">
                <p className="font-semibold text-[#111111] mb-1">
                  3. Puis-je ouvrir le colis avant de payer ?
                </p>
                <p className="text-[#666666]">
                  Oui, vous pouvez vérifier l'état extérieur de votre colis avec le livreur en toute sérénité.
                </p>
              </div>
            </div>
          )}

          {activeInfoModal === 'contact' && (
            <div className="space-y-4">
              <p className="text-xs text-[#555555]">
                Notre équipe est à votre écoute du lundi au samedi de 9h00 à 20h00 pour toute question sur nos collections ou le suivi de votre commande.
              </p>

              <div className="space-y-3 pt-2">
                <a
                  href={`https://wa.me/${(settings?.whatsapp_number || '+212637898783').replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white border border-[#E5E1D8] hover:border-[#25D366] transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">WhatsApp Conciergerie</p>
                    <p className="text-xs text-[#8A8A8A]">{settings?.whatsapp_number || '+212637898783'}</p>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 bg-white border border-[#E5E1D8]">
                  <Mail className="w-5 h-5 text-[#C8A96B]" />
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">Email</p>
                    <p className="text-xs text-[#8A8A8A]">{settings?.contact_email || 'contact@4ym.ma'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-[#E5E1D8]">
                  <MapPin className="w-5 h-5 text-[#C8A96B]" />
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">Showroom / Siège</p>
                    <p className="text-xs text-[#8A8A8A]">{settings?.store_address || 'Casablanca, Maroc'}</p>
                  </div>
                </div>

                <a
                  href={settings?.instagram_url || 'https://instagram.com/4ym.store'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white border border-[#E5E1D8] hover:border-[#C8A96B] transition-colors"
                >
                  <Instagram className="w-5 h-5 text-[#C8A96B]" />
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">Instagram</p>
                    <p className="text-xs text-[#8A8A8A]">{settings?.instagram_handle || '@4ym.store'}</p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-[#E5E1D8] flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
