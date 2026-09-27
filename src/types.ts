export type OrderStatus = 'New' | 'Confirmed' | 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type CollectionSlug = 'boys' | 'girls' | 'new_arrival' | 'best_seller' | 'featured';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  status: 'active' | 'hidden';
  item_count?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  position: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // In Moroccan Dirhams (MAD/DH)
  old_price?: number | null;
  category_id: string;
  category_name?: string;
  stock: number;
  sku: string;
  details: string[];
  tags: string[];
  collections: string[]; // ['boys', 'girls', 'new_arrival', 'best_seller', 'featured']
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  status: 'active' | 'draft' | 'out_of_stock';
  image1: string; // Required Image 1
  image2: string; // Required Image 2
  images: string[]; // [image1, image2]
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  total: number;
  delivery_fee: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  status?: 'pending' | 'approved' | 'rejected';
  email_verified?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface StoreSettings {
  store_name: string;
  slogan: string;
  instagram_handle: string;
  whatsapp_number: string;
  contact_email: string;
  store_address: string;
  free_delivery_enabled: boolean;
  delivery_price: number;
  delivery_message: string;
  delivery_cities: string[];
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  whatsapp_url: string;
  announcement_bar: string;
  homepage_title: string;
  homepage_subtitle: string;
  footer_text: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CODOrderInput {
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}
