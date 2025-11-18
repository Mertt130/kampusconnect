const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');

/**
 * @route   GET /api/companies
 * @desc    Get all companies with filters
 * @access  Public
 */
router.get('/', companyController.getAllCompanies);

/**
 * @route   GET /api/companies/stats
 * @desc    Get company statistics
 * @access  Public
 */
router.get('/stats', companyController.getCompanyStats);

/**
 * @route   GET /api/companies/:id
 * @desc    Get company by ID
 * @access  Public
 */
router.get('/:id', companyController.getCompanyById);

module.exports = router;
