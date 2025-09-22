const { supabase } = require('../config/database');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');

class ProposalController {
  // Submit proposal (freelancers only)
  async submitProposal(req, res) {
    try {
      const { projectId, coverLetter, proposedBudget, timeline } = req.body;

      // Check if project exists and is open
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          id, status, client_id, title,
          client:users!projects_client_id_fkey(id, name, email)
        `)
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (project.status !== 'open') {
        return res.status(400).json({ error: 'Project is not accepting proposals' });
      }

      if (project.client_id === req.user.id) {
        return res.status(400).json({ error: 'Cannot submit proposal to your own project' });
      }

      // Check if user already submitted a proposal
      const { data: existingProposal } = await supabase
        .from('proposals')
        .select('id')
        .eq('project_id', projectId)
        .eq('freelancer_id', req.user.id)
        .single();

      if (existingProposal) {
        return res.status(400).json({ 
          error: 'You have already submitted a proposal for this project' 
        });
      }

      // Create proposal
      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert([
          {
            project_id: projectId,
            freelancer_id: req.user.id,
            cover_letter: coverLetter.trim(),
            proposed_budget: parseInt(proposedBudget),
            timeline: timeline.trim(),
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ])
        .select(`
          *,
          project:projects!proposals_project_id_fkey(id, title),
          freelancer:users!proposals_freelancer_id_fkey(id, name)
        `)
        .single();

      if (error) {
        logger.error('Create proposal error', { error: error.message, userId: req.user.id });
        return res.status(500).json({ error: 'Failed to submit proposal' });
      }

      // Send notification email to client (async)
      emailService.sendProposalNotification(
        project.client,
        project,
        proposal
      ).catch(err => 
        logger.error('Failed to send proposal notification', { 
          error: err.message, 
          proposalId: proposal.id 
        })
      );

      logger.info('Proposal submitted', { 
        proposalId: proposal.id, 
        projectId, 
        freelancerId: req.user.id 
      });

      res.status(201).json({
        message: 'Proposal submitted successfully',
        proposal: {
          id: proposal.id,
          projectId: proposal.project_id,
          projectTitle: proposal.project.title,
          freelancerName: proposal.freelancer.name,
          coverLetter: proposal.cover_letter,
          proposedBudget: proposal.proposed_budget,
          timeline: proposal.timeline,
          status: proposal.status,
          createdAt: proposal.created_at
        }
      });
    } catch (error) {
      logger.error('Submit proposal error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get proposals for a project (project owner only)
  async getProjectProposals(req, res) {
    try {
      const { projectId } = req.params;

      // Check if user owns the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('client_id')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (project.client_id !== req.user.id) {
        logger.warn('Unauthorized proposal access attempt', { 
          projectId, 
          userId: req.user.id 
        });
        return res.status(403).json({ 
          error: 'Not authorized to view proposals for this project' 
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
        logger.error('Get proposals error', { error: error.message, projectId });
        return res.status(500).json({ error: 'Failed to fetch proposals' });
      }

      logger.info('Project proposals fetched', { 
        projectId, 
        count: proposals.length 
      });

      res.json({
        proposals: proposals.map(proposal => ({
          id: proposal.id,
          freelancerId: proposal.freelancer_id,
          freelancerName: proposal.freelancer.name,
          freelancerProfile: proposal.freelancer.profile || {},
          coverLetter: proposal.cover_letter,
          proposedBudget: proposal.proposed_budget,
          timeline: proposal.timeline,
          status: proposal.status,
          createdAt: proposal.created_at
        }))
      });
    } catch (error) {
      logger.error('Get proposals error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get freelancer's proposals
  async getFreelancerProposals(req, res) {
    try {
      const { data: proposals, error } = await supabase
        .from('proposals')
        .select(`
          *,
          project:projects!proposals_project_id_fkey(
            id, title, budget, status, 
            client:users!projects_client_id_fkey(id, name)
          )
        `)
        .eq('freelancer_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Get freelancer proposals error', { 
          error: error.message, 
          userId: req.user.id 
        });
        return res.status(500).json({ error: 'Failed to fetch proposals' });
      }

      logger.info('Freelancer proposals fetched', { 
        userId: req.user.id, 
        count: proposals.length 
      });

      res.json({
        proposals: proposals.map(proposal => ({
          id: proposal.id,
          projectId: proposal.project_id,
          projectTitle: proposal.project.title,
          projectBudget: proposal.project.budget,
          projectStatus: proposal.project.status,
          clientName: proposal.project.client.name,
          coverLetter: proposal.cover_letter,
          proposedBudget: proposal.proposed_budget,
          timeline: proposal.timeline,
          status: proposal.status,
          createdAt: proposal.created_at
        }))
      });
    } catch (error) {
      logger.error('Get freelancer proposals error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update proposal status (project owner only)
  async updateProposalStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Get proposal with project and freelancer info
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select(`
          *,
          project:projects!proposals_project_id_fkey(id, client_id, status, title),
          freelancer:users!proposals_freelancer_id_fkey(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (proposalError || !proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      // Check if user owns the project
      if (proposal.project.client_id !== req.user.id) {
        logger.warn('Unauthorized proposal status update attempt', { 
          proposalId: id, 
          userId: req.user.id 
        });
        return res.status(403).json({ 
          error: 'Not authorized to update this proposal' 
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
          freelancer:users!proposals_freelancer_id_fkey(id, name),
          project:projects!proposals_project_id_fkey(id, title)
        `)
        .single();

      if (error) {
        logger.error('Update proposal status error', { 
          error: error.message, 
          proposalId: id 
        });
        return res.status(500).json({ error: 'Failed to update proposal status' });
      }

      // If proposal is accepted, update project status and reject other proposals
      if (status === 'accepted') {
        // Update project status
        await supabase
          .from('projects')
          .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', proposal.project_id);

        // Reject other pending proposals for this project
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

      // Send status update email to freelancer (async)
      emailService.sendProposalStatusUpdate(
        proposal.freelancer,
        proposal.project,
        { ...proposal, status }
      ).catch(err => 
        logger.error('Failed to send proposal status update', { 
          error: err.message, 
          proposalId: id 
        })
      );

      logger.info('Proposal status updated', { 
        proposalId: id, 
        status, 
        userId: req.user.id 
      });

      res.json({
        message: 'Proposal status updated successfully',
        proposal: {
          id: updatedProposal.id,
          projectTitle: updatedProposal.project.title,
          freelancerName: updatedProposal.freelancer.name,
          status: updatedProposal.status,
          updatedAt: updatedProposal.updated_at
        }
      });
    } catch (error) {
      logger.error('Update proposal status error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete proposal (proposal owner only)
  async deleteProposal(req, res) {
    try {
      const { id } = req.params;

      // Check if user owns the proposal
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('freelancer_id, status')
        .eq('id', id)
        .single();

      if (proposalError || !proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      if (proposal.freelancer_id !== req.user.id) {
        logger.warn('Unauthorized proposal deletion attempt', { 
          proposalId: id, 
          userId: req.user.id 
        });
        return res.status(403).json({ 
          error: 'Not authorized to delete this proposal' 
        });
      }

      if (proposal.status === 'accepted') {
        return res.status(400).json({ 
          error: 'Cannot delete accepted proposal' 
        });
      }

      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Delete proposal error', { 
          error: error.message, 
          proposalId: id 
        });
        return res.status(500).json({ error: 'Failed to delete proposal' });
      }

      logger.info('Proposal deleted', { proposalId: id, userId: req.user.id });

      res.json({ message: 'Proposal deleted successfully' });
    } catch (error) {
      logger.error('Delete proposal error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ProposalController();