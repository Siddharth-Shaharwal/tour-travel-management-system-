const { pool } = require('../config/database');

class Package {
  static async create(packageData) {
    const { title, short_description, long_description, price, duration_days, image_url, guide_required } = packageData;
    
    const [result] = await pool.execute(
      `INSERT INTO packages (title, short_description, long_description, price, duration_days, image_url, guide_required, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [title, short_description, long_description, price, duration_days, image_url, guide_required]
    );
    
    return result.insertId;
  }

  static async getById(packageId) {
    const [packages] = await pool.execute(
      'SELECT * FROM packages WHERE id = ? AND is_active = TRUE',
      [packageId]
    );
    return packages[0];
  }

  static async getAll() {
    const [packages] = await pool.execute(
      'SELECT * FROM packages WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    return packages;
  }

  static async update(packageId, updateData) {
    const { title, short_description, long_description, price, duration_days, image_url, guide_required } = updateData;
    
    await pool.execute(
      `UPDATE packages 
       SET title = ?, short_description = ?, long_description = ?, price = ?, duration_days = ?, image_url = ?, guide_required = ?
       WHERE id = ? AND is_active = TRUE`,
      [title, short_description, long_description, price, duration_days, image_url, guide_required, packageId]
    );
  }

  static async delete(packageId) {
    await pool.execute(
      'UPDATE packages SET is_active = FALSE WHERE id = ?',
      [packageId]
    );
  }
}

module.exports = Package;
