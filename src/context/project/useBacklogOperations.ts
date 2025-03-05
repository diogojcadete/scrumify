
import { useProjectMutations } from "./hooks";
import { showToast } from "./utils";
import { BacklogItemFormData } from "@/types";

export const useBacklogOperations = (
  user: any, 
  backlogItems: any[], 
  columns: any[], 
  selectedProject: any
) => {
  const {
    createBacklogItemMutation,
    updateBacklogItemMutation,
    deleteBacklogItemMutation,
    createTaskMutation
  } = useProjectMutations(user);

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

  return {
    createBacklogItem,
    updateBacklogItem,
    deleteBacklogItem,
    moveBacklogItemToSprint
  };
};
