const express = require('express');
const proposalController = require('../controllers/proposalController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateProposal } = require('../middleware/validation');
const { apiLimiter, proposalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all proposal routes
router.use(apiLimiter);

// Proposal routes
router.post('/', authenticateToken, requireRole('freelancer'), proposalLimiter, validateProposal, proposalController.submitProposal);
router.get('/project/:projectId', authenticateToken, requireRole('client'), proposalController.getProjectProposals);
router.get('/my-proposals', authenticateToken, requireRole('freelancer'), proposalController.getFreelancerProposals);
router.put('/:id/status', authenticateToken, requireRole('client'), proposalController.updateProposalStatus);
router.delete('/:id', authenticateToken, requireRole('freelancer'), proposalController.deleteProposal);
module.exports = router;