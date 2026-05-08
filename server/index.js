import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './db.js';
import { buildCmiParams, verifyCmiCallback } from './cmi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // needed for CMI callback (form POST)

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
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

app.post('/api/products', upload.single('imageFile'), async (req, res) => {
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

app.put('/api/products/:id', upload.single('imageFile'), async (req, res) => {
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

app.delete('/api/products/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// CMI PAYMENT - Morocco
// ═══════════════════════════════════════════════════════════

/**
 * STEP 1: Frontend calls this to create the order and get CMI params.
 * Backend validates stock, saves a PENDING order, returns CMI params.
 * Frontend then builds a form and auto-submits it to CMI.
 */
app.post('/api/payment/initiate', async (req, res) => {
  const { cartItems, customer, total } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Validate stock
    for (const item of cartItems) {
      const [rows] = await conn.execute('SELECT * FROM products WHERE id = ?', [item.id]);
      if (rows.length === 0) throw new Error(`Product not found: ${item.id}`);
      if (rows[0].stock < item.qty || rows[0].outOfStock) {
        throw new Error(`Stock insuffisant pour: ${rows[0].name}`);
      }
    }

    // Create PENDING order
    const orderId = Date.now();
    await conn.execute(
      'INSERT INTO orders (id, customerName, customerEmail, total, status) VALUES (?, ?, ?, ?, ?)',
      [orderId, customer?.name || 'Guest', customer?.email || '', parseFloat(total), 'PENDING']
    );

    // Save order items
    for (const item of cartItems) {
      await conn.execute(
        'INSERT INTO order_items (orderId, productId, name, price, qty) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, item.price, item.qty]
      );
    }

    await conn.commit();
    conn.release();

    // Check if CMI credentials are configured
    const cmiReady = process.env.CMI_CLIENT_ID !== 'YOUR_CLIENT_ID_HERE'
                  && process.env.CMI_STORE_KEY  !== 'YOUR_STORE_KEY_HERE';

    if (!cmiReady) {
      // ─── SIMULATION MODE (no real CMI credentials yet) ───────────────
      console.log('[CMI] Running in SIMULATION mode - credentials not set');
      return res.json({
        mode: 'simulation',
        orderId,
        message: 'CMI credentials not configured. Payment simulated.',
      });
    }

    // ─── REAL CMI MODE ────────────────────────────────────────────────
    const cmiParams = buildCmiParams({
      orderId,
      amount:        total,
      customerEmail: customer?.email || '',
      customerName:  customer?.name  || '',
    });

    res.json({
      mode:       'cmi',
      orderId,
      gatewayUrl: process.env.CMI_BASE_URL,
      params:     cmiParams,
    });

  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Payment initiate error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

/**
 * STEP 2: CMI calls this URL after payment (server-to-server callback).
 * We verify the signature, then update stock and order status.
 * CMI expects us to respond with "ACTION=POSTAUTH" if approved.
 */
app.post('/api/payment/callback', async (req, res) => {
  const params = req.body;
  console.log('[CMI Callback]', params);

  try {
    // Verify CMI signature
    const valid = verifyCmiCallback(params, process.env.CMI_STORE_KEY);
    if (!valid) {
      console.error('[CMI] Invalid signature in callback!');
      return res.send('APPROVED'); // CMI still expects APPROVED response
    }

    const orderId  = params.oid;
    const response = params.Response || params.response || '';
    const approved = response === 'Approved' || response === '00';

    if (approved) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // Deduct stock
        const [items] = await conn.execute(
          'SELECT * FROM order_items WHERE orderId = ?', [orderId]
        );
        for (const item of items) {
          await conn.execute(
            `UPDATE products
             SET stock = GREATEST(stock - ?, 0),
                 outOfStock = IF(stock - ? <= 0, 1, 0)
             WHERE id = ?`,
            [item.qty, item.qty, item.productId]
          );
        }

        // Mark order as paid
        await conn.execute(
          `UPDATE orders SET status = 'Paid (CMI)', authCode = ?, tranId = ? WHERE id = ?`,
          [params.AUTH_CODE || '', params.TransId || '', orderId]
        );

        await conn.commit();
        conn.release();
        console.log(`[CMI] Order ${orderId} paid successfully`);
      } catch (err) {
        await conn.rollback();
        conn.release();
        console.error('[CMI] DB error during callback:', err.message);
      }
    } else {
      // Payment rejected — mark order as failed
      await pool.execute(
        `UPDATE orders SET status = 'FAILED' WHERE id = ?`,
        [orderId]
      );
      console.log(`[CMI] Order ${orderId} payment failed. Response: ${response}`);
    }

    // CMI requires this exact response to confirm we received the callback
    res.send('APPROVED');

  } catch (err) {
    console.error('[CMI Callback] Error:', err.message);
    res.send('APPROVED'); // always send APPROVED to avoid CMI retrying forever
  }
});

/**
 * Simulation-only: mark a PENDING order as paid (used when CMI creds not set)
 */
app.post('/api/payment/simulate-confirm/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const [items] = await pool.execute('SELECT * FROM order_items WHERE orderId = ?', [orderId]);
    for (const item of items) {
      await pool.execute(
        `UPDATE products SET stock = GREATEST(stock - ?, 0), outOfStock = IF(stock - ? <= 0, 1, 0) WHERE id = ?`,
        [item.qty, item.qty, item.productId]
      );
    }
    await pool.execute(
      `UPDATE orders SET status = 'Paid (CMI - Simulated)' WHERE id = ?`, [orderId]
    );
    console.log(`[SIM] Order ${orderId} confirmed as paid`);
    res.json({ message: 'Order confirmed' });
  } catch (err) {
    console.error('simulate-confirm error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// COD ORDERS — log when customer submits WhatsApp form
// ═══════════════════════════════════════════════════════════

app.post('/api/orders/cod', async (req, res) => {
  const { cartItems, customer, total, codInfo } = req.body;
  // cartItems: [{id, name, price, qty, category}]
  // customer:  {name, email}
  // codInfo:   {name, phone, city, zip, address}
  // total:     number

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const orderId = Date.now();
    const custName  = codInfo?.name  || customer?.name  || 'Guest';
    const custEmail = codInfo?.phone || customer?.email || '';

    // Insert order
    await conn.execute(
      `INSERT INTO orders (id, customerName, customerEmail, total, status)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, custName, custEmail, parseFloat(total), 'COD - Pending']
    );

    // Insert order items
    for (const item of cartItems) {
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

// Simple in-memory promo codes — add/edit as needed
const PROMO_CODES = {
  'KLAWDZ20': { type: 'percent', value: 20, label: '20% off' },
  'VAPE10':   { type: 'percent', value: 10, label: '10% off' },
  'FREE50':   { type: 'fixed',   value: 50, label: '50 MAD off' },
  'WELCOME':  { type: 'percent', value: 15, label: '15% off' },
};

app.get('/api/promo/:code', (req, res) => {
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

app.get('/api/orders', async (req, res) => {
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

      const cmiReady = process.env.CMI_CLIENT_ID !== 'YOUR_CLIENT_ID_HERE';
      console.log(`💳 CMI Gateway    → ${cmiReady ? '✅ CONFIGURED' : '⚠️  SIMULATION MODE (add credentials to .env)'}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MySQL:', err.message);
    process.exit(1);
  }
}

startServer();
