const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = 'your-secret-key';

// Database connection from server.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Register user
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role || 'user'],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        res.status(201).json({ message: 'User created successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Send both token and user data (excluding password)
      const userData = {
        id: user.id,
        username: user.username,
        role: user.role
      };

      res.json({ 
        token,
        user: userData
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

module.exports = router; 