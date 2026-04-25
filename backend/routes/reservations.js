const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Create new reservation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { packageId, totalAmount } = req.body;
    const travelerId = req.user.UserID;

    console.log('📦 Creating reservation:', {
      travelerId: travelerId,
      packageId: packageId,
      totalAmount: totalAmount
    });

    // Check if package exists
    const [packages] = await pool.execute(
      'SELECT * FROM Packages WHERE PackageID = ?',
      [packageId]
    );

    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Create reservation (remove IsActive check since column might not exist)
    const [result] = await pool.execute(
      `INSERT INTO Reservations (TravelerID, PackageID, TotalAmount, Status) 
       VALUES (?, ?, ?, 'confirmed')`,
      [travelerId, packageId, totalAmount]
    );

    console.log('✅ Reservation created with ID:', result.insertId);

    res.json({
      success: true,
      message: 'Reservation created successfully!',
      data: { 
        reservationId: result.insertId,
        status: 'confirmed'
      }
    });

  } catch (error) {
    console.error('❌ Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Database error: ' + error.message
    });
  }
});

// Get user's reservations - SIMPLIFIED VERSION
router.get('/my-reservations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.UserID;
    
    console.log('📋 Fetching reservations for user:', userId);

    // Simple query without IsActive check
    const [reservations] = await pool.execute(
      `SELECT 
        r.ReservationID,
        r.TotalAmount,
        r.Status,
        r.BookingDate,
        r.CreatedAt,
        p.Title,
        p.Destination,
        p.Duration,
        p.Description
       FROM Reservations r 
       JOIN Packages p ON r.PackageID = p.PackageID 
       WHERE r.TravelerID = ?
       ORDER BY r.CreatedAt DESC`,
      [userId]
    );

    console.log('✅ Found reservations:', reservations.length);
    console.log('Reservations data:', reservations);

    res.json({
      success: true,
      data: { 
        reservations: reservations,
        count: reservations.length
      }
    });

  } catch (error) {
    console.error('❌ Get reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations: ' + error.message
    });
  }
});

// Get all reservations (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const [reservations] = await pool.execute(
      `SELECT 
        r.*,
        p.Title,
        p.Destination,
        u.FullName as TravelerName,
        u.Email as TravelerEmail
       FROM Reservations r 
       JOIN Packages p ON r.PackageID = p.PackageID 
       JOIN Users u ON r.TravelerID = u.UserID 
       ORDER BY r.CreatedAt DESC`
    );

    res.json({
      success: true,
      data: { reservations }
    });

  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations'
    });
  }
});

// Get reservation by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.UserID;
    const userRole = req.user.Role;

    let query = `
      SELECT 
        r.*,
        p.Title,
        p.Destination,
        p.Duration,
        p.Description,
        u.FullName as TravelerName
      FROM Reservations r 
      JOIN Packages p ON r.PackageID = p.PackageID 
      JOIN Users u ON r.TravelerID = u.UserID 
      WHERE r.ReservationID = ?
    `;

    let params = [reservationId];

    // If not admin, only show user's own reservations
    if (userRole !== 'admin') {
      query += ' AND r.TravelerID = ?';
      params.push(userId);
    }

    const [reservations] = await pool.execute(query, params);

    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: { reservation: reservations[0] }
    });

  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservation'
    });
  }
});

// Update reservation status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const reservationId = req.params.id;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const [result] = await pool.execute(
      'UPDATE Reservations SET Status = ? WHERE ReservationID = ?',
      [status, reservationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation status updated successfully'
    });

  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reservation'
    });
  }
});

// Cancel reservation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.UserID;
    const userRole = req.user.Role;

    // Simply delete the reservation
    let query = 'DELETE FROM Reservations WHERE ReservationID = ?';
    let params = [reservationId];

    // If not admin, only allow deleting own reservations
    if (userRole !== 'admin') {
      query += ' AND TravelerID = ?';
      params.push(userId);
    }

    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling reservation'
    });
  }
});

module.exports = router;