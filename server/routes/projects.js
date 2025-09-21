const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all projects (with filters)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minBudget, 
      maxBudget, 
      skills, 
      status = 'open',
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    let query = supabase
      .from('projects')
      .select(`
        *,
        client:users!projects_client_id_fkey(id, name),
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

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query = query.overlaps('skills', skillsArray);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: projects, error } = await query;

    if (error) {
      console.error('Get projects error:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
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
        clientName: project.client.name,
        proposalCount: project.proposals.length,
        createdAt: project.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: projects.length
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:users!projects_client_id_fkey(id, name, profile),
        proposals(
          id,
          freelancer_id,
          cover_letter,
          proposed_budget,
          timeline,
          status,
          created_at,
          freelancer:users!proposals_freelancer_id_fkey(id, name, profile)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !project) {
      return res.status(404).json({ error: 'Project not found' });
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
        client: {
          id: project.client.id,
          name: project.client.name,
          profile: project.client.profile || {}
        },
        proposals: project.proposals.map(proposal => ({
          id: proposal.id,
          freelancerId: proposal.freelancer_id,
          freelancerName: proposal.freelancer.name,
          freelancerProfile: proposal.freelancer.profile || {},
          coverLetter: proposal.cover_letter,
          proposedBudget: proposal.proposed_budget,
          timeline: proposal.timeline,
          status: proposal.status,
          createdAt: proposal.created_at
        })),
        createdAt: project.created_at
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project (clients only)
router.post('/', authenticateToken, requireRole('client'), async (req, res) => {
  try {
    const { title, description, budget, category, skills, deadline } = req.body;

    // Validate input
    if (!title || !description || !budget || !category || !skills || !deadline) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (budget <= 0) {
      return res.status(400).json({ error: 'Budget must be greater than 0' });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          title,
          description,
          budget: parseInt(budget),
          category,
          skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
          deadline,
          client_id: req.user.id,
          status: 'open',
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        client:users!projects_client_id_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Create project error:', error);
      return res.status(500).json({ error: 'Failed to create project' });
    }

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
        clientName: project.client.name,
        createdAt: project.created_at
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project (project owner only)
router.put('/:id', authenticateToken, requireRole('client'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, budget, category, skills, deadline, status } = req.body;

    // Check if user owns the project
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existingProject.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (budget) updateData.budget = parseInt(budget);
    if (category) updateData.category = category;
    if (skills) updateData.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (deadline) updateData.deadline = deadline;
    if (status) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        client:users!projects_client_id_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Update project error:', error);
      return res.status(500).json({ error: 'Failed to update project' });
    }

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
        clientName: project.client.name,
        createdAt: project.created_at
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project (project owner only)
router.delete('/:id', authenticateToken, requireRole('client'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the project
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existingProject.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this project' });
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete project error:', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's projects
router.get('/user/my-projects', authenticateToken, requireRole('client'), async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        proposals(id, status, freelancer:users!proposals_freelancer_id_fkey(id, name))
      `)
      .eq('client_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user projects error:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
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
        proposals: project.proposals.map(proposal => ({
          id: proposal.id,
          status: proposal.status,
          freelancerName: proposal.freelancer.name
        })),
        createdAt: project.created_at
      }))
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;