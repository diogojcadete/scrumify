
import { Column } from "@/types";
import { toast } from "@/components/ui/use-toast";

export const createColumn = (columns: Column[], sprintId: string, title: string) => {
  const columnExists = columns.some(col => col.title === title);
  
  if (columnExists) {
    toast({
      title: "Column already exists",
      description: `A column named "${title}" already exists.`,
      variant: "destructive"
    });
    return { success: false, columns };
  }
  
  const newColumn: Column = {
    id: crypto.randomUUID(),
    title,
    tasks: []
  };
  
  toast({
    title: "Column created",
    description: `${title} column has been created successfully.`,
  });
  
  return { success: true, columns: [...columns, newColumn] };
};

export const deleteColumn = (columns: Column[], id: string) => {
  const columnToDelete = columns.find(column => column.id === id);
  if (!columnToDelete) return { success: false, columns };
  
  if (columnToDelete.tasks.length > 0) {
    toast({
      title: "Cannot delete column",
      description: "This column still has tasks. Move or delete them first.",
      variant: "destructive"
    });
    return { success: false, columns };
  }
  
  if (["TO DO", "IN PROGRESS", "DONE"].includes(columnToDelete.title)) {
    toast({
      title: "Cannot delete default column",
      description: "The default columns (TO DO, IN PROGRESS, DONE) cannot be deleted.",
      variant: "destructive"
    });
    return { success: false, columns };
  }
  
  toast({
    title: "Column deleted",
    description: `${columnToDelete.title} column has been deleted successfully.`,
  });
  
  return { success: true, columns: columns.filter(column => column.id !== id) };
};
