
import { useProjectMutations } from "./hooks";
import { showToast } from "./utils";
import { SprintFormData } from "@/types";

export const useSprintOperations = (user: any, sprints: any[], selectedProject: any) => {
  const {
    createSprintMutation,
    updateSprintMutation,
    completeSprintMutation
  } = useProjectMutations(user);

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

  return {
    createSprint,
    updateSprint,
    completeSprint
  };
};
