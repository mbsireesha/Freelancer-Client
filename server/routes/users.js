const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all user routes
router.use(apiLimiter);

// User routes
router.put('/profile', authenticateToken, userController.updateProfile);
router.get('/stats', authenticateToken, userController.getUserStats);
router.get('/search/freelancers', userController.searchFreelancers);
router.get('/:id', userController.getUserById);
module.exports = router;