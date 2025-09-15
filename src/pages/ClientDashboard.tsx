import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Plus, Clock, CheckCircle, Users, DollarSign } from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, addProject, updateProposalStatus } = useProjects();
  const [showPostProject, setShowPostProject] = useState(false);

  // Filter projects for current client
  const userProjects = projects.filter(project => project.clientId === user?.id);

  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    budget: 0,
    category: '',
    skills: '',
    deadline: '',
    status: 'open' as const
  });

  const handlePostProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    addProject({
      ...projectData,
      skills: projectData.skills.split(',').map(s => s.trim()),
      clientId: user.id,
      clientName: user.name,
      status: 'open'
    });

    // Reset form
    setProjectData({
      title: '',
      description: '',
      budget: 0,
      category: '',
      skills: '',
      deadline: '',
      status: 'open'
    });
    setShowPostProject(false);
  };

  const handleProposalAction = (proposalId: string, action: 'accepted' | 'rejected') => {
    updateProposalStatus(proposalId, action);
  };

  const totalProposals = userProjects.reduce((sum, project) => sum + project.proposals.length, 0);
  const activeProjects = userProjects.filter(p => p.status === 'in_progress').length;
  const completedProjects = userProjects.filter(p => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Manage your projects and find the perfect freelancers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Proposals</p>
                <p className="text-2xl font-bold text-gray-900">{totalProposals}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${userProjects.reduce((sum, p) => sum + p.budget, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Post Project Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowPostProject(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Post New Project</span>
          </button>
        </div>

        {/* Post Project Form */}
        {showPostProject && (
          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Post a New Project</h2>
            <form onSubmit={handlePostProject} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projectData.title}
                    onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={projectData.category}
                    onChange={(e) => setProjectData(prev => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Web Development, Design, Event Planning"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={projectData.budget}
                    onChange={(e) => setProjectData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={projectData.deadline}
                    onChange={(e) => setProjectData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={projectData.skills}
                    onChange={(e) => setProjectData(prev => ({ ...prev, skills: e.target.value }))}
                    className="input-field"
                    placeholder="React, JavaScript, UI/UX"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  Post Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowPostProject(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6">Your Projects</h2>
          {userProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No projects posted yet. Create your first project to get started!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {project.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">${project.budget}</p>
                      <p className="text-sm text-gray-500">Budget</p>
                    </div>
                  </div>

                  {project.proposals.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-4">Proposals ({project.proposals.length})</h4>
                      <div className="space-y-4">
                        {project.proposals.map((proposal) => (
                          <div key={proposal.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold">{proposal.freelancerName}</h5>
                                <p className="text-sm text-gray-600">Proposed: ${proposal.proposedBudget}</p>
                                <p className="text-sm text-gray-600">Timeline: {proposal.timeline}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{proposal.coverLetter}</p>
                            {proposal.status === 'pending' && (
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleProposalAction(proposal.id, 'accepted')}
                                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleProposalAction(proposal.id, 'rejected')}
                                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;