const express = require('express');
const { getAllBookings, getPendingBookings, approveBooking, rejectBooking } = require('../controllers/adminController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin routes for booking management
router.get('/bookings/all', authenticateToken, authorizeAdmin, getAllBookings);
router.get('/bookings/pending', authenticateToken, authorizeAdmin, getPendingBookings);
router.put('/bookings/:bookingId/approve', authenticateToken, authorizeAdmin, approveBooking);
router.put('/bookings/:bookingId/reject', authenticateToken, authorizeAdmin, rejectBooking);

module.exports = router;
