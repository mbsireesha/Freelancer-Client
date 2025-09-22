const { supabase } = require('../config/database');
const logger = require('../utils/logger');

class ProjectController {
  // Get all projects with filters
  async getProjects(req, res) {
    try {
      const { 
        category, 
        minBudget, 
        maxBudget, 
        skills, 
        status = 'open',
        page = 1, 
        limit = 10,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      let query = supabase
        .from('projects')
        .select(`
          *,
          client:users!projects_client_id_fkey(id, name, profile),
          proposals(id, status)
        `)
        .eq('status', status);

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

      // Sorting
      const ascending = sortOrder === 'asc';
      query = query.order(sortBy, { ascending });

      // Pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query = query.range(offset, offset + parseInt(limit) - 1);

      const { data: projects, error, count } = await query;

      if (error) {
        logger.error('Get projects error', { error: error.message });
        return res.status(500).json({ error: 'Failed to fetch projects' });
      }

      logger.info('Projects fetched', { count: projects.length, filters: req.query });

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
          clientName: project.client.name,
          clientProfile: project.client.profile || {},
          proposalCount: project.proposals.length,
          createdAt: project.created_at,
          updatedAt: project.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: projects.length,
          hasMore: projects.length === parseInt(limit)
        }
      });
    } catch (error) {
      logger.error('Get projects error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get single project
  async getProject(req, res) {
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
        logger.warn('Project not found', { projectId: id });
        return res.status(404).json({ error: 'Project not found' });
      }

      logger.info('Project fetched', { projectId: id });

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
          createdAt: project.created_at,
          updatedAt: project.updated_at
        }
      });
    } catch (error) {
      logger.error('Get project error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create project (clients only)
  async createProject(req, res) {
    try {
      const { title, description, budget, category, skills, deadline } = req.body;

      // Validate deadline is in the future
      const deadlineDate = new Date(deadline);
      if (deadlineDate <= new Date()) {
        return res.status(400).json({ error: 'Deadline must be in the future' });
      }

      const { data: project, error } = await supabase
        .from('projects')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            budget: parseInt(budget),
            category: category.trim(),
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
        logger.error('Create project error', { error: error.message, userId: req.user.id });
        return res.status(500).json({ error: 'Failed to create project' });
      }

      // Update user's project count
      await supabase
        .from('users')
        .update({ 
          profile: { 
            ...req.user.profile, 
            projectsPosted: (req.user.profile?.projectsPosted || 0) + 1 
          }
        })
        .eq('id', req.user.id);

      logger.info('Project created', { projectId: project.id, userId: req.user.id });

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
      logger.error('Create project error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update project (project owner only)
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const { title, description, budget, category, skills, deadline, status } = req.body;

      // Check if user owns the project
      const { data: existingProject, error: fetchError } = await supabase
        .from('projects')
        .select('client_id, status')
        .eq('id', id)
        .single();

      if (fetchError || !existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (existingProject.client_id !== req.user.id) {
        logger.warn('Unauthorized project update attempt', { projectId: id, userId: req.user.id });
        return res.status(403).json({ error: 'Not authorized to update this project' });
      }

      // Prepare update data
      const updateData = { updated_at: new Date().toISOString() };
      if (title) updateData.title = title.trim();
      if (description) updateData.description = description.trim();
      if (budget) updateData.budget = parseInt(budget);
      if (category) updateData.category = category.trim();
      if (skills) updateData.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
      if (deadline) updateData.deadline = deadline;
      if (status) updateData.status = status;

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
        logger.error('Update project error', { error: error.message, projectId: id });
        return res.status(500).json({ error: 'Failed to update project' });
      }

      logger.info('Project updated', { projectId: id, userId: req.user.id });

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
          updatedAt: project.updated_at
        }
      });
    } catch (error) {
      logger.error('Update project error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete project (project owner only)
  async deleteProject(req, res) {
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
        logger.warn('Unauthorized project deletion attempt', { projectId: id, userId: req.user.id });
        return res.status(403).json({ error: 'Not authorized to delete this project' });
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Delete project error', { error: error.message, projectId: id });
        return res.status(500).json({ error: 'Failed to delete project' });
      }

      logger.info('Project deleted', { projectId: id, userId: req.user.id });

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      logger.error('Delete project error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's projects
  async getUserProjects(req, res) {
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
        logger.error('Get user projects error', { error: error.message, userId: req.user.id });
        return res.status(500).json({ error: 'Failed to fetch projects' });
      }

      logger.info('User projects fetched', { userId: req.user.id, count: projects.length });

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
          createdAt: project.created_at,
          updatedAt: project.updated_at
        }))
      });
    } catch (error) {
      logger.error('Get user projects error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ProjectController();