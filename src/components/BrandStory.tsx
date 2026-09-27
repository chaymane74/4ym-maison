import React from 'react';
import { Truck, Sparkles, ShieldCheck, Headphones } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <div>
      {/* 4YM Signature Section */}
      <section id="signature-section" className="py-24 bg-[#111111] text-[#F5F3EF] border-y border-[#222222] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-block text-xs uppercase tracking-[0.3em] text-[#C8A96B] font-medium mb-4">
            L'Âme de la Maison
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-[0.08em] text-[#F5F3EF] mb-8 leading-tight">
            MORE THAN AN ACCESSORY.
          </h2>

          <div className="w-16 h-px bg-[#C8A96B] mx-auto mb-8" />

          <blockquote className="font-serif italic text-xl sm:text-2xl text-[#E5E1D8] max-w-3xl mx-auto font-light leading-relaxed mb-8">
            "At 4YM, we believe style is more than what you wear. It's how you express who you are."
          </blockquote>

          <p className="text-sm sm:text-base text-[#8A8A8A] max-w-2xl mx-auto leading-relaxed font-light">
            Née de la rencontre entre le savoir-faire ancestral des artisans marocains et les lignes architecturales de la haute joaillerie contemporaine, chaque pièce 4YM incarne une affirmation d'élégance audacieuse et intemporelle.
          </p>
        </div>
      </section>

      {/* Why 4YM Section */}
      <section className="py-20 bg-[#FAF9F6] border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C8A96B] font-medium block mb-2">
              L'Expérience 4YM
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#111111] font-light">
              Pourquoi Choisir 4YM | Maison
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* 1. Livraison gratuite au Maroc */}
            <div className="p-6 bg-white border border-[#E5E1D8] text-center hover:border-[#C8A96B] transition-colors">
              <div className="w-12 h-12 bg-[#F5F3EF] text-[#111111] flex items-center justify-center mx-auto mb-5">
                <Truck className="w-5 h-5 text-[#C8A96B]" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] font-medium mb-2">
                Livraison Gratuite
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Partout au Maroc en 24h à 48h. Suivi personnalisé et livraison soignée à domicile ou au bureau.
              </p>
            </div>

            {/* 2. Curated Selection */}
            <div className="p-6 bg-white border border-[#E5E1D8] text-center hover:border-[#C8A96B] transition-colors">
              <div className="w-12 h-12 bg-[#F5F3EF] text-[#111111] flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-5 h-5 text-[#C8A96B]" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] font-medium mb-2">
                Curated Selection
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Des séries limitées triées sur le volet. Métaux précieux traités, cuirs nobles et finitions irréprochables.
              </p>
            </div>

            {/* 3. Secure Ordering (COD) */}
            <div className="p-6 bg-white border border-[#E5E1D8] text-center hover:border-[#C8A96B] transition-colors">
              <div className="w-12 h-12 bg-[#F5F3EF] text-[#111111] flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-5 h-5 text-[#C8A96B]" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] font-medium mb-2">
                Paiement COD Sécurisé
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Réglez en espèces directement à la livraison après avoir inspecté votre colis en toute confiance.
              </p>
            </div>

            {/* 4. Customer Support */}
            <div className="p-6 bg-white border border-[#E5E1D8] text-center hover:border-[#C8A96B] transition-colors">
              <div className="w-12 h-12 bg-[#F5F3EF] text-[#111111] flex items-center justify-center mx-auto mb-5">
                <Headphones className="w-5 h-5 text-[#C8A96B]" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] font-medium mb-2">
                Support Dédié 7j/7
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Notre conciergerie est disponible par WhatsApp et appel pour vous assister avant et après votre achat.
              </p>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
