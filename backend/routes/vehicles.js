const express = require('express');
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticateToken);

// Public routes (authenticated users can view)
router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

// Admin-only routes
router.post('/', authorizeAdmin, createVehicle);
router.put('/:id', authorizeAdmin, updateVehicle);
router.delete('/:id', authorizeAdmin, deleteVehicle);

module.exports = router;
