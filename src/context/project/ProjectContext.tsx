
import React, { createContext, useContext, useState, useEffect } from "react";
import { Project, Sprint, Column, Task, BacklogItem, ProjectFormData, SprintFormData, TaskFormData, BacklogItemFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useProjectMutations } from "./projectHooks";
import { 
  fetchProjects, 
  fetchSprints, 
  fetchColumns, 
  fetchTasks, 
  fetchBacklogItems 
} from "./queries";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  isLoading: boolean;
  createProject: (data: ProjectFormData) => Promise<void>;
  updateProject: (id: string, data: ProjectFormData) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string) => void;
  createSprint: (data: SprintFormData) => Promise<void>;
  updateSprint: (id: string, data: SprintFormData) => Promise<void>;
  completeSprint: (id: string) => Promise<void>;
  createColumn: (sprintId: string, title: string) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  createTask: (sprintId: string, columnId: string, data: TaskFormData) => Promise<void>;
  updateTask: (id: string, data: TaskFormData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string) => Promise<void>;
  createBacklogItem: (data: BacklogItemFormData) => Promise<void>;
  updateBacklogItem: (id: string, data: BacklogItemFormData) => Promise<void>;
  deleteBacklogItem: (id: string) => Promise<void>;
  moveBacklogItemToSprint: (backlogItemId: string, sprintId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { user } = useSupabaseAuth();
  
  const {
    createProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
    createSprintMutation,
    updateSprintMutation,
    completeSprintMutation,
    createColumnMutation,
    deleteColumnMutation,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    moveTaskMutation,
    createBacklogItemMutation,
    updateBacklogItemMutation,
    deleteBacklogItemMutation
  } = useProjectMutations(user);

  // Queries
  const {
    data: projects = [],
    isLoading: isProjectsLoading
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(user),
    enabled: !!user
  });

  const {
    data: sprints = [],
    isLoading: isSprintsLoading
  } = useQuery({
    queryKey: ['sprints'],
    queryFn: () => fetchSprints(user),
    enabled: !!user
  });

  const {
    data: columnsData = [],
    isLoading: isColumnsLoading
  } = useQuery({
    queryKey: ['columns'],
    queryFn: () => fetchColumns(user),
    enabled: !!user
  });

  const {
    data: tasks = [],
    isLoading: isTasksLoading
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(user),
    enabled: !!user
  });

  const {
    data: backlogItems = [],
    isLoading: isBacklogItemsLoading
  } = useQuery({
    queryKey: ['backlogItems'],
    queryFn: () => fetchBacklogItems(user),
    enabled: !!user
  });

  // Combine tasks with columns
  const columns = columnsData.map(column => ({
    ...column,
    tasks: tasks.filter(task => task.columnId === column.id)
  }));

  const isLoading = isProjectsLoading || isSprintsLoading || isColumnsLoading || isTasksLoading || isBacklogItemsLoading;

  // Function to create default columns if they don't exist
  useEffect(() => {
    const createDefaultColumns = async () => {
      if (!user || isLoading) return;
      
      const defaultColumns = ["TO DO", "IN PROGRESS", "DONE"];
      const existingColumnTitles = columns.map(col => col.title);
      
      for (const title of defaultColumns) {
        if (!existingColumnTitles.includes(title)) {
          await createColumnMutation.mutateAsync(title);
        }
      }
    };
    
    createDefaultColumns();
  }, [user, isLoading, columns]);

  // Context functions
  const createProject = async (data: ProjectFormData) => {
    try {
      const newProject = await createProjectMutation.mutateAsync(data);
      toast({
        title: "Project created",
        description: `${data.title} has been created successfully.`,
      });
      setSelectedProject(newProject);
    } catch (error) {
      console.error(error);
    }
  };

  const updateProject = async (id: string, data: ProjectFormData) => {
    try {
      await updateProjectMutation.mutateAsync({ id, data });
      
      if (selectedProject && selectedProject.id === id) {
        const updatedProject = {
          ...selectedProject,
          ...data,
          updatedAt: new Date()
        };
        setSelectedProject(updatedProject);
      }
      
      toast({
        title: "Project updated",
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const projectToDelete = projects.find(project => project.id === id);
      if (!projectToDelete) return;
      
      await deleteProjectMutation.mutateAsync(id);
      
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject(null);
      }
      
      toast({
        title: "Project deleted",
        description: `${projectToDelete.title} has been deleted successfully.`,
      });
    } catch (error) {
      console.error(error);
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
    
    try {
      await createSprintMutation.mutateAsync({ 
        projectId: selectedProject.id, 
        data 
      });
      
      toast({
        title: "Sprint created",
        description: `${data.title} has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateSprint = async (id: string, data: SprintFormData) => {
    try {
      await updateSprintMutation.mutateAsync({ id, data });
      
      toast({
        title: "Sprint updated",
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const completeSprint = async (id: string) => {
    try {
      await completeSprintMutation.mutateAsync(id);
      
      const sprint = sprints.find(s => s.id === id);
      if (sprint) {
        toast({
          title: "Sprint completed",
          description: `${sprint.title} has been marked as completed.`,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createColumn = async (sprintId: string, title: string) => {
    const columnExists = columns.some(col => col.title === title);
    
    if (columnExists) {
      toast({
        title: "Column already exists",
        description: `A column named "${title}" already exists.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createColumnMutation.mutateAsync(title);
      
      toast({
        title: "Column created",
        description: `${title} column has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteColumn = async (id: string) => {
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
    
    try {
      await deleteColumnMutation.mutateAsync(id);
      
      toast({
        title: "Column deleted",
        description: `${columnToDelete.title} column has been deleted successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createTask = async (sprintId: string, columnId: string, data: TaskFormData) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) {
      toast({
        title: "Error",
        description: "Column not found.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createTaskMutation.mutateAsync({
        sprintId,
        columnId,
        data
      });
      
      toast({
        title: "Task created",
        description: `${data.title} has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateTask = async (id: string, data: TaskFormData) => {
    try {
      await updateTaskMutation.mutateAsync({ id, data });
      
      toast({
        title: "Task updated",
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id: string) => {
    let taskTitle = "";
    
    for (const column of columns) {
      const taskToDelete = column.tasks.find(task => task.id === id);
      if (taskToDelete) {
        taskTitle = taskToDelete.title;
        break;
      }
    }
    
    try {
      await deleteTaskMutation.mutateAsync(id);
      
      if (taskTitle) {
        toast({
          title: "Task deleted",
          description: `${taskTitle} has been deleted successfully.`,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const moveTask = async (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    // Find the source column
    const sourceColumn = columns.find(col => col.id === sourceColumnId);
    if (!sourceColumn) return;
    
    // Find the task
    const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    try {
      await moveTaskMutation.mutateAsync({
        taskId,
        destinationColumnId
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createBacklogItem = async (data: BacklogItemFormData) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createBacklogItemMutation.mutateAsync({
        projectId: selectedProject.id,
        data
      });
      
      toast({
        title: "Backlog item created",
        description: `${data.title} has been added to the backlog.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateBacklogItem = async (id: string, data: BacklogItemFormData) => {
    try {
      await updateBacklogItemMutation.mutateAsync({ id, data });
      
      toast({
        title: "Backlog item updated",
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteBacklogItem = async (id: string) => {
    const itemToDelete = backlogItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    try {
      await deleteBacklogItemMutation.mutateAsync(id);
      
      toast({
        title: "Backlog item deleted",
        description: `${itemToDelete.title} has been deleted from the backlog.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const moveBacklogItemToSprint = async (backlogItemId: string, sprintId: string) => {
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
    
    try {
      // Create a task from the backlog item
      await createTaskMutation.mutateAsync({
        sprintId,
        columnId: todoColumn.id,
        data: {
          title: backlogItem.title,
          description: backlogItem.description,
          priority: backlogItem.priority,
          assignee: "",
          storyPoints: backlogItem.storyPoints
        }
      });
      
      // Delete the backlog item
      await deleteBacklogItemMutation.mutateAsync(backlogItemId);
      
      toast({
        title: "Item moved to sprint",
        description: `${backlogItem.title} has been moved to the selected sprint.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        sprints,
        columns,
        backlogItems,
        isLoading,
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
        moveBacklogItemToSprint
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
