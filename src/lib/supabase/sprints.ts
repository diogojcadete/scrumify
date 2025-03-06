
import { SprintFormData } from '@/types';
import { supabase } from './client';

export async function createSprintInDB(sprintData: SprintFormData, projectId: string) {
  const { data, error } = await supabase
    .from('sprints')
    .insert({
      title: sprintData.title,
      description: sprintData.description,
      project_id: projectId,
      start_date: sprintData.startDate,
      end_date: sprintData.endDate,
      is_completed: false
    })
    .select()
    .single();
    
  return { data, error };
}

export async function getSprintsFromDB(projectId?: string) {
  let query = supabase
    .from('sprints')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  
  const { data, error } = await query;
  return { data, error };
}

export async function updateSprintInDB(id: string, sprintData: SprintFormData) {
  const { data, error } = await supabase
    .from('sprints')
    .update({
      title: sprintData.title,
      description: sprintData.description,
      start_date: sprintData.startDate,
      end_date: sprintData.endDate,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function completeSprintInDB(id: string) {
  const { data, error } = await supabase
    .from('sprints')
    .update({
      is_completed: true,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function deleteSprintFromDB(id: string) {
  const { error } = await supabase
    .from('sprints')
    .delete()
    .eq('id', id);
    
  return { error };
}
