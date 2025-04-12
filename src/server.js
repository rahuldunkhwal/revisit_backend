const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const cors = require('cors');

dotenv.config();

app.use(cors());


const app = express();

app.use(express.json());

// Health check route
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ serverTime: result.rows[0] });
  } catch (error) {
    console.error('Error connecting to DB:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});