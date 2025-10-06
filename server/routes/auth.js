const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Register new user
router.post('/register', validateUserRegistration, asyncHandler(async (req, res) => {
  const { name, email, password, userType } = req.body;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    return res.status(409).json({
      error: 'User already exists',
      message: 'An account with this email already exists'
    });
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert([{
      name,
      email,
      password_hash: passwordHash,
      user_type: userType,
      profile: {}
    }])
    .select()
    .single();

  if (error) {
    logger.error('User registration failed:', error);
    throw error;
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      userType: user.user_type 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  logger.info('User registered successfully:', { userId: user.id, email: user.email });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.user_type,
      profile: user.profile
    }
  });
}));

// Login user
router.post('/login', validateUserLogin, asyncHandler(async (req, res) => {
  const { email, password, userType } = req.body;

  // Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('user_type', userType)
    .single();

  if (error || !user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email, password, or user type is incorrect'
    });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email, password, or user type is incorrect'
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      userType: user.user_type 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  logger.info('User logged in successfully:', { userId: user.id, email: user.email });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.user_type,
      profile: user.profile
    }
  });
}));

// Get current user
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, user_type, profile, created_at')
    .eq('id', req.user.id)
    .single();

  if (error || !user) {
    return res.status(404).json({
      error: 'User not found',
      message: 'User account no longer exists'
    });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.user_type,
      profile: user.profile,
      createdAt: user.created_at
    }
  });
}));

// Logout user (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  logger.info('User logged out:', { userId: req.user.id });
  res.json({
    message: 'Logout successful'
  });
});

// Refresh token
router.post('/refresh', authenticateToken, asyncHandler(async (req, res) => {
  // Generate new token
  const token = jwt.sign(
    { 
      userId: req.user.id, 
      email: req.user.email, 
      userType: req.user.userType 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Token refreshed successfully',
    token
  });
}));

module.exports = router;