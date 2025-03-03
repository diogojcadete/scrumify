
import { createClient } from '@supabase/supabase-js';
import { CollaboratorFormData, ProjectFormData, SprintFormData } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btutiksghrrxrxqxwlnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dXRpa3NnaHJyeHJ4cXh3bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDk2ODUsImV4cCI6MjA1NjMyNTY4NX0.SSAGtVl0jMLM9v6isoC4oZOZ-Q92nLNZO2RMOUZeyaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    }
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

// Project database functions
export async function createProjectInDB(projectData: ProjectFormData, userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: projectData.title,
      description: projectData.description,
      end_goal: projectData.endGoal,
      owner_id: userId
    })
    .select()
    .single();
    
  return { data, error };
}

// Updated function to get projects - now includes projects where the user is a collaborator
export async function getProjectsFromDB() {
  try {
    // First get projects that the user owns
    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (ownedError) {
      console.error("Error fetching owned projects:", ownedError);
      return { data: null, error: ownedError };
    }
    
    // Then get projects where the user is a collaborator with accepted status
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { data: ownedProjects, error: null };
    }
    
    const { data: collaboratorProjects, error: collabError } = await supabase
      .from('collaborators')
      .select(`
        projects (*)
      `)
      .eq('email', userData.user.email)
      .eq('status', 'accepted');
      
    if (collabError) {
      console.error("Error fetching collaborator projects:", collabError);
      return { data: ownedProjects, error: null }; // Still return owned projects
    }
    
    // Extract projects from the collaborator data and merge with owned projects
    const collaboratedProjects = collaboratorProjects
      .filter(item => item.projects) // Filter out any null projects
      .map(item => item.projects);
      
    // Combine projects, ensuring no duplicates by using project ID as key
    const projectMap = new Map();
    
    // Add owned projects to map
    ownedProjects.forEach(project => {
      projectMap.set(project.id, project);
    });
    
    // Add collaborated projects to map (will overwrite if duplicate id)
    collaboratedProjects.forEach(project => {
      if (project && !projectMap.has(project.id)) {
        projectMap.set(project.id, project);
      }
    });
    
    // Convert map back to array
    const allProjects = Array.from(projectMap.values());
    
    return { data: allProjects, error: null };
  } catch (error) {
    console.error("Error in getProjectsFromDB:", error);
    return { data: null, error: "Failed to fetch projects" };
  }
}

// New function to get projects where the user is a collaborator
export async function getProjectsByCollaborator() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { data: [], error: "User not authenticated" };
    }
    
    const { data, error } = await supabase
      .from('collaborators')
      .select(`
        projects (*)
      `)
      .eq('email', userData.user.email)
      .eq('status', 'accepted');
      
    if (error) {
      console.error("Error fetching collaborator projects:", error);
      return { data: [], error: error.message };
    }
    
    // Extract just the projects from the response
    const projects = data
      .filter(item => item.projects) // Filter out any null projects
      .map(item => item.projects);
      
    return { data: projects, error: null };
  } catch (error) {
    console.error("Error in getProjectsByCollaborator:", error);
    return { data: [], error: "Failed to fetch collaborator projects" };
  }
}

export async function updateProjectInDB(id: string, projectData: ProjectFormData) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      title: projectData.title,
      description: projectData.description,
      end_goal: projectData.endGoal,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function deleteProjectFromDB(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
    
  return { error };
}

// Sprint database functions
export async function createSprintInDB(sprintData: SprintFormData, projectId: string) {
  // Create a sprints table first if it doesn't exist
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

export async function sendCollaboratorInvitation(projectId: string, projectTitle: string, collaboratorData: CollaboratorFormData) {
  try {
    // Get current user's email for the invitation
    const { data: userData } = await supabase.auth.getUser();
    const inviterEmail = userData.user?.email || 'A team member';
    
    // Store invitation in the collaborators table
    const { data: collaborator, error: dbError } = await supabase
      .from('collaborators')
      .insert({
        project_id: projectId,
        email: collaboratorData.email,
        role: collaboratorData.role
      })
      .select()
      .maybeSingle(); // Changed from single() to maybeSingle() to handle zero or multiple records
    
    if (dbError) {
      console.error('Failed to store invitation:', dbError);
      return { success: false, error: dbError.message };
    }
    
    // Send the actual email via Edge Function
    const { data, error } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        to: collaboratorData.email,
        projectTitle,
        inviterEmail,
        projectId,
        role: collaboratorData.role,
        collaboratorId: collaborator?.id
      }
    });
    
    if (error) {
      console.error('Failed to send invitation email:', error);
      // Delete the collaborator record if the email fails
      if (collaborator?.id) {
        await supabase
          .from('collaborators')
          .delete()
          .eq('id', collaborator.id);
      }
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending invitation:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}

// Add new function to get invitations for a user
export async function getInvitationsForUser(email: string) {
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .select(`
        id,
        email,
        role,
        status,
        created_at,
        projects (
          id,
          title,
          description
        )
      `)
      .eq('email', email)
      .eq('status', 'pending');
    
    if (error) {
      console.error('Error fetching invitations:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getInvitationsForUser:', error);
    return { data: null, error: 'Failed to fetch invitations' };
  }
}

// Update invitation status
export async function updateInvitationStatus(id: string, status: 'accepted' | 'rejected') {
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .update({ 
        status,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .maybeSingle(); // Changed from single() to maybeSingle()
    
    if (error) {
      console.error('Error updating invitation:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in updateInvitationStatus:', error);
    return { success: false, error: 'Failed to update invitation status' };
  }
}
