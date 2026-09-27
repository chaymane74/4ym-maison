import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import logo from '../assets/images/logo.png';

export const Navbar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    categoryFilter,
    setCategoryFilter,
    cartCount,
    setIsCartOpen,
    searchFilter,
    setSearchFilter,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (page: 'home' | 'shop', category?: string) => {
    setActivePage(page);

    if (category !== undefined) {
      setCategoryFilter(category);
    }

    setIsMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activePage !== 'shop') {
      setActivePage('shop');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F5F3EF]/95 backdrop-blur-md border-b border-[#E5E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <button
            onClick={() => handleNavClick('home', 'all')}
            className="flex items-center cursor-pointer focus:outline-none"
            aria-label="4YM | Maison Accueil"
          >
            <img
              src={logo}
              alt="4YM | Maison"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </button>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-7 text-xs uppercase tracking-[0.14em] font-medium text-[#111111]">

            <button
              onClick={() => handleNavClick('home', 'all')}
              className={`hover:text-[#C8A96B] py-1 ${
                activePage === 'home'
                  ? 'text-[#C8A96B] border-b border-[#C8A96B]'
                  : ''
              }`}
            >
              Accueil
            </button>

            <button
              onClick={() => handleNavClick('shop', 'all')}
              className={`hover:text-[#C8A96B] py-1 ${
                activePage === 'shop' && categoryFilter === 'all'
                  ? 'text-[#C8A96B] border-b border-[#C8A96B]'
                  : ''
              }`}
            >
              Boutique
            </button>

            <button
              onClick={() => handleNavClick('shop', 'watches')}
              className="hover:text-[#C8A96B] py-1 whitespace-nowrap"
            >
              Montres
            </button>

            <button
              onClick={() => handleNavClick('shop', 'girls')}
              className="hover:text-[#C8A96B] py-1 whitespace-nowrap"
            >
              Collection Femme
            </button>

            <button
              onClick={() => handleNavClick('shop', 'boys')}
              className="hover:text-[#C8A96B] py-1 whitespace-nowrap"
            >
              Collection Homme
            </button>

            <button
              onClick={() => handleNavClick('shop', 'autres_accessoires')}
              className="hover:text-[#C8A96B] py-1 whitespace-nowrap"
            >
              Autres Accessoires
            </button>

            <button
              onClick={() => handleNavClick('shop', 'cat-jewelry')}
              className="hover:text-[#C8A96B] py-1 whitespace-nowrap"
            >
              Bijoux & Or
            </button>

          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-4 sm:gap-6">

            {/* SEARCH */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[#111111] hover:text-[#C8A96B]"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* CART */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#111111] hover:text-[#C8A96B] flex items-center gap-2"
              aria-label={`Panier (${cartCount} articles)`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />

              <span className="text-xs uppercase tracking-widest font-medium hidden sm:inline">
                Panier
              </span>

              {cartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#111111] text-[#C8A96B] text-[10px] font-semibold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* MOBILE MENU */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-[#111111] hover:text-[#C8A96B]"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[1.5]" />
              )}
            </button>

          </div>
        </div>

        {/* SEARCH BAR */}
        {isSearchOpen && (
          <div className="py-4 border-t border-[#E5E1D8]">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center"
            >
              <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3" />

              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Rechercher une pièce d'exception..."
                className="w-full pl-10 pr-24 py-2.5 bg-white border border-[#E5E1D8] text-sm focus:outline-none focus:border-[#C8A96B]"
                autoFocus
              />

              <button
                type="submit"
                className="absolute right-2 px-3 py-1 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-wider hover:bg-[#C8A96B]"
              >
                Explorer
              </button>
            </form>
          </div>
        )}

      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#F5F3EF] border-b border-[#E5E1D8] px-6 py-6 shadow-xl">

          <div className="flex flex-col space-y-3 text-sm uppercase tracking-[0.2em] font-medium">

            <button
              onClick={() => handleNavClick('home', 'all')}
              className="text-left py-2 border-b border-[#E5E1D8]/60 hover:text-[#C8A96B]"
            >
              Accueil
            </button>

            <button
              onClick={() => handleNavClick('shop', 'all')}
              className="text-left py-2 border-b border-[#E5E1D8]/60 hover:text-[#C8A96B]"
            >
              Toute la Boutique
            </button>

            <button
              onClick={() => handleNavClick('shop', 'watches')}
              className="text-left py-2 border-b border-[#E5E1D8]/60 hover:text-[#C8A96B]"
            >
              Montres & Horlogerie
            </button>

            <button
              onClick={() => handleNavClick('shop', 'girls')}
              className="text-left py-2 border-b border-[#E5E1D8]/60 hover:text-[#C8A96B]"
            >
              Collection Femme
            </button>

            <button
              onClick={() => handleNavClick('shop', 'boys')}
              className="text-left py-2 border-b border-[#E5E1D8]/60 hover:text-[#C8A96B]"
            >
              Collection Homme
            </button>

            <button
              onClick={() => handleNavClick('shop', 'autres_accessoires')}
              className="text-left py-2 border-b border-[#E5E1D8]/60 hover:text-[#C8A96B]"
            >
              Autres Accessoires
            </button>

            <button
              onClick={() => handleNavClick('shop', 'cat-jewelry')}
              className="text-left py-2 border-b border-[#E5E1D8]/60 hover:text-[#C8A96B]"
            >
              Bijoux & Or
            </button>

          </div>
        </div>
      )}
    </header>
  );
};