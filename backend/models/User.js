const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, phone, password, is_admin = false } = userData;
    
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));
    
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, password_hash, is_admin, is_active) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [name, email, phone, hashedPassword, is_admin]
    );
    
    return result.insertId;
  }

  static async findByEmail(email) {
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, password_hash, is_admin, is_active, created_at FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );
    return users[0];
  }

  static async findById(userId) {
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, is_admin, is_active, created_at FROM users WHERE id = ? AND is_active = TRUE',
      [userId]
    );
    return users[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(userId, updateData) {
    const { name, phone } = updateData;
    await pool.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone, userId]
    );
  }

  static async getAllUsers() {
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, is_admin, is_active, created_at FROM users WHERE is_active = TRUE'
    );
    return users;
  }
}

module.exports = User;