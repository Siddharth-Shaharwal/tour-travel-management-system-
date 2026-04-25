const { pool } = require('../config/database');

class Booking {
  static async create(bookingData) {
    const { user_id, package_id, vehicle_id, start_date, end_date, passengers, total_price } = bookingData;
    
    const [result] = await pool.execute(
      `INSERT INTO bookings (user_id, package_id, vehicle_id, start_date, end_date, passengers, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [user_id, package_id, vehicle_id, start_date, end_date, passengers, total_price]
    );
    
    return result.insertId;
  }

  static async getById(bookingId) {
    const [bookings] = await pool.execute(
      `SELECT b.*, p.title as package_title, p.price as package_price, v.make, v.model, u.name as user_name, d.name as driver_name
       FROM bookings b
       LEFT JOIN packages p ON b.package_id = p.id
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN drivers d ON b.driver_id = d.id
       WHERE b.id = ?`,
      [bookingId]
    );
    return bookings[0];
  }

  static async getByUserId(userId) {
    const [bookings] = await pool.execute(
      `SELECT b.*, p.title as package_title, p.price as package_price, v.make, v.model, d.name as driver_name
       FROM bookings b
       LEFT JOIN packages p ON b.package_id = p.id
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       LEFT JOIN drivers d ON b.driver_id = d.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return bookings;
  }

  static async getAll() {
    const [bookings] = await pool.execute(
      `SELECT b.*, p.title as package_title, p.price as package_price, v.make, v.model, u.name as user_name, d.name as driver_name
       FROM bookings b
       LEFT JOIN packages p ON b.package_id = p.id
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN drivers d ON b.driver_id = d.id
       ORDER BY b.created_at DESC`
    );
    return bookings;
  }

  static async updateStatus(bookingId, status, verifiedBy = null) {
    const query = verifiedBy 
      ? `UPDATE bookings SET status = ? WHERE id = ?` 
      : `UPDATE bookings SET status = ? WHERE id = ?`;
    
    await pool.execute(query, [status, bookingId]);

    if (verifiedBy) {
      await pool.execute(
        `UPDATE admin_verifications SET verified = TRUE, verified_by = ?, verified_at = NOW() WHERE booking_id = ?`,
        [verifiedBy, bookingId]
      );
    }
  }

  static async getPendingBookings() {
    const [bookings] = await pool.execute(
      `SELECT b.*, p.title as package_title, u.name as user_name, u.email
       FROM bookings b
       LEFT JOIN packages p ON b.package_id = p.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.status = 'pending'
       ORDER BY b.created_at DESC`
    );
    return bookings;
  }
}

module.exports = Booking;
