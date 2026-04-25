const express = require('express');
const { 
  getDashboardStats, 
  getAvailableVehicles, 
  getAvailableDrivers, 
  assignVehicleAndDriver,
  getDriverAvailability,
  getAvailableSeats
} = require('../controllers/dashboardController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require admin authorization
router.use(authenticateToken, authorizeAdmin);

router.get('/stats', getDashboardStats);
router.get('/vehicles', getAvailableVehicles);
router.get('/drivers', getAvailableDrivers);
router.post('/assign-vehicle', assignVehicleAndDriver);
router.get('/driver-availability', getDriverAvailability);
router.get('/available-seats', getAvailableSeats);

module.exports = router;
