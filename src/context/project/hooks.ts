import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import * as mutations from "./mutations";
import { 
  BacklogItemFormData, 
  CollaboratorFormData, 
  ProjectFormData, 
  SprintFormData, 
  TaskFormData 
} from "@/types";

export const useProjectMutations = (user: any) => {
  const queryClient = useQueryClient();

  // Project mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      return mutations.createProject(user, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: ProjectFormData }) => {
      await mutations.updateProject(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await mutations.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['backlogItems'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Sprint mutations
  const createSprintMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: SprintFormData }) => {
      await mutations.createSprint(projectId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating sprint",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateSprintMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: SprintFormData }) => {
      await mutations.updateSprint(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating sprint",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const completeSprintMutation = useMutation({
    mutationFn: async (id: string) => {
      await mutations.completeSprint(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error completing sprint",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Column mutations
  const createColumnMutation = useMutation({
    mutationFn: async (title: string) => {
      return mutations.createColumn(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating column",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (id: string) => {
      await mutations.deleteColumn(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting column",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Task mutations
  const createTaskMutation = useMutation({
    mutationFn: async ({ sprintId, columnId, data }: { sprintId: string, columnId: string, data: TaskFormData }) => {
      await mutations.createTask(sprintId, columnId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: TaskFormData }) => {
      await mutations.updateTask(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await mutations.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, destinationColumnId }: { taskId: string, destinationColumnId: string }) => {
      await mutations.moveTask(taskId, destinationColumnId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error moving task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Backlog item mutations
  const createBacklogItemMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: BacklogItemFormData }) => {
      await mutations.createBacklogItem(projectId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlogItems'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating backlog item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateBacklogItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: BacklogItemFormData }) => {
      await mutations.updateBacklogItem(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlogItems'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating backlog item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteBacklogItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await mutations.deleteBacklogItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlogItems'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting backlog item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Collaborator mutations
  const addCollaboratorMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: CollaboratorFormData }) => {
      await mutations.addCollaborator(projectId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', variables.projectId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding collaborator",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateCollaboratorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: CollaboratorFormData }) => {
      await mutations.updateCollaborator(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating collaborator",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (id: string) => {
      await mutations.removeCollaborator(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing collaborator",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const acceptCollaboratorInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      await mutations.acceptCollaboratorInvite(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error accepting invitation",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const declineCollaboratorInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      await mutations.declineCollaboratorInvite(id);
    },
    onSuccess: () => {
      // No need to refresh projects since we're just removing an invitation
    },
    onError: (error: any) => {
      toast({
        title: "Error declining invitation",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    createProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
    createSprintMutation,
    updateSprintMutation,
    completeSprintMutation,
    createColumnMutation,
    deleteColumnMutation,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    moveTaskMutation,
    createBacklogItemMutation,
    updateBacklogItemMutation,
    deleteBacklogItemMutation,
    addCollaboratorMutation,
    updateCollaboratorMutation,
    removeCollaboratorMutation,
    acceptCollaboratorInviteMutation,
    declineCollaboratorInviteMutation
  };
};
