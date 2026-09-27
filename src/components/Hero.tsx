import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowUpRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const { setActivePage, setCategoryFilter } = useStore();

  const handleShopNow = () => {
    setCategoryFilter('all');
    setActivePage('shop');
  };

  const handleDiscover = () => {
    const el = document.getElementById('signature-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActivePage('shop');
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#111111] text-[#F5F3EF]">
      {/* Background Image with Measured Luxury Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_maison_editorial_1790305111031.jpg"
          alt="4YM Maison Campaign Luxury Minimalist Moroccan Editorial"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-45 scale-[1.02] transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/90 via-[#111111]/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 md:pt-36 md:pb-40">
        <div className="max-w-2xl">
          
          {/* Subtle brand kicker */}
          <div className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[#C8A96B] mb-6">
            <span>Maison de Haute Joaillerie & Accessoires</span>
            <span aria-hidden="true" className="text-[#8A8A8A]">·</span>
            <span>Maroc</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-light tracking-[0.08em] text-[#F5F3EF] leading-[1.05] text-balance mb-6">
            4YM <span className="font-extralight text-[#8A8A8A]">|</span> MAISON
          </h1>

          {/* Slogan */}
          <p className="font-serif italic text-2xl sm:text-3xl text-[#C8A96B] tracking-wide mb-5">
            Wear Your Identity.
          </p>

          {/* Short Text */}
          <p className="text-sm sm:text-base text-[#D4CFCA] leading-relaxed max-w-xl mb-10 font-normal">
            Curated pieces for those who define their own style. Confectionnées pour durer, pensées pour sublimer chaque instant. Paiement en espèces à la livraison partout au Royaume du Maroc.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={handleShopNow}
              className="px-8 py-4 bg-[#C8A96B] hover:bg-[#B09252] text-[#111111] font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-200 text-center flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-black/20"
            >
              <span>SHOP NOW</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <button
              onClick={handleDiscover}
              className="px-8 py-4 border border-[#E5E1D8]/40 hover:border-[#C8A96B] hover:text-[#C8A96B] text-[#F5F3EF] font-medium text-xs tracking-[0.2em] uppercase transition-all duration-200 text-center cursor-pointer bg-black/20 backdrop-blur-sm"
            >
              DISCOVER 4YM
            </button>
          </div>

          {/* Quick Trust Highlights */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#8A8A8A]">
            <div>
              <p className="text-[#F5F3EF] font-medium uppercase tracking-wider mb-0.5">Livraison Express</p>
              <p>24h - 48h au Maroc</p>
            </div>
            <div>
              <p className="text-[#F5F3EF] font-medium uppercase tracking-wider mb-0.5">Paiement Sécurisé</p>
              <p>En espèces à réception</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-[#F5F3EF] font-medium uppercase tracking-wider mb-0.5">Finitions Rares</p>
              <p>Dorure & cuirs nobles</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
