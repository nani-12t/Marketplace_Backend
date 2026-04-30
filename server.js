const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connectDB, getMarketplaceConn } = require('./config/db');
dotenv.config();

const app = express();

// Connect to Databases
connectDB();

// Handle CORS directly in Express for both local and production
const allowedOrigins = [
  'http://localhost:3000',
  'https://marketplace-frontend-one-tau.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/insurance', require('./routes/insurance'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ocr', require('./routes/ocr'));
app.use('/api/marketplace', require('./routes/marketplace'));

app.get('/api/health', (req, res) => res.json({ status: 'MediID API running', timestamp: new Date() }));

const User = require('./models/User');

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 MediID Server running on port ${PORT}`);
  });
}

module.exports = app;
