const pool = require('../config/database');

const getAllDrivers = async (req, res) => {
  try {
    const [drivers] = await pool.execute(
      `SELECT d.*, dt.type_name 
       FROM drivers d 
       LEFT JOIN driver_types dt ON d.driver_type_id = dt.id
       ORDER BY d.name ASC`
    );

    res.json({
      success: true,
      data: { drivers },
      count: drivers.length
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers'
    });
  }
};

const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const [driver] = await pool.execute(
      `SELECT d.*, dt.type_name 
       FROM drivers d 
       LEFT JOIN driver_types dt ON d.driver_type_id = dt.id
       WHERE d.id = ?`,
      [id]
    );

    if (driver.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      data: { driver: driver[0] }
    });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching driver'
    });
  }
};

const createDriver = async (req, res) => {
  try {
    const { name, license_number, phone, driver_type_id, experience_years } = req.body;

    if (!name || !license_number || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, license number, and phone are required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO drivers (name, license_number, phone, driver_type_id, experience_years, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, license_number, phone, driver_type_id || null, experience_years || 0, 'available']
    );

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: { driver_id: result.insertId }
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating driver'
    });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, license_number, phone, driver_type_id, experience_years, status } = req.body;

    // Check if driver exists
    const [driver] = await pool.execute('SELECT id FROM drivers WHERE id = ?', [id]);
    if (driver.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    const updateFields = [];
    const values = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (license_number !== undefined) {
      updateFields.push('license_number = ?');
      values.push(license_number);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(phone);
    }
    if (driver_type_id !== undefined) {
      updateFields.push('driver_type_id = ?');
      values.push(driver_type_id);
    }
    if (experience_years !== undefined) {
      updateFields.push('experience_years = ?');
      values.push(experience_years);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      values.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE drivers SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Driver updated successfully'
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating driver'
    });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if driver has any assigned bookings
    const [bookings] = await pool.execute(
      'SELECT COUNT(*) as count FROM bookings WHERE driver_id = ? AND status IN ("confirmed", "pending")',
      [id]
    );

    if (bookings[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete driver with active bookings. Please reassign bookings first.'
      });
    }

    const [result] = await pool.execute('DELETE FROM drivers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting driver'
    });
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
};
