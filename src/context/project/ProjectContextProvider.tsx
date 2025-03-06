
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  Project, 
  Sprint, 
  Column, 
  BacklogItem, 
  ProjectFormData, 
  SprintFormData, 
  TaskFormData, 
  BacklogItemFormData, 
  Collaborator, 
  CollaboratorFormData 
} from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase, getSession } from "@/lib/supabase";
import { ProjectContextType, ProjectState } from "./types";
import { 
  fetchProjects, 
  createProject as createProjectUtil, 
  updateProject as updateProjectUtil,
  deleteProject as deleteProjectUtil
} from "./projectUtils";
import {
  fetchSprints,
  createSprint as createSprintUtil,
  updateSprint as updateSprintUtil,
  completeSprint as completeSprintUtil
} from "./sprintUtils";
import {
  createColumn as createColumnUtil,
  deleteColumn as deleteColumnUtil
} from "./columnUtils";
import {
  createTask as createTaskUtil,
  updateTask as updateTaskUtil,
  deleteTask as deleteTaskUtil,
  moveTask as moveTaskUtil
} from "./taskUtils";
import {
  createBacklogItem as createBacklogItemUtil,
  updateBacklogItem as updateBacklogItemUtil,
  deleteBacklogItem as deleteBacklogItemUtil,
  moveBacklogItemToSprint as moveBacklogItemToSprintUtil
} from "./backlogUtils";
import {
  inviteCollaborator as inviteCollaboratorUtil,
  acceptInvitation as acceptInvitationUtil,
  rejectInvitation as rejectInvitationUtil,
  fetchInvitations as fetchInvitationsUtil
} from "./collaboratorUtils";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProjectState>({
    projects: [],
    selectedProject: null,
    sprints: [],
    columns: [],
    backlogItems: [],
    collaborators: [],
    user: null,
    loading: true
  });

  useEffect(() => {
    const getUser = async () => {
      const { session } = await getSession();
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        loading: false
      }));
    };
    
    getUser();

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      setState(prev => ({
        ...prev,
        user: session?.user || null
      }));
      
      if (!session?.user) {
        setState(prev => ({
          ...prev,
          projects: [],
          sprints: [],
          columns: [],
          backlogItems: [],
          collaborators: [],
          selectedProject: null
        }));
      } else {
        fetchProjectsData();
        fetchSprintsData();
      }
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  const fetchProjectsData = async () => {
    if (!state.user) return;
    
    const { data, error } = await fetchProjects(state.user);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    if (data) {
      setState(prev => ({
        ...prev,
        projects: data
      }));
    }
  };

  const fetchSprintsData = async () => {
    if (!state.user) return;
    
    const { data, error } = await fetchSprints(state.user);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load sprints. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    if (data) {
      setState(prev => ({
        ...prev,
        sprints: data
      }));
    }
  };

  useEffect(() => {
    if (state.user) {
      fetchProjectsData();
      fetchSprintsData();
      
      const userIdPrefix = `user_${state.user.id}_`;
      const storedColumns = localStorage.getItem(`${userIdPrefix}columns`);
      const storedBacklogItems = localStorage.getItem(`${userIdPrefix}backlogItems`);
      const storedCollaborators = localStorage.getItem(`${userIdPrefix}collaborators`);

      if (storedColumns) setState(prev => ({ ...prev, columns: JSON.parse(storedColumns) }));
      if (storedBacklogItems) setState(prev => ({ ...prev, backlogItems: JSON.parse(storedBacklogItems) }));
      if (storedCollaborators) setState(prev => ({ ...prev, collaborators: JSON.parse(storedCollaborators) }));
    }
  }, [state.user]);

  useEffect(() => {
    if (!state.user) return;
    
    const userIdPrefix = `user_${state.user.id}_`;
    localStorage.setItem(`${userIdPrefix}columns`, JSON.stringify(state.columns));
  }, [state.columns, state.user]);

  useEffect(() => {
    if (!state.user) return;
    
    const userIdPrefix = `user_${state.user.id}_`;
    localStorage.setItem(`${userIdPrefix}backlogItems`, JSON.stringify(state.backlogItems));
  }, [state.backlogItems, state.user]);

  useEffect(() => {
    if (!state.user) return;
    
    const userIdPrefix = `user_${state.user.id}_`;
    localStorage.setItem(`${userIdPrefix}collaborators`, JSON.stringify(state.collaborators));
  }, [state.collaborators, state.user]);

  // Project functions
  const createProject = async (data: ProjectFormData) => {
    const { data: newProject, error } = await createProjectUtil(data, state.user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (newProject) {
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, newProject],
        selectedProject: newProject
      }));
      
      toast({
        title: "Project created",
        description: `${data.title} has been created successfully.`,
      });
    }
  };

  const updateProject = async (id: string, data: ProjectFormData) => {
    const { data: updatedProject, error } = await updateProjectUtil(id, data, state.user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (updatedProject) {
      setState(prev => {
        const updatedProjects = prev.projects.map(project => 
          project.id === id ? updatedProject : project
        );
        
        return {
          ...prev,
          projects: updatedProjects,
          selectedProject: prev.selectedProject && prev.selectedProject.id === id 
            ? updatedProject 
            : prev.selectedProject
        };
      });
      
      toast({
        title: "Project updated",
        description: `${data.title} has been updated successfully.`,
      });
    }
  };

  const deleteProject = async (id: string) => {
    const projectToDelete = state.projects.find(project => project.id === id);
    if (!projectToDelete) return;
    
    const { success, error } = await deleteProjectUtil(id, state.user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (success) {
      setState(prev => {
        const projectSprints = prev.sprints.filter(sprint => sprint.projectId === id);
        const sprintIds = projectSprints.map(sprint => sprint.id);
        
        return {
          ...prev,
          projects: prev.projects.filter(project => project.id !== id),
          sprints: prev.sprints.filter(sprint => sprint.projectId !== id),
          columns: prev.columns.map(column => ({
            ...column,
            tasks: column.tasks.filter(task => !sprintIds.includes(task.sprintId))
          })),
          backlogItems: prev.backlogItems.filter(item => item.projectId !== id),
          collaborators: prev.collaborators.filter(collab => collab.projectId !== id),
          selectedProject: prev.selectedProject && prev.selectedProject.id === id 
            ? null 
            : prev.selectedProject
        };
      });
      
      toast({
        title: "Project deleted",
        description: `${projectToDelete.title} has been deleted successfully.`,
      });
    }
  };

  const selectProject = (id: string) => {
    if (!id) {
      setState(prev => ({
        ...prev,
        selectedProject: null
      }));
      return;
    }
    
    const project = state.projects.find(p => p.id === id);
    if (project) {
      setState(prev => ({
        ...prev,
        selectedProject: project
      }));
    }
  };

  // Sprint functions
  const createSprint = async (data: SprintFormData) => {
    if (!state.selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    const { data: newSprint, error } = await createSprintUtil(data, state.selectedProject.id, state.user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (newSprint) {
      setState(prev => {
        let todoColumnExists = false;
        let inProgressColumnExists = false;
        let doneColumnExists = false;
        
        prev.columns.forEach(column => {
          if (column.title === "TO DO") todoColumnExists = true;
          if (column.title === "IN PROGRESS") inProgressColumnExists = true;
          if (column.title === "DONE") doneColumnExists = true;
        });
        
        const newColumns: Column[] = [];
        
        if (!todoColumnExists) {
          newColumns.push({
            id: uuidv4(),
            title: "TO DO",
            tasks: []
          });
        }
        
        if (!inProgressColumnExists) {
          newColumns.push({
            id: uuidv4(),
            title: "IN PROGRESS",
            tasks: []
          });
        }
        
        if (!doneColumnExists) {
          newColumns.push({
            id: uuidv4(),
            title: "DONE",
            tasks: []
          });
        }
        
        return {
          ...prev,
          sprints: [...prev.sprints, newSprint],
          columns: [...prev.columns, ...newColumns]
        };
      });
      
      toast({
        title: "Sprint created",
        description: `${data.title} has been created successfully.`,
      });
    }
  };

  const updateSprint = async (id: string, data: SprintFormData) => {
    const { data: updatedSprint, error } = await updateSprintUtil(id, data, state.user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (updatedSprint) {
      setState(prev => ({
        ...prev,
        sprints: prev.sprints.map(sprint => 
          sprint.id === id ? updatedSprint : sprint
        )
      }));
      
      toast({
        title: "Sprint updated",
        description: `${data.title} has been updated successfully.`,
      });
    }
  };

  const completeSprint = async (id: string) => {
    const { data: updatedSprint, error } = await completeSprintUtil(id, state.user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (updatedSprint) {
      setState(prev => ({
        ...prev,
        sprints: prev.sprints.map(sprint => 
          sprint.id === id ? updatedSprint : sprint
        )
      }));
      
      toast({
        title: "Sprint completed",
        description: `${updatedSprint.title} has been marked as completed.`,
      });
    }
  };

  // Column functions
  const createColumn = (sprintId: string, title: string) => {
    const { success, columns } = createColumnUtil(state.columns, sprintId, title);
    if (success) {
      setState(prev => ({
        ...prev,
        columns
      }));
    }
  };

  const deleteColumn = (id: string) => {
    const { success, columns } = deleteColumnUtil(state.columns, id);
    if (success) {
      setState(prev => ({
        ...prev,
        columns
      }));
    }
  };

  // Task functions
  const createTask = (sprintId: string, columnId: string, data: TaskFormData) => {
    const { success, columns } = createTaskUtil(state.columns, sprintId, columnId, data);
    if (success) {
      setState(prev => ({
        ...prev,
        columns
      }));
    }
  };

  const updateTask = (id: string, data: TaskFormData) => {
    const { success, columns } = updateTaskUtil(state.columns, id, data);
    if (success) {
      setState(prev => ({
        ...prev,
        columns
      }));
    }
  };

  const deleteTask = (id: string) => {
    const { success, columns } = deleteTaskUtil(state.columns, id);
    if (success) {
      setState(prev => ({
        ...prev,
        columns
      }));
    }
  };

  const moveTask = (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    const { success, columns } = moveTaskUtil(state.columns, taskId, sourceColumnId, destinationColumnId);
    if (success) {
      setState(prev => ({
        ...prev,
        columns
      }));
    }
  };

  // Backlog functions
  const createBacklogItem = (data: BacklogItemFormData) => {
    if (!state.selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    const { success, backlogItems } = createBacklogItemUtil(
      state.backlogItems, 
      state.selectedProject.id, 
      data
    );
    
    if (success) {
      setState(prev => ({
        ...prev,
        backlogItems
      }));
    }
  };

  const updateBacklogItem = (id: string, data: BacklogItemFormData) => {
    const { success, backlogItems } = updateBacklogItemUtil(state.backlogItems, id, data);
    if (success) {
      setState(prev => ({
        ...prev,
        backlogItems
      }));
    }
  };

  const deleteBacklogItem = (id: string) => {
    const { success, backlogItems } = deleteBacklogItemUtil(state.backlogItems, id);
    if (success) {
      setState(prev => ({
        ...prev,
        backlogItems
      }));
    }
  };

  const moveBacklogItemToSprint = (backlogItemId: string, sprintId: string) => {
    const { success, backlogItems, columns } = moveBacklogItemToSprintUtil(
      state.backlogItems,
      state.columns,
      backlogItemId,
      sprintId
    );
    
    if (success) {
      setState(prev => ({
        ...prev,
        backlogItems,
        columns
      }));
    }
  };

  // Collaborator functions
  const inviteCollaborator = async (projectId: string, projectTitle: string, data: CollaboratorFormData) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) {
      toast({
        title: "Error",
        description: "Project not found.",
        variant: "destructive"
      });
      return { success: false, error: "Project not found" };
    }
    
    const result = await inviteCollaboratorUtil(
      projectId, 
      projectTitle,
      data
    );
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    const existingCollaborator = state.collaborators.find(
      collab => collab.projectId === projectId && collab.email === data.email
    );
    
    if (existingCollaborator) {
      toast({
        title: "Already invited",
        description: `${data.email} has already been invited to this project.`,
        variant: "destructive"
      });
      return { success: false, error: "Collaborator already invited" };
    }
    
    if (result.data) {
      setState(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, result.data]
      }));
    }
    
    return { success: true, error: null };
  };

  const removeCollaborator = (id: string) => {
    if (!state.user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to remove collaborators",
        variant: "destructive"
      });
      return;
    }
    
    const collaboratorToRemove = state.collaborators.find(collab => collab.id === id);
    if (!collaboratorToRemove) return;
    
    const project = state.projects.find(p => p.id === collaboratorToRemove.projectId);
    if (!project) return;
    
    if (project.ownerId !== state.user.id) {
      toast({
        title: "Permission denied",
        description: "Only the project owner can remove collaborators.",
        variant: "destructive"
      });
      return;
    }
    
    setState(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(collab => collab.id !== id)
    }));
    
    toast({
      title: "Collaborator removed",
      description: `${collaboratorToRemove.email} has been removed from the project.`,
    });
  };

  const getProjectCollaborators = (projectId: string) => {
    return state.collaborators.filter(collab => collab.projectId === projectId);
  };

  const acceptInvitation = async (collaboratorId: string) => {
    const result = await acceptInvitationUtil(collaboratorId);
    
    if (result.success) {
      setState(prev => {
        const updatedCollaborators = prev.collaborators.map(collab => 
          collab.id === collaboratorId 
            ? { ...collab, status: "accepted" as "accepted" }
            : collab
        );
        
        return {
          ...prev,
          collaborators: updatedCollaborators,
          projects: result.projectsData || prev.projects
        };
      });
      
      if (!result.projectsData) {
        fetchProjectsData();
      }
    }
    
    return result;
  };

  const rejectInvitation = async (collaboratorId: string) => {
    const result = await rejectInvitationUtil(collaboratorId);
    
    if (result.success) {
      setState(prev => {
        const updatedCollaborators = prev.collaborators.map(collab => 
          collab.id === collaboratorId 
            ? { ...collab, status: "rejected" as "rejected" }
            : collab
        );
        
        return {
          ...prev,
          collaborators: updatedCollaborators
        };
      });
    }
    
    return result;
  };

  const getInvitations = async (email?: string) => {
    if (!state.user?.email && !email) {
      return { success: false, data: null, error: "User not authenticated" };
    }
    const userEmail = email || state.user.email;
    return await fetchInvitationsUtil(userEmail);
  };

  if (state.loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProjectContext.Provider
      value={{
        projects: state.projects,
        selectedProject: state.selectedProject,
        sprints: state.sprints,
        columns: state.columns,
        backlogItems: state.backlogItems,
        collaborators: state.collaborators,
        user: state.user,
        createProject,
        updateProject,
        deleteProject,
        selectProject,
        createSprint,
        updateSprint,
        completeSprint,
        createColumn,
        deleteColumn,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        createBacklogItem,
        updateBacklogItem,
        deleteBacklogItem,
        moveBacklogItemToSprint,
        inviteCollaborator,
        removeCollaborator,
        getProjectCollaborators,
        acceptInvitation,
        rejectInvitation,
        getInvitations
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
