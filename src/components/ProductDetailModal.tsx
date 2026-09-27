import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { X, ShoppingBag, Zap, Check, Truck, Shield, RefreshCw } from 'lucide-react';
import { fetchProductByIdentifier } from '../services/api';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, openCODModal } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);

    if (selectedProduct) {
      setIsLoadingRelated(true);
      fetchProductByIdentifier(selectedProduct.slug || selectedProduct.id)
        .then((res) => {
          setRelatedProducts(res.related || []);
        })
        .catch(() => setRelatedProducts([]))
        .finally(() => setIsLoadingRelated(false));
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isOutOfStock = selectedProduct.stock <= 0 || selectedProduct.status === 'out_of_stock';
  const hasDiscount = selectedProduct.old_price && selectedProduct.old_price > selectedProduct.price;
  const discountPercent = hasDiscount
    ? Math.round(((selectedProduct.old_price! - selectedProduct.price) / selectedProduct.old_price!) * 100)
    : 0;

  const handleOrderNow = () => {
    if (isOutOfStock) return;
    openCODModal([{ product: selectedProduct, quantity }]);
    setSelectedProduct(null);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(selectedProduct, quantity);
  };

  const img1 = selectedProduct.image1 || selectedProduct.images?.[0] || '/src/assets/images/category_new_arrivals_1790305160934.jpg';
  const img2 = selectedProduct.image2 || selectedProduct.images?.[1] || img1;
  const images = img1 === img2 ? [img1] : [img1, img2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#F5F3EF] border border-[#E5E1D8] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-[#111111] transition-colors cursor-pointer border border-[#E5E1D8]"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          
          {/* Gallery Column */}
          <div className="p-6 bg-white border-b md:border-b-0 md:border-r border-[#E5E1D8] flex flex-col justify-between">
            <div>
              {/* Main Image */}
              <div className="relative aspect-square bg-[#F5F3EF] overflow-hidden mb-4 border border-[#E5E1D8]">
                <img
                  src={images[selectedImageIndex] || images[0]}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 text-[11px] font-semibold tracking-wider uppercase">
                  {selectedProduct.best_seller && (
                    <span className="bg-[#111111] text-[#C8A96B] px-2 py-0.5">Best Seller</span>
                  )}
                  {hasDiscount && (
                    <span className="bg-[#C8A96B] text-[#111111] px-2 py-0.5">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 shrink-0 border overflow-hidden transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[#C8A96B] ring-1 ring-[#C8A96B]'
                          : 'border-[#E5E1D8] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${selectedProduct.name} ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-[#111111]/80 text-[9px] text-white text-center py-0.5 font-mono">
                        Vue {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Authenticity Notice */}
            <div className="mt-6 pt-4 border-t border-[#E5E1D8] text-[11px] text-[#8A8A8A] leading-relaxed">
              <span className="text-[#111111] font-semibold">Atelier 4YM :</span> Chaque création fait l'objet d'un contrôle rigoureux de finition. Livrée dans son écrin protecteur velours noir.
            </div>
          </div>

          {/* Product Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-[#8A8A8A] uppercase tracking-[0.2em] mb-2">
                <span>{selectedProduct.category_name || '4YM Maison'}</span>
                <span className="font-mono text-[11px]">{selectedProduct.sku}</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-wide mb-3">
                {selectedProduct.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-semibold text-[#111111] tabular-nums">
                  {selectedProduct.price} DH
                </span>
                {hasDiscount && (
                  <span className="text-sm text-[#8A8A8A] line-through tabular-nums">
                    {selectedProduct.old_price} DH
                  </span>
                )}
                <span className="text-xs text-[#C8A96B] font-medium uppercase tracking-wider ml-auto">
                  TVA incluse
                </span>
              </div>

              {/* Stock Status */}
              <div className="mb-6 flex items-center gap-2 text-xs">
                {isOutOfStock ? (
                  <span className="text-red-700 font-medium">● Actuellement en rupture de stock</span>
                ) : selectedProduct.stock <= 5 ? (
                  <span className="text-amber-700 font-medium">● Dernières pièces disponibles ({selectedProduct.stock} en stock)</span>
                ) : (
                  <span className="text-emerald-700 font-medium">● En stock ({selectedProduct.stock} unités prêtes à expédier)</span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#444444] leading-relaxed mb-6">
                {selectedProduct.description}
              </p>

              {/* Details Bullet Points */}
              {selectedProduct.details && selectedProduct.details.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#111111] mb-2">
                    Caractéristiques & Matières :
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#666666]">
                    {selectedProduct.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#C8A96B] shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs uppercase tracking-wider font-medium text-[#111111]">
                    Quantité :
                  </span>
                  <div className="flex items-center border border-[#E5E1D8] bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-sm hover:bg-[#F5F3EF] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-xs font-semibold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      className="px-3 py-1 text-sm hover:bg-[#F5F3EF] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mb-8">
                {/* Primary Buy Button: COD */}
                <button
                  onClick={handleOrderNow}
                  disabled={isOutOfStock}
                  className={`w-full py-4 px-6 text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isOutOfStock
                      ? 'bg-[#EAE7E0] text-[#8A8A8A] cursor-not-allowed'
                      : 'bg-[#111111] hover:bg-[#C8A96B] text-[#F5F3EF] hover:text-[#111111]'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>COMMANDER / ORDER NOW</span>
                </button>

                {/* Secondary Button: Add to Cart */}
                {!isOutOfStock && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 px-6 border border-[#111111] hover:border-[#C8A96B] hover:text-[#C8A96B] text-[#111111] text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer bg-transparent"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Ajouter au Panier</span>
                  </button>
                )}
              </div>

              {/* Delivery & Reassurance */}
              <div className="border-t border-[#E5E1D8] pt-4 space-y-2 text-xs text-[#666666]">
                <div className="flex items-center gap-2 font-medium text-[#111111]">
                  <Truck className="w-4 h-4 text-[#C8A96B]" />
                  <span>🚚 Livraison gratuite au Maroc sous 24h à 48h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C8A96B]" />
                  <span>Paiement en espèces à la livraison (Cash on Delivery)</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#C8A96B]" />
                  <span>Échange garanti sous 7 jours si non conforme</span>
                </div>
              </div>

            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#E5E1D8]">
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] mb-3">
                  VOUS AIMEREZ AUSSI
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {relatedProducts.slice(0, 2).map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => setSelectedProduct(rel)}
                      className="group cursor-pointer flex items-center gap-2.5 bg-white p-2 border border-[#E5E1D8] hover:border-[#C8A96B]"
                    >
                      <img
                        src={rel.images[0]}
                        alt={rel.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-medium text-[#111111] truncate group-hover:text-[#C8A96B]">
                          {rel.name}
                        </p>
                        <p className="text-[11px] font-semibold text-[#C8A96B] tabular-nums">
                          {rel.price} DH
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
