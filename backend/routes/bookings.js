const express = require('express');
const { createBooking, getMyBookings, getBookingDetails, cancelBooking } = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, createBooking);
router.get('/', authenticateToken, getMyBookings);
router.get('/:bookingId', authenticateToken, getBookingDetails);
router.put('/:bookingId/cancel', authenticateToken, cancelBooking);

module.exports = router;
