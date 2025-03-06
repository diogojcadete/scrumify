
import { useState } from "react";
import { useProjectMutations } from "./hooks";
import { showToast } from "./utils";
import { 
  Project,
  BacklogItemFormData, 
  CollaboratorFormData, 
  ProjectFormData, 
  SprintFormData, 
  TaskFormData 
} from "@/types";

export const useProjectOperations = (
  user: any,
  projects: Project[],
  columns: any[],
  backlogItems: any[],
  collaborators: any[]
) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
    removeCollaboratorMutation,
    acceptCollaboratorInviteMutation,
    declineCollaboratorInviteMutation
  } = useProjectMutations(user);

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

  const isOwner = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.ownerId === user?.id;
  };

  return {
    selectedProject,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    isOwner
  };
};
