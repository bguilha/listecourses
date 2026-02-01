const express = require('express');
const cors = require('cors');
const { pool, initDb } = require('./db');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize DB
initDb();

// Get all items
app.get('/api/items', async (req, res) => {
    try {
        const { category } = req.query;
        if (category) {
            query = 'SELECT * FROM items WHERE category = $1 ORDER BY position ASC, created_at DESC';
            values = [category];
        } else {
            query = 'SELECT * FROM items ORDER BY position ASC, created_at DESC';
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new item
app.post('/api/items', async (req, res) => {
    try {
        const { name, category } = req.body;
        if (!name || !category) {
            return res.status(400).json({ error: 'Name and category are required' });
        }

        const query = 'INSERT INTO items (name, category) VALUES ($1, $2) RETURNING *';
        const result = await pool.query(query, [name, category]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ message: 'Item deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reorder items
app.put('/api/items/reorder', async (req, res) => {
    try {
        const { items } = req.body; // Array of IDs in new order
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Items array is required' });
        }

        // We update the position for each item
        // This could be optimized with a single CASE query but for small lists a loop is fine
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (let i = 0; i < items.length; i++) {
                const id = items[i];
                await client.query('UPDATE items SET position = $1 WHERE id = $2', [i, id]);
            }
            await client.query('COMMIT');
            res.json({ message: 'Items reordered' });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
