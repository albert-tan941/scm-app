const express = require('express');
const router = express.Router();

// Database connection
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Get all purchase requests
router.get('/', (req, res) => {
  db.all(`
    SELECT pr.*, p.name as product_name, u.username as created_by_user 
    FROM purchase_requests pr
    JOIN products p ON pr.product_id = p.id
    JOIN users u ON pr.created_by = u.id
    ORDER BY pr.created_at DESC
  `, [], (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching purchase requests' });
    }
    res.json(requests);
  });
});

// Create purchase request
router.post('/', (req, res) => {
  const { product_id, quantity, created_by } = req.body;

  db.run(
    'INSERT INTO purchase_requests (product_id, quantity, created_by) VALUES (?, ?, ?)',
    [product_id, quantity, created_by],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating purchase request' });
      }
      res.status(201).json({
        id: this.lastID,
        product_id,
        quantity,
        created_by,
        status: 'pending'
      });
    }
  );
});

// Update purchase request status
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'approved', 'rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE purchase_requests SET status = ? WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating status' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Purchase request not found' });
      }

      // If approved, create a shipment record
      if (status === 'approved') {
        db.run(
          'INSERT INTO shipments (purchase_request_id, status) VALUES (?, ?)',
          [req.params.id, 'pending'],
          function(err) {
            if (err) {
              console.error('Error creating shipment:', err);
            }
          }
        );
      }

      res.json({ message: 'Status updated successfully' });
    }
  );
});

module.exports = router; 