
import { ProjectFormData } from '@/types';
import { supabase } from './client';

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

export async function getProjectsFromDB() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    // Fetch projects where the user is the owner
    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (ownedError) {
      console.error("Error fetching owned projects:", ownedError);
      return { data: null, error: ownedError };
    }
    
    // If user is not authenticated, just return owned projects
    if (!userData.user) {
      return { data: ownedProjects, error: null };
    }
    
    // Fetch projects where the user is a collaborator with accepted status
    const { data: collaboratorProjects, error: collabError } = await supabase
      .from('collaborators')
      .select(`
        project_id,
        projects (*)
      `)
      .eq('email', userData.user.email)
      .eq('status', 'accepted');
      
    if (collabError) {
      console.error("Error fetching collaborator projects:", collabError);
      return { data: ownedProjects, error: null };
    }
    
    // Create a combined list of projects with no duplicates
    const projectMap = new Map();
    
    // Add owned projects to the map
    if (ownedProjects) {
      ownedProjects.forEach(project => {
        projectMap.set(project.id, project);
      });
    }
    
    // Add collaborated projects to the map if they exist
    if (collaboratorProjects && collaboratorProjects.length > 0) {
      collaboratorProjects.forEach(item => {
        if (item && item.projects) {
          const project = item.projects;
          if (project && !projectMap.has(project.id)) {
            projectMap.set(project.id, project);
          }
        }
      });
    }
    
    // Convert map to array
    const allProjects = Array.from(projectMap.values());
    
    return { data: allProjects, error: null };
  } catch (error) {
    console.error("Error in getProjectsFromDB:", error);
    return { data: null, error: "Failed to fetch projects" };
  }
}

export async function getProjectsByCollaborator() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { data: [], error: "User not authenticated" };
    }
    
    const { data, error } = await supabase
      .from('collaborators')
      .select(`
        project_id,
        projects (*)
      `)
      .eq('email', userData.user.email)
      .eq('status', 'accepted');
      
    if (error) {
      console.error("Error fetching collaborator projects:", error);
      return { data: [], error: error.message };
    }
    
    // Process the data correctly to extract projects
    const projects = data && data.length > 0
      ? data
          .filter(item => item && item.projects) // Filter out null items
          .map(item => item.projects)            // Extract the projects object
      : [];
      
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
