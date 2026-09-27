import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Product,
  Category,
  Order,
  StoreSettings,
  OrderStatus,
  AdminUser,
} from '../types';
import {
  loginAdmin,
  getAdminToken,
  clearAdminToken,
  fetchAdminStats,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  fetchAdminOrders,
  updateAdminOrderStatus,
  deleteAdminOrder,
  fetchAdminSettings,
  updateAdminSettings,
  uploadAdminProductImage,
  registerAdminRequest,
  fetchPendingAdminUsers,
  approveAdminUser,
  rejectAdminUser,
} from '../services/api';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
  MessageCircle,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Boxes,
  Eye,
  X,
  Calendar,
  Phone,
  MapPin,
  Check,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Users,
  UserCheck,
} from 'lucide-react';

const COLLECTION_OPTIONS = [
  { id: 'watches', label: 'Montres & Horlogerie' },
  { id: 'girls', label: 'Collection Femme' },
  { id: 'boys', label: 'Collection Homme' },
  { id: 'autres_accessoires', label: 'Autres Accessoires' },
  { id: 'cat-jewelry', label: 'Bijoux & Or' },
];

export const AdminDashboard: React.FC = () => {
  const { setActivePage, showNotification, refreshStoreData } = useStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getAdminToken());
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register State
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'categories' | 'settings' | 'requests'>('orders');

  // Pending Admin Users State
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [isLoadingPendingUsers, setIsLoadingPendingUsers] = useState(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  // Overview Stats
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Orders State & Status Tabs
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusTab, setOrderStatusTab] = useState<'all' | OrderStatus>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [orderCityFilter, setOrderCityFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Confirmation view inside admin after clicking "CONFIRM ORDER"
  const [confirmedSuccessOrder, setConfirmedSuccessOrder] = useState<Order | null>(null);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: 450,
    old_price: '',
    category_id: '',
    stock: 10,
    sku: '',
    details: '',
    tags: '',
    collections: [] as string[],
    featured: false,
    best_seller: false,
    new_arrival: true,
    status: 'active' as 'active' | 'draft' | 'out_of_stock',
    image1: '',
    image2: '',
  });
  const [imageError, setImageError] = useState('');
  const [isUploadingImage1, setIsUploadingImage1] = useState(false);
  const [isUploadingImage2, setIsUploadingImage2] = useState(false);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    image: '',
    status: 'active' as 'active' | 'hidden',
  });

  // Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load data
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab, orderStatusTab, orderSearch, orderDateFilter, orderCityFilter]);

  const loadData = async () => {
    try {
      // Always fetch stats for live badge counts and pending admin accounts
      const [st, pendingList] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchPendingAdminUsers().catch(() => []),
      ]);
      if (st) setStats(st);
      setPendingUsers(pendingList);

      if (activeTab === 'requests') {
        setIsLoadingPendingUsers(true);
        try {
          const list = await fetchPendingAdminUsers();
          setPendingUsers(list);
        } finally {
          setIsLoadingPendingUsers(false);
        }
      }

      if (activeTab === 'orders' || activeTab === 'overview') {
        const ords = await fetchAdminOrders({
          status: orderStatusTab !== 'all' ? orderStatusTab : undefined,
          search: orderSearch || undefined,
          date: orderDateFilter || undefined,
          city: orderCityFilter !== 'all' ? orderCityFilter : undefined,
        });
        setOrders(ords);
      }

      if (activeTab === 'products') {
        const [prods, cats] = await Promise.all([
          fetchAdminProducts({
            category: productCategoryFilter !== 'all' ? productCategoryFilter : undefined,
            search: productSearch || undefined,
            status: productStatusFilter !== 'all' ? productStatusFilter : undefined,
          }),
          fetchAdminCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
      }

      if (activeTab === 'categories') {
        const cats = await fetchAdminCategories();
        setCategories(cats);
      }

      if (activeTab === 'settings') {
        const sett = await fetchAdminSettings();
        setStoreSettings(sett);
      }
    } catch (err: any) {
      if (err.message?.includes('non autorisé') || err.message?.includes('expirée')) {
        handleLogout();
      }
      console.error('Error loading admin data:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await loginAdmin(loginEmail, loginPassword);
      setIsAuthenticated(true);
      showNotification('success', 'Connexion réussie au panneau 4YM | Maison');
    } catch (err: any) {
      setLoginError(err.message || 'Identifiants administrateur incorrects.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    // Client-side validation
    if (!registerName.trim()) {
      setRegisterError('Veuillez saisir votre nom complet.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registerEmail.trim() || !emailRegex.test(registerEmail.trim())) {
      setRegisterError('Veuillez saisir une adresse email valide.');
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await registerAdminRequest(
        registerName.trim(),
        registerEmail.trim().toLowerCase(),
        registerPassword
      );
      setRegisterSuccess(
        res.message || "Votre demande a été envoyée. Votre compte est en attente d'approbation par l'administrateur."
      );
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
    } catch (err: any) {
      setRegisterError(err.message || "Erreur lors de l'enregistrement de votre demande.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleApproveUser = async (id: string, name: string) => {
    setProcessingUserId(id);
    try {
      await approveAdminUser(id);
      showNotification('success', `Le compte de ${name} a été approuvé avec succès.`);
      const updated = await fetchPendingAdminUsers();
      setPendingUsers(updated);
    } catch (err: any) {
      showNotification('error', err.message || "Erreur lors de l'approbation du compte.");
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleRejectUser = async (id: string, name: string) => {
    setProcessingUserId(id);
    try {
      await rejectAdminUser(id);
      showNotification('success', `La demande de ${name} a été refusée.`);
      const updated = await fetchPendingAdminUsers();
      setPendingUsers(updated);
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur lors du refus du compte.');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    showNotification('success', 'Déconnexion effectuée');
  };

  // WhatsApp Contact Generator with Customer Name, Order ID, Product, Total, and Confirmation Request
  const getWhatsAppLink = (order: Order) => {
    const rawPhone = order.phone.replace(/[\s\-\.]/g, '');
    let fullPhone = rawPhone;
    if (rawPhone.startsWith('0')) {
      fullPhone = '212' + rawPhone.slice(1);
    } else if (rawPhone.startsWith('+')) {
      fullPhone = rawPhone.replace('+', '');
    }

    const productNames = order.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ');
    const message = encodeURIComponent(
      `Bonjour ${order.customer_name},\n\nNous vous contactons de la part de 4YM | Maison concernant votre commande #${order.order_number}.\n\nArticle(s) : ${productNames}\nMontant total : ${order.total} DH (Paiement à la livraison)\nVille : ${order.city}\n\nNous souhaitons confirmer votre commande afin de planifier l'expédition avec notre livreur.`
    );

    return `https://wa.me/${fullPhone}?text=${message}`;
  };

  // Status Change Workflow
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await updateAdminOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      // Reload stats for live badges
      const st = await fetchAdminStats();
      setStats(st);
      showNotification('success', `Commande #${updated.order_number} passée au statut : ${newStatus}`);
      return updated;
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur mise à jour statut');
      return null;
    }
  };

  // Primary Confirmation Workflow: Click large "CONFIRM ORDER" -> New -> Confirmed + Confirmation Screen
  const handleConfirmOrder = async (order: Order) => {
    const updated = await handleUpdateStatus(order.id, 'Confirmed');
    if (updated) {
      setConfirmedSuccessOrder(updated);
      setSelectedOrder(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Confirmer la suppression de cette commande ?')) return;
    try {
      await deleteAdminOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      const st = await fetchAdminStats();
      setStats(st);
      showNotification('success', 'Commande supprimée avec succès');
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur suppression');
    }
  };

  // Luxury brand preset visuals available for quick 1-click selection
  const LUXURY_PRESET_IMAGES = [
    { label: 'Manchette Or 18k Sculpté', url: '/src/assets/images/product_jewelry_gold_1790305123135.jpg' },
    { label: 'Campagne Écrin Nouveautés', url: '/src/assets/images/category_new_arrivals_1790305160934.jpg' },
    { label: 'Montre Obsidian Noir & Or', url: '/src/assets/images/product_watch_minimalist_1790305134956.jpg' },
    { label: 'Éditorial Maison Riad', url: '/src/assets/images/hero_maison_editorial_1790305111031.jpg' },
    { label: 'Maroquinerie Sahara Cuir', url: '/src/assets/images/product_accessories_leather_1790305146669.jpg' },
    { label: 'Porte-Cartes Détail Ouvert', url: '/src/assets/images/prod_wallet_detail_1790306821884.jpg' },
    { label: 'Collier Arch Porté Soie', url: '/src/assets/images/prod_necklace_look_1790306834526.jpg' },
    { label: 'Lunettes Aviator Profil Or', url: '/src/assets/images/prod_sun_angle_1790306846036.jpg' },
  ];

  // Image Upload Handler with format and size validation
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image1' | 'image2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    // Formats acceptés : JPG / JPEG, PNG, WEBP
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validExtensions = /\.(jpe?g|png|webp)$/i;

    if (!validMimeTypes.includes(file.type) && !validExtensions.test(file.name)) {
      const errMsg = 'Format non supporté. Veuillez sélectionner une image au format JPG, PNG ou WEBP.';
      setImageError(errMsg);
      showNotification('error', errMsg);
      e.target.value = '';
      return;
    }

    // Taille maximale recommandée : 8 Mo
    const maxSizeBytes = 8 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errMsg = 'Image trop volumineuse. La taille maximale recommandée est de 8 Mo.';
      setImageError(errMsg);
      showNotification('error', errMsg);
      e.target.value = '';
      return;
    }

    const setUploading = target === 'image1' ? setIsUploadingImage1 : setIsUploadingImage2;
    setUploading(true);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier image'));
        reader.readAsDataURL(file);
      });

      const res = await uploadAdminProductImage(base64Data, file.name);
      setProductForm(prev => ({
        ...prev,
        [target]: res.url,
      }));
      setImageError('');
      showNotification('success', target === 'image1' ? 'Image 1 téléchargée avec succès' : 'Image 2 téléchargée avec succès');
    } catch (err: any) {
      const errMsg = err.message || 'Erreur lors du téléchargement de l\'image';
      setImageError(errMsg);
      showNotification('error', errMsg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Product Actions
  const openAddProductModal = () => {
    setEditingProduct(null);
    setImageError('');
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: 450,
      old_price: '',
      category_id: categories[0]?.id || 'cat-jewelry',
      stock: 10,
      sku: `4YM-${Date.now().toString().slice(-4)}`,
      details: 'Finition or 18 carats\nFait main au Maroc\nHypoallergénique\nÉcrin velours inclus',
      tags: 'or, bijou, luxe',
      collections: [],
      featured: true,
      best_seller: false,
      new_arrival: true,
      status: 'active',
      image1: '',
      image2: '',
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setImageError('');
    const img1 = prod.image1 || (prod.images && prod.images[0]) || '';
    const img2 = prod.image2 || (prod.images && prod.images[1]) || '';
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      price: prod.price,
      old_price: prod.old_price ? String(prod.old_price) : '',
      category_id: prod.category_id,
      stock: prod.stock,
      sku: prod.sku,
      details: (prod.details || []).join('\n'),
      tags: (prod.tags || []).join(', '),
      collections: prod.collections || [],
      featured: prod.featured,
      best_seller: prod.best_seller,
      new_arrival: prod.new_arrival,
      status: prod.status,
      image1: img1,
      image2: img2,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageError('');

    // Strict validation: Both images are required
    const img1 = productForm.image1?.trim();
    const img2 = productForm.image2?.trim();

    if (!img1 || !img2) {
      const errMsg = 'Please upload both product images.';
      setImageError(errMsg);
      showNotification('error', errMsg);
      return;
    }

    try {
      const payload = {
        ...productForm,
        collections: productForm.collections || [],
        image1: img1,
        image2: img2,
        images: [img1, img2],
        price: Number(productForm.price),
        old_price: productForm.old_price ? Number(productForm.old_price) : null,
        stock: Number(productForm.stock),
        details: productForm.details.split('\n').filter(Boolean),
        tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        showNotification('success', 'Produit mis à jour avec succès');
      } else {
        await createAdminProduct(payload);
        showNotification('success', 'Nouveau produit créé et publié');
      }

      setIsProductModalOpen(false);
      loadData();
      refreshStoreData();
    } catch (err: any) {
      const msg = err.message || 'Erreur sauvegarde';
      setImageError(msg);
      showNotification('error', msg);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Confirmer la suppression de "${name}" ?`)) return;
    try {
      await deleteAdminProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showNotification('success', `Produit "${name}" supprimé`);
      refreshStoreData();
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur suppression');
    }
  };

  // Category Actions
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      image: '/src/assets/images/category_new_arrivals_1790305160934.jpg',
      status: 'active',
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      status: cat.status,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, categoryForm);
        showNotification('success', 'Catégorie modifiée');
      } else {
        await createAdminCategory(categoryForm);
        showNotification('success', 'Nouvelle catégorie créée');
      }
      setIsCategoryModalOpen(false);
      loadData();
      refreshStoreData();
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur sauvegarde catégorie');
    }
  };
  const handleCategoryImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const validMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (!validMimeTypes.includes(file.type)) {
    showNotification(
      'error',
      'Format non supporté. Veuillez sélectionner JPG, PNG ou WEBP.'
    );
    e.target.value = '';
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    showNotification(
      'error',
      'Image trop volumineuse. Maximum 8 Mo.'
    );
    e.target.value = '';
    return;
  }

  try {
    const imageData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () =>
        reject(new Error("Impossible de lire l'image."));

      reader.readAsDataURL(file);
    });

    const uploaded = await uploadAdminProductImage(
      imageData,
      file.name
    );

    setCategoryForm(prev => ({
      ...prev,
      image: uploaded.url,
    }));

    showNotification(
      'success',
      'Image de catégorie téléchargée avec succès.'
    );
  } catch (err: any) {
    showNotification(
      'error',
      err.message || "Erreur lors du téléchargement de l'image."
    );
  } finally {
    e.target.value = '';
  }
};

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer la catégorie "${name}" ?`)) return;
    try {
      await deleteAdminCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showNotification('success', 'Catégorie supprimée');
      refreshStoreData();
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur suppression');
    }
  };

  // Settings Actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSettings) return;
    setIsSavingSettings(true);
    try {
      const updated = await updateAdminSettings(storeSettings);
      setStoreSettings(updated);
      showNotification('success', 'Paramètres de la boutique mis à jour');
      refreshStoreData();
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur sauvegarde paramètres');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ==========================================
  // LOGIN / REGISTER SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111111] text-[#F5F3EF] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] border border-[#2e2e2e] p-8 shadow-2xl">
          <div className="text-center mb-8">
            <span className="font-serif text-3xl tracking-[0.25em] font-medium text-[#F5F3EF] block mb-2">
              4YM <span className="text-[#C8A96B]">|</span> MAISON
            </span>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96B]">
              Panneau d'Administration Central
            </p>
          </div>

          {/* Switch Se connecter | Créer un compte */}
          <div className="flex border-b border-[#2e2e2e] mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError('');
                setRegisterError('');
                setRegisterSuccess('');
              }}
              className={`flex-1 pb-3 text-xs uppercase tracking-[0.15em] font-bold text-center transition-colors cursor-pointer border-b-2 ${
                authMode === 'login'
                  ? 'border-[#C8A96B] text-[#C8A96B]'
                  : 'border-transparent text-[#8A8A8A] hover:text-[#F5F3EF]'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setLoginError('');
                setRegisterError('');
                setRegisterSuccess('');
              }}
              className={`flex-1 pb-3 text-xs uppercase tracking-[0.15em] font-bold text-center transition-colors cursor-pointer border-b-2 ${
                authMode === 'register'
                  ? 'border-[#C8A96B] text-[#C8A96B]'
                  : 'border-transparent text-[#8A8A8A] hover:text-[#F5F3EF]'
              }`}
            >
              Créer un compte
            </button>
          </div>

          {authMode === 'login' ? (
            <>
              {loginError && (
                <div className="mb-6 p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#8A8A8A] mb-1.5">
                    Identifiant / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="off"
                    className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#333333] text-sm text-[#F5F3EF] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#8A8A8A] mb-1.5">
                    Mot de Passe
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#333333] text-sm text-[#F5F3EF] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 px-4 bg-[#C8A96B] hover:bg-[#B09252] text-[#111111] font-bold text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer"
                  >
                    {isLoggingIn ? 'Connexion en cours...' : 'Se Connecter'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {registerSuccess && (
                <div className="mb-6 p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{registerSuccess}</span>
                </div>
              )}

              {registerError && (
                <div className="mb-6 p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{registerError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#8A8A8A] mb-1.5">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    autoComplete="off"
                    placeholder="Nom complet"
                    className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#333333] text-sm text-[#F5F3EF] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#8A8A8A] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    autoComplete="off"
                    placeholder="adresse@domaine.ma"
                    className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#333333] text-sm text-[#F5F3EF] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#8A8A8A] mb-1.5">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Minimum 6 caractères"
                    className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#333333] text-sm text-[#F5F3EF] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#8A8A8A] mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Confirmez votre mot de passe"
                    className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#333333] text-sm text-[#F5F3EF] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3 px-4 bg-[#C8A96B] hover:bg-[#B09252] text-[#111111] font-bold text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer"
                  >
                    {isRegistering ? 'Envoi en cours...' : 'Créer mon compte'}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-[#2e2e2e] text-center">
            <button
              onClick={() => setActivePage('home')}
              className="text-xs text-[#8A8A8A] hover:text-[#C8A96B] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Retourner à la Boutique 4YM</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ADMIN MAIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#111111] flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#111111] text-[#F5F3EF] flex flex-col justify-between shrink-0 border-r border-[#222222]">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#222222]">
            <span className="font-serif text-xl tracking-[0.2em] font-medium text-[#F5F3EF] block">
              4YM <span className="text-[#C8A96B]">|</span> MAISON
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8A96B] font-semibold block mt-1">
              Admin Orders System
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-xs uppercase tracking-wider font-medium">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#C8A96B] text-[#111111] font-bold'
                  : 'text-[#8A8A8A] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Commandes COD</span>
              </div>
              {stats?.new_orders > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-[#111111] text-[10px] font-bold">
                  {stats.new_orders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#C8A96B] text-[#111111] font-bold'
                  : 'text-[#8A8A8A] hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Statistiques & Vue Globale</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#C8A96B] text-[#111111] font-bold'
                  : 'text-[#8A8A8A] hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Produits ({stats?.product_count || products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-[#C8A96B] text-[#111111] font-bold'
                  : 'text-[#8A8A8A] hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Catégories</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#C8A96B] text-[#111111] font-bold'
                  : 'text-[#8A8A8A] hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres Boutique</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-[#C8A96B] text-[#111111] font-bold'
                  : 'text-[#8A8A8A] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Demandes de comptes</span>
              </div>
              {pendingUsers.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-[#111111] text-[10px] font-bold">
                  {pendingUsers.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#222222] space-y-2">
          <button
            onClick={() => setActivePage('home')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8A8A8A] hover:text-[#C8A96B] transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Voir la Boutique</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        
        {/* ==============================================================
            CONFIRMATION PAGE INSIDE ADMIN (When an order is confirmed)
           ============================================================== */}
        {confirmedSuccessOrder && (
          <div className="mb-8 p-6 sm:p-8 bg-white border-2 border-emerald-600 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D8]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <div className="text-emerald-700 font-bold text-xs uppercase tracking-widest">
                    ORDER CONFIRMED ✓
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#111111]">
                    ✓ Order Confirmed Successfully
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setConfirmedSuccessOrder(null)}
                className="text-xs text-[#8A8A8A] hover:text-[#111111] uppercase tracking-wider underline cursor-pointer"
              >
                Fermer l'encart
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#E5E1D8] text-xs">
              <div>
                <p className="text-[#8A8A8A] uppercase tracking-wider mb-1">Order number :</p>
                <p className="font-mono text-base font-bold text-[#111111]">#{confirmedSuccessOrder.order_number}</p>
              </div>

              <div>
                <p className="text-[#8A8A8A] uppercase tracking-wider mb-1">Customer :</p>
                <p className="text-base font-semibold text-[#111111]">{confirmedSuccessOrder.customer_name}</p>
              </div>

              <div>
                <p className="text-[#8A8A8A] uppercase tracking-wider mb-1">Total :</p>
                <p className="text-base font-bold text-emerald-800 tabular-nums">{confirmedSuccessOrder.total} DH</p>
              </div>

              <div>
                <p className="text-[#8A8A8A] uppercase tracking-wider mb-1">Status :</p>
                <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-900 font-bold uppercase tracking-wider text-[11px]">
                  {confirmedSuccessOrder.status}
                </span>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap gap-3 items-center">
              {/* CONTACT CUSTOMER BUTTON (WhatsApp) */}
              <a
                href={getWhatsAppLink(confirmedSuccessOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>CONTACT CUSTOMER</span>
              </a>

              {/* VIEW ORDER BUTTON */}
              <button
                onClick={() => {
                  setSelectedOrder(confirmedSuccessOrder);
                  setConfirmedSuccessOrder(null);
                }}
                className="px-6 py-3 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>VIEW ORDER</span>
              </button>

              {/* BACK TO ORDERS BUTTON */}
              <button
                onClick={() => {
                  setConfirmedSuccessOrder(null);
                  setOrderStatusTab('Confirmed');
                }}
                className="px-6 py-3 border border-[#E5E1D8] hover:border-[#111111] text-[#111111] text-xs font-bold uppercase tracking-wider cursor-pointer bg-white transition-colors"
              >
                BACK TO ORDERS
              </button>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB: ORDERS MANAGEMENT (Central Nervous System)
           ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D8]">
              <div>
                <h1 className="font-serif text-3xl font-light text-[#111111]">
                  Gestion des Commandes COD
                </h1>
                <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mt-1">
                  Système central de validation, expédition et relation client
                </p>
              </div>

              <button
                onClick={loadData}
                className="px-3.5 py-2 bg-white border border-[#E5E1D8] text-xs uppercase tracking-wider hover:border-[#C8A96B] flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Actualiser les Commandes</span>
              </button>
            </div>

            {/* SEPARATE ORDER SECTIONS / TABS (Required by user prompt) */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setOrderStatusTab('all')}
                className={`px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer border ${
                  orderStatusTab === 'all'
                    ? 'bg-[#111111] text-[#F5F3EF] border-[#111111]'
                    : 'bg-white text-[#555555] border-[#E5E1D8] hover:border-[#111111]'
                }`}
              >
                Toutes les Commandes ({stats?.total_orders || orders.length})
              </button>

              {/* 🟡 New Orders */}
              <button
                onClick={() => setOrderStatusTab('New')}
                className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                  orderStatusTab === 'New'
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm'
                    : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                }`}
              >
                <span>🟡 New Orders ({stats?.new_orders || 0})</span>
              </button>

              {/* 🔵 Confirmed */}
              <button
                onClick={() => setOrderStatusTab('Confirmed')}
                className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                  orderStatusTab === 'Confirmed'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-50'
                }`}
              >
                <span>🔵 Confirmed ({stats?.confirmed_orders || 0})</span>
              </button>

              {/* 🟠 Preparing */}
              <button
                onClick={() => setOrderStatusTab('Preparing')}
                className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                  orderStatusTab === 'Preparing'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                    : 'bg-white text-purple-800 border-purple-300 hover:bg-purple-50'
                }`}
              >
                <span>🟠 Preparing ({stats?.preparing_orders || 0})</span>
              </button>

              {/* 🚚 Shipped */}
              <button
                onClick={() => setOrderStatusTab('Shipped')}
                className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                  orderStatusTab === 'Shipped'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-white text-indigo-800 border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <span>🚚 Shipped ({stats?.shipped_orders || 0})</span>
              </button>

              {/* ✅ Delivered */}
              <button
                onClick={() => setOrderStatusTab('Delivered')}
                className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                  orderStatusTab === 'Delivered'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <span>✅ Delivered ({stats?.delivered_orders || 0})</span>
              </button>

              {/* ❌ Cancelled */}
              <button
                onClick={() => setOrderStatusTab('Cancelled')}
                className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                  orderStatusTab === 'Cancelled'
                    ? 'bg-red-600 text-white border-red-700 shadow-sm'
                    : 'bg-white text-red-800 border-red-300 hover:bg-red-50'
                }`}
              >
                <span>❌ Cancelled ({stats?.cancelled_orders || 0})</span>
              </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="p-4 bg-white border border-[#E5E1D8] flex flex-wrap gap-4 items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-[#8A8A8A]" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Rechercher par N° Commande (#4YM...), Nom client, Téléphone..."
                  className="w-full bg-transparent text-xs text-[#111111] focus:outline-none"
                />
                {orderSearch && (
                  <button onClick={() => setOrderSearch('')} className="text-[#8A8A8A] hover:text-[#111111]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* City Filter */}
                <select
                  value={orderCityFilter}
                  onChange={(e) => setOrderCityFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#F5F3EF] border border-[#E5E1D8] text-xs text-[#111111] focus:outline-none"
                >
                  <option value="all">Toutes les Villes</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Tanger">Tanger</option>
                  <option value="Agadir">Agadir</option>
                  <option value="Fès">Fès</option>
                  <option value="Meknès">Meknès</option>
                </select>

                {/* Date Filter */}
                <input
                  type="date"
                  value={orderDateFilter}
                  onChange={(e) => setOrderDateFilter(e.target.value)}
                  className="px-3 py-1 bg-[#F5F3EF] border border-[#E5E1D8] text-xs text-[#111111] focus:outline-none"
                />

                {(orderSearch || orderDateFilter || orderCityFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setOrderSearch('');
                      setOrderDateFilter('');
                      setOrderCityFilter('all');
                    }}
                    className="text-[11px] text-[#8A8A8A] hover:text-[#111111] underline"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-[#E5E1D8] overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111111] text-[#F5F3EF] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Product & Qty</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D8]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-[#8A8A8A]">
                        Aucune commande ne correspond aux filtres actuels.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const isNew = order.status === 'New';
                      return (
                        <tr
                          key={order.id}
                          className={`hover:bg-[#FAF9F6] transition-colors cursor-pointer ${
                            isNew ? 'bg-amber-50/50 font-medium' : ''
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          {/* Order ID */}
                          <td className="p-4 font-mono font-bold text-[#111111] whitespace-nowrap">
                            #{order.order_number}
                          </td>

                          {/* Date */}
                          <td className="p-4 text-[#8A8A8A] text-[11px] whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* Customer Name */}
                          <td className="p-4 font-semibold text-[#111111] whitespace-nowrap">
                            {order.customer_name}
                          </td>

                          {/* Phone */}
                          <td className="p-4 font-mono text-[#444444] whitespace-nowrap">
                            {order.phone}
                          </td>

                          {/* City */}
                          <td className="p-4 text-[#444444] whitespace-nowrap">
                            {order.city}
                          </td>

                          {/* Address */}
                          <td className="p-4 text-[#666666] max-w-xs truncate" title={order.address}>
                            {order.address}
                          </td>

                          {/* Product & Qty */}
                          <td className="p-4 text-[#111111]">
                            {order.items.map((i, idx) => (
                              <div key={idx} className="whitespace-nowrap">
                                <span className="font-semibold">{i.quantity}x</span> {i.product_name}
                              </div>
                            ))}
                          </td>

                          {/* Total */}
                          <td className="p-4 font-bold text-sm text-[#111111] tabular-nums whitespace-nowrap">
                            {order.total} DH
                          </td>

                          {/* Status */}
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border rounded-none cursor-pointer ${
                                order.status === 'New'
                                  ? 'bg-amber-100 text-amber-900 border-amber-400'
                                  : order.status === 'Confirmed'
                                  ? 'bg-blue-100 text-blue-900 border-blue-400'
                                  : order.status === 'Preparing'
                                  ? 'bg-purple-100 text-purple-900 border-purple-400'
                                  : order.status === 'Shipped'
                                  ? 'bg-indigo-100 text-indigo-900 border-indigo-400'
                                  : order.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                  : 'bg-red-100 text-red-900 border-red-400'
                              }`}
                            >
                              <option value="New">🟡 New</option>
                              <option value="Confirmed">🔵 Confirmed</option>
                              <option value="Preparing">🟠 Preparing</option>
                              <option value="Shipped">🚚 Shipped</option>
                              <option value="Delivered">✅ Delivered</option>
                              <option value="Cancelled">❌ Cancelled</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Fast Confirm for New Orders */}
                              {isNew && (
                                <button
                                  onClick={() => handleConfirmOrder(order)}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                                  title="Confirmer la commande maintenant"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Confirmer</span>
                                </button>
                              )}

                              {/* WhatsApp Contact Button */}
                              <a
                                href={getWhatsAppLink(order)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-colors cursor-pointer"
                                title="Contacter le client sur WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4 fill-current" />
                              </a>

                              {/* View Details */}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 hover:text-[#C8A96B] transition-colors cursor-pointer"
                                title="Voir la fiche détaillée"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Delete Order */}
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 hover:text-red-700 transition-colors cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ==============================================================
                ORDER DETAILS MODAL (ORDER #4YM...)
               ============================================================== */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
                <div className="relative w-full max-w-3xl bg-white border border-[#E5E1D8] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                  
                  {/* Modal Header */}
                  <div className="flex justify-between items-start pb-4 border-b border-[#E5E1D8] mb-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96B] font-bold">
                        <span>Fiche Complète de Commande</span>
                        <span>·</span>
                        <span>Date : {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}</span>
                      </div>
                      <h2 className="font-serif text-3xl font-light text-[#111111] mt-1">
                        ORDER #{selectedOrder.order_number}
                      </h2>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-1 hover:text-[#C8A96B] cursor-pointer text-[#8A8A8A]"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Customer Block (Required format) */}
                  <div className="mb-6 p-5 bg-[#FAF9F6] border border-[#E5E1D8]">
                    <h3 className="font-serif text-base font-semibold text-[#111111] uppercase tracking-wider mb-3 pb-2 border-b border-[#E5E1D8]">
                      Customer Details :
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#8A8A8A] uppercase tracking-wider block mb-0.5">Full name :</span>
                        <p className="font-bold text-sm text-[#111111]">{selectedOrder.customer_name}</p>
                      </div>

                      <div>
                        <span className="text-[#8A8A8A] uppercase tracking-wider block mb-0.5">Phone :</span>
                        <p className="font-mono font-bold text-sm text-[#111111]">{selectedOrder.phone}</p>
                      </div>

                      <div>
                        <span className="text-[#8A8A8A] uppercase tracking-wider block mb-0.5">City :</span>
                        <p className="font-medium text-[#111111]">{selectedOrder.city}</p>
                      </div>

                      <div>
                        <span className="text-[#8A8A8A] uppercase tracking-wider block mb-0.5">Current Status :</span>
                        <span className="font-bold text-xs uppercase px-2 py-0.5 bg-white border border-[#E5E1D8]">
                          {selectedOrder.status}
                        </span>
                      </div>

                      <div className="sm:col-span-2 pt-2 border-t border-[#E5E1D8]/60">
                        <span className="text-[#8A8A8A] uppercase tracking-wider block mb-0.5">Full address :</span>
                        <p className="font-medium text-[#111111]">{selectedOrder.address}</p>
                      </div>

                      {selectedOrder.notes && (
                        <div className="sm:col-span-2 pt-2 border-t border-[#E5E1D8]/60">
                          <span className="text-[#8A8A8A] uppercase tracking-wider block mb-0.5">Notes :</span>
                          <p className="italic text-[#111111] bg-white p-2 border border-[#E5E1D8]">"{selectedOrder.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items Block (Required format) */}
                  <div className="mb-6">
                    <h3 className="font-serif text-base font-semibold text-[#111111] uppercase tracking-wider mb-3">
                      Order Details :
                    </h3>
                    <div className="border border-[#E5E1D8] divide-y divide-[#E5E1D8] bg-white">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image_url || '/src/assets/images/category_new_arrivals_1790305160934.jpg'}
                              alt={item.product_name}
                              className="w-12 h-12 object-cover border border-[#E5E1D8]"
                            />
                            <div>
                              <p className="font-bold text-[#111111] text-sm">{item.product_name}</p>
                              <p className="font-mono text-[#8A8A8A] text-[11px]">{item.product_sku}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[#8A8A8A]">
                              Qty: <span className="font-bold text-[#111111]">{item.quantity}</span> × {item.unit_price} DH
                            </p>
                            <p className="font-bold text-sm text-[#111111] tabular-nums mt-0.5">
                              {item.total} DH
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-[#F5F3EF] border-x border-b border-[#E5E1D8] space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#666666]">
                        <span>Delivery fee :</span>
                        <span className="font-medium text-emerald-800">
                          {selectedOrder.delivery_fee === 0 ? 'Gratuite (0 DH)' : `${selectedOrder.delivery_fee} DH`}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-[#111111] pt-2 border-t border-[#E5E1D8]">
                        <span>Total :</span>
                        <span className="font-serif text-xl tabular-nums">{selectedOrder.total} DH</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Large Button: CONFIRM ORDER (If Status === New) */}
                  {selectedOrder.status === 'New' && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-amber-900 text-sm">Nouvelle commande en attente de confirmation</p>
                        <p className="text-xs text-amber-800">Cliquez pour valider la commande et la transférer aux commandes confirmées.</p>
                      </div>

                      <button
                        onClick={() => handleConfirmOrder(selectedOrder)}
                        className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-[1.02]"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>CONFIRM ORDER</span>
                      </button>
                    </div>
                  )}

                  {/* Confirmation Workflow Steps */}
                  <div className="mb-6 pt-2">
                    <p className="text-xs uppercase tracking-wider font-semibold text-[#8A8A8A] mb-2">
                      Changer l'état d'avancement de la commande :
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'Confirmed')}
                        className={`py-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          selectedOrder.status === 'Confirmed'
                            ? 'bg-blue-800 text-white'
                            : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                        }`}
                      >
                        Confirmed
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'Preparing')}
                        className={`py-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          selectedOrder.status === 'Preparing'
                            ? 'bg-purple-800 text-white'
                            : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                        }`}
                      >
                        Preparing
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'Shipped')}
                        className={`py-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          selectedOrder.status === 'Shipped'
                            ? 'bg-indigo-800 text-white'
                            : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'
                        }`}
                      >
                        Shipped
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}
                        className={`py-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          selectedOrder.status === 'Delivered'
                            ? 'bg-emerald-800 text-white'
                            : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                        }`}
                      >
                        Delivered
                      </button>
                    </div>

                    <div className="mt-2 text-right">
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'Cancelled')}
                        className="text-xs text-red-600 hover:text-red-800 underline uppercase tracking-wider cursor-pointer"
                      >
                        Annuler la commande (Cancelled)
                      </button>
                    </div>
                  </div>

                  {/* Actions Footer: WhatsApp Contact & Close */}
                  <div className="pt-4 border-t border-[#E5E1D8] flex flex-col sm:flex-row gap-3">
                    <a
                      href={getWhatsAppLink(selectedOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>CONTACT CUSTOMER (WhatsApp)</span>
                    </a>

                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="py-3 px-6 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      BACK TO ORDERS
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            TAB: OVERVIEW / STATS DASHBOARD
           ============================================================== */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D8]">
              <div>
                <h1 className="font-serif text-3xl font-light text-[#111111]">
                  Vue d'Ensemble & Indicateurs
                </h1>
                <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mt-1">
                  Chiffre d'affaires et volume des commandes COD en direct
                </p>
              </div>

              <button
                onClick={loadData}
                className="px-3.5 py-2 bg-white border border-[#E5E1D8] text-xs uppercase tracking-wider hover:border-[#C8A96B] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Actualiser</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 bg-white border border-[#E5E1D8] shadow-sm">
                <div className="flex items-center justify-between text-[#8A8A8A] text-xs uppercase tracking-wider mb-2">
                  <span>Chiffre d'Affaires</span>
                  <DollarSign className="w-4 h-4 text-[#C8A96B]" />
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] tabular-nums">
                  {stats.total_revenue} DH
                </div>
                <div className="mt-2 text-[11px] text-[#8A8A8A]">
                  Commandes non annulées
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E5E1D8] shadow-sm">
                <div className="flex items-center justify-between text-[#8A8A8A] text-xs uppercase tracking-wider mb-2">
                  <span>Total Commandes</span>
                  <ShoppingBag className="w-4 h-4 text-[#111111]" />
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] tabular-nums">
                  {stats.total_orders}
                </div>
                <div className="mt-2 text-[11px] text-amber-700 font-bold">
                  🟡 {stats.new_orders} nouvelle(s) à confirmer
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E5E1D8] shadow-sm">
                <div className="flex items-center justify-between text-[#8A8A8A] text-xs uppercase tracking-wider mb-2">
                  <span>Colis Livrés</span>
                  <CheckCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-800 tabular-nums">
                  {stats.delivered_orders}
                </div>
                <div className="mt-2 text-[11px] text-[#8A8A8A]">
                  {stats.shipped_orders} en livraison active
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E5E1D8] shadow-sm">
                <div className="flex items-center justify-between text-[#8A8A8A] text-xs uppercase tracking-wider mb-2">
                  <span>Catalogue & Stock</span>
                  <Boxes className="w-4 h-4 text-[#C8A96B]" />
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] tabular-nums">
                  {stats.product_count}
                </div>
                <div className="mt-2 text-[11px] text-red-700 font-medium">
                  {stats.low_stock_count} pièce(s) en stock critique
                </div>
              </div>
            </div>

            {/* Quick breakdown & actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Daily Sales Bar Chart */}
              <div className="lg:col-span-2 bg-white border border-[#E5E1D8] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-lg font-medium text-[#111111]">
                    Ventes des 7 Derniers Jours
                  </h3>
                  <span className="text-xs text-[#8A8A8A] uppercase tracking-wider font-mono">
                    Montant DH
                  </span>
                </div>

                <div className="space-y-4">
                  {stats.daily_stats.map((d: any) => {
                    const maxRev = Math.max(...stats.daily_stats.map((s: any) => s.revenue), 1000);
                    const percent = Math.min(100, Math.round((d.revenue / maxRev) * 100));
                    return (
                      <div key={d.date} className="flex items-center gap-4 text-xs">
                        <span className="w-20 font-mono text-[#8A8A8A]">{d.date.slice(5)}</span>
                        <div className="flex-1 bg-[#F5F3EF] h-5 rounded-none overflow-hidden relative">
                          <div
                            className="bg-[#C8A96B] h-full transition-all duration-500"
                            style={{ width: `${Math.max(5, percent)}%` }}
                          />
                        </div>
                        <span className="w-28 text-right font-semibold text-[#111111] tabular-nums">
                          {d.revenue} DH ({d.orders} cmd)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Summary & Quick Navigation */}
              <div className="bg-white border border-[#E5E1D8] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#111111] mb-4">
                    État des Commandes
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setOrderStatusTab('New');
                      }}
                      className="w-full flex items-center justify-between p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                    >
                      <span className="font-bold text-amber-900">🟡 New Orders</span>
                      <span className="font-bold tabular-nums text-amber-900">{stats.new_orders}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setOrderStatusTab('Confirmed');
                      }}
                      className="w-full flex items-center justify-between p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      <span className="font-bold text-blue-900">🔵 Confirmed</span>
                      <span className="font-bold tabular-nums text-blue-900">{stats.confirmed_orders}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setOrderStatusTab('Preparing');
                      }}
                      className="w-full flex items-center justify-between p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                    >
                      <span className="font-bold text-purple-900">🟠 Preparing</span>
                      <span className="font-bold tabular-nums text-purple-900">{stats.preparing_orders}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setOrderStatusTab('Shipped');
                      }}
                      className="w-full flex items-center justify-between p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                    >
                      <span className="font-bold text-indigo-900">🚚 Shipped</span>
                      <span className="font-bold tabular-nums text-indigo-900">{stats.shipped_orders}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setOrderStatusTab('Delivered');
                      }}
                      className="w-full flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      <span className="font-bold text-emerald-900">✅ Delivered</span>
                      <span className="font-bold tabular-nums text-emerald-900">{stats.delivered_orders}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setOrderStatusTab('Cancelled');
                      }}
                      className="w-full flex items-center justify-between p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      <span className="font-bold text-red-900">❌ Cancelled</span>
                      <span className="font-bold tabular-nums text-red-900">{stats.cancelled_orders}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E5E1D8] mt-6">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full py-2.5 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Ouvrir l'Espace Commandes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==============================================================
            TAB: PRODUCTS MANAGEMENT
           ============================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D8]">
              <div>
                <h1 className="font-serif text-3xl font-light text-[#111111]">
                  Gestion des Produits
                </h1>
                <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mt-1">
                  Créez, modifiez et contrôlez les stocks et le statut d'affichage
                </p>
              </div>

              <button
                onClick={openAddProductModal}
                className="px-4 py-2.5 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Produit</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="p-4 bg-white border border-[#E5E1D8] flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-[#8A8A8A]" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Rechercher par nom, SKU ou mot-clé..."
                  className="w-full bg-transparent text-xs text-[#111111] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#F5F3EF] border border-[#E5E1D8] text-xs text-[#111111] focus:outline-none"
                >
                  <option value="all">Toutes les Catégories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#F5F3EF] border border-[#E5E1D8] text-xs text-[#111111] focus:outline-none"
                >
                  <option value="all">Tous les Statuts</option>
                  <option value="active">Actif</option>
                  <option value="draft">Brouillon</option>
                  <option value="out_of_stock">Rupture</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#E5E1D8] overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111111] text-[#F5F3EF] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Pièce</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Prix</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Badges</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D8]">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#FAF9F6]">
                      <td className="p-4 flex items-center gap-3">
                        <div className="flex -space-x-2 shrink-0">
                          <img
                            src={prod.image1 || prod.images[0]}
                            alt={prod.name}
                            className="w-12 h-12 object-cover border border-[#E5E1D8] bg-[#F5F3EF]"
                            title="Image 1 (Principale)"
                          />
                          <img
                            src={prod.image2 || prod.images[1] || prod.image1 || prod.images[0]}
                            alt={`${prod.name} - Vue 2`}
                            className="w-12 h-12 object-cover border-2 border-white shadow-sm bg-[#F5F3EF]"
                            title="Image 2 (Secondaire)"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-[#111111]">{prod.name}</p>
                          <p className="font-mono text-[10px] text-[#8A8A8A]">{prod.sku} • 2 photos</p>
                        </div>
                      </td>

                      <td className="p-4 text-[#555555]">
                        {prod.category_name}
                      </td>

                      <td className="p-4 font-semibold text-[#111111] tabular-nums">
                        {prod.price} DH
                        {prod.old_price && (
                          <span className="block text-[10px] text-[#8A8A8A] line-through">
                            {prod.old_price} DH
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`font-semibold tabular-nums ${
                            prod.stock <= 0
                              ? 'text-red-700'
                              : prod.stock <= 5
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {prod.stock} unités
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {prod.best_seller && <span className="bg-[#111111] text-[#C8A96B] px-1.5 py-0.5">Best</span>}
                          {prod.new_arrival && <span className="bg-[#F5F3EF] border border-[#E5E1D8] px-1.5 py-0.5">New</span>}
                          {prod.featured && <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5">Featured</span>}
                        </div>
                        {prod.collections && prod.collections.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                            {prod.collections.includes('watches') && (
                              <span className="bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.5 font-medium">Montres</span>
                            )}
                            {(prod.collections.includes('girls') || prod.collections.includes('femme')) && (
                              <span className="bg-pink-50 text-pink-800 border border-pink-200 px-1.5 py-0.5 font-medium">Femme</span>
                            )}
                            {(prod.collections.includes('boys') || prod.collections.includes('homme')) && (
                              <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 font-medium">Homme</span>
                            )}
                            {(prod.collections.includes('autres_accessoires') || prod.collections.includes('autres-accessoires') || prod.category_id === 'cat-accessories') && (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 font-medium">Autres Accessoires</span>
                            )}
                            {(prod.collections.includes('cat-jewelry') || prod.collections.includes('jewelry')) && (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 font-medium">Bijoux & Or</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                            prod.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : prod.status === 'draft'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {prod.status === 'active' ? 'Actif' : prod.status === 'draft' ? 'Brouillon' : 'Rupture'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditProductModal(prod)}
                            className="p-1.5 hover:text-[#C8A96B] transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 hover:text-red-700 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB: CATEGORIES MANAGEMENT
           ============================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D8]">
              <div>
                <h1 className="font-serif text-3xl font-light text-[#111111]">
                  Gestion des Catégories
                </h1>
                <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mt-1">
                  Créez et organisez vos collections signatures
                </p>
              </div>

              <button
                onClick={openAddCategoryModal}
                className="px-4 py-2.5 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Catégorie</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white border border-[#E5E1D8] overflow-hidden p-4 flex flex-col justify-between">
                  <div>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full aspect-[4/3] object-cover mb-4 border border-[#E5E1D8]"
                    />
                    <h3 className="font-serif text-lg font-medium text-[#111111]">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-mono text-[#8A8A8A] mb-2">{cat.slug}</p>
                    <span className="text-[11px] text-[#C8A96B] font-semibold">
                      {cat.item_count || 0} article(s) associé(s)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E5E1D8]">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${
                        cat.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat.status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="p-1 hover:text-[#C8A96B] cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB: SETTINGS MANAGEMENT
           ============================================================== */}
        {activeTab === 'settings' && storeSettings && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D8]">
              <div>
                <h1 className="font-serif text-3xl font-light text-[#111111]">
                  Paramètres de la Boutique 4YM
                </h1>
                <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mt-1">
                  Informations de marque, WhatsApp, tarifs et messages personnalisables
                </p>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
              >
                {isSavingSettings ? 'Enregistrement...' : 'Enregistrer les Paramètres'}
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              
              {/* Brand Info */}
              <div className="p-6 bg-white border border-[#E5E1D8] shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-medium text-[#111111] pb-2 border-b border-[#E5E1D8]">
                  1. Identité de Marque & Coordonnées
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#111111] mb-1">
                      Nom de la Boutique
                    </label>
                    <input
                      type="text"
                      value={storeSettings.store_name}
                      onChange={(e) => setStoreSettings({ ...storeSettings, store_name: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#111111] mb-1">
                      Slogan Officiel
                    </label>
                    <input
                      type="text"
                      value={storeSettings.slogan}
                      onChange={(e) => setStoreSettings({ ...storeSettings, slogan: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#111111] mb-1">
                      Compte Instagram
                    </label>
                    <input
                      type="text"
                      value={storeSettings.instagram_handle}
                      onChange={(e) => setStoreSettings({ ...storeSettings, instagram_handle: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#111111] mb-1">
                      Numéro WhatsApp Client (avec indicatif +212)
                    </label>
                    <input
                      type="text"
                      value={storeSettings.whatsapp_number}
                      onChange={(e) => setStoreSettings({ ...storeSettings, whatsapp_number: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#111111] mb-1">
                      Email de Contact
                    </label>
                    <input
                      type="email"
                      value={storeSettings.contact_email}
                      onChange={(e) => setStoreSettings({ ...storeSettings, contact_email: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#111111] mb-1">
                      Adresse Physique / Showroom
                    </label>
                    <input
                      type="text"
                      value={storeSettings.store_address}
                      onChange={(e) => setStoreSettings({ ...storeSettings, store_address: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#111111]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="p-6 bg-white border border-[#E5E1D8] shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-medium text-[#111111] pb-2 border-b border-[#E5E1D8]">
                  2. Modalités de Livraison (Maroc)
                </h3>

                <div className="space-y-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="checkbox"
                      checked={storeSettings.free_delivery_enabled}
                      onChange={(e) => setStoreSettings({ ...storeSettings, free_delivery_enabled: e.target.checked })}
                      className="w-4 h-4 accent-[#C8A96B]"
                    />
                    <span>Activer la Livraison Gratuite (Offerte partout au Maroc)</span>
                  </label>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#111111] mb-1">
                      Message Affiché pour la Livraison
                    </label>
                    <textarea
                      rows={2}
                      value={storeSettings.delivery_message}
                      onChange={(e) => setStoreSettings({ ...storeSettings, delivery_message: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#111111]"
                    />
                  </div>
                </div>
              </div>

              {/* Texts & Banners */}
              <div className="p-6 bg-white border border-[#E5E1D8] shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-medium text-[#111111] pb-2 border-b border-[#E5E1D8]">
                  3. Textes du Site & Barre d'Annonce
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#111111] mb-1">
                      Barre d'Annonce Supérieure
                    </label>
                    <input
                      type="text"
                      value={storeSettings.announcement_bar}
                      onChange={(e) => setStoreSettings({ ...storeSettings, announcement_bar: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#111111] mb-1">
                      Titre Hero Accueil
                    </label>
                    <input
                      type="text"
                      value={storeSettings.homepage_title}
                      onChange={(e) => setStoreSettings({ ...storeSettings, homepage_title: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#111111] mb-1">
                      Texte Pied de Page (Footer)
                    </label>
                    <input
                      type="text"
                      value={storeSettings.footer_text}
                      onChange={(e) => setStoreSettings({ ...storeSettings, footer_text: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#111111]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-8 py-3 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer"
                >
                  {isSavingSettings ? 'Enregistrement...' : 'Enregistrer Tous les Paramètres'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ==============================================================
            TAB: DEMANDES DE COMPTES (PENDING ADMIN REQUESTS)
           ============================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D8]">
              <div>
                <h2 className="font-serif text-2xl font-light text-[#111111]">
                  Demandes de Comptes Administrateur
                </h2>
                <p className="text-xs text-[#8A8A8A] mt-1">
                  Validez ou refusez les demandes d'accès au panneau d'administration central 4YM | Maison.
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setIsLoadingPendingUsers(true);
                  try {
                    const list = await fetchPendingAdminUsers();
                    setPendingUsers(list);
                  } finally {
                    setIsLoadingPendingUsers(false);
                  }
                }}
                disabled={isLoadingPendingUsers}
                className="px-3 py-2 bg-white border border-[#E5E1D8] text-xs uppercase tracking-wider font-semibold text-[#111111] hover:border-[#C8A96B] flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPendingUsers ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>

            {isLoadingPendingUsers ? (
              <div className="bg-white border border-[#E5E1D8] p-12 text-center text-xs text-[#8A8A8A]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C8A96B]" />
                <p>Chargement des demandes...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="bg-white border border-[#E5E1D8] p-12 text-center text-xs text-[#8A8A8A]">
                <UserCheck className="w-10 h-10 mx-auto mb-3 text-[#C8A96B] opacity-60" />
                <p className="font-semibold text-sm text-[#111111] mb-1">Aucune demande en attente</p>
                <p>Toutes les demandes de comptes administrateurs ont été traitées.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#E5E1D8] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FAF9F6] border-b border-[#E5E1D8] text-[11px] uppercase tracking-wider text-[#8A8A8A] font-semibold">
                        <th className="p-4">Nom</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Date de création</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E1D8]">
                      {pendingUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-[#FAF9F6] transition-colors">
                          <td className="p-4 font-semibold text-[#111111]">
                            {user.name}
                          </td>
                          <td className="p-4 font-mono text-[#555555]">
                            {user.email}
                          </td>
                          <td className="p-4 text-[#8A8A8A]">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '—'}
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold uppercase tracking-wider text-[10px]">
                              En attente
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleApproveUser(user.id, user.name)}
                                disabled={processingUserId === user.id}
                                className="px-3 py-1.5 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-[11px] uppercase tracking-wider font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accepter</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectUser(user.id, user.name)}
                                disabled={processingUserId === user.id}
                                className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 hover:border-red-300 text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Refuser</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ==============================================================
          MODAL: ADD / EDIT PRODUCT
         ============================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-white border border-[#E5E1D8] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E1D8] mb-6">
              <h3 className="font-serif text-2xl font-light text-[#111111]">
                {editingProduct ? 'Modifier la Pièce' : 'Ajouter une Pièce à la Collection'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 hover:text-[#C8A96B] cursor-pointer text-[#8A8A8A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Nom du Produit *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[#111111]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Prix en Dirhams (DH) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Ancien Prix (Barre de réduction)
                  </label>
                  <input
                    type="number"
                    value={productForm.old_price}
                    onChange={(e) => setProductForm({ ...productForm, old_price: e.target.value })}
                    placeholder="Optionnel"
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Référence SKU
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[#111111]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Détails & Caractéristiques (Une ligne par puce)
                </label>
                <textarea
                  rows={3}
                  value={productForm.details}
                  onChange={(e) => setProductForm({ ...productForm, details: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[#111111]"
                />
              </div>

              {/* ==============================================================
                  PRODUCT IMAGES (Exactly 2 required images)
                 ============================================================== */}
              <div className="pt-2 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                  <h4 className="font-serif text-lg font-medium text-[#111111] flex items-center gap-2">
                    <span>Product Images</span>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider bg-[#111111] text-[#C8A96B] px-2 py-0.5">
                      2 Photos Requises
                    </span>
                  </h4>
                  <span className="text-[11px] text-[#8A8A8A]">
                    Formats acceptés : JPG, PNG, WEBP • Max 8 Mo par photo
                  </span>
                </div>

                {imageError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span className="font-medium">{imageError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* ==================== CARD: IMAGE 1 ==================== */}
                  <div className={`p-4 border transition-all ${
                    productForm.image1 ? 'border-[#C8A96B] bg-[#FAF9F6]' : 'border-dashed border-[#CCCCCC] bg-white'
                  }`}>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E5E1D8]">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#C8A96B]" />
                        <span>IMAGE 1</span>
                        <span className="text-red-600">*</span>
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${
                        productForm.image1 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {productForm.image1 ? 'Image Principale' : 'Requis'}
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef1}
                      onChange={(e) => handleImageFileChange(e, 'image1')}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />

                    {productForm.image1 ? (
                      <div className="space-y-3">
                        <div className="relative aspect-[4/3] bg-[#F5F3EF] border border-[#E5E1D8] overflow-hidden group">
                          <img
                            src={productForm.image1}
                            alt="Aperçu Image 1"
                            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 bg-[#111111]/85 text-white text-[10px] font-mono px-2 py-0.5">
                            Image 1 — Couverture
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef1.current?.click()}
                            disabled={isUploadingImage1}
                            className="flex-1 py-2 px-3 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isUploadingImage1 ? 'animate-spin' : ''}`} />
                            <span>{isUploadingImage1 ? 'Téléchargement...' : 'Replace Image 1'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, image1: '' }))}
                            className="py-2 px-3 bg-white hover:bg-red-50 text-red-700 border border-red-200 text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Supprimer Image 1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
                        <div className="w-12 h-12 mb-3 bg-[#F5F3EF] border border-[#E5E1D8] flex items-center justify-center">
                          <Upload className="w-6 h-6 text-[#C8A96B]" />
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef1.current?.click()}
                          disabled={isUploadingImage1}
                          className="w-full py-2.5 px-4 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer mb-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{isUploadingImage1 ? 'Téléchargement en cours...' : 'Upload Image 1'}</span>
                        </button>

                        <p className="text-[10px] text-[#8A8A8A]">
                          JPG, PNG, WEBP acceptés (Max 8 Mo)
                        </p>

                        <div className="mt-3 pt-3 border-t border-[#E5E1D8] w-full text-left">
                          <label className="block text-[10px] uppercase font-semibold text-[#8A8A8A] mb-1">
                            Ou sélectionner un visuel signature 4YM :
                          </label>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                setProductForm(prev => ({ ...prev, image1: e.target.value }));
                                e.target.value = '';
                              }
                            }}
                            defaultValue=""
                            className="w-full p-1.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[11px] text-[#111111]"
                          >
                            <option value="" disabled>Choisir un visuel de la collection...</option>
                            {LUXURY_PRESET_IMAGES.map((p, idx) => (
                              <option key={idx} value={p.url}>{p.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ==================== CARD: IMAGE 2 ==================== */}
                  <div className={`p-4 border transition-all ${
                    productForm.image2 ? 'border-[#C8A96B] bg-[#FAF9F6]' : 'border-dashed border-[#CCCCCC] bg-white'
                  }`}>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E5E1D8]">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#C8A96B]" />
                        <span>IMAGE 2</span>
                        <span className="text-red-600">*</span>
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${
                        productForm.image2 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {productForm.image2 ? 'Vue Secondaire' : 'Requis'}
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef2}
                      onChange={(e) => handleImageFileChange(e, 'image2')}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />

                    {productForm.image2 ? (
                      <div className="space-y-3">
                        <div className="relative aspect-[4/3] bg-[#F5F3EF] border border-[#E5E1D8] overflow-hidden group">
                          <img
                            src={productForm.image2}
                            alt="Aperçu Image 2"
                            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 bg-[#111111]/85 text-white text-[10px] font-mono px-2 py-0.5">
                            Image 2 — Vue Secondaire
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef2.current?.click()}
                            disabled={isUploadingImage2}
                            className="flex-1 py-2 px-3 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isUploadingImage2 ? 'animate-spin' : ''}`} />
                            <span>{isUploadingImage2 ? 'Téléchargement...' : 'Replace Image 2'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, image2: '' }))}
                            className="py-2 px-3 bg-white hover:bg-red-50 text-red-700 border border-red-200 text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Supprimer Image 2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
                        <div className="w-12 h-12 mb-3 bg-[#F5F3EF] border border-[#E5E1D8] flex items-center justify-center">
                          <Upload className="w-6 h-6 text-[#C8A96B]" />
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef2.current?.click()}
                          disabled={isUploadingImage2}
                          className="w-full py-2.5 px-4 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer mb-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{isUploadingImage2 ? 'Téléchargement en cours...' : 'Upload Image 2'}</span>
                        </button>

                        <p className="text-[10px] text-[#8A8A8A]">
                          JPG, PNG, WEBP acceptés (Max 8 Mo)
                        </p>

                        <div className="mt-3 pt-3 border-t border-[#E5E1D8] w-full text-left">
                          <label className="block text-[10px] uppercase font-semibold text-[#8A8A8A] mb-1">
                            Ou sélectionner un visuel signature 4YM :
                          </label>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                setProductForm(prev => ({ ...prev, image2: e.target.value }));
                                e.target.value = '';
                              }
                            }}
                            defaultValue=""
                            className="w-full p-1.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[11px] text-[#111111]"
                          >
                            <option value="" disabled>Choisir un visuel de la collection...</option>
                            {LUXURY_PRESET_IMAGES.map((p, idx) => (
                              <option key={idx} value={p.url}>{p.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Collections Selection Field */}
              <div className="pt-2">
                <label className="block font-semibold uppercase tracking-wider mb-1 text-xs text-[#111111]">
                  Collections (Emplacements du Produit)
                </label>
                <p className="text-[11px] text-[#8A8A8A] mb-2.5">
                  Sélectionnez où ce produit doit être affiché (ex: ⌚ Montres & Horlogerie + 👦 Boys / Drari pour une montre homme) :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-[#FAF9F6] border border-[#E5E1D8]">
                  {COLLECTION_OPTIONS.map((col) => {
                    const isSelected = (productForm.collections || []).includes(col.id);
                    return (
                      <label
                        key={col.id}
                        className={`flex items-center gap-2 p-2.5 border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#111111] text-[#F5F3EF] border-[#111111]'
                            : 'bg-white text-[#111111] border-[#E5E1D8] hover:border-[#C8A96B]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const cur = productForm.collections || [];
                            const updated = e.target.checked
                              ? [...cur, col.id]
                              : cur.filter((c) => c !== col.id);
                            setProductForm({ ...productForm, collections: updated });
                          }}
                          className="accent-[#C8A96B]"
                        />
                        <span className="text-xs font-semibold">{col.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="accent-[#C8A96B]"
                  />
                  <span>En Vedette (Featured)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.best_seller}
                    onChange={(e) => setProductForm({ ...productForm, best_seller: e.target.checked })}
                    className="accent-[#C8A96B]"
                  />
                  <span>Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.new_arrival}
                    onChange={(e) => setProductForm({ ...productForm, new_arrival: e.target.checked })}
                    className="accent-[#C8A96B]"
                  />
                  <span>Nouveauté</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E1D8]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E1D8] text-xs uppercase"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs uppercase font-semibold"
                >
                  Enregistrer la Pièce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: ADD / EDIT CATEGORY
         ============================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-[#E5E1D8] shadow-2xl p-6 sm:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E1D8] mb-6">
              <h3 className="font-serif text-xl font-light text-[#111111]">
                {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 hover:text-[#C8A96B] cursor-pointer text-[#8A8A8A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Nom de la Catégorie *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E1D8] text-[#111111]"
                />
              </div>

<div>
  <label className="block font-semibold uppercase tracking-wider mb-1">
    Image de Couverture
  </label>

  <div className="border border-[#E5E1D8] bg-[#FAF9F6] p-3">
    {categoryForm.image && (
      <div className="mb-3">
        <img
          src={categoryForm.image}
          alt="Aperçu"
          className="w-full h-40 object-cover border border-[#E5E1D8]"
        />
      </div>
    )}

    <label className="flex items-center justify-center w-full h-12 border border-dashed border-[#C8A96B] cursor-pointer bg-white">
      <span className="text-[10px] uppercase font-semibold">
        {categoryForm.image ? 'Remplacer l’image' : 'Choisir une image'}
      </span>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleCategoryImageUpload}
        className="hidden"
      />
    </label>

    <p className="text-[9px] text-gray-500 mt-2">
      JPG, PNG ou WEBP — max 8 Mo
    </p>
  </div>
</div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E1D8]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E1D8] text-xs uppercase"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#111111] hover:bg-[#C8A96B] text-white hover:text-[#111111] text-xs uppercase font-semibold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
