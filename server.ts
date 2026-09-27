import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { db } from './server/db';
import { getPool } from './server/db/connection';
import { initDatabase } from './server/db/init';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// --- SIMPLE TOKEN AUTH FOR ADMIN ---
const ADMIN_SECRET_TOKEN = '4ym-maison-sec-token-2026-auth';

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès non autorisé. Veuillez vous connecter.' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== ADMIN_SECRET_TOKEN) {
    return res.status(403).json({ error: 'Session expirée ou invalide.' });
  }
  next();
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// Get public store settings
app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await db.getSettings();
    // Do not leak webhook details to public
    const publicSettings = {
      store_name: settings.store_name,
      slogan: settings.slogan,
      instagram_handle: settings.instagram_handle,
      whatsapp_number: settings.whatsapp_number,
      contact_email: settings.contact_email,
      store_address: settings.store_address,
      free_delivery_enabled: settings.free_delivery_enabled,
      delivery_price: settings.delivery_price,
      delivery_message: settings.delivery_message,
      delivery_cities: settings.delivery_cities,
      instagram_url: settings.instagram_url,
      tiktok_url: settings.tiktok_url,
      facebook_url: settings.facebook_url,
      whatsapp_url: settings.whatsapp_url,
      announcement_bar: settings.announcement_bar,
      homepage_title: settings.homepage_title,
      homepage_subtitle: settings.homepage_subtitle,
      footer_text: settings.footer_text,
    };
    res.json(publicSettings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get public categories
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = (await db.getCategories()).filter(c => c.status === 'active');
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get public products with filters
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { category, collection, featured, best_seller, new_arrival, search, sort, min_price, max_price } = req.query;

    const products = await db.getProducts({
      category: category as string,
      collection: collection as string,
      featured: featured !== undefined ? featured === 'true' : undefined,
      best_seller: best_seller !== undefined ? best_seller === 'true' : undefined,
      new_arrival: new_arrival !== undefined ? new_arrival === 'true' : undefined,
      search: search as string,
      sort: sort as string,
      min_price: min_price ? Number(min_price) : undefined,
      max_price: max_price ? Number(max_price) : undefined,
      include_hidden: false,
    });

    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product by slug or id
app.get('/api/products/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    let product = await db.getProductBySlug(identifier);
    if (!product) {
      product = await db.getProductById(identifier);
    }

    if (!product || product.status === 'draft') {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Also fetch related products from same category
    const related = (await db.getProducts({
      category: product.category_id,
      include_hidden: false
    })).filter(p => p.id !== product!.id).slice(0, 4);

    res.json({ product, related });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit COD Order
app.post('/api/orders/cod', async (req: Request, res: Response) => {
  try {
    const { customer_name, phone, city, address, notes, items } = req.body;

    // Safety: Name validation
    if (!customer_name || customer_name.trim().length < 2) {
      return res.status(400).json({ error: 'Veuillez saisir votre nom complet.' });
    }

    // Safety: Phone validation (Moroccan phone format check)
    const cleanPhone = phone ? phone.replace(/[\s\-\.]/g, '') : '';
    const moroccoPhoneRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
    if (!moroccoPhoneRegex.test(cleanPhone) && cleanPhone.length < 9) {
      return res.status(400).json({ 
        error: 'Veuillez saisir un numéro de téléphone marocain valide (ex: 06 12 34 56 78).' 
      });
    }

    // Safety: City and address
    if (!city || city.trim().length < 2) {
      return res.status(400).json({ error: 'Veuillez sélectionner ou indiquer votre ville.' });
    }
    if (!address || address.trim().length < 5) {
      return res.status(400).json({ error: 'Veuillez renseigner votre adresse de livraison complète.' });
    }

    // Safety: Item validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Votre commande ne contient aucun article.' });
    }

    // Process order inside database (calculates true backend price, checks stock in transaction, decrements stock)
    const { order, error } = await db.createOrder({
      customer_name: customer_name.trim(),
      phone: cleanPhone,
      city: city.trim(),
      address: address.trim(),
      notes: notes?.trim() || '',
      items: items.map(i => ({
        product_id: String(i.product_id),
        quantity: Math.max(1, parseInt(i.quantity) || 1),
      })),
    });

    if (error || !order) {
      return res.status(400).json({ error: error || 'Impossible de finaliser la commande.' });
    }

    res.status(201).json({
      success: true,
      message: 'Merci pour votre commande ! Votre commande a bien été enregistrée. Nous vous contacterons prochainement pour confirmer la livraison.',
      order: order,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Une erreur interne est survenue lors de la création de votre commande.' });
  }
});

// ==========================================
// ADMIN AUTHENTICATION & APPROVAL
// ==========================================

// Rate Limiting & Cooldown Trackers (In-Memory)
interface ResendTracker {
  lastSentAt: number;
  count: number;
}
const resendCooldowns = new Map<string, ResendTracker>();
const verificationAttempts = new Map<string, { attempts: number; lockedUntil: number }>();

// Helper: Secure 6-digit verification code generator
function generate6DigitCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

// Helper: Send branded verification email
async function sendVerificationEmail(email: string, name: string, code: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || '4YM | Maison <no-reply@4ym.ma>';

  if (!host || !user || !pass) {
    console.warn('[Email] SMTP credentials not fully configured in environment variables.');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111111; color: #F5F3EF; padding: 40px; border: 1px solid #333333;">
        <div style="text-align: center; border-bottom: 1px solid #2e2e2e; padding-bottom: 25px; margin-bottom: 30px;">
          <h1 style="font-size: 24px; letter-spacing: 0.25em; margin: 0; color: #F5F3EF; font-weight: 500;">
            4YM <span style="color: #C8A96B;">|</span> MAISON
          </h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #C8A96B; margin-top: 8px;">
            Portail Administrateur
          </p>
        </div>

        <h2 style="font-size: 18px; font-weight: 400; color: #F5F3EF; margin-bottom: 16px;">
          Vérification de votre adresse email
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #CCCCCC; margin-bottom: 24px;">
          Bonjour <strong>${name}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #CCCCCC; margin-bottom: 20px;">
          Votre code de vérification pour finaliser votre demande d'accès administrateur est :
        </p>

        <div style="background-color: #1a1a1a; border: 1px solid #C8A96B; padding: 18px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; letter-spacing: 0.3em; font-weight: bold; color: #C8A96B; font-family: monospace;">
            ${code}
          </span>
        </div>

        <p style="font-size: 12px; color: #8A8A8A; line-height: 1.5; margin-bottom: 10px;">
          Ce code expire dans <strong>10 minutes</strong>.
        </p>
        <p style="font-size: 12px; color: #8A8A8A; line-height: 1.5; margin-bottom: 30px;">
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
        </p>

        <div style="border-top: 1px solid #2e2e2e; padding-top: 20px; text-align: center; font-size: 11px; color: #666666;">
          © ${new Date().getFullYear()} 4YM | Maison. Tous droits réservés.
        </div>
      </div>
    `;

    const textContent = `4YM | Maison\n\nVérification de votre adresse email\n\nBonjour ${name},\n\nVotre code de vérification est : ${code}\n\nCe code expire dans 10 minutes.\n\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.\n`;

    await transporter.sendMail({
      from,
      to: email,
      subject: '4YM | Maison - Code de vérification administrateur',
      text: textContent,
      html: htmlContent,
    });

    return true;
  } catch (err: any) {
    console.error('[Email] Failed to send verification email via SMTP:', err.message);
    return false;
  }
}

// 1. Register Admin Account Request (status: pending, email_verified: false)
app.post('/api/admin/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Le nom est requis.' });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: "L'adresse email est requise." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Format d'adresse email invalide." });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const cleanName = name.trim();

    // Check whether the email already exists in the existing admin_users table
    const pool = getPool();
    const [existing] = await pool.query<any[]>(
      'SELECT id FROM admin_users WHERE LOWER(email) = ? LIMIT 1',
      [cleanEmail]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(400).json({ error: 'Un compte administrateur avec cette adresse email existe déjà.' });
    }

    // Generate 6-digit code and expiration (10 min)
    const code = generate6DigitCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.createAdminRequest({
      name: cleanName,
      email: cleanEmail,
      password,
      codeHash,
      expiresAt,
    });

    // Send verification email
    await sendVerificationEmail(cleanEmail, cleanName, code);

    // Track resend timestamp
    resendCooldowns.set(cleanEmail, { lastSentAt: Date.now(), count: 1 });

    return res.status(201).json({
      success: true,
      message: 'Un code de vérification a été envoyé à votre adresse email.',
      verificationRequired: true,
      email: cleanEmail,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Verify Email Code
app.post('/api/admin/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: "L'adresse email est requise." });
    }

    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
      return res.status(400).json({ error: 'Veuillez saisir un code valide à 6 chiffres.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Check attempt lockout
    const attemptData = verificationAttempts.get(cleanEmail) || { attempts: 0, lockedUntil: 0 };
    if (attemptData.lockedUntil && Date.now() < attemptData.lockedUntil) {
      const waitSeconds = Math.ceil((attemptData.lockedUntil - Date.now()) / 1000);
      return res.status(429).json({
        error: `Trop de tentatives infructueuses. Veuillez patienter ${waitSeconds} secondes avant de réessayer.`,
      });
    }

    const result = await db.verifyAdminEmailCode(cleanEmail, cleanCode);

    if (!result.success) {
      attemptData.attempts += 1;
      if (attemptData.attempts >= 5) {
        attemptData.lockedUntil = Date.now() + 10 * 60 * 1000; // 10 minutes lock
        verificationAttempts.set(cleanEmail, attemptData);
        return res.status(429).json({
          error: 'Trop de tentatives infructueuses. Votre compte est bloqué pendant 10 minutes.',
        });
      }
      verificationAttempts.set(cleanEmail, attemptData);
      return res.status(400).json({ error: result.error || 'Code de vérification incorrect.' });
    }

    // Reset attempts on success
    verificationAttempts.delete(cleanEmail);

    return res.json({
      success: true,
      message: "Votre email a été vérifié. Votre demande est maintenant en attente d'approbation par l'administrateur.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Resend Verification Code
app.post('/api/admin/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: "L'adresse email est requise." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Rate limiting: 60s cooldown
    const tracker = resendCooldowns.get(cleanEmail);
    if (tracker && Date.now() - tracker.lastSentAt < 60000) {
      const remainingSeconds = Math.ceil((60000 - (Date.now() - tracker.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Veuillez patienter ${remainingSeconds} secondes avant de demander un nouveau code.`,
      });
    }

    // Rate limiting: Max 5 resends per hour
    if (tracker && tracker.count >= 5 && Date.now() - tracker.lastSentAt < 3600000) {
      return res.status(429).json({
        error: 'Limite de renvois atteinte. Veuillez réessayer plus tard.',
      });
    }

    const user = await db.getAdminUserForVerification(cleanEmail);
    if (!user) {
      return res.status(400).json({ error: 'Aucune demande en attente trouvée pour cette adresse email.' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'Cette adresse email est déjà vérifiée.' });
    }

    const newCode = generate6DigitCode();
    const newCodeHash = await bcrypt.hash(newCode, 10);
    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.setAdminVerificationCode(cleanEmail, newCodeHash, newExpiresAt);

    await sendVerificationEmail(cleanEmail, user.name, newCode);

    resendCooldowns.set(cleanEmail, {
      lastSentAt: Date.now(),
      count: (tracker?.count || 0) + 1,
    });

    return res.json({
      success: true,
      message: 'Un nouveau code de vérification a été envoyé.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const admin = await db.validateAdmin(email, password);
    if (!admin) {
      // Check if user exists and password is correct, but status is pending, rejected, or unverified
      const pool = getPool();
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password).trim();

      const [rows] = await pool.query<any[]>(
        'SELECT * FROM admin_users WHERE LOWER(email) = ? LIMIT 1',
        [cleanEmail]
      );

      if (Array.isArray(rows) && rows.length > 0) {
        const user = rows[0];
        const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
        if (isMatch) {
          if (!user.email_verified) {
            return res.status(403).json({
              error: 'Veuillez vérifier votre adresse email avant de vous connecter.',
              status: 'email_unverified',
              email: cleanEmail,
            });
          }
          if (user.status === 'pending') {
            return res.status(403).json({
              error: "Votre compte est en attente d'approbation par l'administrateur principal.",
              status: 'pending',
            });
          }
          if (user.status === 'rejected') {
            return res.status(403).json({
              error: "Votre demande d'accès administrateur a été refusée.",
              status: 'rejected',
            });
          }
        }
      }

      return res.status(401).json({ error: 'Identifiants administrateur incorrects.' });
    }

    res.json({
      success: true,
      token: ADMIN_SECRET_TOKEN,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending admin user requests
app.get('/api/admin/pending-users', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const users = await db.getPendingAdminUsers();
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve admin account request
app.post('/api/admin/users/:id/approve', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await db.updateAdminStatus(id, 'approved');
    if (!ok) {
      return res.status(404).json({ error: 'Compte administrateur introuvable.' });
    }
    res.json({ success: true, message: 'Compte approuvé.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reject admin account request
app.post('/api/admin/users/:id/reject', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await db.updateAdminStatus(id, 'rejected');
    if (!ok) {
      return res.status(404).json({ error: 'Compte administrateur introuvable.' });
    }
    res.json({ success: true, message: 'Compte refusé.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/me', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({
    user: {
      id: 'adm-1',
      email: 'admin@4ym.ma',
      name: 'Direction 4YM',
      role: 'admin',
    },
  });
});

// ==========================================
// ADMIN DASHBOARD & STATS
// ==========================================

app.get('/api/admin/stats', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN PRODUCTS CRUD
// ==========================================

// Upload Product Image Endpoint
app.post('/api/admin/upload-image', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { image_data, file_name } = req.body;
    if (!image_data || typeof image_data !== 'string') {
      return res.status(400).json({ error: 'Données d\'image manquantes.' });
    }

    // Match data URL prefix
    const matches = image_data.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({
        error: 'Format non supporté. Veuillez sélectionner une image au format JPG, PNG ou WEBP.',
      });
    }

    const rawExt = matches[1].toLowerCase();
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
    const base64Data = matches[2];

    // Check size (~8MB max)
    const approximateSizeInBytes = (base64Data.length * 3) / 4;
    if (approximateSizeInBytes > 8 * 1024 * 1024) {
      return res.status(400).json({
        error: 'Image trop volumineuse. La taille maximale recommandée est de 8 Mo.',
      });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const safeName = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    res.json({ success: true, url: publicUrl, name: file_name || safeName });
  } catch (err: any) {
    console.error('Upload image error:', err);
    res.status(500).json({ error: 'Erreur lors du traitement de l\'image.' });
  }
});

app.get('/api/admin/products', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { category, collection, search, status } = req.query;
    const products = await db.getProducts({
      category: category as string,
      collection: collection as string,
      search: search as string,
      status: status as string,
      include_hidden: true,
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      old_price,
      category_id,
      stock,
      sku,
      details,
      tags,
      collections,
      featured,
      best_seller,
      new_arrival,
      status,
      image1,
      image2,
      images,
    } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Nom, prix et catégorie sont obligatoires.' });
    }

    // Two images required validation
    const finalImage1 = image1 || (Array.isArray(images) ? images[0] : null);
    const finalImage2 = image2 || (Array.isArray(images) ? images[1] : null);

    if (!finalImage1 || !finalImage2 || !String(finalImage1).trim() || !String(finalImage2).trim()) {
      return res.status(400).json({
        error: 'Please upload both product images.',
      });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newProduct = await db.createProduct({
      name: name.trim(),
      slug: cleanSlug,
      description: description || '',
      price: Number(price),
      old_price: old_price ? Number(old_price) : null,
      category_id,
      stock: Number(stock) || 0,
      sku: sku || `4YM-${Date.now().toString().slice(-4)}`,
      details: Array.isArray(details) ? details : (details ? String(details).split('\n').filter(Boolean) : []),
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map((t: string) => t.trim()) : []),
      collections: Array.isArray(collections) ? collections : [],
      featured: Boolean(featured),
      best_seller: Boolean(best_seller),
      new_arrival: Boolean(new_arrival),
      status: status || 'active',
      image1: finalImage1.trim(),
      image2: finalImage2.trim(),
      images: [finalImage1.trim(), finalImage2.trim()],
    });

    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.old_price !== undefined) updates.old_price = updates.old_price ? Number(updates.old_price) : null;
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.details && typeof updates.details === 'string') {
      updates.details = updates.details.split('\n').filter(Boolean);
    }
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t: string) => t.trim());
    }

    // Sync image1, image2 and images if provided
    if (updates.image1 || updates.image2 || updates.images) {
      const current = await db.getProductById(id);
      const img1 = updates.image1 || (Array.isArray(updates.images) ? updates.images[0] : current?.image1);
      const img2 = updates.image2 || (Array.isArray(updates.images) ? updates.images[1] : current?.image2);
      updates.image1 = img1;
      updates.image2 = img2;
      updates.images = [img1, img2].filter(Boolean);
    }

    const updated = await db.updateProduct(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await db.deleteProduct(id);
    if (!ok) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }
    res.json({ success: true, message: 'Produit supprimé avec succès.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN CATEGORIES CRUD
// ==========================================

app.get('/api/admin/categories', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/categories', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { name, slug, image, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nom de la catégorie obligatoire.' });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const cat = await db.createCategory({
      name: name.trim(),
      slug: cleanSlug,
      image: image || '/src/assets/images/category_new_arrivals_1790305160934.jpg',
      status: status || 'active',
    });

    res.status(201).json(cat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/categories/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await db.updateCategory(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Catégorie non trouvée.' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await db.deleteCategory(id);
    if (!ok) {
      return res.status(404).json({ error: 'Catégorie non trouvée.' });
    }
    res.json({ success: true, message: 'Catégorie supprimée avec succès.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN ORDERS MANAGEMENT
// ==========================================

app.get('/api/admin/orders', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { status, city, search, date } = req.query;
    const orders = await db.getOrders({
      status: status as string,
      city: city as string,
      search: search as string,
      date: date as string,
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/orders/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['New', 'Confirmed', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut de commande invalide.' });
    }

    const updated = await db.updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/orders/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await db.deleteOrder(id);
    if (!ok) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }
    res.json({ success: true, message: 'Commande supprimée.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN SETTINGS
// ==========================================

app.get('/api/admin/settings', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const updated = await db.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// VITE DEV SERVER / STATIC ASSETS
// ==========================================

async function startServer() {
  // Ensure MySQL database & tables are initialized
  try {
    await initDatabase();
  } catch (e: any) {
    console.error('Database auto-initialization check:', e.message);
  }

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`4YM | Maison Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
