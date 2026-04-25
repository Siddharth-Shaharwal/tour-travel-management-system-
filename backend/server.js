const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');

const app = express();

// Add error logging middleware
app.use((err, req, res, next) => {
  console.error('Middleware error:', err);
  next();
});

// Basic middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiter (basic safe defaults)
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/packages', require('./routes/packages.js'));
app.use('/api/bookings', require('./routes/bookings.js'));
app.use('/api/vehicles', require('./routes/vehicles.js'));
app.use('/api/drivers', require('./routes/drivers.js'));
app.use('/api/admin', require('./routes/admin.js'));
app.use('/api/dashboard', require('./routes/dashboard.js'));

// Legacy routes (kept for compatibility)
app.use('/api/travelers', require('./routes/travelers.js'));
app.use('/api/reservations', require('./routes/reservations.js'));
app.use('/api/transactions', require('./routes/transactions.js'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Travel Management API is running!' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

// Start server after DB connection verified
testConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to DB connection error:', err);
    process.exit(1);
  });

// Graceful error handlers for debugging in dev
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});