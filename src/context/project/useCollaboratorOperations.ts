
import { useProjectMutations } from "./hooks";
import { showToast } from "./utils";
import { CollaboratorFormData } from "@/types";

export const useCollaboratorOperations = (user: any, collaborators: any[], selectedProject: any) => {
  const {
    addCollaboratorMutation,
    updateCollaboratorMutation,
    removeCollaboratorMutation,
    acceptCollaboratorInviteMutation,
    declineCollaboratorInviteMutation
  } = useProjectMutations(user);

  const addCollaborator = async (data: CollaboratorFormData) => {
    if (!selectedProject) {
      showToast("Error", "No project selected.", "destructive");
      return;
    }
    
    try {
      await addCollaboratorMutation.mutateAsync({ 
        projectId: selectedProject.id, 
        data 
      });
      
      showToast("Collaborator invited", `Invitation sent to ${data.email}.`);
    } catch (error) {
      console.error(error);
    }
  };

  const updateCollaborator = async (id: string, data: CollaboratorFormData) => {
    try {
      await updateCollaboratorMutation.mutateAsync({ id, data });
      
      showToast("Collaborator updated", `Collaborator details updated successfully.`);
    } catch (error) {
      console.error(error);
    }
  };

  const removeCollaborator = async (id: string) => {
    const collaboratorToRemove = collaborators.find(collab => collab.id === id);
    if (!collaboratorToRemove) return;
    
    try {
      await removeCollaboratorMutation.mutateAsync(id);
      
      showToast("Collaborator removed", `${collaboratorToRemove.email} has been removed from the project.`);
    } catch (error) {
      console.error(error);
    }
  };

  const acceptCollaboratorInvite = async (id: string) => {
    try {
      await acceptCollaboratorInviteMutation.mutateAsync(id);
      showToast("Invitation accepted", "You now have access to this project.");
    } catch (error) {
      console.error(error);
    }
  };

  const declineCollaboratorInvite = async (id: string) => {
    try {
      await declineCollaboratorInviteMutation.mutateAsync(id);
      showToast("Invitation declined", "The invitation has been declined.");
    } catch (error) {
      console.error(error);
    }
  };

  return {
    addCollaborator,
    updateCollaborator,
    removeCollaborator,
    acceptCollaboratorInvite,
    declineCollaboratorInvite
  };
};
