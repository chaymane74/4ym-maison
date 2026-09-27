import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { submitCODOrder } from '../services/api';
import { Order } from '../types';
import { X, CheckCircle, Truck, ShieldCheck, AlertCircle, MessageCircle, ArrowRight } from 'lucide-react';

export const CODModal: React.FC = () => {
  const { codItems, closeCODModal, settings, clearCart, showNotification, refreshStoreData } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [customCity, setCustomCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!codItems || codItems.length === 0) return null;

  const defaultCities = settings?.delivery_cities || [
    'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès', 'Meknès', 'Mohammedia', 'Autre ville'
  ];

  const subtotal = codItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = settings?.free_delivery_enabled ? 0 : (settings?.delivery_price || 0);
  const grandTotal = subtotal + deliveryFee;

  const validateMoroccoPhone = (num: string): boolean => {
    const clean = num.replace(/[\s\-\.]/g, '');
    const regex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
    return regex.test(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Veuillez renseigner votre nom complet.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[\s\-\.]/g, '');
    if (!cleanPhone) {
      setErrorMessage('Veuillez renseigner votre numéro de téléphone.');
      return;
    }

    if (!validateMoroccoPhone(cleanPhone)) {
      setErrorMessage('Numéro invalide. Format attendu : 06XXXXXXXX ou 07XXXXXXXX.');
      return;
    }

    const resolvedCity = city === 'Autre ville' ? customCity.trim() : city;
    if (!resolvedCity) {
      setErrorMessage('Veuillez spécifier votre ville.');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage('Veuillez renseigner votre adresse de livraison complète (Quartier, Rue, N°).');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitCODOrder({
        customer_name: customerName.trim(),
        phone: cleanPhone,
        city: resolvedCity,
        address: address.trim(),
        notes: notes.trim(),
        items: codItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      });

      setCompletedOrder(response.order);
      clearCart();
      refreshStoreData();
      showNotification('success', `Commande #${response.order.order_number} enregistrée avec succès`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue lors de l\'enregistrement de votre commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!completedOrder) return;
    const whatsappNum = (settings?.whatsapp_number || '+212637898783').replace(/[^\d]/g, '');
    const message = encodeURIComponent(
      `Bonjour 4YM Maison, je viens de passer la commande #${completedOrder.order_number} d'un montant de ${completedOrder.total} DH. Je souhaite confirmer ma livraison.`
    );
    window.open(`https://wa.me/${whatsappNum || '212637898783'}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-[#E5E1D8] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#111111] text-[#F5F3EF] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg tracking-[0.2em] font-medium text-[#C8A96B]">
              4YM | MAISON
            </span>
            <span className="text-xs text-[#8A8A8A] font-light">·</span>
            <span className="text-xs uppercase tracking-wider text-[#8A8A8A]">
              Paiement à la Livraison (COD)
            </span>
          </div>

          <button
            onClick={closeCODModal}
            className="p-1 hover:text-[#C8A96B] transition-colors cursor-pointer text-[#8A8A8A]"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          {completedOrder ? (
            /* --- ORDER CONFIRMATION SCREEN --- */
            <div className="text-center py-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-[#C8A96B]/15 text-[#C8A96B] rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h3 className="font-serif text-3xl font-normal text-[#111111] mb-2">
                Merci pour votre commande !
              </h3>
              
              <p className="text-sm text-[#555555] max-w-md mx-auto mb-6">
                Votre commande a bien été enregistrée. Nous vous contacterons prochainement par téléphone pour confirmer la livraison.
              </p>

              {/* Order Number Box */}
              <div className="inline-block bg-[#F5F3EF] border border-[#E5E1D8] px-6 py-3 mb-6">
                <span className="text-xs text-[#8A8A8A] uppercase tracking-widest block mb-1">
                  Numéro de Commande
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#111111] tracking-wider">
                  Order #{completedOrder.order_number}
                </span>
              </div>

              {/* Order Recap */}
              <div className="bg-[#FAF9F6] border border-[#E5E1D8] p-5 text-left mb-6 space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-[#E5E1D8]">
                  <span className="text-[#8A8A8A]">Client :</span>
                  <span className="font-medium text-[#111111]">{completedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#E5E1D8]">
                  <span className="text-[#8A8A8A]">Téléphone :</span>
                  <span className="font-medium text-[#111111]">{completedOrder.phone}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#E5E1D8]">
                  <span className="text-[#8A8A8A]">Ville de livraison :</span>
                  <span className="font-medium text-[#111111]">{completedOrder.city}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#E5E1D8]">
                  <span className="text-[#8A8A8A]">Montant à payer :</span>
                  <span className="font-bold text-base text-[#111111] tabular-nums">
                    {completedOrder.total} DH
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 pt-1 font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Prêt pour expédition · Pris en charge par l'atelier 4YM</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleWhatsAppContact}
                  className="px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Confirmer sur WhatsApp</span>
                </button>
                <button
                  onClick={closeCODModal}
                  className="px-6 py-3 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Retour à la Boutique</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* --- ORDER ENTRY FORM --- */
            <div>
              {/* Items Summary Header */}
              <div className="mb-6 p-4 bg-[#F5F3EF] border border-[#E5E1D8]">
                <h4 className="text-xs uppercase tracking-[0.15em] font-semibold text-[#111111] mb-3">
                  Articles Sélectionnés ({codItems.length})
                </h4>
                <div className="space-y-2">
                  {codItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-10 h-10 object-cover border border-[#E5E1D8]"
                        />
                        <div>
                          <p className="font-medium text-[#111111]">{item.product.name}</p>
                          <p className="text-[#8A8A8A]">Quantité : {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-[#111111] tabular-nums">
                        {item.product.price * item.quantity} DH
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E1D8] flex items-center justify-between text-sm">
                  <span className="font-serif uppercase tracking-wider text-xs font-semibold text-[#111111]">
                    Total à régler à la livraison :
                  </span>
                  <span className="font-serif text-xl font-bold text-[#111111] tabular-nums">
                    Total: {grandTotal} DH
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1.5">
                    Nom Complet <span className="text-[#C8A96B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Youssef Bennani"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] text-sm text-[#111111] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1.5">
                    Numéro de Téléphone (WhatsApp) <span className="text-[#C8A96B]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 06 12 34 56 78"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] text-sm text-[#111111] focus:outline-none focus:border-[#C8A96B]"
                  />
                  <p className="mt-1 text-[11px] text-[#8A8A8A]">
                    Nous vous appellerons pour convenir de l'horaire de livraison.
                  </p>
                </div>

                {/* City Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1.5">
                      Ville <span className="text-[#C8A96B]">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] text-sm text-[#111111] focus:outline-none focus:border-[#C8A96B] cursor-pointer"
                    >
                      {defaultCities.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {city === 'Autre ville' && (
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1.5">
                        Précisez votre ville <span className="text-[#C8A96B]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Ex: Nador, Dakhla..."
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] text-sm text-[#111111] focus:outline-none focus:border-[#C8A96B]"
                      />
                    </div>
                  )}
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1.5">
                    Adresse Complète de Livraison <span className="text-[#C8A96B]">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Quartier, Numéro de rue, Résidence, Appartement..."
                    className="w-full px-3.5 py-2 bg-white border border-[#E5E1D8] text-sm text-[#111111] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-[#777777] mb-1.5">
                    Instructions particulières (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Appeler avant de passer, code portail, emballage cadeau..."
                    className="w-full px-3.5 py-2 bg-white border border-[#E5E1D8] text-sm text-[#111111] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>

                {/* Trust callouts */}
                <div className="pt-2 text-xs text-[#666666] flex items-center justify-between border-t border-[#E5E1D8]">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#C8A96B]" />
                    <span>Livraison gratuite</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#C8A96B]" />
                    <span>Paiement à la réception</span>
                  </span>
                </div>

                {/* Total & Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      isSubmitting
                        ? 'bg-[#8A8A8A] text-white cursor-wait'
                        : 'bg-[#111111] hover:bg-[#C8A96B] text-[#F5F3EF] hover:text-[#111111]'
                    }`}
                  >
                    {isSubmitting ? (
                      <span>ENREGISTREMENT EN COURS...</span>
                    ) : (
                      <span>CONFIRMER LA COMMANDE ({grandTotal} DH)</span>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
