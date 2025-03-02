
import { Collaborator, CollaboratorFormData, Project } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { 
  sendCollaboratorInvitation,
  getInvitationsForUser,
  updateInvitationStatus
} from "@/lib/supabase";

export const inviteCollaborator = async (
  projectId: string, 
  collaboratorData: CollaboratorFormData,
  projects: Project[]
) => {
  try {
    // Find the project to get its title
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return { 
        data: null, 
        error: "Project not found" 
      };
    }
    
    const { success, error } = await sendCollaboratorInvitation(
      projectId, 
      project.title, 
      collaboratorData
    );
    
    if (!success) {
      toast({
        title: "Failed to send invitation",
        description: error,
        variant: "destructive"
      });
      
      return { data: null, error };
    }
    
    toast({
      title: "Invitation sent",
      description: `Invitation sent to ${collaboratorData.email}`
    });
    
    // Create a client-side representation of the collaborator
    const newCollaborator: Collaborator = {
      id: crypto.randomUUID(), // This will be replaced by actual ID from DB
      projectId,
      email: collaboratorData.email,
      role: collaboratorData.role,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return { data: newCollaborator, error: null };
  } catch (error) {
    console.error("Error inviting collaborator:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
};

export const fetchInvitations = async (email: string) => {
  try {
    const { data, error } = await getInvitationsForUser(email);
    
    if (error) {
      console.error("Error fetching invitations:", error);
      return { data: null, error, success: false };
    }
    
    if (!data || data.length === 0) {
      return { data: [], error: null, success: true };
    }
    
    // Transform from DB format to our application format with null checks
    const invitations = data.map(item => {
      // Check if projects exists and has necessary properties
      const projectId = item.projects?.id || null;
      const projectTitle = item.projects?.title || "Unknown Project";
      const projectDescription = item.projects?.description || "";
      
      if (!projectId) {
        console.warn("Invitation has null project reference:", item);
      }
      
      return {
        id: item.id,
        projectId,
        projectTitle,
        projectDescription,
        email: item.email,
        role: item.role,
        status: item.status,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.created_at)
      };
    }).filter(invitation => invitation.projectId !== null); // Filter out invalid invitations
    
    return { data: invitations, error: null, success: true };
  } catch (error) {
    console.error("Error in fetchInvitations:", error);
    return { data: null, error: "Failed to fetch invitations", success: false };
  }
};

export const acceptInvitation = async (collaboratorId: string) => {
  try {
    const { success, error, data } = await updateInvitationStatus(collaboratorId, "accepted");
    
    if (!success) {
      toast({
        title: "Failed to accept invitation",
        description: error,
        variant: "destructive"
      });
      
      return { success: false, error };
    }
    
    toast({
      title: "Invitation accepted",
      description: "You have successfully joined the project"
    });
    
    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

export const rejectInvitation = async (collaboratorId: string) => {
  try {
    const { success, error } = await updateInvitationStatus(collaboratorId, "rejected");
    
    if (!success) {
      toast({
        title: "Failed to reject invitation",
        description: error,
        variant: "destructive"
      });
      
      return { success: false, error };
    }
    
    toast({
      title: "Invitation rejected",
      description: "You have declined to join the project"
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Explicitly export the fetchInvitations function as getInvitations for backward compatibility
export const getInvitations = fetchInvitations;
