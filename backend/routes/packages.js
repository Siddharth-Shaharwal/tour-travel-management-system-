const express = require('express');
const { getPackages, getPackageById, createPackage, updatePackage, deletePackage } = require('../controllers/packageController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { packageValidation, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

router.get('/', getPackages);
router.get('/:id', getPackageById);
router.post('/', authenticateToken, authorizeAdmin, packageValidation, handleValidationErrors, createPackage);
router.put('/:id', authenticateToken, authorizeAdmin, packageValidation, handleValidationErrors, updatePackage);
router.delete('/:id', authenticateToken, authorizeAdmin, deletePackage);

module.exports = router;