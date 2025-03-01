
import { SprintFormData } from "@/types";
import {
  createSprintInDB,
  getSprintsFromDB,
  updateSprintInDB,
  completeSprintInDB,
  deleteSprintFromDB
} from "@/lib/supabase";

export const fetchSprints = async (user: any) => {
  if (!user) return { data: null, error: "No user is logged in" };
  
  try {
    const { data, error } = await getSprintsFromDB();
    
    if (error) {
      console.error("Error fetching sprints:", error);
      return { data: null, error: error.message };
    }
    
    if (data) {
      // Convert database fields to match our Sprint type
      const formattedSprints = data.map(sprint => ({
        id: sprint.id,
        projectId: sprint.project_id,
        title: sprint.title,
        description: sprint.description,
        startDate: new Date(sprint.start_date),
        endDate: new Date(sprint.end_date),
        isCompleted: sprint.is_completed,
        createdAt: new Date(sprint.created_at),
        updatedAt: new Date(sprint.updated_at)
      }));
      
      return { data: formattedSprints, error: null };
    }
    
    return { data: [], error: null };
  } catch (error) {
    console.error("Error in fetchSprints:", error);
    return { data: null, error: "Failed to fetch sprints" };
  }
};

export const createSprint = async (data: SprintFormData, projectId: string, user: any) => {
  if (!user) {
    return { 
      data: null, 
      error: "Authentication required. You need to sign in to create a sprint" 
    };
  }
  
  try {
    const { data: newSprint, error } = await createSprintInDB(data, projectId);
    
    if (error) {
      console.error("Error creating sprint:", error);
      return { data: null, error: "Failed to create sprint. Please try again." };
    }
    
    if (newSprint) {
      // Convert database fields to match our Sprint type
      const formattedSprint = {
        id: newSprint.id,
        projectId: newSprint.project_id,
        title: newSprint.title,
        description: newSprint.description,
        startDate: new Date(newSprint.start_date),
        endDate: new Date(newSprint.end_date),
        isCompleted: newSprint.is_completed,
        createdAt: new Date(newSprint.created_at),
        updatedAt: new Date(newSprint.updated_at)
      };
      
      return { data: formattedSprint, error: null };
    }
    
    return { data: null, error: "No sprint data returned" };
  } catch (error) {
    console.error("Error in createSprint:", error);
    return { data: null, error: "An unexpected error occurred. Please try again." };
  }
};

export const updateSprint = async (id: string, data: SprintFormData, user: any) => {
  if (!user) {
    return { 
      data: null, 
      error: "Authentication required. You need to sign in to update a sprint" 
    };
  }
  
  try {
    const { data: updatedSprint, error } = await updateSprintInDB(id, data);
    
    if (error) {
      console.error("Error updating sprint:", error);
      return { data: null, error: "Failed to update sprint. Please try again." };
    }
    
    if (updatedSprint) {
      // Convert database fields to match our Sprint type
      const formattedSprint = {
        id: updatedSprint.id,
        projectId: updatedSprint.project_id,
        title: updatedSprint.title,
        description: updatedSprint.description,
        startDate: new Date(updatedSprint.start_date),
        endDate: new Date(updatedSprint.end_date),
        isCompleted: updatedSprint.is_completed,
        createdAt: new Date(updatedSprint.created_at),
        updatedAt: new Date(updatedSprint.updated_at)
      };
      
      return { data: formattedSprint, error: null };
    }
    
    return { data: null, error: "No sprint data returned" };
  } catch (error) {
    console.error("Error in updateSprint:", error);
    return { data: null, error: "An unexpected error occurred. Please try again." };
  }
};

export const completeSprint = async (id: string, user: any) => {
  if (!user) {
    return { 
      data: null, 
      error: "Authentication required. You need to sign in to complete a sprint" 
    };
  }
  
  try {
    const { data: updatedSprint, error } = await completeSprintInDB(id);
    
    if (error) {
      console.error("Error completing sprint:", error);
      return { data: null, error: "Failed to complete sprint. Please try again." };
    }
    
    if (updatedSprint) {
      // Convert database fields to match our Sprint type
      const formattedSprint = {
        id: updatedSprint.id,
        projectId: updatedSprint.project_id,
        title: updatedSprint.title,
        description: updatedSprint.description,
        startDate: new Date(updatedSprint.start_date),
        endDate: new Date(updatedSprint.end_date),
        isCompleted: updatedSprint.is_completed,
        createdAt: new Date(updatedSprint.created_at),
        updatedAt: new Date(updatedSprint.updated_at)
      };
      
      return { data: formattedSprint, error: null };
    }
    
    return { data: null, error: "No sprint data returned" };
  } catch (error) {
    console.error("Error in completeSprint:", error);
    return { data: null, error: "An unexpected error occurred. Please try again." };
  }
};
