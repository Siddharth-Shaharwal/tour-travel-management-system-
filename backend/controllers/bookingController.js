const Booking = require('../models/Booking');
const Package = require('../models/Package');
const Transaction = require('../models/Transaction');

const createBooking = async (req, res) => {
  try {
    const { package_id, vehicle_id, start_date, end_date, passengers } = req.body;
    const userId = req.user.userId;

    if (!package_id || !start_date || !end_date || !passengers) {
      return res.status(400).json({
        success: false,
        message: 'Package ID, start date, end date, and passenger count are required'
      });
    }

    // Get package details for price
    const pkg = await Package.getById(package_id);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const totalPrice = pkg.price * passengers;

    const bookingId = await Booking.create({
      user_id: userId,
      package_id,
      vehicle_id: vehicle_id || null,
      start_date,
      end_date,
      passengers,
      total_price: totalPrice
    });

    // Create transaction record
    await Transaction.create({
      booking_id: bookingId,
      amount: totalPrice,
      payment_mode: 'awaiting_approval'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking_id: bookingId }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating booking'
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.getByUserId(userId);

    res.json({
      success: true,
      data: { bookings },
      count: bookings.length
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    const booking = await Booking.getById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Non-admins can only view their own bookings
    if (!isAdmin && booking.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking details'
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    const booking = await Booking.getById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Non-admins can only cancel their own bookings
    if (!isAdmin && booking.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking status
    await Booking.updateStatus(bookingId, 'cancelled');

    // Process refund by deleting transaction record
    const pool = require('../config/database');
    await pool.execute(
      'DELETE FROM transactions WHERE booking_id = ?',
      [bookingId]
    );

    // Log cancellation
    await pool.execute(
      'INSERT INTO booking_logs (booking_id, action, note) VALUES (?, ?, ?)',
      [bookingId, 'booking_cancelled', `Booking cancelled - Refund processed (Transaction deleted)`]
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully - Refund processed'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking'
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking
};
