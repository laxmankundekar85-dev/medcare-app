const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware MUST be declared before routes
app.use(express.json());
app.use(cors());

// API Endpoints
app.use('/api/auth', authRoutes);

// Google OAuth Authentication Routes placeholder
app.get('/api/auth/google', (req, res) => {
  // TODO: Implement passport.js or official Google OAuth redirect logic here
  res.status(501).json({ message: 'Google OAuth login endpoint not configured yet.' });
});

app.get('/', (req, res) => {
  res.send('Medcare Backend API is running...');
});

const PORT = process.env.PORT || 5000;

// Start server instantly without waiting for cloud database connections
app.listen(PORT, () => {
  console.log(`🚀 Server is listening and ready on port ${PORT}`);
});