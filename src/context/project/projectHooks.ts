import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { 
  createProject, 
  updateProject, 
  deleteProject,
  createSprint,
  updateSprint,
  completeSprint,
  createColumn,
  deleteColumn,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  createBacklogItem,
  updateBacklogItem,
  deleteBacklogItem,
  inviteCollaborator,
  removeCollaborator,
  updateCollaboratorStatus
} from "./mutations";

export const useProjectMutations = (user: any) => {
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => createProject(user, data),
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
    mutationFn: async ({ id, data }: { id: string, data: any }) => updateProject(id, data),
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
    mutationFn: async (id: string) => deleteProject(id),
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

  const createSprintMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: any }) => 
      createSprint(projectId, data),
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
    mutationFn: async ({ id, data }: { id: string, data: any }) => updateSprint(id, data),
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
    mutationFn: async (id: string) => completeSprint(id),
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

  const createColumnMutation = useMutation({
    mutationFn: async (title: string) => createColumn(title),
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
    mutationFn: async (id: string) => deleteColumn(id),
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

  const createTaskMutation = useMutation({
    mutationFn: async ({ sprintId, columnId, data }: { sprintId: string, columnId: string, data: any }) => 
      createTask(sprintId, columnId, data),
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
    mutationFn: async ({ id, data }: { id: string, data: any }) => updateTask(id, data),
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
    mutationFn: async (id: string) => deleteTask(id),
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
    mutationFn: async ({ taskId, destinationColumnId }: { taskId: string, destinationColumnId: string }) => 
      moveTask(taskId, destinationColumnId),
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

  const createBacklogItemMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: any }) => 
      createBacklogItem(projectId, data),
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
    mutationFn: async ({ id, data }: { id: string, data: any }) => updateBacklogItem(id, data),
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
    mutationFn: async (id: string) => deleteBacklogItem(id),
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

  const inviteCollaboratorMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: any }) => 
      inviteCollaborator(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error inviting collaborator",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (id: string) => removeCollaborator(id),
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

  const updateCollaboratorStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'accepted' | 'rejected' }) =>
      updateCollaboratorStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating invitation status",
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
    inviteCollaboratorMutation,
    removeCollaboratorMutation,
    updateCollaboratorStatusMutation
  };
};
