
import { Column, Task, TaskFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";

export const createTask = (columns: Column[], sprintId: string, columnId: string, data: TaskFormData) => {
  const column = columns.find(col => col.id === columnId);
  if (!column) {
    toast({
      title: "Error",
      description: "Column not found.",
      variant: "destructive"
    });
    return { success: false, columns };
  }
  
  const newTask: Task = {
    id: crypto.randomUUID(),
    ...data,
    columnId,
    sprintId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const updatedColumns = columns.map(col => 
    col.id === columnId 
      ? { ...col, tasks: [...col.tasks, newTask] } 
      : col
  );
  
  toast({
    title: "Task created",
    description: `${data.title} has been created successfully.`,
  });
  
  return { success: true, columns: updatedColumns };
};

export const updateTask = (columns: Column[], id: string, data: TaskFormData) => {
  const updatedColumns = columns.map(column => {
    const taskIndex = column.tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      const updatedTasks = [...column.tasks];
      updatedTasks[taskIndex] = { 
        ...updatedTasks[taskIndex], 
        ...data, 
        updatedAt: new Date() 
      };
      
      return { ...column, tasks: updatedTasks };
    }
    
    return column;
  });
  
  toast({
    title: "Task updated",
    description: `${data.title} has been updated successfully.`,
  });
  
  return { success: true, columns: updatedColumns };
};

export const deleteTask = (columns: Column[], id: string) => {
  let taskTitle = "";
  
  const updatedColumns = columns.map(column => {
    const taskToDelete = column.tasks.find(task => task.id === id);
    if (taskToDelete) taskTitle = taskToDelete.title;
    
    return {
      ...column,
      tasks: column.tasks.filter(task => task.id !== id)
    };
  });
  
  if (taskTitle) {
    toast({
      title: "Task deleted",
      description: `${taskTitle} has been deleted successfully.`,
    });
  }
  
  return { success: true, columns: updatedColumns };
};

export const moveTask = (columns: Column[], taskId: string, sourceColumnId: string, destinationColumnId: string) => {
  const sourceColumn = columns.find(col => col.id === sourceColumnId);
  if (!sourceColumn) return { success: false, columns };
  
  const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) return { success: false, columns };
  
  const task = { ...sourceColumn.tasks[taskIndex], columnId: destinationColumnId };
  
  const updatedColumns = columns.map(col => {
    if (col.id === sourceColumnId) {
      return {
        ...col,
        tasks: col.tasks.filter(t => t.id !== taskId)
      };
    }
    
    if (col.id === destinationColumnId) {
      return {
        ...col,
        tasks: [...col.tasks, task]
      };
    }
    
    return col;
  });
  
  return { success: true, columns: updatedColumns };
};
