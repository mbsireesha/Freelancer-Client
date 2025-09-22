const validator = require('validator');

// Validation middleware for user registration
const validateRegistration = (req, res, next) => {
  const { name, email, password, userType } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // User type validation
  if (!userType || !['client', 'freelancer'].includes(userType)) {
    errors.push('User type must be either client or freelancer');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
  const { email, password, userType } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (!userType || !['client', 'freelancer'].includes(userType)) {
    errors.push('User type must be either client or freelancer');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

// Validation middleware for project creation
const validateProject = (req, res, next) => {
  const { title, description, budget, category, skills, deadline } = req.body;
  const errors = [];

  if (!title || title.trim().length < 5) {
    errors.push('Project title must be at least 5 characters long');
  }

  if (!description || description.trim().length < 20) {
    errors.push('Project description must be at least 20 characters long');
  }

  if (!budget || budget <= 0) {
    errors.push('Budget must be greater than 0');
  }

  if (!category || category.trim().length < 2) {
    errors.push('Category is required');
  }

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    errors.push('At least one skill is required');
  }

  if (!deadline || !validator.isDate(deadline)) {
    errors.push('Valid deadline date is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

// Validation middleware for proposal submission
const validateProposal = (req, res, next) => {
  const { projectId, coverLetter, proposedBudget, timeline } = req.body;
  const errors = [];

  if (!projectId || !validator.isUUID(projectId)) {
    errors.push('Valid project ID is required');
  }

  if (!coverLetter || coverLetter.trim().length < 50) {
    errors.push('Cover letter must be at least 50 characters long');
  }

  if (!proposedBudget || proposedBudget <= 0) {
    errors.push('Proposed budget must be greater than 0');
  }

  if (!timeline || timeline.trim().length < 3) {
    errors.push('Timeline is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProject,
  validateProposal
};