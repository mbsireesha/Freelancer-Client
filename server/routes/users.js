const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { bio, skills, hourlyRate, company, location } = req.body;
    
    const profileData = {
      bio: bio || '',
      location: location || ''
    };

    // Add role-specific fields
    if (req.user.user_type === 'freelancer') {
      profileData.skills = skills || [];
      profileData.hourlyRate = hourlyRate || 0;
    } else if (req.user.user_type === 'client') {
      profileData.company = company || '';
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
      console.error('Profile update error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

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
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID (public profile)
router.get('/:id', async (req, res) => {
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

    res.json({
      user: {
        id: user.id,
        name: user.name,
        userType: user.user_type,
        profile: user.profile || {},
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search freelancers
router.get('/search/freelancers', async (req, res) => {
  try {
    const { skills, location, minRate, maxRate, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('users')
      .select('id, name, user_type, profile, created_at')
      .eq('user_type', 'freelancer');

    // Apply filters
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
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

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: freelancers, error } = await query;

    if (error) {
      console.error('Search freelancers error:', error);
      return res.status(500).json({ error: 'Failed to search freelancers' });
    }

    res.json({
      freelancers: freelancers.map(user => ({
        id: user.id,
        name: user.name,
        profile: user.profile || {},
        createdAt: user.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: freelancers.length
      }
    });
  } catch (error) {
    console.error('Search freelancers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;