const { pool } = require('../config/database');

const getPackages = async (req, res) => {
  try {
    const [packages] = await pool.execute(
      'SELECT * FROM packages WHERE is_active = TRUE ORDER BY id DESC'
    );

    res.json({
      success: true,
      data: { packages },
      count: packages.length
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching packages'
    });
  }
};

const getPackageById = async (req, res) => {
  try {
    const [packages] = await pool.execute(
      'SELECT * FROM packages WHERE id = ? AND is_active = TRUE',
      [req.params.id]
    );

    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      data: { package: packages[0] }
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching package'
    });
  }
};

const createPackage = async (req, res) => {
  try {
    const { title, description, price, duration_days } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO packages (title, description, price, duration_days) 
       VALUES (?, ?, ?, ?)`,
      [title, description, price, duration_days]
    );

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: { packageId: result.insertId }
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating package'
    });
  }
};

const updatePackage = async (req, res) => {
  try {
    const { title, description, price, duration_days } = req.body;

    const [result] = await pool.execute(
      `UPDATE packages SET title = ?, description = ?, price = ?, duration_days = ? 
       WHERE id = ? AND is_active = TRUE`,
      [title, description, price, duration_days, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      message: 'Package updated successfully'
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating package'
    });
  }
};

const deletePackage = async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE packages SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting package'
    });
  }
};

module.exports = {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
};