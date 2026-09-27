import React from 'react';
import { useStore } from '../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore();
  const message = settings?.announcement_bar || 'LIVRAISON GRATUITE PARTOUT AU MAROC • PAIEMENT À LA LIVRAISON (COD)';

  return (
    <div className="bg-[#111111] text-[#C8A96B] text-[11px] sm:text-xs tracking-[0.2em] py-2 px-4 text-center font-medium uppercase border-b border-[#222222] select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <span>{message}</span>
      </div>
    </div>
  );
};
