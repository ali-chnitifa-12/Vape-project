import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'public', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'vape_img_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const dataFile = path.join(__dirname, 'data', 'products.json');
const ordersFile = path.join(__dirname, 'data', 'orders.json');
const reviewsFile = path.join(__dirname, 'data', 'reviews.json');

// Helper to read data
const readData = () => {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading data:", error);
    return [];
  }
};

// Helper to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing data:", error);
  }
};

// Helper to read orders
const readOrders = () => {
  try {
    const data = fs.readFileSync(ordersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper to write orders
const writeOrders = (data) => {
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {}
};

// Helper to read reviews
const readReviews = () => {
  try {
    const data = fs.readFileSync(reviewsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper to write reviews
const writeReviews = (data) => {
  try {
    fs.writeFileSync(reviewsFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {}
};

// 1. Get all products
app.get('/api/products', (req, res) => {
  const products = readData();
  res.json(products);
});

// 2. Add a new product
app.post('/api/products', upload.single('imageFile'), (req, res) => {
  const products = readData();
  const stockVal = parseInt(req.body.stock) || 0;
  const newProduct = {
    ...req.body,
    id: Date.now(), // simple unique id generator
    price: parseFloat(req.body.price),
    originalPrice: req.body.originalPrice && req.body.originalPrice !== 'null' ? parseFloat(req.body.originalPrice) : null,
    stock: stockVal,
    outOfStock: req.body.outOfStock === 'true' || stockVal <= 0,
    badge: req.body.badge || 'new',
    rating: 5,
    reviews: 0,
    color: req.body.color || '#00ffaa',
    description: req.body.description || '',
    specs: [],
    flavors: [],
    image: req.file ? `/images/${req.file.filename}` : '/images/vape_device_1_1777480668776.png'
  };
  products.push(newProduct);
  writeData(products);
  res.status(201).json(newProduct);
});

// 3. Update a product
app.put('/api/products/:id', upload.single('imageFile'), (req, res) => {
  const products = readData();
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  
  if (index !== -1) {
    const updatedStock = req.body.stock !== undefined ? parseInt(req.body.stock) : products[index].stock;
    const updatedOutOfStock = req.body.outOfStock !== undefined ? (req.body.outOfStock === 'true') : (updatedStock <= 0);

    const updatedProduct = {
      ...products[index],
      ...req.body,
      price: req.body.price ? parseFloat(req.body.price) : products[index].price,
      originalPrice: req.body.originalPrice && req.body.originalPrice !== 'null' ? parseFloat(req.body.originalPrice) : null,
      stock: updatedStock,
      outOfStock: updatedOutOfStock
    };

    if (req.file) {
      updatedProduct.image = `/images/${req.file.filename}`;
    }

    products[index] = updatedProduct;
    writeData(products);
    res.json(products[index]);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// 4. Delete a product
app.delete('/api/products/:id', (req, res) => {
  const products = readData();
  const filteredProducts = products.filter(p => p.id !== parseInt(req.params.id));
  
  if (products.length !== filteredProducts.length) {
    writeData(filteredProducts);
    res.json({ message: "Product deleted" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// 5. Purchase a product (decrease stock)
app.post('/api/purchase', (req, res) => {
  const { cartItems, customer, total } = req.body; 
  const products = readData();
  
  let success = true;
  let errorMsg = "";

  cartItems.forEach(item => {
    const index = products.findIndex(p => p.id === parseInt(item.id));
    if (index !== -1) {
      if (products[index].stock >= item.qty && !products[index].outOfStock) {
        products[index].stock -= item.qty;
        if (products[index].stock <= 0) {
          products[index].stock = 0;
          products[index].outOfStock = true;
        }
      } else {
        success = false;
        errorMsg = `Not enough stock for ${products[index].name}`;
      }
    }
  });

  if (success) {
    writeData(products);

    // Save order
    const orders = readOrders();
    const newOrder = {
      id: Date.now(),
      items: cartItems,
      customer: customer || { name: 'Guest', email: 'guest@example.com' },
      total: total,
      date: new Date().toISOString(),
      status: 'Paid (CMI)'
    };
    orders.push(newOrder);
    writeOrders(orders);

    res.json({ message: "Purchase successful", products, order: newOrder });
  } else {
    res.status(400).json({ message: errorMsg });
  }
});

// 6. Get all orders
app.get('/api/orders', (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

// 7. Reviews
app.get('/api/reviews/:productId', (req, res) => {
  const reviews = readReviews();
  const productReviews = reviews.filter(r => r.productId === parseInt(req.params.productId));
  res.json(productReviews);
});

app.post('/api/reviews', (req, res) => {
  const reviews = readReviews();
  const { productId, name, rating, comment } = req.body;
  
  const newReview = {
    id: Date.now(),
    productId: parseInt(productId),
    name,
    rating: parseInt(rating),
    comment,
    date: new Date().toISOString()
  };
  
  reviews.push(newReview);
  writeReviews(reviews);
  
  // Update product review count/avg in a real app, here we just return
  res.status(201).json(newReview);
});

app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});
