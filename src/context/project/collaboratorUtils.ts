
import { CollaboratorFormData } from "@/types";
import { supabase } from "@/lib/supabase";

export const inviteCollaborator = async (
  projectId: string, 
  projectTitle: string, 
  data: CollaboratorFormData, 
  user: any
) => {
  if (!user) {
    return { 
      success: false, 
      error: "Authentication required. You need to sign in to invite collaborators" 
    };
  }
  
  try {
    // Check if the recipient user exists by email
    const { data: userExists, error: userError } = await supabase
      .from('collaborators')
      .select('*')
      .eq('email', data.email)
      .eq('project_id', projectId);
    
    if (userExists && userExists.length > 0) {
      return { 
        success: false, 
        error: "This user has already been invited to this project." 
      };
    }
    
    // Create a new collaborator record with 'pending' status
    const { data: collaborator, error } = await supabase
      .from('collaborators')
      .insert({
        project_id: projectId,
        email: data.email,
        role: data.role,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating collaborator:", error);
      return { 
        success: false, 
        error: error.message || "Failed to create invitation." 
      };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in inviteCollaborator:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    };
  }
};

export const acceptInvitation = async (
  collaboratorId: string, 
  user: any
) => {
  if (!user) {
    return { 
      success: false, 
      error: "Authentication required. You need to sign in to accept invitations" 
    };
  }
  
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .update({ status: 'accepted' })
      .eq('id', collaboratorId)
      .eq('email', user.email)
      .select()
      .single();
    
    if (error) {
      console.error("Error accepting invitation:", error);
      return { 
        success: false, 
        error: error.message || "Failed to accept invitation." 
      };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in acceptInvitation:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    };
  }
};

export const rejectInvitation = async (
  collaboratorId: string, 
  user: any
) => {
  if (!user) {
    return { 
      success: false, 
      error: "Authentication required. You need to sign in to reject invitations" 
    };
  }
  
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .update({ status: 'rejected' })
      .eq('id', collaboratorId)
      .eq('email', user.email)
      .select()
      .single();
    
    if (error) {
      console.error("Error rejecting invitation:", error);
      return { 
        success: false, 
        error: error.message || "Failed to reject invitation." 
      };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in rejectInvitation:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    };
  }
};

export const getInvitations = async (user: any) => {
  if (!user) {
    return { 
      data: null,
      success: false, 
      error: "Authentication required to get invitations" 
    };
  }
  
  try {
    console.log("Fetching invitations for user:", user.email);
    const { data, error } = await supabase
      .from('collaborators')
      .select(`
        *,
        projects:project_id (
          title,
          description
        )
      `)
      .eq('email', user.email)
      .eq('status', 'pending');
    
    if (error) {
      console.error("Error fetching invitations:", error);
      return { 
        data: null,
        success: false, 
        error: error.message || "Failed to get invitations." 
      };
    }
    
    console.log("Invitations found:", data);
    return { data, success: true, error: null };
  } catch (error) {
    console.error("Error in getInvitations:", error);
    return { 
      data: null,
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    };
  }
};
