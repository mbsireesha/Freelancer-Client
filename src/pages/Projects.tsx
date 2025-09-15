import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Search, Filter, Clock, DollarSign, MapPin, Users } from 'lucide-react';

const Projects: React.FC = () => {
  const { projects } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetRange, setBudgetRange] = useState('');

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || project.category === selectedCategory;

    const matchesBudget = budgetRange === '' || (() => {
      switch (budgetRange) {
        case 'under-500': return project.budget < 500;
        case '500-1500': return project.budget >= 500 && project.budget <= 1500;
        case '1500-3000': return project.budget >= 1500 && project.budget <= 3000;
        case 'over-3000': return project.budget > 3000;
        default: return true;
      }
    })();

    return matchesSearch && matchesCategory && matchesBudget && project.status === 'open';
  });

  const categories = [...new Set(projects.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Projects</h1>
          <p className="text-xl text-gray-600">
            Discover exciting opportunities across technical and non-technical fields
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
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

            <div>
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="input-field"
              >
                <option value="">Any Budget</option>
                <option value="under-500">Under $500</option>
                <option value="500-1500">$500 - $1,500</option>
                <option value="1500-3000">$1,500 - $3,000</option>
                <option value="over-3000">Over $3,000</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>{filteredProjects.length} projects found</span>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProjects.map((project) => (
              <div key={project.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-3">{project.description}</p>
                    
                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.skills.slice(0, 4).map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 4 && (
                        <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded">
                          +{project.skills.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.category}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Due: {new Date(project.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {project.proposals.length} proposal(s)
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ${project.budget.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Fixed Price
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Posted by <span className="font-medium text-gray-700">{project.clientName}</span>
                    <span className="mx-1">•</span>
                    {project.createdAt}
                  </div>
                  
                  <button className="btn-primary text-sm px-4 py-2">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {filteredProjects.length > 0 && (
          <div className="text-center mt-12">
            <button className="btn-secondary">
              Load More Projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;