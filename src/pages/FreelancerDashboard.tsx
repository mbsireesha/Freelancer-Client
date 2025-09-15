import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Search, Filter, Clock, DollarSign, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const FreelancerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, submitProposal } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    proposedBudget: 0,
    timeline: ''
  });

  // Filter available projects (excluding client's own projects and completed ones)
  const availableProjects = projects.filter(project => 
    project.clientId !== user?.id && 
    project.status === 'open' &&
    (searchTerm === '' || project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     project.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === '' || project.category === selectedCategory)
  );

  // Get user's proposals
  const userProposals = projects.flatMap(project => 
    project.proposals.filter(proposal => proposal.freelancerId === user?.id)
  );

  const categories = [...new Set(projects.map(p => p.category))];

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProject) return;

    submitProposal({
      projectId: selectedProject.id,
      freelancerId: user.id,
      freelancerName: user.name,
      ...proposalData,
      status: 'pending'
    });

    // Reset form
    setProposalData({
      coverLetter: '',
      proposedBudget: 0,
      timeline: ''
    });
    setShowProposalModal(false);
    setSelectedProject(null);
  };

  const openProposalModal = (project: any) => {
    setSelectedProject(project);
    setProposalData(prev => ({ ...prev, proposedBudget: project.budget }));
    setShowProposalModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Find your next opportunity and grow your freelance career</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <div className="card p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Available Projects */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Projects ({availableProjects.length})</h2>
              {availableProjects.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-gray-500">No projects match your search criteria.</p>
                </div>
              ) : (
                availableProjects.map((project) => (
                  <div key={project.id} className="card p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.skills.map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {project.category}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Deadline: {project.deadline}
                          </div>
                          <span>By {project.clientName}</span>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          ${project.budget}
                        </div>
                        <button
                          onClick={() => openProposalModal(project)}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          Submit Proposal
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 border-t pt-3">
                      Posted {project.createdAt} • {project.proposals.length} proposal(s)
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Complete</span>
                  <span className="text-sm font-medium text-blue-600">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <Link to="/profile" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  Complete your profile <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>

            {/* Recent Proposals */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Your Proposals ({userProposals.length})</h3>
              {userProposals.length === 0 ? (
                <p className="text-gray-500 text-sm">No proposals submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {userProposals.slice(0, 5).map((proposal) => {
                    const project = projects.find(p => p.id === proposal.projectId);
                    return (
                      <div key={proposal.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{project?.title}</p>
                            <p className="text-xs text-gray-500">${proposal.proposedBudget}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {proposal.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Proposals Sent</span>
                  <span className="font-medium">{userProposals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Accepted</span>
                  <span className="font-medium text-green-600">
                    {userProposals.filter(p => p.status === 'accepted').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium">
                    {userProposals.length > 0 
                      ? Math.round((userProposals.filter(p => p.status === 'accepted').length / userProposals.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proposal Modal */}
        {showProposalModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Submit Proposal</h2>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedProject.title}</h3>
                <p className="text-gray-600 mt-2">{selectedProject.description}</p>
                <p className="text-green-600 font-semibold mt-2">Budget: ${selectedProject.budget}</p>
              </div>

              <form onSubmit={handleSubmitProposal} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    rows={6}
                    value={proposalData.coverLetter}
                    onChange={(e) => setProposalData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    className="input-field"
                    placeholder="Explain why you're the perfect fit for this project..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Proposed Budget ($)
                    </label>
                    <input
                      type="number"
                      value={proposalData.proposedBudget}
                      onChange={(e) => setProposalData(prev => ({ ...prev, proposedBudget: parseInt(e.target.value) }))}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeline
                    </label>
                    <input
                      type="text"
                      value={proposalData.timeline}
                      onChange={(e) => setProposalData(prev => ({ ...prev, timeline: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., 2 weeks"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button type="submit" className="btn-primary">
                    Submit Proposal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProposalModal(false);
                      setSelectedProject(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboard;