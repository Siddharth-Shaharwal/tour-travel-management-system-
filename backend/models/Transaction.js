const { pool } = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const { booking_id, amount, payment_mode = 'pending' } = transactionData;
    
    const [result] = await pool.execute(
      `INSERT INTO transactions (booking_id, amount, payment_mode, status, created_at) 
       VALUES (?, ?, ?, 'pending', NOW())`,
      [booking_id, amount, payment_mode]
    );
    
    return result.insertId;
  }

  static async getById(transactionId) {
    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );
    return transactions[0];
  }

  static async getByBookingId(bookingId) {
    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE booking_id = ? ORDER BY created_at DESC',
      [bookingId]
    );
    return transactions;
  }

  static async updateStatus(transactionId, status) {
    await pool.execute(
      'UPDATE transactions SET status = ? WHERE id = ?',
      [status, transactionId]
    );
  }

  static async getAll() {
    const [transactions] = await pool.execute(
      'SELECT * FROM transactions ORDER BY created_at DESC'
    );
    return transactions;
  }
}

module.exports = Transaction;
