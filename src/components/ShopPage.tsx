import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { fetchProducts } from '../services/api';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, X, RefreshCw } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { categories, categoryFilter, setCategoryFilter, searchFilter, setSearchFilter } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [specialFilter, setSpecialFilter] = useState<'all' | 'best_seller' | 'new_arrival' | 'featured'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const isWatches = categoryFilter === 'cat-watches' || categoryFilter === 'watches';
      const isGirls = categoryFilter === 'girls' || categoryFilter === 'femme';
      const isBoys = categoryFilter === 'boys' || categoryFilter === 'homme';
      const isAutresAccessoires = categoryFilter === 'autres_accessoires' || categoryFilter === 'autres-accessoires';
      const isJewelry = categoryFilter === 'cat-jewelry' || categoryFilter === 'jewelry';

      const isCol = isGirls || isBoys || isAutresAccessoires;

      const data = await fetchProducts({
        category: isWatches ? 'cat-watches' : (isJewelry ? 'cat-jewelry' : (!isCol && categoryFilter !== 'all' ? categoryFilter : undefined)),
        collection: isGirls ? 'girls' : (isBoys ? 'boys' : (isAutresAccessoires ? 'autres_accessoires' : (isWatches ? 'watches' : (isJewelry ? 'jewelry' : undefined)))),
        search: searchFilter || undefined,
        sort: sortBy,
        best_seller: specialFilter === 'best_seller' ? true : undefined,
        new_arrival: specialFilter === 'new_arrival' ? true : undefined,
        featured: specialFilter === 'featured' ? true : undefined,
        max_price: maxPrice < 2000 ? maxPrice : undefined,
      });
      setProducts(data);
    } catch (err) {
      console.error('Error fetching shop products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryFilter, searchFilter, sortBy, specialFilter, maxPrice]);

  let activeCategoryName = 'Tous les Articles';
  if (categoryFilter === 'cat-watches' || categoryFilter === 'watches') {
    activeCategoryName = 'Montres & Horlogerie';
  } else if (categoryFilter === 'girls' || categoryFilter === 'femme') {
    activeCategoryName = 'Collection Femme';
  } else if (categoryFilter === 'boys' || categoryFilter === 'homme') {
    activeCategoryName = 'Collection Homme';
  } else if (categoryFilter === 'autres_accessoires' || categoryFilter === 'autres-accessoires' || categoryFilter === 'cat-accessories') {
    activeCategoryName = 'Autres Accessoires';
  } else if (categoryFilter === 'cat-jewelry' || categoryFilter === 'jewelry') {
    activeCategoryName = 'Bijoux & Or';
  } else if (categoryFilter !== 'all') {
    activeCategoryName = categories.find(c => c.id === categoryFilter || c.slug === categoryFilter)?.name || 'Tous les Articles';
  }

  return (
    <div className="bg-[#F5F3EF] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs uppercase tracking-[0.25em] text-[#C8A96B] mb-2 font-medium">
            <span>Catalogue 4YM</span>
            <span aria-hidden="true" className="text-[#8A8A8A]">/</span>
            <span>{activeCategoryName}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#111111] tracking-wide">
            {activeCategoryName}
          </h1>

          <p className="text-xs sm:text-sm text-[#777777] mt-2 max-w-xl">
            Toutes nos pièces sont forgées avec minutie et expédiées sans frais partout au Maroc avec paiement en espèces à la livraison.
          </p>
        </div>

        {/* Filters & Control Bar */}
        <div className="bg-white border border-[#E5E1D8] p-4 sm:p-5 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Rechercher par nom, matière, référence..."
                className="w-full pl-9 pr-8 py-2 bg-[#F5F3EF]/60 border border-[#E5E1D8] text-xs text-[#111111] placeholder-[#8A8A8A] focus:outline-none focus:border-[#C8A96B]"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#111111]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Interactive Segmented Filter (Collections & Categories) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-[#111111] text-[#F5F3EF]'
                    : 'bg-[#F5F3EF] text-[#666666] hover:text-[#111111]'
                }`}
              >
                Tous ({products.length})
              </button>
              <button
                onClick={() => setCategoryFilter('watches')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'watches' || categoryFilter === 'cat-watches'
                    ? 'bg-[#111111] text-[#F5F3EF]'
                    : 'bg-[#F5F3EF] text-[#666666] hover:text-[#111111]'
                }`}
              >
                Montres & Horlogerie
              </button>
              <button
                onClick={() => setCategoryFilter('girls')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'girls' || categoryFilter === 'femme'
                    ? 'bg-[#111111] text-[#F5F3EF]'
                    : 'bg-[#F5F3EF] text-[#666666] hover:text-[#111111]'
                }`}
              >
                Collection Femme
              </button>
              <button
                onClick={() => setCategoryFilter('boys')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'boys' || categoryFilter === 'homme'
                    ? 'bg-[#111111] text-[#F5F3EF]'
                    : 'bg-[#F5F3EF] text-[#666666] hover:text-[#111111]'
                }`}
              >
                Collection Homme
              </button>
              <button
                onClick={() => setCategoryFilter('autres_accessoires')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'autres_accessoires' || categoryFilter === 'autres-accessoires' || categoryFilter === 'cat-accessories'
                    ? 'bg-[#111111] text-[#F5F3EF]'
                    : 'bg-[#F5F3EF] text-[#666666] hover:text-[#111111]'
                }`}
              >
                Autres Accessoires
              </button>
              <button
                onClick={() => setCategoryFilter('cat-jewelry')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'cat-jewelry' || categoryFilter === 'jewelry'
                    ? 'bg-[#111111] text-[#F5F3EF]'
                    : 'bg-[#F5F3EF] text-[#666666] hover:text-[#111111]'
                }`}
              >
                Bijoux & Or
              </button>
            </div>

            {/* Sort & Quick Filter Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#8A8A8A] uppercase tracking-wider hidden sm:inline">Trier :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-[#F5F3EF] border border-[#E5E1D8] text-xs text-[#111111] focus:outline-none focus:border-[#C8A96B] cursor-pointer"
                >
                  <option value="newest">Plus Récents</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="oldest">Plus Anciens</option>
                </select>
              </div>

              {/* Special Tag Filter */}
              <select
                value={specialFilter}
                onChange={(e) => setSpecialFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-[#F5F3EF] border border-[#E5E1D8] text-xs text-[#111111] focus:outline-none focus:border-[#C8A96B] cursor-pointer"
              >
                <option value="all">Toutes les Sélections</option>
                <option value="best_seller">Best Sellers</option>
                <option value="new_arrival">Nouveautés</option>
                <option value="featured">Pièces en Vedette</option>
              </select>
            </div>

          </div>

          {/* Price Range Slider */}
          <div className="mt-4 pt-3 border-t border-[#E5E1D8] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[#8A8A8A] uppercase tracking-wider">Prix max :</span>
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-32 sm:w-48 accent-[#C8A96B] cursor-pointer"
              />
              <span className="font-semibold text-[#111111] tabular-nums">
                {maxPrice < 2000 ? `${maxPrice} DH` : 'Tous les prix'}
              </span>
            </div>

            {(categoryFilter !== 'all' || searchFilter || specialFilter !== 'all' || maxPrice < 2000) && (
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setSearchFilter('');
                  setSpecialFilter('all');
                  setMaxPrice(2000);
                }}
                className="text-[11px] text-[#8A8A8A] hover:text-[#C8A96B] underline uppercase tracking-wider cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-[#C8A96B] animate-spin mx-auto mb-3" />
            <p className="font-serif text-lg text-[#111111]">Chargement de nos pièces d'exception...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center bg-white border border-[#E5E1D8] p-8">
            <p className="font-serif text-2xl text-[#111111] mb-2">Aucun article ne correspond à votre recherche</p>
            <p className="text-xs text-[#777777] max-w-md mx-auto mb-6">
              Essayez de modifier vos critères de recherche ou réinitialisez les filtres pour découvrir l'ensemble de la collection 4YM.
            </p>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setSearchFilter('');
                setSpecialFilter('all');
                setMaxPrice(2000);
              }}
              className="px-6 py-2.5 bg-[#111111] text-[#F5F3EF] hover:bg-[#C8A96B] hover:text-[#111111] text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
            >
              Afficher toute la boutique
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
