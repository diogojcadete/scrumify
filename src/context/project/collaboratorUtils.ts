
import { CollaboratorFormData } from "@/types";
import { sendCollaboratorInvitation } from "@/lib/supabase";

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
    const result = await sendCollaboratorInvitation(projectId, projectTitle, data);
    
    if (!result.success) {
      return { 
        success: false, 
        error: result.error || "Failed to send invitation." 
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
