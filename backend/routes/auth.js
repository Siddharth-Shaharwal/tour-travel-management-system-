const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { registerValidation, loginValidation, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;