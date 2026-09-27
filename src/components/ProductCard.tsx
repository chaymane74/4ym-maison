import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Eye, ShoppingBag, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openCODModal, setSelectedProduct } = useStore();

  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
    : 0;

  const handleQuickCOD = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    openCODModal([{ product, quantity: 1 }]);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  const primaryImage = product.image1 || product.images?.[0] || '/src/assets/images/category_new_arrivals_1790305160934.jpg';
  const secondaryImage = product.image2 || product.images?.[1] || primaryImage;

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group flex flex-col bg-white border border-[#E5E1D8] overflow-hidden hover:border-[#C8A96B] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] bg-[#F5F3EF] overflow-hidden">
        {/* Subtle status tag (Zero-pill discipline: quiet unboxed text) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 text-[11px] font-medium tracking-wider uppercase pointer-events-none">
          {isOutOfStock ? (
            <span className="bg-[#111111] text-white px-2 py-0.5">Rupture</span>
          ) : (
            <>
              {product.best_seller && (
                <span className="bg-[#111111] text-[#C8A96B] px-2 py-0.5">Best Seller</span>
              )}
              {product.new_arrival && (
                <span className="bg-[#F5F3EF] text-[#111111] border border-[#E5E1D8] px-2 py-0.5">Nouveau</span>
              )}
              {hasDiscount && (
                <span className="bg-[#C8A96B] text-[#111111] font-semibold px-2 py-0.5">
                  -{discountPercent}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Primary Product Image */}
        <img
          src={primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
            secondaryImage && secondaryImage !== primaryImage ? 'group-hover:opacity-0' : ''
          }`}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Secondary Angle Product Image (Smooth fade-in on hover) */}
        {secondaryImage && secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} - Vue 2`}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="flex-1 py-2 px-3 bg-white/90 hover:bg-white text-[#111111] text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors"
            title="Aperçu rapide"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Voir</span>
          </button>

          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="py-2 px-3 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Ajouter au panier"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-[11px] text-[#8A8A8A] uppercase tracking-wider mb-1">
            <span>{product.category_name || '4YM Maison'}</span>
            <span className="font-mono text-[10px] text-[#B0AAA0]">{product.sku}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-lg text-[#111111] font-medium leading-snug group-hover:text-[#C8A96B] transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-2.5 mb-3">
            <span className="text-base sm:text-lg font-semibold text-[#111111] tabular-nums tracking-tight">
              {product.price} DH
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#8A8A8A] line-through tabular-nums">
                {product.old_price} DH
              </span>
            )}
          </div>

          {/* Direct Buy Button (Cash on Delivery) */}
          <button
            onClick={handleQuickCOD}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 text-xs uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-[#EAE7E0] text-[#8A8A8A] cursor-not-allowed'
                : 'bg-[#111111] hover:bg-[#C8A96B] text-[#F5F3EF] hover:text-[#111111]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Épuisé' : 'Commander (COD)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
