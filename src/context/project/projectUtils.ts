
import { Project, ProjectFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { 
  createProjectInDB, 
  getProjectsFromDB, 
  updateProjectInDB, 
  deleteProjectFromDB,
} from "@/lib/supabase";

export const fetchProjects = async (user: any) => {
  if (!user) return { data: null, error: "No user is logged in" };
  
  try {
    const { data, error } = await getProjectsFromDB();
    
    if (error) {
      console.error("Error fetching projects:", error);
      return { data: null, error: error.message };
    }
    
    if (data) {
      // Convert database date strings to Date objects
      const formattedProjects = data.map(project => ({
        ...project,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        ownerId: project.owner_id
      }));
      
      return { data: formattedProjects, error: null };
    }
    
    return { data: [], error: null };
  } catch (error) {
    console.error("Error in fetchProjects:", error);
    return { data: null, error: "Failed to fetch projects" };
  }
};

export const createProject = async (data: ProjectFormData, user: any) => {
  if (!user) {
    return { 
      data: null, 
      error: "Authentication required. You need to sign in to create a project" 
    };
  }
  
  try {
    const { data: newProject, error } = await createProjectInDB(data, user.id);
    
    if (error) {
      console.error("Error creating project:", error);
      return { data: null, error: "Failed to create project. Please try again." };
    }
    
    if (newProject) {
      // Convert database fields to match our Project type
      const formattedProject = {
        id: newProject.id,
        title: newProject.title,
        description: newProject.description,
        endGoal: newProject.end_goal,
        ownerId: newProject.owner_id,
        createdAt: new Date(newProject.created_at),
        updatedAt: new Date(newProject.updated_at)
      };
      
      return { data: formattedProject, error: null };
    }
    
    return { data: null, error: "No project data returned" };
  } catch (error) {
    console.error("Error in createProject:", error);
    return { data: null, error: "An unexpected error occurred. Please try again." };
  }
};

export const updateProject = async (id: string, data: ProjectFormData, user: any) => {
  if (!user) {
    return { 
      data: null, 
      error: "Authentication required. You need to sign in to update a project" 
    };
  }
  
  try {
    const { data: updatedProject, error } = await updateProjectInDB(id, data);
    
    if (error) {
      console.error("Error updating project:", error);
      return { data: null, error: "Failed to update project. Please try again." };
    }
    
    if (updatedProject) {
      // Convert database fields to match our Project type
      const formattedProject = {
        id: updatedProject.id,
        title: updatedProject.title,
        description: updatedProject.description,
        endGoal: updatedProject.end_goal,
        ownerId: updatedProject.owner_id,
        createdAt: new Date(updatedProject.created_at),
        updatedAt: new Date(updatedProject.updated_at)
      };
      
      return { data: formattedProject, error: null };
    }
    
    return { data: null, error: "No project data returned" };
  } catch (error) {
    console.error("Error in updateProject:", error);
    return { data: null, error: "An unexpected error occurred. Please try again." };
  }
};

export const deleteProject = async (id: string, user: any) => {
  if (!user) {
    return { 
      success: false, 
      error: "Authentication required. You need to sign in to delete a project" 
    };
  }
  
  try {
    const { error } = await deleteProjectFromDB(id);
    
    if (error) {
      console.error("Error deleting project:", error);
      return { success: false, error: "Failed to delete project. Please try again." };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteProject:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
};
