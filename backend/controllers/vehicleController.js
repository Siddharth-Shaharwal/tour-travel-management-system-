const pool = require('../config/database');

const getAllVehicles = async (req, res) => {
  try {
    const [vehicles] = await pool.execute(
      `SELECT v.*, vt.type_name 
       FROM vehicles v 
       LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
       ORDER BY v.id DESC`
    );

    res.json({
      success: true,
      data: { vehicles },
      count: vehicles.length
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles'
    });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [vehicle] = await pool.execute(
      `SELECT v.*, vt.type_name 
       FROM vehicles v 
       LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
       WHERE v.id = ?`,
      [id]
    );

    if (vehicle.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: { vehicle: vehicle[0] }
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle'
    });
  }
};

const createVehicle = async (req, res) => {
  try {
    const { license_plate, capacity, vehicle_type_id, registration_number } = req.body;

    if (!license_plate || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'License plate and capacity are required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO vehicles (license_plate, capacity, vehicle_type_id, registration_number, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [license_plate, capacity, vehicle_type_id || null, registration_number || null, 'available']
    );

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: { vehicle_id: result.insertId }
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating vehicle'
    });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { license_plate, capacity, vehicle_type_id, registration_number, status } = req.body;

    // Check if vehicle exists
    const [vehicle] = await pool.execute('SELECT id FROM vehicles WHERE id = ?', [id]);
    if (vehicle.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const updateFields = [];
    const values = [];

    if (license_plate !== undefined) {
      updateFields.push('license_plate = ?');
      values.push(license_plate);
    }
    if (capacity !== undefined) {
      updateFields.push('capacity = ?');
      values.push(capacity);
    }
    if (vehicle_type_id !== undefined) {
      updateFields.push('vehicle_type_id = ?');
      values.push(vehicle_type_id);
    }
    if (registration_number !== undefined) {
      updateFields.push('registration_number = ?');
      values.push(registration_number);
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
      `UPDATE vehicles SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle'
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle has any assigned bookings
    const [bookings] = await pool.execute(
      'SELECT COUNT(*) as count FROM bookings WHERE vehicle_id = ? AND status IN ("confirmed", "pending")',
      [id]
    );

    if (bookings[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle with active bookings. Please reassign bookings first.'
      });
    }

    const [result] = await pool.execute('DELETE FROM vehicles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle'
    });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
