const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Use absolute path to ensure database is created in the correct location
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

async function createAdminUser() {
  const username = 'admin';
  const password = 'admin123';
  const role = 'admin';

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create users table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      )
    `, function(err) {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }

      // Insert admin user
      db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              console.log('Admin user already exists');
            } else {
              console.error('Error creating admin user:', err);
            }
          } else {
            console.log('Admin user created successfully');
          }
          db.close();
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

createAdminUser(); 