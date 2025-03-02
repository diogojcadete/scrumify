import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  Project, 
  Sprint, 
  Column, 
  Task, 
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
import { ProjectContextType } from "./types";
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
  inviteCollaborator as inviteCollaboratorUtil,
  acceptInvitation as acceptInvitationUtil,
  rejectInvitation as rejectInvitationUtil,
  fetchInvitations as fetchInvitationsUtil
} from "./collaboratorUtils";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { session } = await getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    
    getUser();

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      
      if (!session?.user) {
        setProjects([]);
        setSprints([]);
        setColumns([]);
        setBacklogItems([]);
        setCollaborators([]);
        setSelectedProject(null);
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
    if (!user) return;
    
    const { data, error } = await fetchProjects(user);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    if (data) {
      setProjects(data);
    }
  };

  const fetchSprintsData = async () => {
    if (!user) return;
    
    const { data, error } = await fetchSprints(user);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load sprints. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    if (data) {
      setSprints(data);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjectsData();
      fetchSprintsData();
      
      const userIdPrefix = `user_${user.id}_`;
      const storedColumns = localStorage.getItem(`${userIdPrefix}columns`);
      const storedBacklogItems = localStorage.getItem(`${userIdPrefix}backlogItems`);
      const storedCollaborators = localStorage.getItem(`${userIdPrefix}collaborators`);

      if (storedColumns) setColumns(JSON.parse(storedColumns));
      if (storedBacklogItems) setBacklogItems(JSON.parse(storedBacklogItems));
      if (storedCollaborators) setCollaborators(JSON.parse(storedCollaborators));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const userIdPrefix = `user_${user.id}_`;
    localStorage.setItem(`${userIdPrefix}columns`, JSON.stringify(columns));
  }, [columns, user]);

  useEffect(() => {
    if (!user) return;
    
    const userIdPrefix = `user_${user.id}_`;
    localStorage.setItem(`${userIdPrefix}backlogItems`, JSON.stringify(backlogItems));
  }, [backlogItems, user]);

  useEffect(() => {
    if (!user) return;
    
    const userIdPrefix = `user_${user.id}_`;
    localStorage.setItem(`${userIdPrefix}collaborators`, JSON.stringify(collaborators));
  }, [collaborators, user]);

  const createProject = async (data: ProjectFormData) => {
    const { data: newProject, error } = await createProjectUtil(data, user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (newProject) {
      setProjects([...projects, newProject]);
      setSelectedProject(newProject);
      
      toast({
        title: "Project created",
        description: `${data.title} has been created successfully.`,
      });
    }
  };

  const updateProject = async (id: string, data: ProjectFormData) => {
    const { data: updatedProject, error } = await updateProjectUtil(id, data, user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (updatedProject) {
      const updatedProjects = projects.map(project => 
        project.id === id ? updatedProject : project
      );
      
      setProjects(updatedProjects);
      
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject(updatedProject);
      }
      
      toast({
        title: "Project updated",
        description: `${data.title} has been updated successfully.`,
      });
    }
  };

  const deleteProject = async (id: string) => {
    const projectToDelete = projects.find(project => project.id === id);
    if (!projectToDelete) return;
    
    const { success, error } = await deleteProjectUtil(id, user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (success) {
      setProjects(projects.filter(project => project.id !== id));
      
      const projectSprints = sprints.filter(sprint => sprint.projectId === id);
      const sprintIds = projectSprints.map(sprint => sprint.id);
      
      setSprints(sprints.filter(sprint => sprint.projectId !== id));
      
      setColumns(
        columns.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => !sprintIds.includes(task.sprintId))
        }))
      );
      
      setBacklogItems(backlogItems.filter(item => item.projectId !== id));
      
      setCollaborators(collaborators.filter(collab => collab.projectId !== id));
      
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject(null);
      }
      
      toast({
        title: "Project deleted",
        description: `${projectToDelete.title} has been deleted successfully.`,
      });
    }
  };

  const selectProject = (id: string) => {
    if (!id) {
      setSelectedProject(null);
      return;
    }
    
    const project = projects.find(p => p.id === id);
    if (project) {
      setSelectedProject(project);
    }
  };

  const createSprint = async (data: SprintFormData) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    const { data: newSprint, error } = await createSprintUtil(data, selectedProject.id, user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (newSprint) {
      setSprints([...sprints, newSprint]);
      
      let todoColumnExists = false;
      let inProgressColumnExists = false;
      let doneColumnExists = false;
      
      columns.forEach(column => {
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
      
      if (newColumns.length > 0) {
        setColumns([...columns, ...newColumns]);
      }
      
      toast({
        title: "Sprint created",
        description: `${data.title} has been created successfully.`,
      });
    }
  };

  const updateSprint = async (id: string, data: SprintFormData) => {
    const { data: updatedSprint, error } = await updateSprintUtil(id, data, user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (updatedSprint) {
      const updatedSprints = sprints.map(sprint => 
        sprint.id === id ? updatedSprint : sprint
      );
      
      setSprints(updatedSprints);
      
      toast({
        title: "Sprint updated",
        description: `${data.title} has been updated successfully.`,
      });
    }
  };

  const completeSprint = async (id: string) => {
    const { data: updatedSprint, error } = await completeSprintUtil(id, user);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    if (updatedSprint) {
      const updatedSprints = sprints.map(sprint => 
        sprint.id === id ? updatedSprint : sprint
      );
      
      setSprints(updatedSprints);
      
      toast({
        title: "Sprint completed",
        description: `${updatedSprint.title} has been marked as completed.`,
      });
    }
  };

  const createColumn = (sprintId: string, title: string) => {
    const columnExists = columns.some(col => col.title === title);
    
    if (columnExists) {
      toast({
        title: "Column already exists",
        description: `A column named "${title}" already exists.`,
        variant: "destructive"
      });
      return;
    }
    
    const newColumn: Column = {
      id: uuidv4(),
      title,
      tasks: []
    };
    
    setColumns([...columns, newColumn]);
    
    toast({
      title: "Column created",
      description: `${title} column has been created successfully.`,
    });
  };

  const deleteColumn = (id: string) => {
    const columnToDelete = columns.find(column => column.id === id);
    if (!columnToDelete) return;
    
    if (columnToDelete.tasks.length > 0) {
      toast({
        title: "Cannot delete column",
        description: "This column still has tasks. Move or delete them first.",
        variant: "destructive"
      });
      return;
    }
    
    if (["TO DO", "IN PROGRESS", "DONE"].includes(columnToDelete.title)) {
      toast({
        title: "Cannot delete default column",
        description: "The default columns (TO DO, IN PROGRESS, DONE) cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    setColumns(columns.filter(column => column.id !== id));
    
    toast({
      title: "Column deleted",
      description: `${columnToDelete.title} column has been deleted successfully.`,
    });
  };

  const createTask = (sprintId: string, columnId: string, data: TaskFormData) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) {
      toast({
        title: "Error",
        description: "Column not found.",
        variant: "destructive"
      });
      return;
    }
    
    const newTask: Task = {
      id: uuidv4(),
      ...data,
      columnId,
      sprintId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedColumns = columns.map(col => 
      col.id === columnId 
        ? { ...col, tasks: [...col.tasks, newTask] } 
        : col
    );
    
    setColumns(updatedColumns);
    
    toast({
      title: "Task created",
      description: `${data.title} has been created successfully.`,
    });
  };

  const updateTask = (id: string, data: TaskFormData) => {
    const updatedColumns = columns.map(column => {
      const taskIndex = column.tasks.findIndex(task => task.id === id);
      
      if (taskIndex !== -1) {
        const updatedTasks = [...column.tasks];
        updatedTasks[taskIndex] = { 
          ...updatedTasks[taskIndex], 
          ...data, 
          updatedAt: new Date() 
        };
        
        return { ...column, tasks: updatedTasks };
      }
      
      return column;
    });
    
    setColumns(updatedColumns);
    
    toast({
      title: "Task updated",
      description: `${data.title} has been updated successfully.`,
    });
  };

  const deleteTask = (id: string) => {
    let taskTitle = "";
    
    const updatedColumns = columns.map(column => {
      const taskToDelete = column.tasks.find(task => task.id === id);
      if (taskToDelete) taskTitle = taskToDelete.title;
      
      return {
        ...column,
        tasks: column.tasks.filter(task => task.id !== id)
      };
    });
    
    setColumns(updatedColumns);
    
    if (taskTitle) {
      toast({
        title: "Task deleted",
        description: `${taskTitle} has been deleted successfully.`,
      });
    }
  };

  const moveTask = (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    const sourceColumn = columns.find(col => col.id === sourceColumnId);
    if (!sourceColumn) return;
    
    const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    const task = { ...sourceColumn.tasks[taskIndex], columnId: destinationColumnId };
    
    const updatedColumns = columns.map(col => {
      if (col.id === sourceColumnId) {
        return {
          ...col,
          tasks: col.tasks.filter(t => t.id !== taskId)
        };
      }
      
      if (col.id === destinationColumnId) {
        return {
          ...col,
          tasks: [...col.tasks, task]
        };
      }
      
      return col;
    });
    
    setColumns(updatedColumns);
  };

  const createBacklogItem = (data: BacklogItemFormData) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    const newBacklogItem: BacklogItem = {
      id: uuidv4(),
      projectId: selectedProject.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setBacklogItems([...backlogItems, newBacklogItem]);
    
    toast({
      title: "Backlog item created",
      description: `${data.title} has been added to the backlog.`,
    });
  };

  const updateBacklogItem = (id: string, data: BacklogItemFormData) => {
    const updatedBacklogItems = backlogItems.map(item => 
      item.id === id 
        ? { ...item, ...data, updatedAt: new Date() } 
        : item
    );
    
    setBacklogItems(updatedBacklogItems);
    
    toast({
      title: "Backlog item updated",
      description: `${data.title} has been updated successfully.`,
    });
  };

  const deleteBacklogItem = (id: string) => {
    const itemToDelete = backlogItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    setBacklogItems(backlogItems.filter(item => item.id !== id));
    
    toast({
      title: "Backlog item deleted",
      description: `${itemToDelete.title} has been deleted from the backlog.`,
    });
  };

  const moveBacklogItemToSprint = (backlogItemId: string, sprintId: string) => {
    const backlogItem = backlogItems.find(item => item.id === backlogItemId);
    if (!backlogItem) return;
    
    const todoColumn = columns.find(col => col.title === "TO DO");
    if (!todoColumn) {
      toast({
        title: "Error",
        description: "TO DO column not found. Please create a sprint first.",
        variant: "destructive"
      });
      return;
    }
    
    const newTask: Task = {
      id: uuidv4(),
      title: backlogItem.title,
      description: backlogItem.description,
      priority: backlogItem.priority,
      assignee: "",
      storyPoints: backlogItem.storyPoints,
      columnId: todoColumn.id,
      sprintId: sprintId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedColumns = columns.map(col => 
      col.id === todoColumn.id 
        ? { ...col, tasks: [...col.tasks, newTask] } 
        : col
    );
    
    const updatedBacklogItems = backlogItems.filter(item => item.id !== backlogItemId);
    
    setColumns(updatedColumns);
    setBacklogItems(updatedBacklogItems);
    
    toast({
      title: "Item moved to sprint",
      description: `${backlogItem.title} has been moved to the selected sprint.`,
    });
  };

  const inviteCollaborator = async (projectId: string, projectTitle: string, data: CollaboratorFormData) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      toast({
        title: "Error",
        description: "Project not found.",
        variant: "destructive"
      });
      return { success: false, error: "Project not found" };
    }
    
    if (project.ownerId !== user.id) {
      toast({
        title: "Permission denied",
        description: "Only the project owner can invite collaborators.",
        variant: "destructive"
      });
      return { success: false, error: "Permission denied" };
    }
    
    const result = await inviteCollaboratorUtil(
      projectId, 
      data,
      projects
    );
    
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
      return { success: false, error: result.error };
    }
    
    const existingCollaborator = collaborators.find(
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
    
    const newCollaborator: Collaborator = {
      id: uuidv4(),
      projectId,
      email: data.email,
      role: data.role,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setCollaborators([...collaborators, newCollaborator]);
    
    toast({
      title: "Invitation sent",
      description: `Invitation has been sent to ${data.email}.`,
    });
    
    return { success: true, error: null };
  };

  const removeCollaborator = (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to remove collaborators",
        variant: "destructive"
      });
      return;
    }
    
    const collaboratorToRemove = collaborators.find(collab => collab.id === id);
    if (!collaboratorToRemove) return;
    
    const project = projects.find(p => p.id === collaboratorToRemove.projectId);
    if (!project) return;
    
    if (project.ownerId !== user.id) {
      toast({
        title: "Permission denied",
        description: "Only the project owner can remove collaborators.",
        variant: "destructive"
      });
      return;
    }
    
    setCollaborators(collaborators.filter(collab => collab.id !== id));
    
    toast({
      title: "Collaborator removed",
      description: `${collaboratorToRemove.email} has been removed from the project.`,
    });
  };

  const getProjectCollaborators = (projectId: string) => {
    return collaborators.filter(collab => collab.projectId === projectId);
  };

  const acceptInvitation = async (collaboratorId: string) => {
    const result = await acceptInvitationUtil(collaboratorId);
    
    if (result.success) {
      const updatedCollaborators = collaborators.map(collab => 
        collab.id === collaboratorId 
          ? { ...collab, status: "accepted" as "accepted" }
          : collab
      );
      
      setCollaborators(updatedCollaborators);
    }
    
    return result;
  };

  const rejectInvitation = async (collaboratorId: string) => {
    const result = await rejectInvitationUtil(collaboratorId);
    
    if (result.success) {
      const updatedCollaborators = collaborators.map(collab => 
        collab.id === collaboratorId 
          ? { ...collab, status: "rejected" as "rejected" }
          : collab
      );
      
      setCollaborators(updatedCollaborators);
    }
    
    return result;
  };

  const getInvitations = async (email?: string) => {
    if (!user?.email && !email) {
      return { success: false, data: null, error: "User not authenticated" };
    }
    const userEmail = email || user.email;
    return await fetchInvitationsUtil(userEmail);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        sprints,
        columns,
        backlogItems,
        collaborators,
        user,
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
