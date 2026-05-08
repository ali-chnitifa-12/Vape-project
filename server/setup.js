import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const conn = await mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'vape-store',
});

console.log('✅ Connected to MySQL vape-store database');

// ──────────────────────────────────────────
// 1. Create Tables
// ──────────────────────────────────────────

await conn.execute(`
  CREATE TABLE IF NOT EXISTS products (
    id         BIGINT       PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    category   VARCHAR(100) NOT NULL,
    price      DECIMAL(10,2) NOT NULL,
    originalPrice DECIMAL(10,2) DEFAULT NULL,
    badge      VARCHAR(50)  DEFAULT 'new',
    rating     INT          DEFAULT 5,
    reviews    INT          DEFAULT 0,
    image      VARCHAR(500) DEFAULT '/images/vape_device_1_1777480668776.png',
    color      VARCHAR(50)  DEFAULT '#00ffaa',
    description TEXT,
    specs      JSON,
    flavors    JSON,
    stock      INT          DEFAULT 0,
    outOfStock TINYINT(1)   DEFAULT 0,
    createdAt  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log('✅ Table: products');

await conn.execute(`
  CREATE TABLE IF NOT EXISTS orders (
    id           BIGINT       PRIMARY KEY,
    customerName VARCHAR(255) NOT NULL,
    customerEmail VARCHAR(255) NOT NULL,
    total        DECIMAL(10,2) NOT NULL,
    status       VARCHAR(100) DEFAULT 'Paid (CMI)',
    createdAt    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log('✅ Table: orders');

await conn.execute(`
  CREATE TABLE IF NOT EXISTS order_items (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    orderId   BIGINT NOT NULL,
    productId BIGINT NOT NULL,
    name      VARCHAR(255),
    price     DECIMAL(10,2),
    qty       INT,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
  )
`);
console.log('✅ Table: order_items');

await conn.execute(`
  CREATE TABLE IF NOT EXISTS reviews (
    id        BIGINT       PRIMARY KEY,
    productId BIGINT       NOT NULL,
    name      VARCHAR(255) NOT NULL,
    rating    INT          NOT NULL,
    comment   TEXT,
    createdAt TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
  )
`);
console.log('✅ Table: reviews');

// ──────────────────────────────────────────
// 2. Seed Products from JSON (skip if already exist)
// ──────────────────────────────────────────

const productsFile = path.join(__dirname, 'data', 'products.json');
if (fs.existsSync(productsFile)) {
  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  
  for (const p of products) {
    const [existing] = await conn.execute('SELECT id FROM products WHERE id = ?', [p.id]);
    if (existing.length === 0) {
      await conn.execute(
        `INSERT INTO products (id, name, category, price, originalPrice, badge, rating, reviews, image, color, description, specs, flavors, stock, outOfStock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id, p.name, p.category, p.price, p.originalPrice ?? null,
          p.badge || 'new', p.rating || 5, p.reviews || 0,
          p.image, p.color || '#00ffaa', p.description || '',
          JSON.stringify(p.specs || []), JSON.stringify(p.flavors || []),
          p.stock || 0, p.outOfStock ? 1 : 0
        ]
      );
      console.log(`  ↳ Seeded: ${p.name}`);
    } else {
      console.log(`  ↳ Skipped (already exists): ${p.name}`);
    }
  }
}

await conn.end();
console.log('\n🎉 Database setup complete! You can now run: npm run dev');
