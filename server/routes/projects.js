const express = require('express');
const projectController = require('../controllers/projectController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');
const { apiLimiter, projectLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all project routes
router.use(apiLimiter);

// Project routes
router.get('/', projectController.getProjects);
router.get('/user/my-projects', authenticateToken, requireRole('client'), projectController.getUserProjects);
router.get('/:id', projectController.getProject);
router.post('/', authenticateToken, requireRole('client'), projectLimiter, validateProject, projectController.createProject);
router.put('/:id', authenticateToken, requireRole('client'), projectController.updateProject);
router.delete('/:id', authenticateToken, requireRole('client'), projectController.deleteProject);
module.exports = router;