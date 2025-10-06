const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid access token'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      logger.warn('Invalid token - user not found:', { userId: decoded.userId });
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found or token expired'
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.user_type,
      profile: user.profile || {}
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed or invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please login to access this resource'
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.userType)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires ${userRoles.join(' or ')} role`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};