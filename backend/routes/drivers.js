const express = require('express');
const {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
} = require('../controllers/driverController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// All driver routes require authentication
router.use(authenticateToken);

// Public routes (authenticated users can view)
router.get('/', getAllDrivers);
router.get('/:id', getDriverById);

// Admin-only routes
router.post('/', authorizeAdmin, createDriver);
router.put('/:id', authorizeAdmin, updateDriver);
router.delete('/:id', authorizeAdmin, deleteDriver);

module.exports = router;
