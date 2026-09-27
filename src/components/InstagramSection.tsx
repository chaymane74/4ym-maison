import React from 'react';
import { useStore } from '../context/StoreContext';
import { Instagram, ArrowUpRight } from 'lucide-react';

export const InstagramSection: React.FC = () => {
  const { settings } = useStore();
  const handle = settings?.instagram_handle || '@4ym.store';
  const url = settings?.instagram_url || 'https://instagram.com/4ym.store';

  const feedImages = [
    /*{
      src: '/src/assets/images/hero_maison_editorial_1790305111031.jpg',
      caption: 'L\'attitude 4YM · Automne 2026',
    },*/
     /*{
      src: '/src/assets/images/product_jewelry_gold_1790305123135.jpg',
      caption: 'L\'or sculpté à la main sur travertin naturel',
    },*/
    /*{
      src: '/src/assets/images/product_watch_minimalist_1790305134956.jpg',
      caption: 'Obsidian Noir & Or · Précision intemporelle',
    },*/
    /*{
      src: '/src/assets/images/product_accessories_leather_1790305146669.jpg',
      caption: 'Maroquinerie d\'exception confectionnée au Maroc',
    },*/
     /*{
      src: '/src/assets/images/category_new_arrivals_1790305160934.jpg',
      caption: 'Détails & Chaînes dorées · Nouvelle collection',
    },*/
  ];

  return (
    <section className="py-20 bg-[#F5F3EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C8A96B] font-semibold mb-2">
          <Instagram className="w-4 h-4" />
          <span>Communauté 4YM</span>
        </div>

        <h3 className="font-serif text-3xl sm:text-4xl text-[#111111] font-light mb-3">
          FOLLOW {handle.toUpperCase()}
        </h3>

        <p className="text-xs text-[#8A8A8A] max-w-md mx-auto mb-6">
          Rejoignez l'univers 4YM Maison sur Instagram. Découvrez nos campagnes, aperçus d'atelier et looks de notre communauté.
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E5E1D8] hover:border-[#C8A96B] hover:text-[#C8A96B] text-[#111111] text-xs uppercase tracking-[0.18em] font-semibold transition-colors"
        >
          <span>Visiter le profil {handle}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Visual Feed Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {feedImages.map((post, idx) => (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square bg-[#EAE7E0] overflow-hidden border border-[#E5E1D8] block"
          >
            <img
              src={post.src}
              alt={post.caption}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#111111]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-white text-center">
              <Instagram className="w-6 h-6 text-[#C8A96B] mb-2" />
              <p className="text-[10px] uppercase tracking-wider line-clamp-2">{post.caption}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
