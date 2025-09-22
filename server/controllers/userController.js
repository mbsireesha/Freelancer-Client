const { supabase } = require('../config/database');
const logger = require('../utils/logger');

class UserController {
  // Update user profile
  async updateProfile(req, res) {
    try {
      const { bio, skills, hourlyRate, company, location, portfolio } = req.body;
      
      const currentProfile = req.user.profile || {};
      const profileData = {
        ...currentProfile,
        bio: bio || currentProfile.bio || '',
        location: location || currentProfile.location || ''
      };

      // Add role-specific fields
      if (req.user.user_type === 'freelancer') {
        profileData.skills = skills || currentProfile.skills || [];
        profileData.hourlyRate = hourlyRate || currentProfile.hourlyRate || 0;
        profileData.portfolio = portfolio || currentProfile.portfolio || [];
        
        // Validate hourly rate
        if (profileData.hourlyRate < 0) {
          return res.status(400).json({ error: 'Hourly rate cannot be negative' });
        }
      } else if (req.user.user_type === 'client') {
        profileData.company = company || currentProfile.company || '';
        profileData.projectsPosted = currentProfile.projectsPosted || 0;
      }

      const { data: user, error } = await supabase
        .from('users')
        .update({ 
          profile: profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.user.id)
        .select('id, name, email, user_type, profile')
        .single();

      if (error) {
        logger.error('Profile update error', { 
          error: error.message, 
          userId: req.user.id 
        });
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      logger.info('Profile updated', { userId: req.user.id });

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.user_type,
          profile: user.profile || {}
        }
      });
    } catch (error) {
      logger.error('Profile update error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user by ID (public profile)
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, user_type, profile, created_at')
        .eq('id', id)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Filter sensitive information for public profile
      const publicProfile = {
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        skills: user.profile?.skills || [],
        portfolio: user.profile?.portfolio || []
      };

      // Add role-specific public info
      if (user.user_type === 'freelancer') {
        publicProfile.hourlyRate = user.profile?.hourlyRate || 0;
        publicProfile.availability = user.profile?.availability || 'available';
      } else {
        publicProfile.company = user.profile?.company || '';
        publicProfile.projectsPosted = user.profile?.projectsPosted || 0;
      }

      logger.info('Public profile fetched', { userId: id });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          userType: user.user_type,
          profile: publicProfile,
          memberSince: user.created_at
        }
      });
    } catch (error) {
      logger.error('Get user error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Search freelancers
  async searchFreelancers(req, res) {
    try {
      const { 
        skills, 
        location, 
        minRate, 
        maxRate, 
        availability = 'available',
        page = 1, 
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;
      
      let query = supabase
        .from('users')
        .select('id, name, user_type, profile, created_at')
        .eq('user_type', 'freelancer');

      // Apply filters
      if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
        // Note: This is a simplified search. In production, you might want to use full-text search
        query = query.contains('profile->skills', skillsArray);
      }

      if (location) {
        query = query.ilike('profile->location', `%${location}%`);
      }

      if (minRate) {
        query = query.gte('profile->hourlyRate', parseInt(minRate));
      }

      if (maxRate) {
        query = query.lte('profile->hourlyRate', parseInt(maxRate));
      }

      if (availability) {
        query = query.eq('profile->availability', availability);
      }

      // Sorting
      const ascending = sortOrder === 'asc';
      if (sortBy === 'hourlyRate') {
        query = query.order('profile->hourlyRate', { ascending });
      } else {
        query = query.order(sortBy, { ascending });
      }

      // Pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query = query.range(offset, offset + parseInt(limit) - 1);

      const { data: freelancers, error } = await query;

      if (error) {
        logger.error('Search freelancers error', { error: error.message });
        return res.status(500).json({ error: 'Failed to search freelancers' });
      }

      logger.info('Freelancers search completed', { 
        count: freelancers.length, 
        filters: req.query 
      });

      res.json({
        freelancers: freelancers.map(user => ({
          id: user.id,
          name: user.name,
          profile: {
            bio: user.profile?.bio || '',
            skills: user.profile?.skills || [],
            hourlyRate: user.profile?.hourlyRate || 0,
            location: user.profile?.location || '',
            availability: user.profile?.availability || 'available',
            portfolio: user.profile?.portfolio || []
          },
          memberSince: user.created_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: freelancers.length,
          hasMore: freelancers.length === parseInt(limit)
        }
      });
    } catch (error) {
      logger.error('Search freelancers error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.user_type;

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
          activeProjects: projects?.filter(p => p.status === 'in_progress').length || 0,
          completedProjects: projects?.filter(p => p.status === 'completed').length || 0,
          totalProposals: proposals?.length || 0,
          pendingProposals: proposals?.filter(p => p.status === 'pending').length || 0
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
          pendingProposals: proposals?.filter(p => p.status === 'pending').length || 0,
          rejectedProposals: proposals?.filter(p => p.status === 'rejected').length || 0,
          successRate: proposals?.length > 0 ? 
            Math.round((acceptedProposals.length / proposals.length) * 100) : 0,
          totalEarnings
        };
      }

      logger.info('User stats fetched', { userId, userType });

      res.json({ stats });
    } catch (error) {
      logger.error('Get user stats error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();