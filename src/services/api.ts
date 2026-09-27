import { Product, Category, Order, StoreSettings, CODOrderInput, AdminUser, OrderStatus } from '../types';

const API_BASE = '/api';

export function getAdminToken(): string | null {
  return localStorage.getItem('4ym_admin_token');
}

export function setAdminToken(token: string): void {
  localStorage.setItem('4ym_admin_token', token);
}

export function clearAdminToken(): void {
  localStorage.removeItem('4ym_admin_token');
}

function authHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Public API
export async function fetchStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Erreur de chargement des paramètres');
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Erreur de chargement des catégories');
  return res.json();
}

export async function fetchProducts(params?: {
  category?: string;
  collection?: string;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  search?: string;
  sort?: string;
  min_price?: number;
  max_price?: number;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.collection) query.set('collection', params.collection);
  if (params?.featured !== undefined) query.set('featured', String(params.featured));
  if (params?.best_seller !== undefined) query.set('best_seller', String(params.best_seller));
  if (params?.new_arrival !== undefined) query.set('new_arrival', String(params.new_arrival));
  if (params?.search) query.set('search', params.search);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.min_price) query.set('min_price', String(params.min_price));
  if (params?.max_price) query.set('max_price', String(params.max_price));

  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Erreur de chargement des produits');
  return res.json();
}

export async function fetchProductByIdentifier(identifier: string): Promise<{ product: Product; related: Product[] }> {
  const res = await fetch(`${API_BASE}/products/${identifier}`);
  if (!res.ok) throw new Error('Produit introuvable');
  return res.json();
}

export async function submitCODOrder(payload: CODOrderInput): Promise<{ success: boolean; message: string; order: Order }> {
  const res = await fetch(`${API_BASE}/orders/cod`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors de la confirmation de votre commande');
  }
  return data;
}

// Admin API
export async function loginAdmin(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Identifiants invalides');
  }
  setAdminToken(data.token);
  return data;
}

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Erreur chargement statistiques');
  return res.json();
}

export async function uploadAdminProductImage(imageData: string, fileName?: string): Promise<{ success: boolean; url: string; name: string }> {
  const res = await fetch(`${API_BASE}/admin/upload-image`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ image_data: imageData, file_name: fileName }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors de l\'envoi de l\'image');
  }
  return data;
}

export async function fetchAdminProducts(params?: { category?: string; collection?: string; search?: string; status?: string }): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.collection) query.set('collection', params.collection);
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);

  const res = await fetch(`${API_BASE}/admin/products?${query.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Erreur chargement des produits admin');
  return res.json();
}

export async function createAdminProduct(productData: any): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur création produit');
  return data;
}

export async function updateAdminProduct(id: string, productData: any): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur mise à jour produit');
  return data;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erreur suppression produit');
  }
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Erreur chargement catégories');
  return res.json();
}

export async function createAdminCategory(categoryData: any): Promise<Category> {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(categoryData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur création catégorie');
  return data;
}

export async function updateAdminCategory(id: string, categoryData: any): Promise<Category> {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(categoryData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur modification catégorie');
  return data;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Erreur suppression catégorie');
}

export async function fetchAdminOrders(params?: { status?: string; city?: string; search?: string; date?: string }): Promise<Order[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.city) query.set('city', params.city);
  if (params?.search) query.set('search', params.search);
  if (params?.date) query.set('date', params.date);

  const res = await fetch(`${API_BASE}/admin/orders?${query.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Erreur chargement des commandes');
  return res.json();
}

export async function updateAdminOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur mise à jour statut');
  return data;
}

export async function deleteAdminOrder(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Erreur suppression commande');
}

export async function fetchAdminSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Erreur chargement paramètres');
  return res.json();
}

export async function updateAdminSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur sauvegarde paramètres');
  return data;
}

// Admin Account Registration & Approval
export async function registerAdminRequest(name: string, email: string, password: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erreur lors de l'enregistrement de la demande");
  }
  return data;
}

export async function fetchPendingAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE}/admin/pending-users`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors du chargement des demandes de comptes');
  }
  return data.users || [];
}

export async function approveAdminUser(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/users/${id}/approve`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erreur lors de l'approbation du compte");
  }
  return data;
}

export async function rejectAdminUser(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/users/${id}/reject`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors du refus du compte');
  }
  return data;
}

