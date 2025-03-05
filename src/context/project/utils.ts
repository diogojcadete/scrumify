
import { Column, Task } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Function to combine tasks with columns
export const combineTasksWithColumns = (columnsData: Column[], tasks: Task[]): Column[] => {
  return columnsData.map(column => ({
    ...column,
    tasks: tasks.filter(task => task.columnId === column.id)
  }));
};

// Check if all tasks in a sprint are in DONE column
export const checkAllTasksCompleted = (
  columns: Column[], 
  sprintId: string, 
  doneColumn: Column | undefined
): boolean => {
  if (!doneColumn) return false;
  
  // Count total tasks for this sprint
  const totalTasks = columns.reduce(
    (count, column) => count + column.tasks.filter(task => task.sprintId === sprintId).length,
    0
  );
  
  // Count tasks in DONE column
  const doneTasks = doneColumn.tasks.filter(task => task.sprintId === sprintId).length;
  
  // If there are no tasks, sprint can't be completed
  if (totalTasks === 0) return false;
  
  // Check if all tasks are in DONE column
  return doneTasks === totalTasks;
};

// Helper for validating if a column is deletable
export const canDeleteColumn = (
  column: Column,
  defaultColumns: string[] = ["TO DO", "IN PROGRESS", "DONE"]
): { canDelete: boolean; message?: string } => {
  if (column.tasks.length > 0) {
    return {
      canDelete: false,
      message: "This column still has tasks. Move or delete them first."
    };
  }
  
  if (defaultColumns.includes(column.title)) {
    return {
      canDelete: false,
      message: "The default columns (TO DO, IN PROGRESS, DONE) cannot be deleted."
    };
  }
  
  return { canDelete: true };
};

// Toast helper for consistent styling
export const showToast = (title: string, description: string, type: "default" | "destructive" | "outline" | "secondary" = "default") => {
  toast({
    title,
    description,
    variant: type
  });
};
