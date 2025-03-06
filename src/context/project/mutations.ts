import { ProjectFormData, SprintFormData, TaskFormData, BacklogItemFormData, CollaboratorFormData } from "@/types";
import { supabase } from "@/lib/supabase";

// Project mutations
export const createProject = async (user: any, data: ProjectFormData) => {
  if (!user) throw new Error("You must be signed in to create a project");
  
  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      owner_id: user.id,  // This now correctly references users.id
      title: data.title,
      description: data.description,
      end_goal: data.endGoal
    })
    .select()
    .single();
  
  if (error) throw error;
  return newProject;
};

export const updateProject = async (id: string, data: ProjectFormData) => {
  const { error } = await supabase
    .from('projects')
    .update({
      title: data.title,
      description: data.description,
      end_goal: data.endGoal,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteProject = async (id: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Sprint mutations
export const createSprint = async (projectId: string, data: SprintFormData) => {
  const { error } = await supabase
    .from('sprints')
    .insert({
      project_id: projectId,
      title: data.title,
      description: data.description,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      is_completed: false
    });
  
  if (error) throw error;
};

export const updateSprint = async (id: string, data: SprintFormData) => {
  const { error } = await supabase
    .from('sprints')
    .update({
      title: data.title,
      description: data.description,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) throw error;
};

export const completeSprint = async (id: string) => {
  const { error } = await supabase
    .from('sprints')
    .update({
      is_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) throw error;
};

// Column mutations
export const createColumn = async (title: string) => {
  const { data, error } = await supabase
    .from('columns')
    .insert({
      title
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteColumn = async (id: string) => {
  const { error } = await supabase
    .from('columns')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Task mutations
export const createTask = async (sprintId: string, columnId: string, data: TaskFormData) => {
  const { error } = await supabase
    .from('tasks')
    .insert({
      sprint_id: sprintId,
      column_id: columnId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignee: data.assignee,
      story_points: data.storyPoints
    });
  
  if (error) throw error;
};

export const updateTask = async (id: string, data: TaskFormData) => {
  const { error } = await supabase
    .from('tasks')
    .update({
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignee: data.assignee,
      story_points: data.storyPoints,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const moveTask = async (taskId: string, destinationColumnId: string) => {
  const { error } = await supabase
    .from('tasks')
    .update({
      column_id: destinationColumnId,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId);
  
  if (error) throw error;
};

// Backlog item mutations
export const createBacklogItem = async (projectId: string, data: BacklogItemFormData) => {
  const { error } = await supabase
    .from('backlog_items')
    .insert({
      project_id: projectId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      story_points: data.storyPoints
    });
  
  if (error) throw error;
};

export const updateBacklogItem = async (id: string, data: BacklogItemFormData) => {
  const { error } = await supabase
    .from('backlog_items')
    .update({
      title: data.title,
      description: data.description,
      priority: data.priority,
      story_points: data.storyPoints,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteBacklogItem = async (id: string) => {
  const { error } = await supabase
    .from('backlog_items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Collaborator mutations
export const inviteCollaborator = async (projectId: string, data: CollaboratorFormData) => {
  // First check if the email already exists as a collaborator
  const { data: existingCollaborator, error: checkError } = await supabase
    .from('collaborators')
    .select('*')
    .eq('project_id', projectId)
    .eq('email', data.email)
    .single();
  
  if (existingCollaborator) {
    throw new Error("This user is already a collaborator on this project");
  }
  
  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned, which is expected
    throw checkError;
  }
  
  const { error } = await supabase
    .from('collaborators')
    .insert({
      project_id: projectId,
      email: data.email,
      role: data.role,
      status: 'pending'
    });
  
  if (error) throw error;
};

export const removeCollaborator = async (id: string) => {
  const { error } = await supabase
    .from('collaborators')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const updateCollaboratorStatus = async (id: string, status: 'accepted' | 'rejected') => {
  const { error } = await supabase
    .from('collaborators')
    .update({
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) throw error;
};
