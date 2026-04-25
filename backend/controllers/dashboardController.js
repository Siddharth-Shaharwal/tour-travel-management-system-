const { pool } = require('../config/database');
const Booking = require('../models/Booking');

const getDashboardStats = async (req, res) => {
  try {
    // Get total revenue from successful transactions
    const [revenueResult] = await pool.execute(
      `SELECT SUM(amount) as total_revenue FROM transactions WHERE status IN ('success', 'pending')`
    );
    const totalRevenue = revenueResult[0]?.total_revenue || 0;

    // Get number of bookings
    const [bookingStats] = await pool.execute(
      `SELECT COUNT(*) as total_bookings FROM bookings WHERE status != 'cancelled'`
    );
    const totalBookings = bookingStats[0]?.total_bookings || 0;

    // Get number of users
    const [userStats] = await pool.execute(
      `SELECT COUNT(*) as total_users FROM users WHERE is_admin = FALSE`
    );
    const totalUsers = userStats[0]?.total_users || 0;

    // Get number of active packages
    const [packageStats] = await pool.execute(
      `SELECT COUNT(*) as active_packages FROM packages WHERE is_active = TRUE`
    );
    const activePackages = packageStats[0]?.active_packages || 0;

    // Get bookings breakdown by status
    const [statusBreakdown] = await pool.execute(
      `SELECT status, COUNT(*) as count FROM bookings GROUP BY status`
    );

    // Approximate profit calculation (assuming 30% profit margin)
    const profitMargin = 0.30;
    const estimatedProfit = totalRevenue * profitMargin;

    // Get revenue by package
    const [revenueByPackage] = await pool.execute(
      `SELECT p.id, p.title, COUNT(b.id) as booking_count, SUM(b.total_price) as package_revenue
       FROM packages p
       LEFT JOIN bookings b ON p.id = b.package_id AND b.status != 'cancelled'
       WHERE p.is_active = TRUE
       GROUP BY p.id, p.title
       ORDER BY package_revenue DESC`
    );

    // Get recent bookings
    const [recentBookings] = await pool.execute(
      `SELECT b.id, u.name as user_name, p.title as package_title, b.total_price, b.status, b.created_at
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN packages p ON b.package_id = p.id
       ORDER BY b.created_at DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue: parseFloat(totalRevenue),
          estimatedProfit: parseFloat(estimatedProfit),
          totalBookings,
          totalUsers,
          activePackages
        },
        statusBreakdown,
        revenueByPackage: revenueByPackage.map(p => ({
          ...p,
          package_revenue: parseFloat(p.package_revenue)
        })),
        recentBookings: recentBookings.map(b => ({
          ...b,
          total_price: parseFloat(b.total_price)
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
};

const getAvailableVehicles = async (req, res) => {
  try {
    const { start_date, end_date, passenger_count } = req.query;

    if (!start_date || !end_date || !passenger_count) {
      return res.status(400).json({
        success: false,
        message: 'start_date, end_date, and passenger_count are required'
      });
    }

    const [vehicles] = await pool.execute(
      `SELECT v.*, vt.name as type_name 
       FROM vehicles v
       LEFT JOIN vehicle_types vt ON v.type_id = vt.id
       WHERE v.status = 'available' AND v.capacity >= ?
       AND v.id NOT IN (
         SELECT vehicle_id FROM bookings 
         WHERE status IN ('confirmed', 'pending') 
         AND vehicle_id IS NOT NULL
         AND (
           (start_date < ? AND end_date > ?)
           OR (start_date >= ? AND start_date < ?)
         )
       )
       ORDER BY v.capacity`,
      [passenger_count, end_date, start_date, start_date, end_date]
    );

    res.json({
      success: true,
      data: { vehicles }
    });
  } catch (error) {
    console.error('Available vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available vehicles'
    });
  }
};

const getAvailableDrivers = async (req, res) => {
  try {
    const [drivers] = await pool.execute(
      `SELECT * FROM drivers WHERE is_active = TRUE AND assigned_vehicle IS NULL ORDER BY name`
    );

    res.json({
      success: true,
      data: { drivers }
    });
  } catch (error) {
    console.error('Available drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available drivers'
    });
  }
};

const assignVehicleAndDriver = async (req, res) => {
  try {
    const { booking_id, vehicle_id, driver_id } = req.body;

    if (!booking_id || !vehicle_id || !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'booking_id, vehicle_id, and driver_id are required'
      });
    }

    // Check booking exists
    const booking = await Booking.getById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check driver availability for the booking dates
    const [driverConflicts] = await pool.execute(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE driver_id = ? AND status IN ('confirmed', 'pending')
       AND (
         (start_date < ? AND end_date > ?)
         OR (start_date >= ? AND start_date < ?)
       )`,
      [driver_id, booking.end_date, booking.start_date, booking.start_date, booking.end_date]
    );

    if (driverConflicts[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Driver is not available for the selected dates'
      });
    }

    // Update booking with vehicle, driver, and AUTO-CONFIRM status
    const [updateResult] = await pool.execute(
      'UPDATE bookings SET vehicle_id = ?, driver_id = ?, status = ? WHERE id = ?',
      [vehicle_id, driver_id, 'confirmed', booking_id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update booking'
      });
    }

    // Update vehicle status to booked
    await pool.execute(
      'UPDATE vehicles SET status = ? WHERE id = ?',
      ['booked', vehicle_id]
    );

    // Update driver assignment
    await pool.execute(
      'UPDATE drivers SET assigned_vehicle = ? WHERE id = ?',
      [vehicle_id, driver_id]
    );

    // Log the assignment
    await pool.execute(
      'INSERT INTO booking_logs (booking_id, action, note) VALUES (?, ?, ?)',
      [booking_id, 'vehicle_driver_assigned', `Vehicle ID ${vehicle_id} and Driver ID ${driver_id} assigned - Booking confirmed`]
    );

    res.json({
      success: true,
      message: 'Vehicle and driver assigned successfully - Booking confirmed'
    });
  } catch (error) {
    console.error('Assign vehicle and driver error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error assigning vehicle and driver'
    });
  }
};

const getDriverAvailability = async (req, res) => {
  try {
    const { driver_id, start_date, end_date } = req.query;

    if (!driver_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'driver_id, start_date, and end_date are required'
      });
    }

    const [conflicts] = await pool.execute(
      `SELECT b.*, p.title, u.name FROM bookings b
       LEFT JOIN packages p ON b.package_id = p.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.driver_id = ? AND b.status IN ('confirmed', 'pending')
       AND (
         (b.start_date < ? AND b.end_date > ?)
         OR (b.start_date >= ? AND b.start_date < ?)
       )`,
      [driver_id, end_date, start_date, start_date, end_date]
    );

    res.json({
      success: true,
      data: {
        driver_id,
        is_available: conflicts.length === 0,
        conflicts: conflicts,
        message: conflicts.length === 0 ? 'Driver is available' : `Driver has ${conflicts.length} booking(s)`
      }
    });
  } catch (error) {
    console.error('Driver availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking driver availability'
    });
  }
};

const getAvailableSeats = async (req, res) => {
  try {
    const { package_id, start_date, end_date } = req.query;

    if (!package_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'package_id, start_date, and end_date are required'
      });
    }

    // Get all confirmed/pending bookings for this package in the date range
    const [bookings] = await pool.execute(
      `SELECT SUM(passengers) as booked_seats FROM bookings
       WHERE package_id = ? AND status IN ('confirmed', 'pending')
       AND (
         (start_date < ? AND end_date > ?)
         OR (start_date >= ? AND start_date < ?)
       )`,
      [package_id, end_date, start_date, start_date, end_date]
    );

    const bookedSeats = bookings[0]?.booked_seats || 0;
    // Assume 50 seats available per batch
    const totalSeats = 50;
    const availableSeats = totalSeats - bookedSeats;

    res.json({
      success: true,
      data: {
        package_id,
        total_seats: totalSeats,
        booked_seats: bookedSeats,
        available_seats: Math.max(0, availableSeats),
        date_range: { start_date, end_date }
      }
    });
  } catch (error) {
    console.error('Available seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking available seats'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAvailableVehicles,
  getAvailableDrivers,
  assignVehicleAndDriver,
  getDriverAvailability,
  getAvailableSeats
};
