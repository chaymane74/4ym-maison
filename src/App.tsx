import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { ShopPage } from './components/ShopPage';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CODModal } from './components/CODModal';
import { CartDrawer } from './components/CartDrawer';
import { InfoModal } from './components/InfoModal';
import { AdminDashboard } from './admin/AdminDashboard';
import { MessageCircle, CheckCircle2, AlertCircle, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activePage, notification, settings } = useStore();

  const whatsappNumber = (settings?.whatsapp_number || '+212637898783').replace(/[^\d+]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(
    'Bonjour 4YM Maison, je souhaite avoir des renseignements sur vos collections.'
  )}`;

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#111111] flex flex-col selection:bg-[#C8A96B] selection:text-white">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 shadow-xl border flex items-center gap-3 text-xs font-medium max-w-sm ${
              notification.type === 'success'
                ? 'bg-[#111111] text-[#F5F3EF] border-[#C8A96B]'
                : 'bg-red-950 text-red-100 border-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#C8A96B] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Routing View */}
      {activePage === 'admin' ? (
        <AdminDashboard />
      ) : (
        <>
          <AnnouncementBar />
          <Navbar />

          <main className="flex-1">
            {activePage === 'shop' ? <ShopPage /> : <HomePage />}
          </main>

          <Footer />

          {/* Floating WhatsApp Quick Concierge (Essential for Moroccan Customers) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-30 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group cursor-pointer"
            aria-label="WhatsApp Concierge"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-semibold tracking-wider uppercase">
              Assistance WhatsApp
            </span>
          </a>

          {/* Global Modals & Drawers */}
          <ProductDetailModal />
          <CODModal />
          <CartDrawer />
          <InfoModal />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
