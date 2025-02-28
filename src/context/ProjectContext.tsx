import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Project, Sprint, Column, Task, BacklogItem, Collaborator, ProjectFormData, SprintFormData, TaskFormData, BacklogItemFormData, CollaboratorFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/clerk-react";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
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
  addCollaborator: (projectId: string, data: CollaboratorFormData) => void;
  updateCollaboratorRole: (projectId: string, userId: string, newRole: "viewer" | "editor" | "admin") => void;
  removeCollaborator: (projectId: string, userId: string) => void;
  userCanEditProject: (projectId: string) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) return;
    
    const storedProjects = localStorage.getItem(`projects_${user.id}`);
    const storedSprints = localStorage.getItem(`sprints_${user.id}`);
    const storedColumns = localStorage.getItem(`columns_${user.id}`);
    const storedBacklogItems = localStorage.getItem(`backlog_${user.id}`);

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedSprints) setSprints(JSON.parse(storedSprints));
    if (storedColumns) setColumns(JSON.parse(storedColumns));
    if (storedBacklogItems) setBacklogItems(JSON.parse(storedBacklogItems));
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    localStorage.setItem(`projects_${user.id}`, JSON.stringify(projects));
  }, [projects, isSignedIn, user]);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    localStorage.setItem(`sprints_${user.id}`, JSON.stringify(sprints));
  }, [sprints, isSignedIn, user]);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    localStorage.setItem(`columns_${user.id}`, JSON.stringify(columns));
  }, [columns, isSignedIn, user]);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    localStorage.setItem(`backlog_${user.id}`, JSON.stringify(backlogItems));
  }, [backlogItems, isSignedIn, user]);

  const userCanEditProject = (projectId: string) => {
    if (!isSignedIn || !user) return false;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    
    if (project.ownerId === user.id) return true;
    
    const collaborator = project.collaborators.find(c => c.userId === user.id);
    return collaborator && (collaborator.role === "editor" || collaborator.role === "admin");
  };

  const createProject = (data: ProjectFormData) => {
    if (!isSignedIn || !user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project.",
        variant: "destructive"
      });
      return;
    }
    
    const newProject: Project = {
      id: uuidv4(),
      ...data,
      ownerId: user.id,
      collaborators: [],
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

  const updateProject = (id: string, data: ProjectFormData) => {
    if (!userCanEditProject(id)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to edit this project.",
        variant: "destructive"
      });
      return;
    }
    
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

  const deleteProject = (id: string) => {
    const projectToDelete = projects.find(project => project.id === id);
    if (!projectToDelete) return;
    
    if (isSignedIn && user && projectToDelete.ownerId !== user.id) {
      toast({
        title: "Permission denied",
        description: "Only the project owner can delete a project.",
        variant: "destructive"
      });
      return;
    }
    
    setProjects(projects.filter(project => project.id !== id));
    
    const projectSprints = sprints.filter(sprint => sprint.projectId === id);
    const sprintIds = projectSprints.map(sprint => sprint.id);
    
    setSprints(sprints.filter(sprint => sprint.projectId !== id));
    
    setColumns(columns.filter(column => 
      !column.tasks.some(task => sprintIds.includes(task.sprintId))
    ));
    
    setBacklogItems(backlogItems.filter(item => item.projectId !== id));
    
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject(null);
    }
    
    toast({
      title: "Project deleted",
      description: `${projectToDelete.title} has been deleted successfully.`,
    });
  };

  const selectProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const hasAccess = 
        project.ownerId === user?.id || 
        project.collaborators.some(c => c.userId === user?.id);
      
      if (!hasAccess) {
        toast({
          title: "Access denied",
          description: "You don't have access to this project.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedProject(project);
    }
  };

  const addCollaborator = (projectId: string, data: CollaboratorFormData) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (isSignedIn && user && project.ownerId !== user.id) {
      const userCollaborator = project.collaborators.find(c => c.userId === user.id);
      if (!userCollaborator || userCollaborator.role !== "admin") {
        toast({
          title: "Permission denied",
          description: "Only project owners and admins can add collaborators.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (project.collaborators.some(c => c.email === data.email)) {
      toast({
        title: "Collaborator exists",
        description: "This user is already a collaborator on this project.",
        variant: "destructive"
      });
      return;
    }
    
    const newCollaborator: Collaborator = {
      userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      role: data.role,
      addedAt: new Date()
    };
    
    const updatedProjects = projects.map(p => 
      p.id === projectId
        ? { 
            ...p, 
            collaborators: [...p.collaborators, newCollaborator],
            updatedAt: new Date()
          }
        : p
    );
    
    setProjects(updatedProjects);
    
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject({
        ...selectedProject,
        collaborators: [...selectedProject.collaborators, newCollaborator],
        updatedAt: new Date()
      });
    }
    
    toast({
      title: "Collaborator added",
      description: `${data.email} has been added as a ${data.role}.`,
    });
    
    // In a real app, we would send an email invitation here
  };

  const updateCollaboratorRole = (projectId: string, userId: string, newRole: "viewer" | "editor" | "admin") => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (isSignedIn && user && project.ownerId !== user.id) {
      const userCollaborator = project.collaborators.find(c => c.userId === user.id);
      if (!userCollaborator || userCollaborator.role !== "admin") {
        toast({
          title: "Permission denied",
          description: "Only project owners and admins can update collaborator roles.",
          variant: "destructive"
        });
        return;
      }
    }
    
    const updatedProjects = projects.map(p => {
      if (p.id !== projectId) return p;
      
      const updatedCollaborators = p.collaborators.map(c =>
        c.userId === userId
          ? { ...c, role: newRole }
          : c
      );
      
      return {
        ...p,
        collaborators: updatedCollaborators,
        updatedAt: new Date()
      };
    });
    
    setProjects(updatedProjects);
    
    if (selectedProject && selectedProject.id === projectId) {
      const updatedCollaborators = selectedProject.collaborators.map(c =>
        c.userId === userId
          ? { ...c, role: newRole }
          : c
      );
      
      setSelectedProject({
        ...selectedProject,
        collaborators: updatedCollaborators,
        updatedAt: new Date()
      });
    }
    
    const collaborator = project.collaborators.find(c => c.userId === userId);
    
    toast({
      title: "Role updated",
      description: `${collaborator?.email} is now a ${newRole}.`,
    });
  };

  const removeCollaborator = (projectId: string, userId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (isSignedIn && user && project.ownerId !== user.id) {
      const userCollaborator = project.collaborators.find(c => c.userId === user.id);
      if (!userCollaborator || userCollaborator.role !== "admin") {
        toast({
          title: "Permission denied",
          description: "Only project owners and admins can remove collaborators.",
          variant: "destructive"
        });
        return;
      }
    }
    
    const collaboratorToRemove = project.collaborators.find(c => c.userId === userId);
    if (!collaboratorToRemove) return;
    
    const updatedProjects = projects.map(p => {
      if (p.id !== projectId) return p;
      
      return {
        ...p,
        collaborators: p.collaborators.filter(c => c.userId !== userId),
        updatedAt: new Date()
      };
    });
    
    setProjects(updatedProjects);
    
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject({
        ...selectedProject,
        collaborators: selectedProject.collaborators.filter(c => c.userId !== userId),
        updatedAt: new Date()
      });
    }
    
    toast({
      title: "Collaborator removed",
      description: `${collaboratorToRemove.email} has been removed from the project.`,
    });
  };

  const createSprint = (data: SprintFormData) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    if (!userCanEditProject(selectedProject.id)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to create sprints in this project.",
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
    
    const sprintId = newSprint.id;
    const defaultColumns: Column[] = [
      {
        id: uuidv4(),
        title: "TO DO",
        tasks: []
      },
      {
        id: uuidv4(),
        title: "IN PROGRESS",
        tasks: []
      },
      {
        id: uuidv4(),
        title: "DONE",
        tasks: []
      }
    ];
    
    const columnsWithSprintId = defaultColumns.map(column => ({
      ...column,
      tasks: []
    }));
    
    setSprints([...sprints, newSprint]);
    setColumns([...columns, ...columnsWithSprintId]);
    
    toast({
      title: "Sprint created",
      description: `${data.title} has been created successfully.`,
    });
  };

  const updateSprint = (id: string, data: SprintFormData) => {
    const sprint = sprints.find(s => s.id === id);
    if (!sprint) return;
    
    if (!userCanEditProject(sprint.projectId)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to update sprints in this project.",
        variant: "destructive"
      });
      return;
    }
    
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

  const completeSprint = (id: string) => {
    const sprint = sprints.find(s => s.id === id);
    if (!sprint) return;
    
    if (!userCanEditProject(sprint.projectId)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to complete sprints in this project.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedSprints = sprints.map(sprint => 
      sprint.id === id 
        ? { ...sprint, isCompleted: true, updatedAt: new Date() } 
        : sprint
    );
    
    setSprints(updatedSprints);
    
    toast({
      title: "Sprint completed",
      description: `${sprint.title} has been marked as completed.`,
    });
  };

  const createColumn = (sprintId: string, title: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;
    
    if (!userCanEditProject(sprint.projectId)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to create columns in this project.",
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
    
    const task = columnToDelete.tasks[0];
    if (task) {
      const sprint = sprints.find(s => s.id === task.sprintId);
      if (sprint && !userCanEditProject(sprint.projectId)) {
        toast({
          title: "Permission denied",
          description: "You don't have permission to delete columns in this project.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (columnToDelete.tasks.length > 0) {
      toast({
        title: "Cannot delete column",
        description: "This column still has tasks. Move or delete them first.",
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
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;
    
    if (!userCanEditProject(sprint.projectId)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to create tasks in this project.",
        variant: "destructive"
      });
      return;
    }
    
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
    let taskProject = null;
    let taskFound = false;
    
    for (const column of columns) {
      const task = column.tasks.find(t => t.id === id);
      if (task) {
        taskFound = true;
        const sprint = sprints.find(s => s.id === task.sprintId);
        if (sprint) {
          taskProject = sprint.projectId;
        }
        break;
      }
    }
    
    if (taskFound && taskProject && !userCanEditProject(taskProject)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to update tasks in this project.",
        variant: "destructive"
      });
      return;
    }
    
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
    let taskProject = null;
    let taskTitle = "";
    
    for (const column of columns) {
      const task = column.tasks.find(t => t.id === id);
      if (task) {
        taskTitle = task.title;
        const sprint = sprints.find(s => s.id === task.sprintId);
        if (sprint) {
          taskProject = sprint.projectId;
        }
        break;
      }
    }
    
    if (taskProject && !userCanEditProject(taskProject)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete tasks in this project.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedColumns = columns.map(column => {
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
    
    const task = sourceColumn.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const sprint = sprints.find(s => s.id === task.sprintId);
    if (sprint && !userCanEditProject(sprint.projectId)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to move tasks in this project.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedTask = { ...task, columnId: destinationColumnId };
    
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
          tasks: [...col.tasks, updatedTask]
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
    
    if (!userCanEditProject(selectedProject.id)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to create backlog items in this project.",
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
    const backlogItem = backlogItems.find(item => item.id === id);
    if (!backlogItem) return;
    
    if (!userCanEditProject(backlogItem.projectId)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to update backlog items in this project.",
        variant: "destructive"
      });
      return;
    }
    
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
    
    if (!userCanEditProject(itemToDelete.projectId)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete backlog items in this project.",
        variant: "destructive"
      });
      return;
    }
    
    setBacklogItems(backlogItems.filter(item => item.id !== id));
    
    toast({
      title: "Backlog item deleted",
      description: `${itemToDelete.title} has been deleted from the backlog.`,
    });
  };

  const moveBacklogItemToSprint = (backlogItemId: string, sprintId: string) => {
    const backlogItem = backlogItems.find(item => item.id === backlogItemId);
    if (!backlogItem) return;
    
    if (!userCanEditProject(backlogItem.projectId)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to move backlog items in this project.",
        variant: "destructive"
      });
      return;
    }
    
    const todoColumn = columns.find(col => 
      col.title === "TO DO" && 
      col.tasks.some(task => task.sprintId === sprintId)
    );
    
    if (!todoColumn) {
      toast({
        title: "Error",
        description: "Could not find the TO DO column for the selected sprint.",
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

  const accessibleProjects = projects.filter(project => {
    if (!isSignedIn || !user) return false;
    
    return (
      project.ownerId === user.id || 
      project.collaborators.some(c => c.userId === user.id)
    );
  });

  return (
    <ProjectContext.Provider
      value={{
        projects: accessibleProjects,
        selectedProject,
        sprints,
        columns,
        backlogItems,
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
        addCollaborator,
        updateCollaboratorRole,
        removeCollaborator,
        userCanEditProject
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
