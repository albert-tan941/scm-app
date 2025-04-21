const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const purchaseRoutes = require('./routes/purchases');
const shipmentRoutes = require('./routes/shipments');

// Import middleware
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

// Create tables
function createTables() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )`);

  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    current_stock INTEGER DEFAULT 0
  )`);

  // Purchase requests table
  db.run(`CREATE TABLE IF NOT EXISTS purchase_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (created_by) REFERENCES users (id)
  )`);

  // Shipments table
  db.run(`CREATE TABLE IF NOT EXISTS shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_request_id INTEGER,
    status TEXT DEFAULT 'pending',
    estimated_delivery DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests (id)
  )`);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', auth, productRoutes);
app.use('/api/purchases', auth, purchaseRoutes);
app.use('/api/shipments', auth, shipmentRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SCM API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 