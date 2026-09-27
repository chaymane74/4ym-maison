import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight } from 'lucide-react';

export const FeaturedCategories: React.FC = () => {
  const { categories, setActivePage, setCategoryFilter } = useStore();

  const handleSelectCategory = (catId: string, slug: string) => {
    setCategoryFilter(catId || slug);
    setActivePage('shop');
  };

  return (
    <section className="py-20 bg-[#F5F3EF] border-b border-[#E5E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#C8A96B] font-medium mb-2">
              Collections Signatures
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-light">
              Catégories en Vedette
            </h2>
          </div>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setActivePage('shop');
            }}
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#C8A96B] transition-colors group cursor-pointer"
          >
            <span>Explorer le catalogue</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id, cat.slug)}
              className="group cursor-pointer relative bg-white border border-[#E5E1D8] overflow-hidden flex flex-col justify-end aspect-[3/4] transition-all duration-300 hover:border-[#C8A96B] shadow-sm hover:shadow-md"
            >
              {/* Category Image with fallback */}
              <div className="absolute inset-0 z-0 bg-[#EAE7E0] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to avoid broken image
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/85 via-[#111111]/25 to-transparent transition-opacity group-hover:opacity-90" />
              </div>

              {/* Text Card overlay */}
              <div className="relative z-10 p-5 sm:p-6 text-white">
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#C8A96B] mb-1 font-medium">
                  {cat.item_count ? `${cat.item_count} pièces` : 'Collection 4YM'}
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-light tracking-wide text-white group-hover:text-[#F5F3EF]">
                  {cat.name}
                </h3>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 group-hover:text-[#C8A96B] transition-colors">
                  <span>Découvrir</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
