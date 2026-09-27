import React, { useState, useEffect } from 'react';
import { Hero } from './Hero';
import { FeaturedCategories } from './FeaturedCategories';
import { ProductCard } from './ProductCard';
import { BrandStory } from './BrandStory';
import { InstagramSection } from './InstagramSection';
import { Product } from '../types';
import { fetchProducts } from '../services/api';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setActivePage, setCategoryFilter } = useStore();
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeProducts = async () => {
      try {
        setIsLoading(true);
        const [arrivals, best] = await Promise.all([
          fetchProducts({ new_arrival: true, sort: 'newest' }),
          fetchProducts({ best_seller: true, sort: 'newest' }),
        ]);
        setNewArrivals(arrivals.slice(0, 4));
        setBestSellers(best.slice(0, 4));
      } catch (err) {
        console.error('Error loading home products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHomeProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* New Arrivals Section */}
      <section className="py-20 bg-white border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#C8A96B] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Collection Actuelle</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-light">
                Dernières Nouveautés
              </h2>
            </div>

            <button
              onClick={() => {
                setCategoryFilter('all');
                setActivePage('shop');
              }}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#C8A96B] transition-colors group cursor-pointer"
            >
              <span>Voir toutes les nouveautés</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-20 bg-[#F5F3EF] border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#C8A96B] font-semibold mb-2">
                <Flame className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Les Préférés de nos Clients</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-light">
                Best Sellers 4YM
              </h2>
            </div>

            <button
              onClick={() => {
                setCategoryFilter('all');
                setActivePage('shop');
              }}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#C8A96B] transition-colors group cursor-pointer"
            >
              <span>Découvrir la sélection</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* 4YM Signature & Why 4YM */}
      <BrandStory />

      {/* Instagram Section */}
      <InstagramSection />
    </div>
  );
};
