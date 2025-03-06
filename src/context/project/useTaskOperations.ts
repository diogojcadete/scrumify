
import { useProjectMutations } from "./hooks";
import { showToast } from "./utils";
import { TaskFormData } from "@/types";

export const useTaskOperations = (user: any, columns: any[]) => {
  const {
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    moveTaskMutation
  } = useProjectMutations(user);

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
      const taskToDelete = column.tasks.find((task: any) => task.id === id);
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
    
    const taskIndex = sourceColumn.tasks.findIndex((task: any) => task.id === taskId);
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

  return {
    createTask,
    updateTask,
    deleteTask,
    moveTask
  };
};
