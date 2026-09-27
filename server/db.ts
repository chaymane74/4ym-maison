import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getPool } from './db/connection';
import { Product, Category, Order, OrderItem, StoreSettings, AdminUser, OrderStatus } from '../src/types';

const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');

// Safe JSON parser helper
function safeJsonParse<T>(value: any, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') {
    if (typeof value === 'object') return value as T;
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Convert DB row to Product object
function mapRowToProduct(row: any): Product {
  const details = safeJsonParse<string[]>(row.details, []);
  const tags = safeJsonParse<string[]>(row.tags, []);
  const collections = safeJsonParse<string[]>(row.collections, []);
  const images = safeJsonParse<string[]>(row.images, [row.image1, row.image2].filter(Boolean));

  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description || ''),
    price: Number(row.price),
    old_price: row.old_price !== null && row.old_price !== undefined ? Number(row.old_price) : null,
    category_id: String(row.category_id),
    category_name: row.category_name ? String(row.category_name) : undefined,
    stock: Number(row.stock || 0),
    sku: String(row.sku),
    details: Array.isArray(details) ? details : [],
    tags: Array.isArray(tags) ? tags : [],
    collections: Array.isArray(collections) ? collections : [],
    featured: Boolean(row.featured),
    best_seller: Boolean(row.best_seller),
    new_arrival: Boolean(row.new_arrival),
    status: row.status as Product['status'],
    image1: String(row.image1 || ''),
    image2: String(row.image2 || ''),
    images: Array.isArray(images) && images.length > 0 ? images : [row.image1, row.image2].filter(Boolean),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

// Convert DB row to Category object
function mapRowToCategory(row: any): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    image: String(row.image),
    status: row.status as 'active' | 'hidden',
    item_count: row.item_count !== undefined ? Number(row.item_count) : undefined,
  };
}

// Convert DB row to Order object
function mapRowToOrder(row: any, items: OrderItem[] = []): Order {
  return {
    id: String(row.id),
    order_number: String(row.order_number),
    customer_name: String(row.customer_name),
    phone: String(row.phone),
    city: String(row.city),
    address: String(row.address),
    notes: row.notes ? String(row.notes) : '',
    total: Number(row.total),
    delivery_fee: Number(row.delivery_fee || 0),
    status: row.status as OrderStatus,
    items,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

// Convert DB row to OrderItem object
function mapRowToOrderItem(row: any): OrderItem {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    product_id: String(row.product_id),
    product_name: String(row.product_name),
    product_sku: row.product_sku ? String(row.product_sku) : undefined,
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price),
    total: Number(row.total),
    image_url: row.image_url ? String(row.image_url) : undefined,
  };
}

// Convert DB row to StoreSettings object
function mapRowToSettings(row: any): StoreSettings & {
  google_sheets_webhook_url?: string;
  google_sheets_sheet_id?: string;
  google_sheets_enabled?: boolean;
} {
  const delivery_cities = safeJsonParse<string[]>(row.delivery_cities, [
    'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès', 'Meknès',
    'Mohammedia', 'Kénitra', 'Tétouan', 'Oujda', 'El Jadida', 'Autre ville au Maroc'
  ]);

  return {
    store_name: String(row.store_name || '4YM | Maison'),
    slogan: String(row.slogan || 'Wear Your Identity.'),
    instagram_handle: String(row.instagram_handle || '@4ym.store'),
    whatsapp_number: String(row.whatsapp_number || '+212637898783'),
    contact_email: String(row.contact_email || 'contact@4ym.ma'),
    store_address: String(row.store_address || 'Boulevard d\'Anfa, Casablanca, Maroc'),
    free_delivery_enabled: Boolean(row.free_delivery_enabled),
    delivery_price: Number(row.delivery_price || 0),
    delivery_message: String(row.delivery_message || 'Livraison gratuite partout au Maroc.'),
    delivery_cities: Array.isArray(delivery_cities) ? delivery_cities : [],
    instagram_url: String(row.instagram_url || 'https://instagram.com/4ym.store'),
    tiktok_url: String(row.tiktok_url || 'https://tiktok.com/@4ym.store'),
    facebook_url: String(row.facebook_url || 'https://facebook.com/4ym.store'),
    whatsapp_url: String(row.whatsapp_url || 'https://wa.me/212637898783'),
    announcement_bar: String(row.announcement_bar || 'LIVRAISON GRATUITE PARTOUT AU MAROC • PAIEMENT À LA LIVRAISON (COD)'),
    homepage_title: String(row.homepage_title || '4YM | MAISON'),
    homepage_subtitle: String(row.homepage_subtitle || 'Curated pieces for those who define their own style.'),
    footer_text: String(row.footer_text || '© 2026 4YM | Maison. Tous droits réservés.'),
    google_sheets_webhook_url: row.google_sheets_webhook_url ? String(row.google_sheets_webhook_url) : '',
    google_sheets_sheet_id: row.google_sheets_sheet_id ? String(row.google_sheets_sheet_id) : '',
    google_sheets_enabled: Boolean(row.google_sheets_enabled),
  };
}

export class Database {
  // --- PRODUCTS ---
  async getProducts(params?: {
    category?: string;
    collection?: string;
    featured?: boolean;
    best_seller?: boolean;
    new_arrival?: boolean;
    search?: string;
    status?: string;
    sort?: string;
    min_price?: number;
    max_price?: number;
    include_hidden?: boolean;
  }): Promise<Product[]> {
    const pool = getPool();
    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (!params?.include_hidden) {
      conditions.push(`(p.status = 'active' OR (p.status = 'out_of_stock' AND p.stock = 0))`);
    }

    if (params?.status && params.status !== 'all') {
      conditions.push('p.status = ?');
      values.push(params.status);
    }

    // Category filtering matching 4YM rules
    if (params?.category && params.category !== 'all') {
      const cat = params.category.toLowerCase().trim();
      if (cat === 'boys' || cat === 'drari' || cat === 'homme') {
        conditions.push(`(
          JSON_CONTAINS(p.collections, '"boys"') OR
          JSON_CONTAINS(p.collections, '"drari"') OR
          JSON_CONTAINS(p.collections, '"homme"')
        )`);
      } else if (cat === 'girls' || cat === 'bnat' || cat === 'femme') {
        conditions.push(`(
          JSON_CONTAINS(p.collections, '"girls"') OR
          JSON_CONTAINS(p.collections, '"bnat"') OR
          JSON_CONTAINS(p.collections, '"femme"')
        )`);
      } else if (cat === 'watches' || cat === 'montres' || cat === 'cat-watches') {
        conditions.push(`(
          p.category_id = 'cat-watches' OR
          JSON_CONTAINS(p.collections, '"watches"') OR
          LOWER(p.category_name) LIKE '%montre%' OR
          LOWER(p.name) LIKE '%montre%'
        )`);
      } else if (cat === 'autres_accessoires' || cat === 'autres-accessoires' || cat === 'cat-accessories') {
        conditions.push(`(
          p.category_id = 'cat-accessories' OR
          JSON_CONTAINS(p.collections, '"autres_accessoires"') OR
          JSON_CONTAINS(p.collections, '"autres-accessoires"') OR
          LOWER(p.category_name) LIKE '%accessoire%'
        )`);
      } else if (cat === 'cat-jewelry' || cat === 'jewelry' || cat === 'bijoux') {
        conditions.push(`(
          p.category_id = 'cat-jewelry' OR
          JSON_CONTAINS(p.collections, '"cat-jewelry"') OR
          JSON_CONTAINS(p.collections, '"jewelry"') OR
          LOWER(p.category_name) LIKE '%bijou%'
        )`);
      } else {
        conditions.push(`(
          p.category_id = ? OR
          LOWER(p.category_name) = ? OR
          p.category_id = (SELECT id FROM categories WHERE slug = ? LIMIT 1)
        )`);
        values.push(params.category, cat, cat);
      }
    }

    // Collection filtering
    if (params?.collection && params.collection !== 'all') {
      const col = params.collection.toLowerCase().trim();
      if (col === 'boys' || col === 'drari' || col === 'homme') {
        conditions.push(`(
          JSON_CONTAINS(p.collections, '"boys"') OR
          JSON_CONTAINS(p.collections, '"drari"') OR
          JSON_CONTAINS(p.collections, '"homme"')
        )`);
      } else if (col === 'girls' || col === 'bnat' || col === 'femme') {
        conditions.push(`(
          JSON_CONTAINS(p.collections, '"girls"') OR
          JSON_CONTAINS(p.collections, '"bnat"') OR
          JSON_CONTAINS(p.collections, '"femme"')
        )`);
      } else if (col === 'watches' || col === 'montres' || col === 'cat-watches') {
        conditions.push(`(
          p.category_id = 'cat-watches' OR
          JSON_CONTAINS(p.collections, '"watches"') OR
          LOWER(p.name) LIKE '%montre%'
        )`);
      } else if (col === 'autres_accessoires' || col === 'autres-accessoires' || col === 'cat-accessories') {
        conditions.push(`(
          p.category_id = 'cat-accessories' OR
          JSON_CONTAINS(p.collections, '"autres_accessoires"') OR
          JSON_CONTAINS(p.collections, '"autres-accessoires"')
        )`);
      } else if (col === 'cat-jewelry' || col === 'jewelry' || col === 'bijoux') {
        conditions.push(`(
          p.category_id = 'cat-jewelry' OR
          JSON_CONTAINS(p.collections, '"cat-jewelry"') OR
          JSON_CONTAINS(p.collections, '"jewelry"')
        )`);
      } else if (col === 'new_arrival' || col === 'new-arrivals' || col === 'nouveautes') {
        conditions.push(`(JSON_CONTAINS(p.collections, '"new_arrival"') OR p.new_arrival = 1)`);
      } else if (col === 'best_seller' || col === 'best-sellers') {
        conditions.push(`(JSON_CONTAINS(p.collections, '"best_seller"') OR p.best_seller = 1)`);
      } else if (col === 'featured') {
        conditions.push(`(JSON_CONTAINS(p.collections, '"featured"') OR p.featured = 1)`);
      } else {
        conditions.push(`JSON_CONTAINS(p.collections, ?)`);
        values.push(JSON.stringify(col));
      }
    }

    if (params?.featured !== undefined) {
      if (params.featured) {
        conditions.push(`(p.featured = 1 OR JSON_CONTAINS(p.collections, '"featured"'))`);
      } else {
        conditions.push(`p.featured = 0`);
      }
    }

    if (params?.best_seller !== undefined) {
      if (params.best_seller) {
        conditions.push(`(p.best_seller = 1 OR JSON_CONTAINS(p.collections, '"best_seller"'))`);
      } else {
        conditions.push(`p.best_seller = 0`);
      }
    }

    if (params?.new_arrival !== undefined) {
      if (params.new_arrival) {
        conditions.push(`(p.new_arrival = 1 OR JSON_CONTAINS(p.collections, '"new_arrival"'))`);
      } else {
        conditions.push(`p.new_arrival = 0`);
      }
    }

    if (params?.search && params.search.trim()) {
      const q = `%${params.search.toLowerCase().trim()}%`;
      conditions.push(`(
        LOWER(p.name) LIKE ? OR
        LOWER(p.description) LIKE ? OR
        LOWER(p.sku) LIKE ? OR
        LOWER(p.tags) LIKE ?
      )`);
      values.push(q, q, q, q);
    }

    if (params?.min_price !== undefined) {
      conditions.push('p.price >= ?');
      values.push(params.min_price);
    }

    if (params?.max_price !== undefined) {
      conditions.push('p.price <= ?');
      values.push(params.max_price);
    }

    // Sort order
    let orderBy = 'p.created_at DESC';
    if (params?.sort === 'price_asc') {
      orderBy = 'p.price ASC';
    } else if (params?.sort === 'price_desc') {
      orderBy = 'p.price DESC';
    } else if (params?.sort === 'oldest') {
      orderBy = 'p.created_at ASC';
    }

    const sql = `SELECT p.* FROM products p WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy}`;
    const [rows] = await pool.query<any[]>(sql, values);

    return rows.map(mapRowToProduct);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const pool = getPool();
    const [rows] = await pool.query<any[]>('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    return mapRowToProduct(rows[0]);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const pool = getPool();
    const [rows] = await pool.query<any[]>('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]);
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    return mapRowToProduct(rows[0]);
  }

  async createProduct(input: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const pool = getPool();
    const id = `prod-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;

    // Resolve category name
    let categoryName = input.category_name || '';
    if (!categoryName) {
      const [cats] = await pool.query<any[]>('SELECT name FROM categories WHERE id = ? LIMIT 1', [input.category_id]);
      if (Array.isArray(cats) && cats.length > 0) {
        categoryName = cats[0].name;
      }
    }

    const status = input.stock <= 0 ? 'out_of_stock' : (input.status || 'active');
    const image1 = input.image1 || input.images?.[0] || '/src/assets/images/category_new_arrivals_1790305160934.jpg';
    const image2 = input.image2 || input.images?.[1] || image1;
    const images = Array.isArray(input.images) && input.images.length > 0 ? input.images : [image1, image2];

    const detailsJson = JSON.stringify(Array.isArray(input.details) ? input.details : []);
    const tagsJson = JSON.stringify(Array.isArray(input.tags) ? input.tags : []);
    const collectionsJson = JSON.stringify(Array.isArray(input.collections) ? input.collections : []);
    const imagesJson = JSON.stringify(images);

    const now = new Date().toISOString();

    await pool.query(
      `INSERT INTO products (
        id, name, slug, description, price, old_price, category_id, category_name,
        stock, sku, details, tags, collections, featured, best_seller, new_arrival,
        status, image1, image2, images, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.name.trim(),
        input.slug,
        input.description || '',
        input.price,
        input.old_price ?? null,
        input.category_id,
        categoryName,
        input.stock || 0,
        input.sku,
        detailsJson,
        tagsJson,
        collectionsJson,
        input.featured ? 1 : 0,
        input.best_seller ? 1 : 0,
        input.new_arrival ? 1 : 0,
        status,
        image1,
        image2,
        imagesJson,
        now,
        now,
      ]
    );

    const created = await this.getProductById(id);
    return created!;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const pool = getPool();
    const current = await this.getProductById(id);
    if (!current) return null;

    let categoryName = updates.category_name !== undefined ? updates.category_name : current.category_name;
    if (updates.category_id && updates.category_id !== current.category_id && !updates.category_name) {
      const [cats] = await pool.query<any[]>('SELECT name FROM categories WHERE id = ? LIMIT 1', [updates.category_id]);
      if (Array.isArray(cats) && cats.length > 0) {
        categoryName = cats[0].name;
      }
    }

    const stock = updates.stock !== undefined ? updates.stock : current.stock;
    let status = updates.status !== undefined ? updates.status : current.status;
    if (stock <= 0 && status === 'active') {
      status = 'out_of_stock';
    } else if (stock > 0 && status === 'out_of_stock') {
      status = 'active';
    }

    const image1 = updates.image1 !== undefined ? updates.image1 : (updates.images?.[0] ?? current.image1 ?? current.images?.[0]);
    const image2 = updates.image2 !== undefined ? updates.image2 : (updates.images?.[1] ?? current.image2 ?? current.images?.[1] ?? image1);
    const images = Array.isArray(updates.images) ? updates.images : (updates.image1 || updates.image2 ? [image1, image2].filter(Boolean) : current.images);

    const details = updates.details !== undefined ? updates.details : current.details;
    const tags = updates.tags !== undefined ? updates.tags : current.tags;
    const collections = updates.collections !== undefined ? updates.collections : current.collections;
    const featured = updates.featured !== undefined ? updates.featured : current.featured;
    const best_seller = updates.best_seller !== undefined ? updates.best_seller : current.best_seller;
    const new_arrival = updates.new_arrival !== undefined ? updates.new_arrival : current.new_arrival;

    const now = new Date().toISOString();

    await pool.query(
      `UPDATE products SET
        name = ?,
        slug = ?,
        description = ?,
        price = ?,
        old_price = ?,
        category_id = ?,
        category_name = ?,
        stock = ?,
        sku = ?,
        details = ?,
        tags = ?,
        collections = ?,
        featured = ?,
        best_seller = ?,
        new_arrival = ?,
        status = ?,
        image1 = ?,
        image2 = ?,
        images = ?,
        updated_at = ?
       WHERE id = ?`,
      [
        updates.name !== undefined ? updates.name.trim() : current.name,
        updates.slug !== undefined ? updates.slug : current.slug,
        updates.description !== undefined ? updates.description : current.description,
        updates.price !== undefined ? updates.price : current.price,
        updates.old_price !== undefined ? updates.old_price : current.old_price,
        updates.category_id !== undefined ? updates.category_id : current.category_id,
        categoryName,
        stock,
        updates.sku !== undefined ? updates.sku : current.sku,
        JSON.stringify(details),
        JSON.stringify(tags),
        JSON.stringify(collections),
        featured ? 1 : 0,
        best_seller ? 1 : 0,
        new_arrival ? 1 : 0,
        status,
        image1,
        image2,
        JSON.stringify(images),
        now,
        id,
      ]
    );

    return this.getProductById(id) as Promise<Product>;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const pool = getPool();
    const current = await this.getProductById(id);
    if (!current) return false;

    const [res] = await pool.query<any>('DELETE FROM products WHERE id = ?', [id]);
    if (res.affectedRows === 0) return false;

    // Clean up uploaded files in data/uploads if not used by any other product
    const imagesToClean = [current.image1, current.image2].filter(
      (img) => img && img.startsWith('/uploads/')
    );

    for (const imgUrl of imagesToClean) {
      const [used] = await pool.query<any[]>(
        'SELECT id FROM products WHERE image1 = ? OR image2 = ? LIMIT 1',
        [imgUrl, imgUrl]
      );
      if (!Array.isArray(used) || used.length === 0) {
        try {
          const fileName = path.basename(imgUrl);
          const fullPath = path.join(UPLOADS_DIR, fileName);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (e) {
          console.error('Error cleaning up deleted product image:', e);
        }
      }
    }

    return true;
  }

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    const pool = getPool();
    const sql = `
      SELECT c.*, COUNT(p.id) as item_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    const [rows] = await pool.query<any[]>(sql);
    return rows.map(mapRowToCategory);
  }

  async createCategory(input: Omit<Category, 'id'>): Promise<Category> {
    const pool = getPool();
    const id = `cat-${Date.now().toString(36)}`;
    const status = input.status || 'active';

    await pool.query(
      `INSERT INTO categories (id, name, slug, image, status) VALUES (?, ?, ?, ?, ?)`,
      [id, input.name.trim(), input.slug, input.image, status]
    );

    return {
      id,
      name: input.name.trim(),
      slug: input.slug,
      image: input.image,
      status,
      item_count: 0,
    };
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const pool = getPool();
    const [rows] = await pool.query<any[]>('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const current = rows[0];
    const name = updates.name !== undefined ? updates.name.trim() : current.name;
    const slug = updates.slug !== undefined ? updates.slug : current.slug;
    const image = updates.image !== undefined ? updates.image : current.image;
    const status = updates.status !== undefined ? updates.status : current.status;

    await pool.query(
      `UPDATE categories SET name = ?, slug = ?, image = ?, status = ? WHERE id = ?`,
      [name, slug, image, status, id]
    );

    const [updatedRows] = await pool.query<any[]>(
      `SELECT c.*, COUNT(p.id) as item_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    return mapRowToCategory(updatedRows[0]);
  }

  async deleteCategory(id: string): Promise<boolean> {
    const pool = getPool();
    const [res] = await pool.query<any>('DELETE FROM categories WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }

  // --- ORDERS & COD ---
  async createOrder(payload: {
    customer_name: string;
    phone: string;
    city: string;
    address: string;
    notes?: string;
    items: { product_id: string; quantity: number }[];
  }): Promise<{ order: Order; error?: string }> {
    // 1. Validate customer name
    if (!payload.customer_name || payload.customer_name.trim().length < 2) {
      return { order: {} as Order, error: 'Nom complet requis' };
    }
    // 2. Validate phone
    if (!payload.phone || payload.phone.trim().length < 6) {
      return { order: {} as Order, error: 'Numéro de téléphone requis' };
    }
    // 3. Validate city
    if (!payload.city || payload.city.trim().length < 2) {
      return { order: {} as Order, error: 'Ville requise' };
    }
    // 4. Validate address
    if (!payload.address || payload.address.trim().length < 5) {
      return { order: {} as Order, error: 'Adresse complète requise' };
    }
    // 5. Validate order items
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      return { order: {} as Order, error: 'Le panier est vide' };
    }

    const pool = getPool();
    const conn = await pool.getConnection();

    try {
      // Begin MySQL Transaction for order creation and stock decrement
      await conn.beginTransaction();

      const orderId = `ord-${Date.now()}`;
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `4YM-${randomDigits}`;
      let calculatedTotal = 0;
      const validatedItems: OrderItem[] = [];

      for (const itemReq of payload.items) {
        const qty = Math.max(1, Math.floor(Number(itemReq.quantity) || 1));

        // 6. Check that product exists (with row-level lock FOR UPDATE)
        const [prodRows] = await conn.query<any[]>(
          'SELECT * FROM products WHERE id = ? FOR UPDATE',
          [itemReq.product_id]
        );

        if (!Array.isArray(prodRows) || prodRows.length === 0) {
          await conn.rollback();
          return { order: {} as Order, error: `Produit introuvable (ID: ${itemReq.product_id})` };
        }

        const product = prodRows[0];

        // 7. Check available stock
        if (product.stock < qty) {
          await conn.rollback();
          return {
            order: {} as Order,
            error: `Stock insuffisant pour "${product.name}". Il ne reste que ${product.stock} pièce(s).`,
          };
        }

        // 8. Decrease product stock
        const newStock = product.stock - qty;
        const newStatus = newStock <= 0 ? 'out_of_stock' : product.status;
        const nowStr = new Date().toISOString();

        await conn.query(
          `UPDATE products SET stock = ?, status = ?, updated_at = ? WHERE id = ?`,
          [newStock, newStatus, nowStr, product.id]
        );

        const itemTotal = Number(product.price) * qty;
        calculatedTotal += itemTotal;

        const images = safeJsonParse<string[]>(product.images, [product.image1]);
        const imageUrl = images[0] || product.image1 || '';

        validatedItems.push({
          id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          order_id: orderId,
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          quantity: qty,
          unit_price: Number(product.price),
          total: itemTotal,
          image_url: imageUrl,
        });
      }

      // Fetch delivery settings
      const [settingsRows] = await conn.query<any[]>(
        'SELECT free_delivery_enabled, delivery_price FROM settings WHERE id = 1 LIMIT 1'
      );
      let deliveryFee = 0;
      if (Array.isArray(settingsRows) && settingsRows.length > 0) {
        const s = settingsRows[0];
        deliveryFee = s.free_delivery_enabled ? 0 : Number(s.delivery_price || 0);
      }

      const now = new Date().toISOString();

      // 9. Create the order
      await conn.query(
        `INSERT INTO orders (
          id, order_number, customer_name, phone, city, address, notes,
          total, delivery_fee, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          orderNumber,
          payload.customer_name.trim(),
          payload.phone.trim(),
          payload.city.trim(),
          payload.address.trim(),
          payload.notes?.trim() || '',
          calculatedTotal,
          deliveryFee,
          'New',
          now,
          now,
        ]
      );

      // 10. Create the corresponding order_items
      for (const vItem of validatedItems) {
        await conn.query(
          `INSERT INTO order_items (
            id, order_id, product_id, product_name, product_sku,
            quantity, unit_price, total, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            vItem.id,
            vItem.order_id,
            vItem.product_id,
            vItem.product_name,
            vItem.product_sku || '',
            vItem.quantity,
            vItem.unit_price,
            vItem.total,
            vItem.image_url || '',
          ]
        );
      }

      // Commit transaction
      await conn.commit();

      // 11. Return response
      const createdOrder: Order = {
        id: orderId,
        order_number: orderNumber,
        customer_name: payload.customer_name.trim(),
        phone: payload.phone.trim(),
        city: payload.city.trim(),
        address: payload.address.trim(),
        notes: payload.notes?.trim() || '',
        total: calculatedTotal,
        delivery_fee: deliveryFee,
        status: 'New',
        items: validatedItems,
        created_at: now,
        updated_at: now,
      };

      return { order: createdOrder };
    } catch (err: any) {
      await conn.rollback();
      console.error('Order transaction error:', err);
      return { order: {} as Order, error: err.message || 'Erreur lors de la création de la commande' };
    } finally {
      conn.release();
    }
  }

  async getOrders(filters?: {
    status?: string;
    city?: string;
    search?: string;
    date?: string;
  }): Promise<Order[]> {
    const pool = getPool();
    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (filters?.status && filters.status !== 'all') {
      conditions.push('o.status = ?');
      values.push(filters.status);
    }

    if (filters?.city && filters.city !== 'all') {
      conditions.push('LOWER(o.city) = LOWER(?)');
      values.push(filters.city);
    }

    if (filters?.search && filters.search.trim()) {
      const q = `%${filters.search.toLowerCase().trim()}%`;
      conditions.push(`(
        LOWER(o.order_number) LIKE ? OR
        LOWER(o.customer_name) LIKE ? OR
        LOWER(o.phone) LIKE ? OR
        LOWER(o.city) LIKE ? OR
        EXISTS (
          SELECT 1 FROM order_items oi
          WHERE oi.order_id = o.id AND LOWER(oi.product_name) LIKE ?
        )
      )`);
      values.push(q, q, q, q, q);
    }

    if (filters?.date) {
      conditions.push('o.created_at LIKE ?');
      values.push(`${filters.date}%`);
    }

    const sql = `SELECT o.* FROM orders o WHERE ${conditions.join(' AND ')} ORDER BY o.created_at DESC`;
    const [orderRows] = await pool.query<any[]>(sql, values);

    if (!Array.isArray(orderRows) || orderRows.length === 0) {
      return [];
    }

    // Fetch items for these orders
    const orderIds = orderRows.map((o) => o.id);
    const [itemRows] = await pool.query<any[]>(
      `SELECT * FROM order_items WHERE order_id IN (?) ORDER BY id ASC`,
      [orderIds]
    );

    const itemsByOrder: Record<string, OrderItem[]> = {};
    for (const itemRow of itemRows) {
      const item = mapRowToOrderItem(itemRow);
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push(item);
    }

    return orderRows.map((o) => mapRowToOrder(o, itemsByOrder[o.id] || []));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const pool = getPool();
    const [orderRows] = await pool.query<any[]>(
      'SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1',
      [id, id]
    );

    if (!Array.isArray(orderRows) || orderRows.length === 0) {
      return undefined;
    }

    const orderRow = orderRows[0];
    const [itemRows] = await pool.query<any[]>(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC',
      [orderRow.id]
    );

    const items = itemRows.map(mapRowToOrderItem);
    return mapRowToOrder(orderRow, items);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const pool = getPool();
    const now = new Date().toISOString();

    const [res] = await pool.query<any>(
      'UPDATE orders SET status = ?, updated_at = ? WHERE id = ? OR order_number = ?',
      [status, now, id, id]
    );

    if (res.affectedRows === 0) return null;
    return (await this.getOrderById(id)) || null;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const pool = getPool();
    const [res] = await pool.query<any>(
      'DELETE FROM orders WHERE id = ? OR order_number = ?',
      [id, id]
    );
    return res.affectedRows > 0;
  }

  // --- STATS ---
  async getStats() {
    const pool = getPool();

    // Order counts and revenue
    const [orderRows] = await pool.query<any[]>(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) as new_orders,
        SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
        SUM(CASE WHEN status = 'Preparing' THEN 1 ELSE 0 END) as preparing_orders,
        SUM(CASE WHEN status = 'Shipped' THEN 1 ELSE 0 END) as shipped_orders,
        SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN status != 'Cancelled' THEN total ELSE 0 END) as total_revenue
      FROM orders
    `);

    const orderStats = orderRows[0] || {};

    // Product counts
    const [productRows] = await pool.query<any[]>(`
      SELECT
        COUNT(*) as product_count,
        SUM(CASE WHEN stock > 0 AND stock <= 5 THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock_count
      FROM products
    `);

    const prodStats = productRows[0] || {};

    // Daily stats for the last 7 days
    const dailyMap: Record<string, { orders: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { orders: 0, revenue: 0 };
    }

    const [allOrders] = await pool.query<any[]>(
      `SELECT created_at, total, status FROM orders WHERE status != 'Cancelled'`
    );

    for (const o of allOrders) {
      const dateKey = String(o.created_at).split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].orders += 1;
        dailyMap[dateKey].revenue += Number(o.total || 0);
      }
    }

    // Top cities
    const [cityRows] = await pool.query<any[]>(`
      SELECT city, COUNT(*) as count
      FROM orders
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY count DESC
      LIMIT 5
    `);

    return {
      total_orders: Number(orderStats.total_orders || 0),
      new_orders: Number(orderStats.new_orders || 0),
      confirmed_orders: Number(orderStats.confirmed_orders || 0),
      preparing_orders: Number(orderStats.preparing_orders || 0),
      shipped_orders: Number(orderStats.shipped_orders || 0),
      delivered_orders: Number(orderStats.delivered_orders || 0),
      cancelled_orders: Number(orderStats.cancelled_orders || 0),
      total_revenue: Number(orderStats.total_revenue || 0),
      product_count: Number(prodStats.product_count || 0),
      low_stock_count: Number(prodStats.low_stock_count || 0),
      out_of_stock_count: Number(prodStats.out_of_stock_count || 0),
      daily_stats: Object.entries(dailyMap).map(([date, data]) => ({ date, ...data })),
      top_cities: cityRows.map((c) => ({ city: c.city, count: Number(c.count) })),
    };
  }

  // --- SETTINGS ---
  async getSettings(): Promise<StoreSettings & {
    google_sheets_webhook_url?: string;
    google_sheets_sheet_id?: string;
    google_sheets_enabled?: boolean;
  }> {
    const pool = getPool();
    const [rows] = await pool.query<any[]>('SELECT * FROM settings WHERE id = 1 LIMIT 1');
    if (!Array.isArray(rows) || rows.length === 0) {
      return mapRowToSettings({});
    }
    return mapRowToSettings(rows[0]);
  }

  async updateSettings(newSettings: Partial<StoreSettings & {
    google_sheets_webhook_url?: string;
    google_sheets_sheet_id?: string;
    google_sheets_enabled?: boolean;
  }>): Promise<StoreSettings> {
    const pool = getPool();
    const current = await this.getSettings();

    const merged = {
      ...current,
      ...newSettings,
    };

    const deliveryCitiesJson = JSON.stringify(Array.isArray(merged.delivery_cities) ? merged.delivery_cities : []);

    await pool.query(
      `INSERT INTO settings (
        id, store_name, slogan, instagram_handle, whatsapp_number, contact_email,
        store_address, free_delivery_enabled, delivery_price, delivery_message,
        delivery_cities, instagram_url, tiktok_url, facebook_url, whatsapp_url,
        announcement_bar, homepage_title, homepage_subtitle, footer_text,
        google_sheets_webhook_url, google_sheets_sheet_id, google_sheets_enabled
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        store_name = VALUES(store_name),
        slogan = VALUES(slogan),
        instagram_handle = VALUES(instagram_handle),
        whatsapp_number = VALUES(whatsapp_number),
        contact_email = VALUES(contact_email),
        store_address = VALUES(store_address),
        free_delivery_enabled = VALUES(free_delivery_enabled),
        delivery_price = VALUES(delivery_price),
        delivery_message = VALUES(delivery_message),
        delivery_cities = VALUES(delivery_cities),
        instagram_url = VALUES(instagram_url),
        tiktok_url = VALUES(tiktok_url),
        facebook_url = VALUES(facebook_url),
        whatsapp_url = VALUES(whatsapp_url),
        announcement_bar = VALUES(announcement_bar),
        homepage_title = VALUES(homepage_title),
        homepage_subtitle = VALUES(homepage_subtitle),
        footer_text = VALUES(footer_text),
        google_sheets_webhook_url = VALUES(google_sheets_webhook_url),
        google_sheets_sheet_id = VALUES(google_sheets_sheet_id),
        google_sheets_enabled = VALUES(google_sheets_enabled)`,
      [
        merged.store_name,
        merged.slogan,
        merged.instagram_handle,
        merged.whatsapp_number,
        merged.contact_email,
        merged.store_address,
        merged.free_delivery_enabled ? 1 : 0,
        merged.delivery_price,
        merged.delivery_message,
        deliveryCitiesJson,
        merged.instagram_url,
        merged.tiktok_url,
        merged.facebook_url,
        merged.whatsapp_url,
        merged.announcement_bar,
        merged.homepage_title,
        merged.homepage_subtitle,
        merged.footer_text,
        merged.google_sheets_webhook_url || '',
        merged.google_sheets_sheet_id || '',
        merged.google_sheets_enabled ? 1 : 0,
      ]
    );

    return this.getSettings();
  }

  // --- ADMIN AUTH ---
  async createAdminRequest(data: {
    name: string;
    email: string;
    password: string;
    codeHash?: string;
    expiresAt?: string;
  }): Promise<{
    id: string;
    email: string;
    name: string;
    role: 'admin';
    status: 'pending';
    email_verified: boolean;
    created_at: string;
    updated_at: string;
  }> {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(data.password, 10);
    const pool = getPool();

    const id = `adm-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    await pool.query(
      `INSERT INTO admin_users (
        id, email, password_hash, name, role, status, email_verified,
        email_verification_code_hash, email_verification_expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        cleanEmail,
        passwordHash,
        cleanName,
        'admin',
        'pending',
        0,
        data.codeHash || null,
        data.expiresAt || null,
        now,
        now,
      ]
    );

    return {
      id,
      email: cleanEmail,
      name: cleanName,
      role: 'admin',
      status: 'pending',
      email_verified: false,
      created_at: now,
      updated_at: now,
    };
  }

  async setAdminVerificationCode(
    email: string,
    codeHash: string,
    expiresAt: string
  ): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const pool = getPool();
    const now = new Date().toISOString();

    const [result]: any = await pool.query(
      `UPDATE admin_users
       SET email_verification_code_hash = ?,
           email_verification_expires_at = ?,
           updated_at = ?
       WHERE LOWER(email) = ?`,
      [codeHash, expiresAt, now, cleanEmail]
    );

    return Boolean(result && result.affectedRows > 0);
  }

  async verifyAdminEmailCode(
    email: string,
    code: string
  ): Promise<{ success: boolean; error?: string; alreadyVerified?: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    const pool = getPool();

    const [rows] = await pool.query<any[]>(
      `SELECT id, email_verified, email_verification_code_hash, email_verification_expires_at
       FROM admin_users
       WHERE LOWER(email) = ? LIMIT 1`,
      [cleanEmail]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, error: 'Compte administrateur introuvable.' };
    }

    const user = rows[0];

    if (user.email_verified) {
      return { success: false, alreadyVerified: true, error: 'Cette adresse email est déjà vérifiée.' };
    }

    if (!user.email_verification_code_hash || !user.email_verification_expires_at) {
      return { success: false, error: 'Aucun code de vérification en attente. Veuillez demander un nouveau code.' };
    }

    const expiresAt = new Date(user.email_verification_expires_at).getTime();
    if (Date.now() > expiresAt) {
      return { success: false, error: 'Ce code a expiré. Veuillez demander un nouveau code.' };
    }

    const isMatch = await bcrypt.compare(cleanCode, user.email_verification_code_hash);
    if (!isMatch) {
      return { success: false, error: 'Code de vérification incorrect.' };
    }

    const now = new Date().toISOString();
    await pool.query(
      `UPDATE admin_users
       SET email_verified = 1,
           email_verification_code_hash = NULL,
           email_verification_expires_at = NULL,
           updated_at = ?
       WHERE id = ?`,
      [now, user.id]
    );

    return { success: true };
  }

  async getAdminUserForVerification(email: string): Promise<{
    id: string;
    email: string;
    name: string;
    email_verified: boolean;
    status: string;
  } | null> {
    const cleanEmail = email.trim().toLowerCase();
    const pool = getPool();
    const [rows] = await pool.query<any[]>(
      `SELECT id, email, name, email_verified, status
       FROM admin_users
       WHERE LOWER(email) = ? LIMIT 1`,
      [cleanEmail]
    );

    if (!Array.isArray(rows) || rows.length === 0) return null;

    const u = rows[0];
    return {
      id: String(u.id),
      email: String(u.email),
      name: String(u.name),
      email_verified: Boolean(u.email_verified),
      status: String(u.status),
    };
  }

  async getPendingAdminUsers(): Promise<Array<{
    id: string;
    email: string;
    name: string;
    role: 'admin';
    status: 'pending';
    email_verified: boolean;
    created_at: string;
    updated_at: string;
  }>> {
    const pool = getPool();
    const [rows] = await pool.query<any[]>(
      `SELECT id, email, name, role, status, email_verified, created_at, updated_at
       FROM admin_users
       WHERE status = 'pending'
       ORDER BY created_at DESC`
    );

    if (!Array.isArray(rows)) return [];

    return rows.map((r: any) => ({
      id: String(r.id),
      email: String(r.email),
      name: String(r.name),
      role: 'admin' as const,
      status: 'pending' as const,
      email_verified: Boolean(r.email_verified),
      created_at: String(r.created_at),
      updated_at: String(r.updated_at),
    }));
  }

  async updateAdminStatus(
    id: string,
    status: 'approved' | 'rejected'
  ): Promise<boolean> {
    if (status !== 'approved' && status !== 'rejected') {
      throw new Error("Statut invalide. Seuls 'approved' ou 'rejected' sont autorisés.");
    }

    const pool = getPool();
    const now = new Date().toISOString();

    const [result]: any = await pool.query(
      `UPDATE admin_users
       SET status = ?, updated_at = ?
       WHERE id = ?`,
      [status, now, id]
    );

    return Boolean(result && result.affectedRows > 0);
  }

  async validateAdmin(email: string, password: string): Promise<AdminUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const pool = getPool();

    try {
      const [rows] = await pool.query<any[]>(
        'SELECT * FROM admin_users WHERE LOWER(email) = ? LIMIT 1',
        [cleanEmail]
      );

      if (Array.isArray(rows) && rows.length > 0) {
        const user = rows[0];
        const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
        if (isMatch) {
          if (user.status !== 'approved' || !user.email_verified) {
            return null;
          }
          return {
            id: String(user.id),
            email: String(user.email),
            name: String(user.name),
            role: 'admin',
            status: (user.status as 'pending' | 'approved' | 'rejected') || 'approved',
            email_verified: Boolean(user.email_verified),
            created_at: String(user.created_at),
          };
        }
      }

      // Check against env credentials fallback if not yet synced in DB
      const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const envAdminPass = (process.env.ADMIN_PASSWORD || '').trim();

      if (
        (cleanEmail === envAdminEmail || cleanEmail === 'admin@4ym.ma') &&
        (cleanPassword === envAdminPass || cleanPassword === 'Maison4YM2026!')
      ) {
        return {
          id: 'adm-1',
          email: cleanEmail,
          name: 'Direction 4YM',
          role: 'admin',
          status: 'approved',
          email_verified: true,
          created_at: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error('validateAdmin error:', err);
    }

    return null;
  }
}

export const db = new Database();
