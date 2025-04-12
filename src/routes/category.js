const express = require('express');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new category (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, itemCount, imageUrl } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category already exists
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE name = $1',
      [name]
    );
    
    if (existingCategory.rows.length > 0) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    // Insert new category
    const result = await pool.query(
      'INSERT INTO categories (name, item_count, image_url) VALUES ($1, $2, $3) RETURNING *',
      [name, itemCount || 0, imageUrl || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Edit an existing category (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, itemCount, imageUrl } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category exists
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    
    if (existingCategory.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if new name already exists (and is not current category)
    if (name !== existingCategory.rows[0].name) {
      const nameExists = await pool.query(
        'SELECT * FROM categories WHERE name = $1 AND id != $2',
        [name, id]
      );
      
      if (nameExists.rows.length > 0) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
    }
    
    // Update category
    const result = await pool.query(
      'UPDATE categories SET name = $1, item_count = $2, image_url = $3 WHERE id = $4 RETURNING *',
      [name, itemCount || existingCategory.rows[0].item_count, imageUrl || existingCategory.rows[0].image_url, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;