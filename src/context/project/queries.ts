import { Project, Sprint, Column, Task, BacklogItem, Collaborator } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export const fetchProjects = async (user: any) => {
  if (!user) return [];
  
  // Fetch projects where the user is the owner or a collaborator
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .or(`owner_id.eq.${user.id},id.in.(${
      supabase.from('collaborators')
      .select('project_id')
      .eq('email', user.email)
      .in('status', ['pending', 'accepted'])
    })`)
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

export const fetchCollaborators = async (projectId: string) => {
  const { data, error } = await supabase
    .from('collaborators')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  
  if (error) {
    toast({
      title: "Error fetching collaborators",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
  
  return data.map(collaborator => ({
    ...collaborator,
    projectId: collaborator.project_id,
    createdAt: new Date(collaborator.created_at),
    updatedAt: new Date(collaborator.updated_at)
  }));
};

export const fetchInvitations = async (user: any) => {
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('collaborators')
    .select('*, projects:project_id(*)')
    .eq('email', user.email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) {
    toast({
      title: "Error fetching invitations",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
  
  return data.map(invitation => ({
    ...invitation,
    projectId: invitation.project_id,
    projectTitle: invitation.projects?.title || 'Unknown Project',
    createdAt: new Date(invitation.created_at),
    updatedAt: new Date(invitation.updated_at)
  }));
};
