import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    openCODModal,
    setActivePage,
  } = useStore();

  if (!isCartOpen) return null;

  const handleCheckoutCOD = () => {
    if (cart.length === 0) return;
    openCODModal(cart.map(item => ({ product: item.product, quantity: item.quantity })));
    setIsCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F5F3EF] border-l border-[#E5E1D8] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 bg-white border-b border-[#E5E1D8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              <h3 className="font-serif text-xl font-medium tracking-wide text-[#111111]">
                Votre Panier
              </h3>
              <span className="text-xs text-[#8A8A8A]">({cartCount} {cartCount > 1 ? 'articles' : 'article'})</span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 hover:text-[#C8A96B] transition-colors cursor-pointer text-[#8A8A8A]"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-[#8A8A8A]">
                <ShoppingBag className="w-12 h-12 stroke-[1] mx-auto mb-4 text-[#C8A96B]" />
                <p className="font-serif text-lg text-[#111111] mb-2">Votre panier est vide</p>
                <p className="text-xs max-w-xs mx-auto mb-6">
                  Découvrez nos collections de bijoux, montres et maroquinerie signature.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActivePage('shop');
                  }}
                  className="px-6 py-2.5 bg-[#111111] text-[#F5F3EF] hover:bg-[#C8A96B] hover:text-[#111111] text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
                >
                  Découvrir la Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 bg-white border border-[#E5E1D8] hover:border-[#C8A96B] transition-colors"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover bg-[#F5F3EF] shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-[#111111] line-clamp-1 pr-2">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#8A8A8A] hover:text-red-700 transition-colors p-0.5 cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#8A8A8A]">{item.product.category_name}</p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-[#E5E1D8]">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs hover:bg-[#F5F3EF] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs hover:bg-[#F5F3EF] cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[#111111] tabular-nums">
                        {item.product.price * item.quantity} DH
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout Action */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E5E1D8] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Sous-total</span>
                  <span className="font-semibold text-[#111111] tabular-nums">{cartTotal} DH</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>Livraison au Maroc</span>
                  </span>
                  <span className="text-emerald-700 font-medium">GRATUITE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#111111] pt-2 border-t border-[#E5E1D8]">
                  <span>Total à régler (COD)</span>
                  <span className="font-serif text-lg tabular-nums">{cartTotal} DH</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutCombined}
                className="w-full py-4 px-6 bg-[#111111] hover:bg-[#C8A96B] text-[#F5F3EF] hover:text-[#111111] text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <span>COMMANDER EN CASH (COD)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-[#8A8A8A]">
                Paiement en espèces lors de la réception de votre colis.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  function handleCheckoutCombined() {
    handleCheckoutCOD();
  }
};
