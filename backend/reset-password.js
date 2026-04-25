const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');
require('dotenv').config();

async function resetPasswords() {
  try {
    // Hash passwords
    const adminHash = await bcrypt.hash('admin@123', 10);
    const userHash = await bcrypt.hash('user@123', 10);

    // Update admin password
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [adminHash, 'admin@travelms.com']
    );

    // Update user password
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [userHash, 'user@travelms.com']
    );

    console.log('Passwords reset successfully!');
    console.log('Admin email: admin@travelms.com, password: admin@123');
    console.log('User email: user@travelms.com, password: user@123');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting passwords:', error);
    process.exit(1);
  }
}

resetPasswords();
