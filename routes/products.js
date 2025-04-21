const express = require('express');
const router = express.Router();

// Database connection
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Get all products
router.get('/', (req, res) => {
  db.all('SELECT * FROM products', [], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching products' });
    }
    res.json(products);
  });
});

// Get single product
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching product' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

// Create product
router.post('/', (req, res) => {
  const { name, description, current_stock } = req.body;

  db.run(
    'INSERT INTO products (name, description, current_stock) VALUES (?, ?, ?)',
    [name, description, current_stock || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating product' });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        description,
        current_stock
      });
    }
  );
});

// Update product stock
router.put('/:id/stock', (req, res) => {
  const { current_stock } = req.body;

  db.run(
    'UPDATE products SET current_stock = ? WHERE id = ?',
    [current_stock, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating stock' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Stock updated successfully' });
    }
  );
});

module.exports = router; 