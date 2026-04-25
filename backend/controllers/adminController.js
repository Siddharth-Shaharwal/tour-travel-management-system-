const Booking = require('../models/Booking');

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAll();

    res.json({
      success: true,
      data: { bookings },
      count: bookings.length
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
};

const getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.getPendingBookings();

    res.json({
      success: true,
      data: { bookings },
      count: bookings.length
    });
  } catch (error) {
    console.error('Get pending bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending bookings'
    });
  }
};

const approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const adminId = req.user.userId;

    const booking = await Booking.getById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a booking with status: ${booking.status}`
      });
    }

    await Booking.updateStatus(bookingId, 'confirmed', adminId);

    res.json({
      success: true,
      message: 'Booking approved successfully'
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving booking'
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.getById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a booking with status: ${booking.status}`
      });
    }

    await Booking.updateStatus(bookingId, 'cancelled');

    res.json({
      success: true,
      message: 'Booking rejected successfully'
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting booking'
    });
  }
};

module.exports = {
  getAllBookings,
  getPendingBookings,
  approveBooking,
  rejectBooking
};
