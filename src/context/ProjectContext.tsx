import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Project, Sprint, Column, Task, BacklogItem, ProjectFormData, SprintFormData, TaskFormData, BacklogItemFormData, Collaborator, CollaboratorFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { 
  supabase, 
  getSession, 
  createProjectInDB, 
  getProjectsFromDB, 
  updateProjectInDB, 
  deleteProjectFromDB,
  createSprintInDB,
  getSprintsFromDB,
  updateSprintInDB,
  completeSprintInDB,
  deleteSprintFromDB,
  sendCollaboratorInvitation
} from "@/lib/supabase";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  collaborators: Collaborator[];
  user: any | null;
  createProject: (data: ProjectFormData) => void;
  updateProject: (id: string, data: ProjectFormData) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string) => void;
  createSprint: (data: SprintFormData) => void;
  updateSprint: (id: string, data: SprintFormData) => void;
  completeSprint: (id: string) => void;
  createColumn: (sprintId: string, title: string) => void;
  deleteColumn: (id: string) => void;
  createTask: (sprintId: string, columnId: string, data: TaskFormData) => void;
  updateTask: (id: string, data: TaskFormData) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string) => void;
  createBacklogItem: (data: BacklogItemFormData) => void;
  updateBacklogItem: (id: string, data: BacklogItemFormData) => void;
  deleteBacklogItem: (id: string) => void;
  moveBacklogItemToSprint: (backlogItemId: string, sprintId: string) => void;
  inviteCollaborator: (projectId: string, data: CollaboratorFormData) => void;
  removeCollaborator: (id: string) => void;
  getProjectCollaborators: (projectId: string) => Collaborator[];
}

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

  // Auth state management
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
        // Clear state when logged out
        setProjects([]);
        setSprints([]);
        setColumns([]);
        setBacklogItems([]);
        setCollaborators([]);
        setSelectedProject(null);
      } else {
        // Fetch data when logged in
        fetchProjects();
        fetchSprints();
      }
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  // Fetch projects from the database
  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await getProjectsFromDB();
      
      if (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        // Convert database date strings to Date objects
        const formattedProjects = data.map(project => ({
          ...project,
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
          ownerId: project.owner_id
        }));
        
        setProjects(formattedProjects);
      }
    } catch (error) {
      console.error("Error in fetchProjects:", error);
    }
  };

  // Fetch sprints from the database
  const fetchSprints = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await getSprintsFromDB();
      
      if (error) {
        console.error("Error fetching sprints:", error);
        toast({
          title: "Error",
          description: "Failed to load sprints. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        // Convert database fields to match our Sprint type
        const formattedSprints = data.map(sprint => ({
          id: sprint.id,
          projectId: sprint.project_id,
          title: sprint.title,
          description: sprint.description,
          startDate: new Date(sprint.start_date),
          endDate: new Date(sprint.end_date),
          isCompleted: sprint.is_completed,
          createdAt: new Date(sprint.created_at),
          updatedAt: new Date(sprint.updated_at)
        }));
        
        setSprints(formattedSprints);
      }
    } catch (error) {
      console.error("Error in fetchSprints:", error);
    }
  };

  // Load user data based on auth state
  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchSprints();
      
      // For columns, backlog items, and collaborators, we'll still use localStorage for now
      const userIdPrefix = `user_${user.id}_`;
      const storedColumns = localStorage.getItem(`${userIdPrefix}columns`);
      const storedBacklogItems = localStorage.getItem(`${userIdPrefix}backlogItems`);
      const storedCollaborators = localStorage.getItem(`${userIdPrefix}collaborators`);

      if (storedColumns) setColumns(JSON.parse(storedColumns));
      if (storedBacklogItems) setBacklogItems(JSON.parse(storedBacklogItems));
      if (storedCollaborators) setCollaborators(JSON.parse(storedCollaborators));
    }
  }, [user]);

  // Save columns to localStorage (still not in DB)
  useEffect(() => {
    if (!user) return;
    
    const userIdPrefix = `user_${user.id}_`;
    localStorage.setItem(`${userIdPrefix}columns`, JSON.stringify(columns));
  }, [columns, user]);

  // Save backlog items to localStorage (still not in DB)
  useEffect(() => {
    if (!user) return;
    
    const userIdPrefix = `user_${user.id}_`;
    localStorage.setItem(`${userIdPrefix}backlogItems`, JSON.stringify(backlogItems));
  }, [backlogItems, user]);

  // Save collaborators to localStorage (still not in DB)
  useEffect(() => {
    if (!user) return;
    
    const userIdPrefix = `user_${user.id}_`;
    localStorage.setItem(`${userIdPrefix}collaborators`, JSON.stringify(collaborators));
  }, [collaborators, user]);

  const createProject = async (data: ProjectFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to create a project",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: newProject, error } = await createProjectInDB(data, user.id);
      
      if (error) {
        console.error("Error creating project:", error);
        toast({
          title: "Error",
          description: "Failed to create project. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (newProject) {
        // Convert database fields to match our Project type
        const formattedProject = {
          id: newProject.id,
          title: newProject.title,
          description: newProject.description,
          endGoal: newProject.end_goal,
          ownerId: newProject.owner_id,
          createdAt: new Date(newProject.created_at),
          updatedAt: new Date(newProject.updated_at)
        };
        
        setProjects([...projects, formattedProject]);
        setSelectedProject(formattedProject);
        
        toast({
          title: "Project created",
          description: `${data.title} has been created successfully.`,
        });
      }
    } catch (error) {
      console.error("Error in createProject:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateProject = async (id: string, data: ProjectFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to update a project",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: updatedProject, error } = await updateProjectInDB(id, data);
      
      if (error) {
        console.error("Error updating project:", error);
        toast({
          title: "Error",
          description: "Failed to update project. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (updatedProject) {
        // Convert database fields to match our Project type
        const formattedProject = {
          id: updatedProject.id,
          title: updatedProject.title,
          description: updatedProject.description,
          endGoal: updatedProject.end_goal,
          ownerId: updatedProject.owner_id,
          createdAt: new Date(updatedProject.created_at),
          updatedAt: new Date(updatedProject.updated_at)
        };
        
        const updatedProjects = projects.map(project => 
          project.id === id ? formattedProject : project
        );
        
        setProjects(updatedProjects);
        
        if (selectedProject && selectedProject.id === id) {
          setSelectedProject(formattedProject);
        }
        
        toast({
          title: "Project updated",
          description: `${data.title} has been updated successfully.`,
        });
      }
    } catch (error) {
      console.error("Error in updateProject:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to delete a project",
        variant: "destructive"
      });
      return;
    }
    
    const projectToDelete = projects.find(project => project.id === id);
    if (!projectToDelete) return;
    
    try {
      const { error } = await deleteProjectFromDB(id);
      
      if (error) {
        console.error("Error deleting project:", error);
        toast({
          title: "Error",
          description: "Failed to delete project. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
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
    } catch (error) {
      console.error("Error in deleteProject:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to create a sprint",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: newSprint, error } = await createSprintInDB(data, selectedProject.id);
      
      if (error) {
        console.error("Error creating sprint:", error);
        toast({
          title: "Error",
          description: "Failed to create sprint. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (newSprint) {
        // Convert database fields to match our Sprint type
        const formattedSprint = {
          id: newSprint.id,
          projectId: newSprint.project_id,
          title: newSprint.title,
          description: newSprint.description,
          startDate: new Date(newSprint.start_date),
          endDate: new Date(newSprint.end_date),
          isCompleted: newSprint.is_completed,
          createdAt: new Date(newSprint.created_at),
          updatedAt: new Date(newSprint.updated_at)
        };
        
        setSprints([...sprints, formattedSprint]);
        
        // Create default columns if they don't exist
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
    } catch (error) {
      console.error("Error in createSprint:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateSprint = async (id: string, data: SprintFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to update a sprint",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: updatedSprint, error } = await updateSprintInDB(id, data);
      
      if (error) {
        console.error("Error updating sprint:", error);
        toast({
          title: "Error",
          description: "Failed to update sprint. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (updatedSprint) {
        // Convert database fields to match our Sprint type
        const formattedSprint = {
          id: updatedSprint.id,
          projectId: updatedSprint.project_id,
          title: updatedSprint.title,
          description: updatedSprint.description,
          startDate: new Date(updatedSprint.start_date),
          endDate: new Date(updatedSprint.end_date),
          isCompleted: updatedSprint.is_completed,
          createdAt: new Date(updatedSprint.created_at),
          updatedAt: new Date(updatedSprint.updated_at)
        };
        
        const updatedSprints = sprints.map(sprint => 
          sprint.id === id ? formattedSprint : sprint
        );
        
        setSprints(updatedSprints);
        
        toast({
          title: "Sprint updated",
          description: `${data.title} has been updated successfully.`,
        });
      }
    } catch (error) {
      console.error("Error in updateSprint:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const completeSprint = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to complete a sprint",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: updatedSprint, error } = await completeSprintInDB(id);
      
      if (error) {
        console.error("Error completing sprint:", error);
        toast({
          title: "Error",
          description: "Failed to complete sprint. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (updatedSprint) {
        // Convert database fields to match our Sprint type
        const formattedSprint = {
          id: updatedSprint.id,
          projectId: updatedSprint.project_id,
          title: updatedSprint.title,
          description: updatedSprint.description,
          startDate: new Date(updatedSprint.start_date),
          endDate: new Date(updatedSprint.end_date),
          isCompleted: updatedSprint.is_completed,
          createdAt: new Date(updatedSprint.created_at),
          updatedAt: new Date(updatedSprint.updated_at)
        };
        
        const updatedSprints = sprints.map(sprint => 
          sprint.id === id ? formattedSprint : sprint
        );
        
        setSprints(updatedSprints);
        
        toast({
          title: "Sprint completed",
          description: `${formattedSprint.title} has been marked as completed.`,
        });
      }
    } catch (error) {
      console.error("Error in completeSprint:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  // These functions still use local state only - we'll keep them as is for now
  // In a future update, we would implement these with Supabase as well
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

  const inviteCollaborator = async (projectId: string, data: CollaboratorFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to invite collaborators",
        variant: "destructive"
      });
      return;
    }
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      toast({
        title: "Error",
        description: "Project not found.",
        variant: "destructive"
      });
      return;
    }
    
    if (project.ownerId !== user.id) {
      toast({
        title: "Permission denied",
        description: "Only the project owner can invite collaborators.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await sendCollaboratorInvitation(projectId, project.title, data);
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to send invitation.",
          variant: "destructive"
        });
        return;
      }
      
      // We'll still use local state for collaborators for now
      const existingCollaborator = collaborators.find(
        collab => collab.projectId === projectId && collab.email === data.email
      );
      
      if (existingCollaborator) {
        toast({
          title: "Already invited",
          description: `${data.email} has already been invited to this project.`,
          variant: "destructive"
        });
        return;
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
    } catch (error) {
      console.error("Error in inviteCollaborator:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
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
        getProjectCollaborators
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
