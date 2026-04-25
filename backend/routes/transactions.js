const express = require('express');
const { authenticateToken } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Get all transactions' });
});

module.exports = router;