
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Project, Sprint, Column, Task, BacklogItem, ProjectFormData, SprintFormData, TaskFormData, BacklogItemFormData, Collaborator, CollaboratorFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  collaborators: Collaborator[];
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

  // Set up auth listener and load user data
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        // Clear data when user signs out
        setProjects([]);
        setSprints([]);
        setColumns([]);
        setBacklogItems([]);
        setCollaborators([]);
        setSelectedProject(null);
      }
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  // Load data from localStorage when user is authenticated
  useEffect(() => {
    if (!user) return;
    
    const userIdPrefix = `user_${user.id}_`;
    const storedProjects = localStorage.getItem(`${userIdPrefix}projects`);
    const storedSprints = localStorage.getItem(`${userIdPrefix}sprints`);
    const storedColumns = localStorage.getItem(`${userIdPrefix}columns`);
    const storedBacklogItems = localStorage.getItem(`${userIdPrefix}backlogItems`);
    const storedCollaborators = localStorage.getItem(`${userIdPrefix}collaborators`);

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedSprints) setSprints(JSON.parse(storedSprints));
    if (storedColumns) setColumns(JSON.parse(storedColumns));
    if (storedBacklogItems) setBacklogItems(JSON.parse(storedBacklogItems));
    if (storedCollaborators) setCollaborators(JSON.parse(storedCollaborators));
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!user) return;
    
    const userIdPrefix = `user_${user.id}_`;
    localStorage.setItem(`${userIdPrefix}projects`, JSON.stringify(projects));
  }, [projects, user]);

  useEffect(() => {
    if (!user) return;
    
    const userIdPrefix = `user_${user.id}_`;
    localStorage.setItem(`${userIdPrefix}sprints`, JSON.stringify(sprints));
  }, [sprints, user]);

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

  // Create a new project
  const createProject = (data: ProjectFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to create a project",
        variant: "destructive"
      });
      return;
    }
    
    const newProject: Project = {
      id: uuidv4(),
      ...data,
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
    
    toast({
      title: "Project created",
      description: `${data.title} has been created successfully.`,
    });
  };

  // Update an existing project
  const updateProject = (id: string, data: ProjectFormData) => {
    const updatedProjects = projects.map(project => 
      project.id === id 
        ? { ...project, ...data, updatedAt: new Date() } 
        : project
    );
    
    setProjects(updatedProjects);
    
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject({ ...selectedProject, ...data, updatedAt: new Date() });
    }
    
    toast({
      title: "Project updated",
      description: `${data.title} has been updated successfully.`,
    });
  };

  // Delete a project and all associated data
  const deleteProject = (id: string) => {
    const projectToDelete = projects.find(project => project.id === id);
    if (!projectToDelete) return;
    
    // Remove the project
    setProjects(projects.filter(project => project.id !== id));
    
    // Remove all sprints associated with this project
    const projectSprints = sprints.filter(sprint => sprint.projectId === id);
    const sprintIds = projectSprints.map(sprint => sprint.id);
    
    setSprints(sprints.filter(sprint => sprint.projectId !== id));
    
    // Remove all tasks associated with this project's sprints
    setColumns(
      columns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => !sprintIds.includes(task.sprintId))
      }))
    );
    
    // Remove all backlog items associated with this project
    setBacklogItems(backlogItems.filter(item => item.projectId !== id));
    
    // Remove all collaborators associated with this project
    setCollaborators(collaborators.filter(collab => collab.projectId !== id));
    
    // Update selected project if needed
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject(null);
    }
    
    toast({
      title: "Project deleted",
      description: `${projectToDelete.title} has been deleted successfully.`,
    });
  };

  // Select a project to view
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

  // Create a new sprint for the selected project
  const createSprint = (data: SprintFormData) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    const newSprint: Sprint = {
      id: uuidv4(),
      projectId: selectedProject.id,
      ...data,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if default columns already exist
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
    
    setSprints([...sprints, newSprint]);
    
    if (newColumns.length > 0) {
      setColumns([...columns, ...newColumns]);
    }
    
    toast({
      title: "Sprint created",
      description: `${data.title} has been created successfully.`,
    });
  };

  // Update an existing sprint
  const updateSprint = (id: string, data: SprintFormData) => {
    const updatedSprints = sprints.map(sprint => 
      sprint.id === id 
        ? { ...sprint, ...data, updatedAt: new Date() } 
        : sprint
    );
    
    setSprints(updatedSprints);
    
    toast({
      title: "Sprint updated",
      description: `${data.title} has been updated successfully.`,
    });
  };

  // Mark a sprint as completed
  const completeSprint = (id: string) => {
    const updatedSprints = sprints.map(sprint => 
      sprint.id === id 
        ? { ...sprint, isCompleted: true, updatedAt: new Date() } 
        : sprint
    );
    
    setSprints(updatedSprints);
    
    const sprint = sprints.find(s => s.id === id);
    if (sprint) {
      toast({
        title: "Sprint completed",
        description: `${sprint.title} has been marked as completed.`,
      });
    }
  };

  // Create a new column for a sprint
  const createColumn = (sprintId: string, title: string) => {
    // First check if this column title already exists
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

  // Delete a column
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
    
    // Don't allow deleting default columns
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

  // Create a new task in a column
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

  // Update an existing task
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

  // Delete a task
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

  // Move a task from one column to another
  const moveTask = (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    // Find the source column
    const sourceColumn = columns.find(col => col.id === sourceColumnId);
    if (!sourceColumn) return;
    
    // Find the task
    const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    // Get the task and update its columnId
    const task = { ...sourceColumn.tasks[taskIndex], columnId: destinationColumnId };
    
    // Update columns
    const updatedColumns = columns.map(col => {
      // Remove from source column
      if (col.id === sourceColumnId) {
        return {
          ...col,
          tasks: col.tasks.filter(t => t.id !== taskId)
        };
      }
      
      // Add to destination column
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

  // Create a new backlog item
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

  // Update an existing backlog item
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

  // Delete a backlog item
  const deleteBacklogItem = (id: string) => {
    const itemToDelete = backlogItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    setBacklogItems(backlogItems.filter(item => item.id !== id));
    
    toast({
      title: "Backlog item deleted",
      description: `${itemToDelete.title} has been deleted from the backlog.`,
    });
  };

  // Move a backlog item to a sprint
  const moveBacklogItemToSprint = (backlogItemId: string, sprintId: string) => {
    // Find the backlog item
    const backlogItem = backlogItems.find(item => item.id === backlogItemId);
    if (!backlogItem) return;
    
    // Find the TO DO column
    const todoColumn = columns.find(col => col.title === "TO DO");
    if (!todoColumn) {
      toast({
        title: "Error",
        description: "TO DO column not found. Please create a sprint first.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a task from the backlog item
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
    
    // Add the task to the TO DO column
    const updatedColumns = columns.map(col => 
      col.id === todoColumn.id 
        ? { ...col, tasks: [...col.tasks, newTask] } 
        : col
    );
    
    // Remove the backlog item
    const updatedBacklogItems = backlogItems.filter(item => item.id !== backlogItemId);
    
    setColumns(updatedColumns);
    setBacklogItems(updatedBacklogItems);
    
    toast({
      title: "Item moved to sprint",
      description: `${backlogItem.title} has been moved to the selected sprint.`,
    });
  };

  // Invite a collaborator to a project
  const inviteCollaborator = async (projectId: string, data: CollaboratorFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to invite collaborators",
        variant: "destructive"
      });
      return;
    }
    
    // Check if project exists
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      toast({
        title: "Error",
        description: "Project not found.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user is the project owner
    if (project.ownerId !== user.id) {
      toast({
        title: "Permission denied",
        description: "Only the project owner can invite collaborators.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if the email is already a collaborator for this project
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
    
    // Create a new collaborator
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
    
    // In a real app, here we would:
    // 1. Store the invitation in the database
    // 2. Send an email invitation to the collaborator
    
    toast({
      title: "Invitation sent",
      description: `Invitation has been sent to ${data.email}.`,
    });
  };

  // Remove a collaborator from a project
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
    
    // Find the project
    const project = projects.find(p => p.id === collaboratorToRemove.projectId);
    if (!project) return;
    
    // Check if user is the project owner
    if (project.ownerId !== user.id) {
      toast({
        title: "Permission denied",
        description: "Only the project owner can remove collaborators.",
        variant: "destructive"
      });
      return;
    }
    
    // Remove the collaborator
    setCollaborators(collaborators.filter(collab => collab.id !== id));
    
    toast({
      title: "Collaborator removed",
      description: `${collaboratorToRemove.email} has been removed from the project.`,
    });
  };

  // Get all collaborators for a specific project
  const getProjectCollaborators = (projectId: string) => {
    return collaborators.filter(collab => collab.projectId === projectId);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        sprints,
        columns,
        backlogItems,
        collaborators,
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
