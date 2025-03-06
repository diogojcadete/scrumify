
import { useProjectMutations } from "./hooks";
import { canDeleteColumn, showToast } from "./utils";

export const useColumnOperations = (user: any, columns: any[]) => {
  const {
    createColumnMutation,
    deleteColumnMutation
  } = useProjectMutations(user);

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

  return {
    createColumn,
    deleteColumn
  };
};
