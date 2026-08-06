const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Root / Health Check Endpoint
app.get('/', (req, res) => {
  res.send('Medcare Backend API is running...');
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening and ready on port ${PORT}`);
});