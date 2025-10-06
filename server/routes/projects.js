const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  validateProjectCreation, 
  validateProjectUpdate, 
  validateUUID, 
  validatePagination,
  validateProjectFilters 
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Get all projects with filters
router.get('/', validatePagination, validateProjectFilters, asyncHandler(async (req, res) => {
  const { 
    category, 
    minBudget, 
    maxBudget, 
    search, 
    status = 'open',
    page = 1, 
    limit = 20 
  } = req.query;

  let query = supabase
    .from('projects')
    .select(`
      *,
      client:users!projects_client_id_fkey(id, name, profile),
      proposals(id, status)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  // Apply filters
  if (category) {
    query = query.eq('category', category);
  }

  if (minBudget) {
    query = query.gte('budget', parseInt(minBudget));
  }

  if (maxBudget) {
    query = query.lte('budget', parseInt(maxBudget));
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: projects, error } = await query;

  if (error) {
    logger.error('Projects fetch failed:', error);
    throw error;
  }

  res.json({
    projects: projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      budget: project.budget,
      category: project.category,
      skills: project.skills,
      deadline: project.deadline,
      status: project.status,
      clientId: project.client_id,
      clientName: project.client?.name,
      clientProfile: project.client?.profile,
      proposalCount: project.proposals?.length || 0,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: projects.length
    }
  });
}));

// Get single project
router.get('/:id', validateUUID('id'), asyncHandler(async (req, res) => {
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:users!projects_client_id_fkey(id, name, profile),
      proposals(
        id, 
        cover_letter, 
        proposed_budget, 
        timeline, 
        status, 
        created_at,
        freelancer:users!proposals_freelancer_id_fkey(id, name, profile)
      )
    `)
    .eq('id', req.params.id)
    .single();

  if (error || !project) {
    return res.status(404).json({
      error: 'Project not found',
      message: 'The requested project does not exist'
    });
  }

  res.json({
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      budget: project.budget,
      category: project.category,
      skills: project.skills,
      deadline: project.deadline,
      status: project.status,
      clientId: project.client_id,
      clientName: project.client?.name,
      clientProfile: project.client?.profile,
      proposals: project.proposals?.map(proposal => ({
        id: proposal.id,
        coverLetter: proposal.cover_letter,
        proposedBudget: proposal.proposed_budget,
        timeline: proposal.timeline,
        status: proposal.status,
        freelancerId: proposal.freelancer?.id,
        freelancerName: proposal.freelancer?.name,
        freelancerProfile: proposal.freelancer?.profile,
        createdAt: proposal.created_at
      })) || [],
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }
  });
}));

// Create new project (clients only)
router.post('/', authenticateToken, requireRole('client'), validateProjectCreation, asyncHandler(async (req, res) => {
  const { title, description, budget, category, skills, deadline } = req.body;

  const { data: project, error } = await supabase
    .from('projects')
    .insert([{
      title,
      description,
      budget,
      category,
      skills,
      deadline,
      client_id: req.user.id,
      status: 'open'
    }])
    .select(`
      *,
      client:users!projects_client_id_fkey(id, name, profile)
    `)
    .single();

  if (error) {
    logger.error('Project creation failed:', error);
    throw error;
  }

  logger.info('Project created successfully:', { projectId: project.id, clientId: req.user.id });

  res.status(201).json({
    message: 'Project created successfully',
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      budget: project.budget,
      category: project.category,
      skills: project.skills,
      deadline: project.deadline,
      status: project.status,
      clientId: project.client_id,
      clientName: project.client?.name,
      proposals: [],
      createdAt: project.created_at
    }
  });
}));

// Update project
router.put('/:id', authenticateToken, validateUUID('id'), validateProjectUpdate, asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const updates = req.body;

  // Check if user owns the project
  const { data: existingProject, error: fetchError } = await supabase
    .from('projects')
    .select('client_id')
    .eq('id', projectId)
    .single();

  if (fetchError || !existingProject) {
    return res.status(404).json({
      error: 'Project not found',
      message: 'The requested project does not exist'
    });
  }

  if (existingProject.client_id !== req.user.id) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only update your own projects'
    });
  }

  const { data: project, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .select(`
      *,
      client:users!projects_client_id_fkey(id, name, profile)
    `)
    .single();

  if (error) {
    logger.error('Project update failed:', error);
    throw error;
  }

  logger.info('Project updated successfully:', { projectId, clientId: req.user.id });

  res.json({
    message: 'Project updated successfully',
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      budget: project.budget,
      category: project.category,
      skills: project.skills,
      deadline: project.deadline,
      status: project.status,
      clientId: project.client_id,
      clientName: project.client?.name,
      updatedAt: project.updated_at
    }
  });
}));

// Delete project
router.delete('/:id', authenticateToken, validateUUID('id'), asyncHandler(async (req, res) => {
  const projectId = req.params.id;

  // Check if user owns the project
  const { data: existingProject, error: fetchError } = await supabase
    .from('projects')
    .select('client_id')
    .eq('id', projectId)
    .single();

  if (fetchError || !existingProject) {
    return res.status(404).json({
      error: 'Project not found',
      message: 'The requested project does not exist'
    });
  }

  if (existingProject.client_id !== req.user.id) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only delete your own projects'
    });
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    logger.error('Project deletion failed:', error);
    throw error;
  }

  logger.info('Project deleted successfully:', { projectId, clientId: req.user.id });

  res.json({
    message: 'Project deleted successfully'
  });
}));

// Get user's projects
router.get('/user/my-projects', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const offset = (page - 1) * limit;

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      proposals(id, status, freelancer:users!proposals_freelancer_id_fkey(id, name))
    `)
    .eq('client_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error('User projects fetch failed:', error);
    throw error;
  }

  res.json({
    projects: projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      budget: project.budget,
      category: project.category,
      skills: project.skills,
      deadline: project.deadline,
      status: project.status,
      proposalCount: project.proposals?.length || 0,
      proposals: project.proposals?.map(proposal => ({
        id: proposal.id,
        status: proposal.status,
        freelancerId: proposal.freelancer?.id,
        freelancerName: proposal.freelancer?.name
      })) || [],
      createdAt: project.created_at,
      updatedAt: project.updated_at
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: projects.length
    }
  });
}));

module.exports = router;