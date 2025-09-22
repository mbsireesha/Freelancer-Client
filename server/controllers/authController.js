const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password, userType } = req.body;

      logger.info('Registration attempt', { email, userType });

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        logger.warn('Registration failed - user exists', { email });
        return res.status(400).json({ 
          error: 'User already exists with this email address' 
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert([
          {
            name: name.trim(),
            email: email.toLowerCase(),
            password_hash: hashedPassword,
            user_type: userType,
            profile: this.getDefaultProfile(userType),
            created_at: new Date().toISOString()
          }
        ])
        .select('id, name, email, user_type, profile, created_at')
        .single();

      if (error) {
        logger.error('Database error during registration', { error: error.message, email });
        return res.status(500).json({ error: 'Failed to create user account' });
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Send welcome email (async, don't wait)
      emailService.sendWelcomeEmail(user).catch(err => 
        logger.error('Failed to send welcome email', { error: err.message, userId: user.id })
      );

      logger.info('User registered successfully', { userId: user.id, userType });

      res.status(201).json({
        message: 'Account created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.user_type,
          profile: user.profile || {}
        },
        token
      });
    } catch (error) {
      logger.error('Registration error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password, userType } = req.body;

      logger.info('Login attempt', { email, userType });

      // Find user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('user_type', userType)
        .single();

      if (error || !user) {
        logger.warn('Login failed - invalid credentials', { email, userType });
        return res.status(401).json({ error: 'Invalid email, password, or user type' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        logger.warn('Login failed - wrong password', { email, userType });
        return res.status(401).json({ error: 'Invalid email, password, or user type' });
      }

      // Update last login
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id);

      // Generate JWT token
      const token = this.generateToken(user);

      logger.info('User logged in successfully', { userId: user.id, userType });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.user_type,
          profile: user.profile || {}
        },
        token
      });
    } catch (error) {
      logger.error('Login error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, user_type, profile, created_at')
        .eq('id', req.user.id)
        .single();

      if (error || !user) {
        logger.warn('Get current user failed', { userId: req.user.id });
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.user_type,
          profile: user.profile || {},
          createdAt: user.created_at
        }
      });
    } catch (error) {
      logger.error('Get current user error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      logger.info('User logged out', { userId: req.user.id });
      res.json({ message: 'Logout successful' });
    } catch (error) {
      logger.error('Logout error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.user_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Get default profile based on user type
  getDefaultProfile(userType) {
    if (userType === 'freelancer') {
      return {
        bio: '',
        skills: [],
        hourlyRate: 0,
        portfolio: [],
        location: '',
        availability: 'available'
      };
    } else {
      return {
        bio: '',
        company: '',
        location: '',
        projectsPosted: 0
      };
    }
  }
}

module.exports = new AuthController();