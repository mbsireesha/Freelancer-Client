const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Submit proposal (freelancers only)
router.post('/', authenticateToken, requireRole('freelancer'), async (req, res) => {
  try {
    const { projectId, coverLetter, proposedBudget, timeline } = req.body;

    // Validate input
    if (!projectId || !coverLetter || !proposedBudget || !timeline) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (proposedBudget <= 0) {
      return res.status(400).json({ error: 'Proposed budget must be greater than 0' });
    }

    // Check if project exists and is open
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, status, client_id')
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
      return res.status(400).json({ error: 'You have already submitted a proposal for this project' });
    }

    // Create proposal
    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert([
        {
          project_id: projectId,
          freelancer_id: req.user.id,
          cover_letter: coverLetter,
          proposed_budget: parseInt(proposedBudget),
          timeline,
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
      console.error('Create proposal error:', error);
      return res.status(500).json({ error: 'Failed to submit proposal' });
    }

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
    console.error('Submit proposal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get proposals for a project (project owner only)
router.get('/project/:projectId', authenticateToken, requireRole('client'), async (req, res) => {
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
      return res.status(403).json({ error: 'Not authorized to view proposals for this project' });
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
      console.error('Get proposals error:', error);
      return res.status(500).json({ error: 'Failed to fetch proposals' });
    }

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
    console.error('Get proposals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get freelancer's proposals
router.get('/my-proposals', authenticateToken, requireRole('freelancer'), async (req, res) => {
  try {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select(`
        *,
        project:projects!proposals_project_id_fkey(id, title, budget, status, client:users!projects_client_id_fkey(id, name))
      `)
      .eq('freelancer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get freelancer proposals error:', error);
      return res.status(500).json({ error: 'Failed to fetch proposals' });
    }

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
    console.error('Get freelancer proposals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update proposal status (project owner only)
router.put('/:id/status', authenticateToken, requireRole('client'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

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
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Check if user owns the project
    if (proposal.project.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this proposal' });
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
      console.error('Update proposal status error:', error);
      return res.status(500).json({ error: 'Failed to update proposal status' });
    }

    // If proposal is accepted, update project status to in_progress
    if (status === 'accepted') {
      await supabase
        .from('projects')
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposal.project_id);
    }

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
    console.error('Update proposal status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete proposal (proposal owner only)
router.delete('/:id', authenticateToken, requireRole('freelancer'), async (req, res) => {
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
      return res.status(403).json({ error: 'Not authorized to delete this proposal' });
    }

    if (proposal.status === 'accepted') {
      return res.status(400).json({ error: 'Cannot delete accepted proposal' });
    }

    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete proposal error:', error);
      return res.status(500).json({ error: 'Failed to delete proposal' });
    }

    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Delete proposal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;