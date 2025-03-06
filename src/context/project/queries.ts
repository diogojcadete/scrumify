
import { Project, Sprint, Column, Task, BacklogItem } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export const fetchProjects = async (user: any) => {
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    toast({
      title: "Error fetching projects",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
  
  return data.map(project => ({
    ...project,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at)
  }));
};

export const fetchSprints = async (user: any) => {
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    toast({
      title: "Error fetching sprints",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
  
  return data.map(sprint => ({
    ...sprint,
    projectId: sprint.project_id,
    startDate: new Date(sprint.start_date),
    endDate: new Date(sprint.end_date),
    isCompleted: sprint.is_completed,
    createdAt: new Date(sprint.created_at),
    updatedAt: new Date(sprint.updated_at)
  }));
};

export const fetchColumns = async (user: any) => {
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    toast({
      title: "Error fetching columns",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
  
  return data.map(column => ({
    ...column,
    createdAt: new Date(column.created_at),
    updatedAt: new Date(column.updated_at),
    tasks: []
  }));
};

export const fetchTasks = async (user: any) => {
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    toast({
      title: "Error fetching tasks",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
  
  return data.map(task => ({
    ...task,
    sprintId: task.sprint_id,
    columnId: task.column_id,
    storyPoints: task.story_points,
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at)
  }));
};

export const fetchBacklogItems = async (user: any) => {
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('backlog_items')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    toast({
      title: "Error fetching backlog items",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
  
  return data.map(item => ({
    ...item,
    projectId: item.project_id,
    storyPoints: item.story_points,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }));
};
