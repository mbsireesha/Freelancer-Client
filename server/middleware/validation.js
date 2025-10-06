const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('userType')
    .isIn(['client', 'freelancer'])
    .withMessage('User type must be either client or freelancer'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('userType')
    .isIn(['client', 'freelancer'])
    .withMessage('User type must be either client or freelancer'),
  handleValidationErrors
];

const validateProfileUpdate = [
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must not exceed 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),
  handleValidationErrors
];

// Project validation rules
const validateProjectCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('budget')
    .isInt({ min: 1 })
    .withMessage('Budget must be a positive integer'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('skills.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  body('deadline')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  handleValidationErrors
];

const validateProjectUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('budget')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Budget must be a positive integer'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: open, in_progress, completed, cancelled'),
  handleValidationErrors
];

// Proposal validation rules
const validateProposalCreation = [
  body('projectId')
    .isUUID()
    .withMessage('Valid project ID is required'),
  body('coverLetter')
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Cover letter must be between 50 and 1000 characters'),
  body('proposedBudget')
    .isInt({ min: 1 })
    .withMessage('Proposed budget must be a positive integer'),
  body('timeline')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Timeline must be between 5 and 100 characters'),
  handleValidationErrors
];

const validateProposalStatusUpdate = [
  body('status')
    .isIn(['accepted', 'rejected'])
    .withMessage('Status must be either accepted or rejected'),
  handleValidationErrors
];

// Parameter validation
const validateUUID = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateProjectFilters = [
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  query('minBudget')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum budget must be a non-negative integer'),
  query('maxBudget')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum budget must be a non-negative integer'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validateProjectCreation,
  validateProjectUpdate,
  validateProposalCreation,
  validateProposalStatusUpdate,
  validateUUID,
  validatePagination,
  validateProjectFilters,
  handleValidationErrors
};