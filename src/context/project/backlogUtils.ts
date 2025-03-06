
import { BacklogItem, BacklogItemFormData, Column, Task } from "@/types";
import { toast } from "@/components/ui/use-toast";

export const createBacklogItem = (
  backlogItems: BacklogItem[], 
  projectId: string, 
  data: BacklogItemFormData
) => {
  if (!projectId) {
    toast({
      title: "Error",
      description: "No project selected.",
      variant: "destructive"
    });
    return { success: false, backlogItems };
  }
  
  const newBacklogItem: BacklogItem = {
    id: crypto.randomUUID(),
    projectId: projectId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  toast({
    title: "Backlog item created",
    description: `${data.title} has been added to the backlog.`,
  });
  
  return { success: true, backlogItems: [...backlogItems, newBacklogItem] };
};

export const updateBacklogItem = (
  backlogItems: BacklogItem[], 
  id: string, 
  data: BacklogItemFormData
) => {
  const updatedBacklogItems = backlogItems.map(item => 
    item.id === id 
      ? { ...item, ...data, updatedAt: new Date() } 
      : item
  );
  
  toast({
    title: "Backlog item updated",
    description: `${data.title} has been updated successfully.`,
  });
  
  return { success: true, backlogItems: updatedBacklogItems };
};

export const deleteBacklogItem = (backlogItems: BacklogItem[], id: string) => {
  const itemToDelete = backlogItems.find(item => item.id === id);
  if (!itemToDelete) return { success: false, backlogItems };
  
  toast({
    title: "Backlog item deleted",
    description: `${itemToDelete.title} has been deleted from the backlog.`,
  });
  
  return { success: true, backlogItems: backlogItems.filter(item => item.id !== id) };
};

export const moveBacklogItemToSprint = (
  backlogItems: BacklogItem[], 
  columns: Column[], 
  backlogItemId: string, 
  sprintId: string
) => {
  const backlogItem = backlogItems.find(item => item.id === backlogItemId);
  if (!backlogItem) return { success: false, backlogItems, columns };
  
  const todoColumn = columns.find(col => col.title === "TO DO");
  if (!todoColumn) {
    toast({
      title: "Error",
      description: "TO DO column not found. Please create a sprint first.",
      variant: "destructive"
    });
    return { success: false, backlogItems, columns };
  }
  
  const newTask: Task = {
    id: crypto.randomUUID(),
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
  
  toast({
    title: "Item moved to sprint",
    description: `${backlogItem.title} has been moved to the selected sprint.`,
  });
  
  return { 
    success: true, 
    backlogItems: updatedBacklogItems, 
    columns: updatedColumns 
  };
};
