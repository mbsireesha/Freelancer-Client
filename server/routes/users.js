const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validateProfileUpdate, validateUUID, validatePagination } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Update user profile
router.put('/profile', authenticateToken, validateProfileUpdate, asyncHandler(async (req, res) => {
  const { bio, skills, hourlyRate, company, location, portfolio } = req.body;
  
  const profileData = {
    ...req.user.profile,
    ...(bio !== undefined && { bio }),
    ...(skills !== undefined && { skills }),
    ...(hourlyRate !== undefined && { hourlyRate }),
    ...(company !== undefined && { company }),
    ...(location !== undefined && { location }),
    ...(portfolio !== undefined && { portfolio })
  };

  const { data: user, error } = await supabase
    .from('users')
    .update({ 
      profile: profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    logger.error('Profile update failed:', error);
    throw error;
  }

  logger.info('Profile updated successfully:', { userId: req.user.id });

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.user_type,
      profile: user.profile
    }
  });
}));

// Get user by ID (public profile)
router.get('/:id', validateUUID('id'), asyncHandler(async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, user_type, profile, created_at')
    .eq('id', req.params.id)
    .single();

  if (error || !user) {
    return res.status(404).json({
      error: 'User not found',
      message: 'The requested user does not exist'
    });
  }

  // Return public profile information only
  res.json({
    user: {
      id: user.id,
      name: user.name,
      userType: user.user_type,
      profile: {
        bio: user.profile?.bio,
        skills: user.profile?.skills,
        hourlyRate: user.user_type === 'freelancer' ? user.profile?.hourlyRate : undefined,
        company: user.user_type === 'client' ? user.profile?.company : undefined,
        location: user.profile?.location,
        portfolio: user.profile?.portfolio
      },
      createdAt: user.created_at
    }
  });
}));

// Search freelancers
router.get('/search/freelancers', validatePagination, asyncHandler(async (req, res) => {
  const { 
    skills, 
    location, 
    minRate, 
    maxRate, 
    page = 1, 
    limit = 20 
  } = req.query;

  let query = supabase
    .from('users')
    .select('id, name, user_type, profile, created_at')
    .eq('user_type', 'freelancer');

  // Apply filters
  if (location) {
    query = query.ilike('profile->location', `%${location}%`);
  }

  if (minRate) {
    query = query.gte('profile->hourlyRate', parseFloat(minRate));
  }

  if (maxRate) {
    query = query.lte('profile->hourlyRate', parseFloat(maxRate));
  }

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: freelancers, error, count } = await query;

  if (error) {
    logger.error('Freelancer search failed:', error);
    throw error;
  }

  // Filter by skills if provided (client-side filtering for JSON array)
  let filteredFreelancers = freelancers;
  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : [skills];
    filteredFreelancers = freelancers.filter(freelancer => {
      const userSkills = freelancer.profile?.skills || [];
      return skillsArray.some(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
    });
  }

  res.json({
    freelancers: filteredFreelancers.map(freelancer => ({
      id: freelancer.id,
      name: freelancer.name,
      profile: {
        bio: freelancer.profile?.bio,
        skills: freelancer.profile?.skills,
        hourlyRate: freelancer.profile?.hourlyRate,
        location: freelancer.profile?.location,
        portfolio: freelancer.profile?.portfolio
      },
      createdAt: freelancer.created_at
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredFreelancers.length,
      totalPages: Math.ceil(filteredFreelancers.length / limit)
    }
  });
}));

// Get user statistics
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.userType;

  let stats = {};

  if (userType === 'client') {
    // Get client statistics
    const { data: projects } = await supabase
      .from('projects')
      .select('id, status')
      .eq('client_id', userId);

    const { data: proposals } = await supabase
      .from('proposals')
      .select('id, status')
      .in('project_id', projects?.map(p => p.id) || []);

    stats = {
      totalProjects: projects?.length || 0,
      activeProjects: projects?.filter(p => p.status === 'open').length || 0,
      completedProjects: projects?.filter(p => p.status === 'completed').length || 0,
      totalProposals: proposals?.length || 0,
      acceptedProposals: proposals?.filter(p => p.status === 'accepted').length || 0
    };
  } else {
    // Get freelancer statistics
    const { data: proposals } = await supabase
      .from('proposals')
      .select('id, status, proposed_budget')
      .eq('freelancer_id', userId);

    const acceptedProposals = proposals?.filter(p => p.status === 'accepted') || [];
    const totalEarnings = acceptedProposals.reduce((sum, p) => sum + (p.proposed_budget || 0), 0);

    stats = {
      totalProposals: proposals?.length || 0,
      acceptedProposals: acceptedProposals.length,
      rejectedProposals: proposals?.filter(p => p.status === 'rejected').length || 0,
      pendingProposals: proposals?.filter(p => p.status === 'pending').length || 0,
      totalEarnings,
      successRate: proposals?.length > 0 ? Math.round((acceptedProposals.length / proposals.length) * 100) : 0
    };
  }

  res.json({ stats });
}));

module.exports = router;