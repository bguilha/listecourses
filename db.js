const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function initDb() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);

    // Add position column if it doesn't exist (for existing databases that might not have it yet)
    // We do this separately because IF NOT EXISTS in CREATE TABLE only checks table existence, not columns.
    // However, if table created fresh, it has the column.
    // The Alter command is safe to run even if column exists if we check (Postgres 9.6+ supports IF NOT EXISTS)
    // But older postgres might fail. Let's just try/catch generic alter.
    try {
      await pool.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0');
    } catch (e) {
      // Ignore error if column exists or standard SQL error
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

module.exports = { pool, initDb };
