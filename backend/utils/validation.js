const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('phone').optional().trim()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
];

const packageValidation = [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('short_description').optional().trim(),
  body('long_description').optional().trim(),
  body('duration_days').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('image_url').optional().trim(),
  body('guide_required').optional().isBoolean()
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  packageValidation
};