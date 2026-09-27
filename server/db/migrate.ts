import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { getPool } from './connection';
import { initDatabase } from './init';
import { Category, Product, Order, AdminUser, StoreSettings } from '../../src/types';

dotenv.config();

const JSON_FILE_PATH = path.resolve(process.cwd(), 'data', '4ym_store.json');

interface RawJsonData {
  categories?: Category[];
  products?: Product[];
  orders?: Order[];
  admin_users?: AdminUser[];
  settings?: StoreSettings & {
    google_sheets_webhook_url?: string;
    google_sheets_sheet_id?: string;
    google_sheets_enabled?: boolean;
  };
}

export async function runMigration(): Promise<boolean> {
  console.log('--- Starting Migration from JSON to MySQL ---');

  // Step 1: Ensure database & tables exist
  const initSuccess = await initDatabase();
  if (!initSuccess) {
    console.error('Migration aborted: Database initialization failed.');
    return false;
  }

  // Step 2: Read JSON file
  if (!fs.existsSync(JSON_FILE_PATH)) {
    console.warn(`JSON file not found at ${JSON_FILE_PATH}. No JSON data to migrate.`);
    return true;
  }

  let jsonData: RawJsonData;
  try {
    const rawContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    jsonData = JSON.parse(rawContent);
    console.log(`Successfully read ${JSON_FILE_PATH} (preserving file as backup).`);
  } catch (err: any) {
    console.error(`Error reading JSON file: ${err.message}`);
    return false;
  }

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Migrate Categories
    const categories = jsonData.categories || [];
    console.log(`Migrating ${categories.length} categories...`);
    for (const cat of categories) {
      await conn.query(
        `INSERT INTO categories (id, name, slug, image, status)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           slug = VALUES(slug),
           image = VALUES(image),
           status = VALUES(status)`,
        [cat.id, cat.name, cat.slug, cat.image, cat.status || 'active']
      );
    }
    console.log(`✓ Categories migrated.`);

    // 2. Migrate Products
    const products = jsonData.products || [];
    console.log(`Migrating ${products.length} products...`);
    for (const prod of products) {
      const detailsJson = JSON.stringify(Array.isArray(prod.details) ? prod.details : []);
      const tagsJson = JSON.stringify(Array.isArray(prod.tags) ? prod.tags : []);
      const collectionsJson = JSON.stringify(Array.isArray(prod.collections) ? prod.collections : []);
      const imagesJson = JSON.stringify(Array.isArray(prod.images) ? prod.images : [prod.image1, prod.image2].filter(Boolean));

      await conn.query(
        `INSERT INTO products (
          id, name, slug, description, price, old_price, category_id, category_name,
          stock, sku, details, tags, collections, featured, best_seller, new_arrival,
          status, image1, image2, images, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          slug = VALUES(slug),
          description = VALUES(description),
          price = VALUES(price),
          old_price = VALUES(old_price),
          category_id = VALUES(category_id),
          category_name = VALUES(category_name),
          stock = VALUES(stock),
          sku = VALUES(sku),
          details = VALUES(details),
          tags = VALUES(tags),
          collections = VALUES(collections),
          featured = VALUES(featured),
          best_seller = VALUES(best_seller),
          new_arrival = VALUES(new_arrival),
          status = VALUES(status),
          image1 = VALUES(image1),
          image2 = VALUES(image2),
          images = VALUES(images),
          updated_at = VALUES(updated_at)`,
        [
          prod.id,
          prod.name,
          prod.slug,
          prod.description || '',
          prod.price,
          prod.old_price ?? null,
          prod.category_id,
          prod.category_name || null,
          prod.stock ?? 0,
          prod.sku,
          detailsJson,
          tagsJson,
          collectionsJson,
          prod.featured ? 1 : 0,
          prod.best_seller ? 1 : 0,
          prod.new_arrival ? 1 : 0,
          prod.status || 'active',
          prod.image1 || '',
          prod.image2 || '',
          imagesJson,
          prod.created_at || new Date().toISOString(),
          prod.updated_at || new Date().toISOString(),
        ]
      );
    }
    console.log(`✓ Products migrated.`);

    // 3. Migrate Orders and Order Items
    const orders = jsonData.orders || [];
    console.log(`Migrating ${orders.length} orders...`);
    let orderItemCount = 0;

    for (const order of orders) {
      await conn.query(
        `INSERT INTO orders (
          id, order_number, customer_name, phone, city, address, notes,
          total, delivery_fee, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          order_number = VALUES(order_number),
          customer_name = VALUES(customer_name),
          phone = VALUES(phone),
          city = VALUES(city),
          address = VALUES(address),
          notes = VALUES(notes),
          total = VALUES(total),
          delivery_fee = VALUES(delivery_fee),
          status = VALUES(status),
          updated_at = VALUES(updated_at)`,
        [
          order.id,
          order.order_number,
          order.customer_name,
          order.phone,
          order.city,
          order.address,
          order.notes || '',
          order.total,
          order.delivery_fee ?? 0,
          order.status || 'New',
          order.created_at || new Date().toISOString(),
          order.updated_at || new Date().toISOString(),
        ]
      );

      // Order Items
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          orderItemCount++;
          await conn.query(
            `INSERT INTO order_items (
              id, order_id, product_id, product_name, product_sku,
              quantity, unit_price, total, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              product_name = VALUES(product_name),
              product_sku = VALUES(product_sku),
              quantity = VALUES(quantity),
              unit_price = VALUES(unit_price),
              total = VALUES(total),
              image_url = VALUES(image_url)`,
            [
              item.id || `item-${order.id}-${Math.random().toString(36).substring(2, 7)}`,
              order.id,
              item.product_id,
              item.product_name,
              item.product_sku || '',
              item.quantity,
              item.unit_price,
              item.total,
              item.image_url || '',
            ]
          );
        }
      }
    }
    console.log(`✓ Orders (${orders.length}) and Order Items (${orderItemCount}) migrated.`);

    // 4. Migrate Admin Users
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = (process.env.ADMIN_PASSWORD || 'Maison4YM2026!').trim();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUsers = jsonData.admin_users || [];
    if (adminUsers.length > 0) {
      for (const user of adminUsers) {
        await conn.query(
          `INSERT INTO admin_users (id, email, password_hash, name, role, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             role = VALUES(role)`,
          [
            user.id,
            user.email.toLowerCase(),
            hashedPassword,
            user.name || 'Direction 4YM',
            user.role || 'admin',
            user.created_at || new Date().toISOString(),
            new Date().toISOString(),
          ]
        );
      }
    } else {
      await conn.query(
        `INSERT INTO admin_users (id, email, password_hash, name, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           role = VALUES(role)`,
        [
          'adm-1',
          adminEmail,
          hashedPassword,
          'Direction 4YM',
          'admin',
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
    }
    console.log(`✓ Admin users migrated.`);

    // 5. Migrate Settings
    const settings = jsonData.settings;
    if (settings) {
      const deliveryCitiesJson = JSON.stringify(Array.isArray(settings.delivery_cities) ? settings.delivery_cities : []);
      await conn.query(
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
          settings.store_name || '4YM | Maison',
          settings.slogan || '',
          settings.instagram_handle || '',
          settings.whatsapp_number || '',
          settings.contact_email || '',
          settings.store_address || '',
          settings.free_delivery_enabled ? 1 : 0,
          settings.delivery_price ?? 0,
          settings.delivery_message || '',
          deliveryCitiesJson,
          settings.instagram_url || '',
          settings.tiktok_url || '',
          settings.facebook_url || '',
          settings.whatsapp_url || '',
          settings.announcement_bar || '',
          settings.homepage_title || '',
          settings.homepage_subtitle || '',
          settings.footer_text || '',
          settings.google_sheets_webhook_url || '',
          settings.google_sheets_sheet_id || '',
          settings.google_sheets_enabled ? 1 : 0,
        ]
      );
      console.log(`✓ Store settings migrated.`);
    }

    await conn.commit();
    console.log('--- Migration completed successfully! ---');
    return true;
  } catch (err: any) {
    await conn.rollback();
    console.error(`Migration error, transaction rolled back: ${err.message}`);
    return false;
  } finally {
    conn.release();
  }
}

// If run directly via CLI: tsx server/db/migrate.ts
if (process.argv[1]?.endsWith('migrate.ts')) {
  runMigration()
    .then((success) => {
      if (success) {
        console.log('Migration finished with exit code 0.');
        process.exit(0);
      } else {
        console.error('Migration failed with exit code 1.');
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}
