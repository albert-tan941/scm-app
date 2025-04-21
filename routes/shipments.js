const express = require('express');
const router = express.Router();

// Database connection
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Get all shipments
router.get('/', (req, res) => {
  db.all(`
    SELECT s.*, pr.product_id, p.name as product_name, pr.quantity
    FROM shipments s
    JOIN purchase_requests pr ON s.purchase_request_id = pr.id
    JOIN products p ON pr.product_id = p.id
    ORDER BY s.created_at DESC
  `, [], (err, shipments) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching shipments' });
    }
    res.json(shipments);
  });
});

// Get single shipment
router.get('/:id', (req, res) => {
  db.get(`
    SELECT s.*, pr.product_id, p.name as product_name, pr.quantity
    FROM shipments s
    JOIN purchase_requests pr ON s.purchase_request_id = pr.id
    JOIN products p ON pr.product_id = p.id
    WHERE s.id = ?
  `, [req.params.id], (err, shipment) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching shipment' });
    }
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(shipment);
  });
});

// Update shipment status
router.put('/:id/status', (req, res) => {
  const { status, estimated_delivery } = req.body;
  const validStatuses = ['pending', 'shipped', 'in_transit', 'delivered'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE shipments SET status = ?, estimated_delivery = ? WHERE id = ?',
    [status, estimated_delivery, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating shipment' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Shipment not found' });
      }

      // If delivered, update product stock
      if (status === 'delivered') {
        db.get(
          `SELECT pr.product_id, pr.quantity, p.current_stock 
           FROM shipments s
           JOIN purchase_requests pr ON s.purchase_request_id = pr.id
           JOIN products p ON pr.product_id = p.id
           WHERE s.id = ?`,
          [req.params.id],
          (err, result) => {
            if (!err && result) {
              const newStock = result.current_stock + result.quantity;
              db.run(
                'UPDATE products SET current_stock = ? WHERE id = ?',
                [newStock, result.product_id]
              );
            }
          }
        );
      }

      res.json({ message: 'Shipment updated successfully' });
    }
  );
});

module.exports = router; 