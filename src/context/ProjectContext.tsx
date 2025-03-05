
import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ProjectContextType } from "./project/types";
import { useProjectMutations } from "./project/hooks";
import { combineTasksWithColumns, canDeleteColumn, showToast } from "./project/utils";
import { 
  fetchProjects, 
  fetchSprints, 
  fetchColumns, 
  fetchTasks, 
  fetchBacklogItems, 
  fetchCollaborators 
} from "./project/queries";
import { 
  Project, 
  BacklogItemFormData, 
  CollaboratorFormData, 
  ProjectFormData, 
  SprintFormData, 
  TaskFormData,
  Task
} from "@/types";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [user, setUser] = useState<any>(null);

  // Set up auth listener
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
        setSelectedProject(null);
      }
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

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

  const {
    data: collaborators = [],
    isLoading: isCollaboratorsLoading
  } = useQuery({
    queryKey: ['collaborators', selectedProject?.id],
    queryFn: () => fetchCollaborators(user, selectedProject?.id),
    enabled: !!user && !!selectedProject
  });

  // Combine tasks with columns
  const columns = combineTasksWithColumns(columnsData, tasks);

  const isLoading = 
    isProjectsLoading || 
    isSprintsLoading || 
    isColumnsLoading || 
    isTasksLoading || 
    isBacklogItemsLoading || 
    isCollaboratorsLoading;

  // Get all mutations
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
    deleteBacklogItemMutation,
    addCollaboratorMutation,
    updateCollaboratorMutation,
    removeCollaboratorMutation
  } = useProjectMutations(user);

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
  }, [user, isLoading, columns, createColumnMutation]);

  // Method implementations
  const createProject = async (data: ProjectFormData) => {
    try {
      const newProject = await createProjectMutation.mutateAsync(data);
      showToast("Project created", `${data.title} has been created successfully.`);
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
      
      showToast("Project updated", `${data.title} has been updated successfully.`);
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
      
      showToast("Project deleted", `${projectToDelete.title} has been deleted successfully.`);
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
      showToast("Error", "No project selected.", "destructive");
      return;
    }
    
    try {
      await createSprintMutation.mutateAsync({ 
        projectId: selectedProject.id, 
        data 
      });
      
      showToast("Sprint created", `${data.title} has been created successfully.`);
    } catch (error) {
      console.error(error);
    }
  };

  const updateSprint = async (id: string, data: SprintFormData) => {
    try {
      await updateSprintMutation.mutateAsync({ id, data });
      
      showToast("Sprint updated", `${data.title} has been updated successfully.`);
    } catch (error) {
      console.error(error);
    }
  };

  const completeSprint = async (id: string) => {
    try {
      await completeSprintMutation.mutateAsync(id);
      
      const sprint = sprints.find(s => s.id === id);
      if (sprint) {
        showToast("Sprint completed", `${sprint.title} has been marked as completed.`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createColumn = async (sprintId: string, title: string) => {
    const columnExists = columns.some(col => col.title === title);
    
    if (columnExists) {
      showToast("Column already exists", `A column named "${title}" already exists.`, "destructive");
      return;
    }
    
    try {
      await createColumnMutation.mutateAsync(title);
      
      showToast("Column created", `${title} column has been created successfully.`);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteColumn = async (id: string) => {
    const columnToDelete = columns.find(column => column.id === id);
    if (!columnToDelete) return;
    
    const { canDelete, message } = canDeleteColumn(columnToDelete);
    
    if (!canDelete) {
      showToast("Cannot delete column", message || "Unable to delete this column.", "destructive");
      return;
    }
    
    try {
      await deleteColumnMutation.mutateAsync(id);
      
      showToast("Column deleted", `${columnToDelete.title} column has been deleted successfully.`);
    } catch (error) {
      console.error(error);
    }
  };

  const createTask = async (sprintId: string, columnId: string, data: TaskFormData) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) {
      showToast("Error", "Column not found.", "destructive");
      return;
    }
    
    try {
      await createTaskMutation.mutateAsync({
        sprintId,
        columnId,
        data
      });
      
      showToast("Task created", `${data.title} has been created successfully.`);
    } catch (error) {
      console.error(error);
    }
  };

  const updateTask = async (id: string, data: TaskFormData) => {
    try {
      await updateTaskMutation.mutateAsync({ id, data });
      
      showToast("Task updated", `${data.title} has been updated successfully.`);
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
        showToast("Task deleted", `${taskTitle} has been deleted successfully.`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const moveTask = async (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    const sourceColumn = columns.find(col => col.id === sourceColumnId);
    if (!sourceColumn) return;
    
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
      showToast("Error", "No project selected.", "destructive");
      return;
    }
    
    try {
      await createBacklogItemMutation.mutateAsync({
        projectId: selectedProject.id,
        data
      });
      
      showToast("Backlog item created", `${data.title} has been added to the backlog.`);
    } catch (error) {
      console.error(error);
    }
  };

  const updateBacklogItem = async (id: string, data: BacklogItemFormData) => {
    try {
      await updateBacklogItemMutation.mutateAsync({ id, data });
      
      showToast("Backlog item updated", `${data.title} has been updated successfully.`);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteBacklogItem = async (id: string) => {
    const itemToDelete = backlogItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    try {
      await deleteBacklogItemMutation.mutateAsync(id);
      
      showToast("Backlog item deleted", `${itemToDelete.title} has been deleted from the backlog.`);
    } catch (error) {
      console.error(error);
    }
  };

  const moveBacklogItemToSprint = async (backlogItemId: string, sprintId: string) => {
    const backlogItem = backlogItems.find(item => item.id === backlogItemId);
    if (!backlogItem) return;
    
    const todoColumn = columns.find(col => col.title === "TO DO");
    if (!todoColumn) {
      showToast("Error", "TO DO column not found. Please create a sprint first.", "destructive");
      return;
    }
    
    try {
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
      
      await deleteBacklogItemMutation.mutateAsync(backlogItemId);
      
      showToast("Item moved to sprint", `${backlogItem.title} has been moved to the selected sprint.`);
    } catch (error) {
      console.error(error);
    }
  };

  const addCollaborator = async (data: CollaboratorFormData) => {
    if (!selectedProject) {
      showToast("Error", "No project selected.", "destructive");
      return;
    }
    
    try {
      await addCollaboratorMutation.mutateAsync({ 
        projectId: selectedProject.id, 
        data 
      });
      
      showToast("Collaborator invited", `Invitation sent to ${data.email}.`);
    } catch (error) {
      console.error(error);
    }
  };

  const updateCollaborator = async (id: string, data: CollaboratorFormData) => {
    try {
      await updateCollaboratorMutation.mutateAsync({ id, data });
      
      showToast("Collaborator updated", `Collaborator details updated successfully.`);
    } catch (error) {
      console.error(error);
    }
  };

  const removeCollaborator = async (id: string) => {
    const collaboratorToRemove = collaborators.find(collab => collab.id === id);
    if (!collaboratorToRemove) return;
    
    try {
      await removeCollaboratorMutation.mutateAsync(id);
      
      showToast("Collaborator removed", `${collaboratorToRemove.email} has been removed from the project.`);
    } catch (error) {
      console.error(error);
    }
  };

  const isOwner = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.ownerId === user?.id;
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
        moveBacklogItemToSprint,
        addCollaborator,
        updateCollaborator,
        removeCollaborator,
        isOwner
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
