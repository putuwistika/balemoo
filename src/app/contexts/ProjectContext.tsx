import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/app/lib/supabase';
import { projectId as supabaseProjectId, publicAnonKey } from '/utils/supabase/info';

interface Agenda {
  id: string;
  name: string;
  date: string;
  time: string;
  isActive?: boolean; // Agenda active/inactive toggle
}

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  agendas: Agenda[];
  assignedUsers: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean; // Project active/inactive toggle
  isDeleted?: boolean; // Soft delete flag
  deletedAt?: string;
  deletedBy?: string;
  features?: {
    qr_scan?: boolean;
    analytics?: boolean;
  };
  team?: {
    manager?: string; // Admin user ID
    staff?: string[]; // Staff user IDs
    client?: string; // User ID
  };
}

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  selectedAgenda: Agenda | null;
  setSelectedAgenda: (agenda: Agenda | null) => void;
  isProjectAccessible: (project: Project) => boolean;
  loading: boolean;
  error: string | null;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  updateAgenda: (projectId: string, agendaId: string, updates: Partial<Agenda>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(null);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrapper for setSelectedProject to auto-select first agenda
  const setSelectedProject = (project: Project | null) => {
    setSelectedProjectState(project);
    if (project && project.agendas && project.agendas.length > 0) {
      setSelectedAgenda(project.agendas[0]);
    } else {
      setSelectedAgenda(null);
    }
  };

  // Fetch projects from backend
  const fetchProjects = async () => {
    if (!user || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-deeab278/projects`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`, // Use anon key for Kong verification
            'X-User-Token': accessToken, // Send user token in custom header
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects');
      }

      const data = await response.json();
      const fetchedProjects = data.projects || [];
      setProjects(fetchedProjects);
      
      // Update selectedProject if it exists in the fetched projects
      if (selectedProject) {
        const updatedSelectedProject = fetchedProjects.find((p: Project) => p.id === selectedProject.id);
        if (updatedSelectedProject) {
          setSelectedProject(updatedSelectedProject);
        }
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects when user logs in
  useEffect(() => {
    if (user && accessToken) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user, accessToken]);

  // Create new project
  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(
        `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-deeab278/projects`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const data = await response.json();
      
      // Refresh projects list
      await fetchProjects();
      
      return data.project;
    } catch (err: any) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  // Update existing project
  const updateProject = async (projectIdParam: string, updates: Partial<Project>) => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('=== UPDATE PROJECT REQUEST (Frontend) ===');
      console.log('Project ID:', projectIdParam);
      console.log('Updates:', JSON.stringify(updates, null, 2));
      
      const response = await fetch(
        `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-deeab278/projects/${projectIdParam}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to update project');
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      // Refresh projects list
      await fetchProjects();
    } catch (err: any) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  // Delete project (soft delete)
  const deleteProject = async (projectIdParam: string) => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(
        `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-deeab278/projects/${projectIdParam}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      // Refresh projects list
      await fetchProjects();
    } catch (err: any) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  // Refresh projects manually
  const refreshProjects = async () => {
    await fetchProjects();
  };

  // Update agenda (local only for now - can be moved to backend later)
  const updateAgenda = (projectId: string, agendaId: string, updates: Partial<Agenda>) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedAgendas = project.agendas.map(agenda => {
          if (agenda.id === agendaId) {
            return { ...agenda, ...updates };
          }
          return agenda;
        });
        return { ...project, agendas: updatedAgendas };
      }
      return project;
    });
    setProjects(updatedProjects);
  };

  const isProjectAccessible = (project: Project) => {
    if (!user) return false;
    
    // Admin can access all projects
    if (user.role === 'admin') {
      return true;
    }
    
    // Check if project is active (inactive projects not accessible to non-admins)
    if (project.isActive === false) {
      return false;
    }
    
    // Check new team structure first
    if (project.team) {
      if (user.role === 'staff') {
        return project.team.staff?.includes(user.id) || false;
      } else if (user.role === 'user') {
        return project.team.client === user.id;
      }
    }
    
    // Fallback to old assignedUsers field for backwards compatibility
    return project.assignedUsers?.includes(user.id) || false;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        setSelectedProject,
        selectedAgenda,
        setSelectedAgenda,
        isProjectAccessible,
        loading,
        error,
        createProject,
        updateProject,
        deleteProject,
        refreshProjects,
        updateAgenda,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

// Export types for external use
export type { Project, Agenda, ProjectContextType };