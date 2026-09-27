import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, StoreSettings, CartItem } from '../types';
import { fetchStoreSettings, fetchCategories } from '../services/api';

interface StoreContextType {
  settings: StoreSettings | null;
  categories: Category[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // Checkout & Modals
  codItems: { product: Product; quantity: number }[] | null;
  openCODModal: (items: { product: Product; quantity: number }[]) => void;
  closeCODModal: () => void;
  
  // Product Detail
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Navigation
  activePage: 'home' | 'shop' | 'admin';
  setActivePage: (page: 'home' | 'shop' | 'admin') => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  searchFilter: string;
  setSearchFilter: (query: string) => void;

  // Info Modals
  activeInfoModal: 'about' | 'delivery' | 'returns' | 'faq' | 'contact' | null;
  setActiveInfoModal: (modal: 'about' | 'delivery' | 'returns' | 'faq' | 'contact' | null) => void;

  // Notifications
  notification: { type: 'success' | 'error'; message: string } | null;
  showNotification: (type: 'success' | 'error', message: string) => void;
  refreshStoreData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('4ym_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
const [codItems, setCodItems] = useState<{
  product: Product;
  quantity: number;
  color?: string;
}[] | null>(null);  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Check URL parameters or hash on initial load
  const [activePage, setActivePage] = useState<'home' | 'shop' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin') || hash === '#admin' || hash.startsWith('#/admin') || search.includes('admin')) {
        return 'admin';
      }
      if (path === '/shop' || path.startsWith('/shop') || hash === '#shop' || hash.startsWith('#/shop')) {
        return 'shop';
      }
    }
    return 'home';
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeInfoModal, setActiveInfoModal] = useState<'about' | 'delivery' | 'returns' | 'faq' | 'contact' | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('4ym_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Sync browser url history cleanly
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin') || hash === '#admin' || hash.startsWith('#/admin') || search.includes('admin')) {
        setActivePage('admin');
      } else if (path === '/shop' || path.startsWith('/shop') || hash === '#shop' || hash.startsWith('#/shop')) {
        setActivePage('shop');
      } else {
        setActivePage('home');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const changePage = (page: 'home' | 'shop' | 'admin') => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetUrl = page === 'admin' ? '/admin' : (page === 'shop' ? '/shop' : '/');
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  };

  const refreshStoreData = async () => {
    try {
      const [sData, cData] = await Promise.all([
        fetchStoreSettings(),
        fetchCategories()
      ]);
      setSettings(sData);
      setCategories(cData);
    } catch (err) {
      console.error('Error fetching store settings or categories', err);
    }
  };

  useEffect(() => {
    refreshStoreData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

const addToCart = (
  product: Product,
  quantity: number = 1,
  color?: string
) => {
  if (product.stock <= 0) {
    showNotification(
      'error',
      `Désolé, "${product.name}" est actuellement en rupture de stock.`
    );
    return;
  }

  setCart(prev => {
    const existing = prev.find(
      item =>
        item.product.id === product.id &&
        item.color === color
    );

    if (existing) {
      const newQty = Math.min(
        product.stock,
        existing.quantity + quantity
      );

      return prev.map(item =>
        item.product.id === product.id &&
        item.color === color
          ? { ...item, quantity: newQty }
          : item
      );
    }

    return [
      ...prev,
      {
        product,
        quantity: Math.min(product.stock, quantity),
        color,
      },
    ];
  });

  showNotification(
    'success',
    `"${product.name}" ajouté à votre panier`
  );

  setIsCartOpen(true);
};

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const maxQty = Math.min(item.product.stock, quantity);
          return { ...item, quantity: maxQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const openCODModal = (items: { product: Product; quantity: number }[]) => {
    setCodItems(items);
  };

  const closeCODModal = () => {
    setCodItems(null);
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        codItems,
        openCODModal,
        closeCODModal,
        selectedProduct,
        setSelectedProduct,
        activePage,
        setActivePage: changePage,
        categoryFilter,
        setCategoryFilter,
        searchFilter,
        setSearchFilter,
        activeInfoModal,
        setActiveInfoModal,
        notification,
        showNotification,
        refreshStoreData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
