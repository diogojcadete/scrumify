
import { CollaboratorFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  sendCollaboratorInvitation, 
  getInvitationsForUser, 
  updateInvitationStatus 
} from "@/lib/supabase";

export const inviteCollaborator = async (
  projectId: string,
  projectTitle: string,
  data: CollaboratorFormData
) => {
  try {
    const { success, error, data: collaboratorData } = await sendCollaboratorInvitation(
      projectId,
      projectTitle,
      data
    );

    if (!success) {
      toast({
        title: "Error",
        description: error || "Failed to send invitation. Please try again.",
        variant: "destructive"
      });
      return { success: false, error, data: null };
    }

    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${data.email}.`
    });

    return { success: true, error: null, data: collaboratorData };
  } catch (error) {
    console.error("Error in inviteCollaborator:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive"
    });
    return { success: false, error: "Failed to send invitation", data: null };
  }
};

export const fetchInvitations = async (email: string) => {
  try {
    const { data, error } = await getInvitationsForUser(email);

    if (error) {
      console.error("Error fetching invitations:", error);
      return { success: false, data: null, error };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error("Error in fetchInvitations:", error);
    return { success: false, data: null, error: "Failed to fetch invitations" };
  }
};

export const acceptInvitation = async (collaboratorId: string) => {
  try {
    const { success, error, data, projectsData } = await updateInvitationStatus(collaboratorId, "accepted");

    if (!success) {
      toast({
        title: "Error",
        description: error || "Failed to accept invitation. Please try again.",
        variant: "destructive"
      });
      return { success: false, error, projectsData: null };
    }

    toast({
      title: "Invitation accepted",
      description: "You are now a collaborator on this project."
    });

    return { success: true, error: null, projectsData };
  } catch (error) {
    console.error("Error in acceptInvitation:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive"
    });
    return { success: false, error: "Failed to accept invitation", projectsData: null };
  }
};

export const rejectInvitation = async (collaboratorId: string) => {
  try {
    const { success, error } = await updateInvitationStatus(collaboratorId, "rejected");

    if (!success) {
      toast({
        title: "Error",
        description: error || "Failed to reject invitation. Please try again.",
        variant: "destructive"
      });
      return { success: false, error };
    }

    toast({
      title: "Invitation rejected",
      description: "The invitation has been rejected."
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in rejectInvitation:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive"
    });
    return { success: false, error: "Failed to reject invitation" };
  }
};
