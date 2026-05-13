import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import pool from './db.js';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-klawdz-key';

// Restrict CORS to trusted origins
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:3000', 'https://vape-klawdz.com'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // needed for CMI callback (form POST)

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ─────────────────────────────────────────────────────────
// Rate Limiters
// ─────────────────────────────────────────────────────────
const codRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 COD orders per window
  message: { message: 'Too many orders created from this IP, please try again after an hour' }
});

const promoRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 promo checks per window
  message: { valid: false, message: 'Too many promo checks, please try again later' }
});

// ─────────────────────────────────────────────────────────
// Auth Middleware & Admin Login
// ─────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token });
  } else {
    return res.status(401).json({ message: 'Incorrect password' });
  }
});

// Serve uploaded images
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'public', 'images');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'vape_img_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ─────────────────────────────────────────────────────────
// Helper: format product row from DB
// ─────────────────────────────────────────────────────────
function formatProduct(row) {
  return {
    ...row,
    price: parseFloat(row.price),
    originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
    outOfStock: row.outOfStock === 1 || row.outOfStock === true,
    specs:   typeof row.specs   === 'string' ? JSON.parse(row.specs)   : (row.specs   || []),
    flavors: typeof row.flavors === 'string' ? JSON.parse(row.flavors) : (row.flavors || []),
  };
}

// ═══════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY createdAt DESC');
    res.json(rows.map(formatProduct));
  } catch (err) {
    console.error('GET /api/products:', err.message);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(formatProduct(rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.post('/api/products', authMiddleware, upload.single('imageFile'), async (req, res) => {
  try {
    const { name, category, price, originalPrice, badge, stock, outOfStock, color, description } = req.body;
    const id = Date.now();
    const stockVal = parseInt(stock) || 0;
    const isOut = outOfStock === 'true' || stockVal <= 0 ? 1 : 0;
    const image = req.file
      ? `/images/${req.file.filename}`
      : '/images/vape_device_1_1777480668776.png';

    await pool.execute(
      `INSERT INTO products (id, name, category, price, originalPrice, badge, rating, reviews, image, color, description, specs, flavors, stock, outOfStock)
       VALUES (?, ?, ?, ?, ?, ?, 5, 0, ?, ?, ?, '[]', '[]', ?, ?)`,
      [id, name, category || 'Device', parseFloat(price) || 0,
       originalPrice && originalPrice !== 'null' ? parseFloat(originalPrice) : null,
       badge || 'new', image, color || '#00ffaa', description || '', stockVal, isOut]
    );
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json(formatProduct(rows[0]));
  } catch (err) {
    console.error('POST /api/products:', err.message);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.put('/api/products/:id', authMiddleware, upload.single('imageFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Product not found' });
    const p = existing[0];

    const { name, category, price, originalPrice, badge, stock, outOfStock, color, description } = req.body;
    const stockVal  = stock !== undefined ? parseInt(stock) : p.stock;
    const isOut     = outOfStock !== undefined ? (outOfStock === 'true' ? 1 : 0) : (stockVal <= 0 ? 1 : 0);
    const image     = req.file ? `/images/${req.file.filename}` : p.image;

    await pool.execute(
      `UPDATE products SET name=?, category=?, price=?, originalPrice=?, badge=?, image=?, color=?, description=?, stock=?, outOfStock=? WHERE id=?`,
      [name || p.name, category || p.category,
       price ? parseFloat(price) : p.price,
       originalPrice && originalPrice !== 'null' ? parseFloat(originalPrice) : null,
       badge || p.badge, image, color || p.color,
       description !== undefined ? description : p.description,
       stockVal, isOut, id]
    );
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    res.json(formatProduct(rows[0]));
  } catch (err) {
    console.error('PUT /api/products:', err.message);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// PROMO CODES & TOTAL CALCULATION (Secure)
// ═══════════════════════════════════════════════════════════
const PROMO_CODES = {
  'KLAWDZ20': { type: 'percent', value: 20, label: '20% off' },
  'VAPE10':   { type: 'percent', value: 10, label: '10% off' },
  'FREE50':   { type: 'fixed',   value: 50, label: '50 MAD off' },
  'WELCOME':  { type: 'percent', value: 15, label: '15% off' },
};

async function calculateOrderTotal(conn, cartItems, promoCode) {
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of cartItems) {
    const [rows] = await conn.execute('SELECT * FROM products WHERE id = ?', [item.id]);
    if (rows.length === 0) throw new Error(`Product not found: ${item.id}`);
    const product = rows[0];
    
    if (product.stock < item.qty || product.outOfStock) {
      throw new Error(`Stock insuffisant pour: ${product.name}`);
    }

    subtotal += parseFloat(product.price) * item.qty;
    verifiedItems.push({
      ...item,
      price: parseFloat(product.price), // Use DB price
      name: product.name
    });
  }

  const shipping = subtotal > 50 ? 0 : 9.99;
  let discount = 0;

  if (promoCode) {
    const promo = PROMO_CODES[promoCode.toUpperCase().trim()];
    if (promo) {
      discount = promo.type === 'percent' 
        ? subtotal * (promo.value / 100)
        : Math.min(promo.value, subtotal);
    }
  }

  const total = subtotal + shipping - discount;
  return { total: Math.max(0, total), verifiedItems };
}



// ═══════════════════════════════════════════════════════════
// COD ORDERS — log when customer submits WhatsApp form
// ═══════════════════════════════════════════════════════════

app.post('/api/orders/cod', codRateLimiter, async (req, res) => {
  const { cartItems, customer, codInfo, promoCode } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Securely calculate total
    const { total: finalTotal, verifiedItems } = await calculateOrderTotal(conn, cartItems, promoCode);

    const orderId = Date.now();
    const custName  = codInfo?.name  || customer?.name  || 'Guest';
    const custEmail = codInfo?.phone || customer?.email || '';

    // Insert order
    await conn.execute(
      `INSERT INTO orders (id, customerName, customerEmail, total, status)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, custName, custEmail, finalTotal, 'COD - Pending']
    );

    // Insert order items
    for (const item of verifiedItems) {
      await conn.execute(
        'INSERT INTO order_items (orderId, productId, name, price, qty) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, item.price, item.qty]
      );
    }

    // Deduct stock for each item
    for (const item of cartItems) {
      await conn.execute(
        `UPDATE products
         SET stock      = GREATEST(stock - ?, 0),
             outOfStock = IF(stock - ? <= 0, 1, 0)
         WHERE id = ?`,
        [item.qty, item.qty, item.productId || item.id]
      );
    }

    await conn.commit();
    conn.release();

    console.log(`[COD] Order #${orderId} logged — ${custName} — ${total} MAD`);
    res.status(201).json({ orderId, message: 'COD order logged' });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('[COD] Error logging order:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// PROMO CODES
// ═══════════════════════════════════════════════════════════

app.get('/api/promo/:code', promoRateLimiter, (req, res) => {
  const code  = req.params.code.toUpperCase().trim();
  const promo = PROMO_CODES[code];
  if (!promo) {
    return res.status(404).json({ valid: false, message: 'Code invalide ou expiré' });
  }
  res.json({ valid: true, code, ...promo });
});

// ═══════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.execute('SELECT * FROM orders ORDER BY createdAt DESC');
    for (const order of orders) {
      const [items] = await pool.execute(
        'SELECT * FROM order_items WHERE orderId = ?', [order.id]
      );
      order.customer = { name: order.customerName, email: order.customerEmail };
      order.items    = items;
      order.date     = order.createdAt;
      order.total    = parseFloat(order.total);
    }
    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders:', err.message);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.put('/api/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error('PUT /api/orders/:id/status:', err.message);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════

app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC',
      [req.params.productId]
    );
    res.json(rows.map(r => ({ ...r, date: r.createdAt })));
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { productId, name, rating, comment } = req.body;
    const id = Date.now();
    await pool.execute(
      'INSERT INTO reviews (id, productId, name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [id, parseInt(productId), name, parseInt(rating), comment]
    );
    const [rows] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    res.status(201).json({ ...rows[0], date: rows[0].createdAt });
  } catch (err) {
    console.error('POST /api/reviews:', err.message);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════════════════════════

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'alichnitifa30@gmail.com',
        pass: process.env.EMAIL_PASS // The user will need to configure this app password in .env
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'alichnitifa30@gmail.com',
      to: 'alichnitifa30@gmail.com', // Always send to this email
      subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
      text: `You have received a new message from the contact form.\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">New Contact Form Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3 style="color: #555;">Message:</h3>
          <p style="white-space: pre-wrap; color: #444;">${message}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('POST /api/contact Error:', err.message);
    res.status(500).json({ message: 'Failed to send email', error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

async function startServer() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running → http://localhost:${PORT}`);
      console.log(`🗄️  MySQL database → ${process.env.DB_NAME || 'vape-store'}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MySQL:', err.message);
    process.exit(1);
  }
}

startServer();
