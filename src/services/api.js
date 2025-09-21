const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('skillbridge_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('skillbridge_token', token);
    } else {
      localStorage.removeItem('skillbridge_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // User endpoints
  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async searchFreelancers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/users/search/freelancers?${params}`);
  }

  // Project endpoints
  async getProjects(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/projects?${params}`);
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: projectData,
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: projectData,
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyProjects() {
    return this.request('/projects/user/my-projects');
  }

  // Proposal endpoints
  async submitProposal(proposalData) {
    return this.request('/proposals', {
      method: 'POST',
      body: proposalData,
    });
  }

  async getProjectProposals(projectId) {
    return this.request(`/proposals/project/${projectId}`);
  }

  async getMyProposals() {
    return this.request('/proposals/my-proposals');
  }

  async updateProposalStatus(proposalId, status) {
    return this.request(`/proposals/${proposalId}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  async deleteProposal(id) {
    return this.request(`/proposals/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();