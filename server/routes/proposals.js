const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  validateProposalCreation, 
  validateProposalStatusUpdate, 
  validateUUID, 
  validatePagination 
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Submit proposal (freelancers only)
router.post('/', authenticateToken, requireRole('freelancer'), validateProposalCreation, asyncHandler(async (req, res) => {
  const { projectId, coverLetter, proposedBudget, timeline } = req.body;

  // Check if project exists and is open
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, status, client_id')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    return res.status(404).json({
      error: 'Project not found',
      message: 'The requested project does not exist'
    });
  }

  if (project.status !== 'open') {
    return res.status(400).json({
      error: 'Project not available',
      message: 'This project is no longer accepting proposals'
    });
  }

  if (project.client_id === req.user.id) {
    return res.status(400).json({
      error: 'Invalid action',
      message: 'You cannot submit a proposal to your own project'
    });
  }

  // Check if user already submitted a proposal
  const { data: existingProposal } = await supabase
    .from('proposals')
    .select('id')
    .eq('project_id', projectId)
    .eq('freelancer_id', req.user.id)
    .single();

  if (existingProposal) {
    return res.status(409).json({
      error: 'Proposal already exists',
      message: 'You have already submitted a proposal for this project'
    });
  }

  // Create proposal
  const { data: proposal, error } = await supabase
    .from('proposals')
    .insert([{
      project_id: projectId,
      freelancer_id: req.user.id,
      cover_letter: coverLetter,
      proposed_budget: proposedBudget,
      timeline,
      status: 'pending'
    }])
    .select(`
      *,
      project:projects!proposals_project_id_fkey(id, title, client_id),
      freelancer:users!proposals_freelancer_id_fkey(id, name, profile)
    `)
    .single();

  if (error) {
    logger.error('Proposal creation failed:', error);
    throw error;
  }

  logger.info('Proposal submitted successfully:', { 
    proposalId: proposal.id, 
    projectId, 
    freelancerId: req.user.id 
  });

  res.status(201).json({
    message: 'Proposal submitted successfully',
    proposal: {
      id: proposal.id,
      projectId: proposal.project_id,
      projectTitle: proposal.project?.title,
      coverLetter: proposal.cover_letter,
      proposedBudget: proposal.proposed_budget,
      timeline: proposal.timeline,
      status: proposal.status,
      freelancerId: proposal.freelancer_id,
      freelancerName: proposal.freelancer?.name,
      createdAt: proposal.created_at
    }
  });
}));

// Get proposals for a project (project owner only)
router.get('/project/:projectId', authenticateToken, validateUUID('projectId'), asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Check if user owns the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('client_id')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    return res.status(404).json({
      error: 'Project not found',
      message: 'The requested project does not exist'
    });
  }

  if (project.client_id !== req.user.id) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only view proposals for your own projects'
    });
  }

  const { data: proposals, error } = await supabase
    .from('proposals')
    .select(`
      *,
      freelancer:users!proposals_freelancer_id_fkey(id, name, profile)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Project proposals fetch failed:', error);
    throw error;
  }

  res.json({
    proposals: proposals.map(proposal => ({
      id: proposal.id,
      coverLetter: proposal.cover_letter,
      proposedBudget: proposal.proposed_budget,
      timeline: proposal.timeline,
      status: proposal.status,
      freelancerId: proposal.freelancer_id,
      freelancerName: proposal.freelancer?.name,
      freelancerProfile: proposal.freelancer?.profile,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at
    }))
  });
}));

// Get freelancer's proposals
router.get('/my-proposals', authenticateToken, requireRole('freelancer'), validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const offset = (page - 1) * limit;

  const { data: proposals, error } = await supabase
    .from('proposals')
    .select(`
      *,
      project:projects!proposals_project_id_fkey(id, title, budget, status, client:users!projects_client_id_fkey(id, name))
    `)
    .eq('freelancer_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error('Freelancer proposals fetch failed:', error);
    throw error;
  }

  res.json({
    proposals: proposals.map(proposal => ({
      id: proposal.id,
      projectId: proposal.project_id,
      projectTitle: proposal.project?.title,
      projectBudget: proposal.project?.budget,
      projectStatus: proposal.project?.status,
      clientName: proposal.project?.client?.name,
      coverLetter: proposal.cover_letter,
      proposedBudget: proposal.proposed_budget,
      timeline: proposal.timeline,
      status: proposal.status,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: proposals.length
    }
  });
}));

// Update proposal status (project owner only)
router.put('/:id/status', authenticateToken, validateUUID('id'), validateProposalStatusUpdate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Get proposal with project info
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select(`
      *,
      project:projects!proposals_project_id_fkey(id, client_id, status)
    `)
    .eq('id', id)
    .single();

  if (proposalError || !proposal) {
    return res.status(404).json({
      error: 'Proposal not found',
      message: 'The requested proposal does not exist'
    });
  }

  // Check if user owns the project
  if (proposal.project.client_id !== req.user.id) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only update proposals for your own projects'
    });
  }

  // Check if proposal can be updated
  if (proposal.status !== 'pending') {
    return res.status(400).json({
      error: 'Invalid action',
      message: 'Only pending proposals can be updated'
    });
  }

  // Update proposal status
  const { data: updatedProposal, error } = await supabase
    .from('proposals')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      project:projects!proposals_project_id_fkey(id, title),
      freelancer:users!proposals_freelancer_id_fkey(id, name)
    `)
    .single();

  if (error) {
    logger.error('Proposal status update failed:', error);
    throw error;
  }

  // If proposal is accepted, update project status and reject other proposals
  if (status === 'accepted') {
    // Update project status to in_progress
    await supabase
      .from('projects')
      .update({ 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', proposal.project_id);

    // Reject all other pending proposals for this project
    await supabase
      .from('proposals')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('project_id', proposal.project_id)
      .neq('id', id)
      .eq('status', 'pending');
  }

  logger.info('Proposal status updated successfully:', { 
    proposalId: id, 
    status, 
    clientId: req.user.id 
  });

  res.json({
    message: 'Proposal status updated successfully',
    proposal: {
      id: updatedProposal.id,
      projectId: updatedProposal.project_id,
      projectTitle: updatedProposal.project?.title,
      status: updatedProposal.status,
      freelancerName: updatedProposal.freelancer?.name,
      updatedAt: updatedProposal.updated_at
    }
  });
}));

// Delete proposal (freelancer only, pending proposals only)
router.delete('/:id', authenticateToken, validateUUID('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get proposal
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('freelancer_id, status')
    .eq('id', id)
    .single();

  if (proposalError || !proposal) {
    return res.status(404).json({
      error: 'Proposal not found',
      message: 'The requested proposal does not exist'
    });
  }

  // Check if user owns the proposal
  if (proposal.freelancer_id !== req.user.id) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only delete your own proposals'
    });
  }

  // Check if proposal can be deleted
  if (proposal.status !== 'pending') {
    return res.status(400).json({
      error: 'Invalid action',
      message: 'Only pending proposals can be deleted'
    });
  }

  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Proposal deletion failed:', error);
    throw error;
  }

  logger.info('Proposal deleted successfully:', { proposalId: id, freelancerId: req.user.id });

  res.json({
    message: 'Proposal deleted successfully'
  });
}));

module.exports = router;