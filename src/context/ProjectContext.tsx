import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    const savedProjects = localStorage.getItem('skillbridge_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Initialize with sample projects
      const sampleProjects: Project[] = [
        {
          id: '1',
          title: 'E-commerce Website Development',
          description: 'Looking for a skilled developer to build a modern e-commerce website with payment integration.',
          budget: 2500,
          category: 'Web Development',
          skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          deadline: '2024-03-15',
          clientId: 'client1',
          clientName: 'TechCorp Ltd',
          status: 'open',
          proposals: [],
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Wedding Event Planning',
          description: 'Need an experienced event planner for a 150-guest wedding ceremony and reception.',
          budget: 3000,
          category: 'Event Planning',
          skills: ['Event Planning', 'Vendor Management', 'Budget Management'],
          deadline: '2024-06-20',
          clientId: 'client2',
          clientName: 'Sarah Johnson',
          status: 'open',
          proposals: [],
          createdAt: '2024-01-10'
        },
        {
          id: '3',
          title: 'Mobile App UI/UX Design',
          description: 'Looking for a creative designer to create a modern and user-friendly mobile app interface.',
          budget: 1800,
          category: 'Design',
          skills: ['UI/UX Design', 'Figma', 'Mobile Design'],
          deadline: '2024-02-28',
          clientId: 'client3',
          clientName: 'StartupXYZ',
          status: 'open',
          proposals: [],
          createdAt: '2024-01-08'
        }
      ];
      setProjects(sampleProjects);
      localStorage.setItem('skillbridge_projects', JSON.stringify(sampleProjects));
    }
  }, []);

  const addProject = (projectData: Omit<Project, 'id' | 'proposals' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      proposals: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('skillbridge_projects', JSON.stringify(updatedProjects));
  };

  const submitProposal = (proposalData: Omit<Proposal, 'id' | 'createdAt'>) => {
    const newProposal: Proposal = {
      ...proposalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedProjects = projects.map(project =>
      project.id === proposalData.projectId
        ? { ...project, proposals: [...project.proposals, newProposal] }
        : project
    );

    setProjects(updatedProjects);
    localStorage.setItem('skillbridge_projects', JSON.stringify(updatedProjects));
  };

  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    const updatedProjects = projects.map(project =>
      project.id === projectId ? { ...project, status } : project
    );

    setProjects(updatedProjects);
    localStorage.setItem('skillbridge_projects', JSON.stringify(updatedProjects));
  };

  const updateProposalStatus = (proposalId: string, status: Proposal['status']) => {
    const updatedProjects = projects.map(project => ({
      ...project,
      proposals: project.proposals.map(proposal =>
        proposal.id === proposalId ? { ...proposal, status } : proposal
      )
    }));

    setProjects(updatedProjects);
    localStorage.setItem('skillbridge_projects', JSON.stringify(updatedProjects));
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      addProject,
      submitProposal,
      updateProjectStatus,
      updateProposalStatus
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