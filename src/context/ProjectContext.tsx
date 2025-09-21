import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  deadline: string;
  clientId: string;
  clientName: string;
  status: 'open' | 'in_progress' | 'completed';
  proposals: Proposal[];
  createdAt: string;
}

interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  coverLetter: string;
  proposedBudget: number;
  timeline: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'proposals' | 'createdAt'>) => void;
  submitProposal: (proposal: Omit<Proposal, 'id' | 'createdAt'>) => void;
  updateProjectStatus: (projectId: string, status: Project['status']) => void;
  updateProposalStatus: (proposalId: string, status: Proposal['status']) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects();
      setProjects(response.projects.map(transformProject));
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformProject = (apiProject: any): Project => ({
    id: apiProject.id,
    title: apiProject.title,
    description: apiProject.description,
    budget: apiProject.budget,
    category: apiProject.category,
    skills: apiProject.skills,
    deadline: apiProject.deadline,
    clientId: apiProject.clientId || apiProject.client_id,
    clientName: apiProject.clientName,
    status: apiProject.status,
    proposals: apiProject.proposals || [],
    createdAt: apiProject.createdAt
  });

  const addProject = async (projectData: Omit<Project, 'id' | 'proposals' | 'createdAt'>) => {
    try {
      const response = await apiService.createProject({
        title: projectData.title,
        description: projectData.description,
        budget: projectData.budget,
        category: projectData.category,
        skills: projectData.skills,
        deadline: projectData.deadline
      });
      
      const newProject = transformProject(response.project);
      setProjects(prev => [newProject, ...prev]);
      return true;
    } catch (error) {
      console.error('Failed to create project:', error);
      return false;
    }
  };

  const submitProposal = async (proposalData: Omit<Proposal, 'id' | 'createdAt'>) => {
    try {
      await apiService.submitProposal({
        projectId: proposalData.projectId,
        coverLetter: proposalData.coverLetter,
        proposedBudget: proposalData.proposedBudget,
        timeline: proposalData.timeline
      });
      
      // Reload projects to get updated proposal count
      await loadProjects();
      return true;
    } catch (error) {
      console.error('Failed to submit proposal:', error);
      return false;
    }
  };

  const updateProjectStatus = async (projectId: string, status: Project['status']) => {
    try {
      await apiService.updateProject(projectId, { status });
      setProjects(prev => prev.map(project =>
        project.id === projectId ? { ...project, status } : project
      ));
      return true;
    } catch (error) {
      console.error('Failed to update project status:', error);
      return false;
    }
  };

  const updateProposalStatus = async (proposalId: string, status: Proposal['status']) => {
    try {
      await apiService.updateProposalStatus(proposalId, status);
      // Reload projects to get updated proposals
      await loadProjects();
      return true;
    } catch (error) {
      console.error('Failed to update proposal status:', error);
      return false;
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      loading,
      addProject,
      submitProposal,
      updateProjectStatus,
      updateProposalStatus,
      loadProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};