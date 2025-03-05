import React, { createContext, useContext, useState, useEffect } from "react";
import { Project, Sprint, Column, Task, BacklogItem, ProjectFormData, SprintFormData, TaskFormData, BacklogItemFormData, Collaborator, CollaboratorFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  collaborators: Collaborator[];
  isLoading: boolean;
  createProject: (data: ProjectFormData) => Promise<void>;
  updateProject: (id: string, data: ProjectFormData) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string) => void;
  createSprint: (data: SprintFormData) => Promise<void>;
  updateSprint: (id: string, data: SprintFormData) => Promise<void>;
  completeSprint: (id: string) => Promise<void>;
  createColumn: (sprintId: string, title: string) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  createTask: (sprintId: string, columnId: string, data: TaskFormData) => Promise<void>;
  updateTask: (id: string, data: TaskFormData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string) => Promise<void>;
  createBacklogItem: (data: BacklogItemFormData) => Promise<void>;
  updateBacklogItem: (id: string, data: BacklogItemFormData) => Promise<void>;
  deleteBacklogItem: (id: string) => Promise<void>;
  moveBacklogItemToSprint: (backlogItemId: string, sprintId: string) => Promise<void>;
  addCollaborator: (data: CollaboratorFormData) => Promise<void>;
  removeCollaborator: (id: string) => Promise<void>;
  updateCollaborator: (id: string, data: CollaboratorFormData) => Promise<void>;
  isOwner: (projectId: string) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [user, setUser] = useState<any>(null);
  const queryClient = useQueryClient();

  // Set up auth listener
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setSelectedProject(null);
      }
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  // Query functions
  const fetchProjects = async () => {
    if (!user) return [];
    
    // Fetch projects owned by the user
    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    
    if (ownedError) {
      toast({
        title: "Error fetching owned projects",
        description: ownedError.message,
        variant: "destructive"
      });
      return [];
    }
    
    // Fetch projects where the user is a collaborator
    const { data: collaborations, error: collabError } = await supabase
      .from('collaborators')
      .select('project_id, status')
      .eq('email', user.email)
      .eq('status', 'accepted');
    
    if (collabError) {
      toast({
        title: "Error fetching collaborations",
        description: collabError.message,
        variant: "destructive"
      });
      return ownedProjects.map(project => ({
        ...project,
        ownerId: project.owner_id,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at)
      }));
    }
    
    if (collaborations.length === 0) {
      return ownedProjects.map(project => ({
        ...project,
        ownerId: project.owner_id,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at)
      }));
    }
    
    const projectIds = collaborations.map(collab => collab.project_id);
    
    const { data: collabProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);
    
    if (projectsError) {
      toast({
        title: "Error fetching collaborative projects",
        description: projectsError.message,
        variant: "destructive"
      });
      return ownedProjects.map(project => ({
        ...project,
        ownerId: project.owner_id,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at)
      }));
    }
    
    // Combine owned and collaborative projects
    const allProjects = [
      ...ownedProjects.map(project => ({
        ...project,
        ownerId: project.owner_id,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at)
      })),
      ...collabProjects.map(project => ({
        ...project,
        ownerId: project.owner_id,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at)
      }))
    ];
    
    // Remove duplicates (in case user is both owner and collaborator)
    return allProjects.filter((project, index, self) => 
      index === self.findIndex((p) => p.id === project.id)
    );
  };

  const fetchSprints = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching sprints",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    return data.map(sprint => ({
      ...sprint,
      projectId: sprint.project_id,
      startDate: new Date(sprint.start_date),
      endDate: new Date(sprint.end_date),
      isCompleted: sprint.is_completed,
      createdAt: new Date(sprint.created_at),
      updatedAt: new Date(sprint.updated_at)
    }));
  };

  const fetchColumns = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching columns",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    return data.map(column => ({
      ...column,
      createdAt: new Date(column.created_at),
      updatedAt: new Date(column.updated_at),
      tasks: []
    }));
  };

  const fetchTasks = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    return data.map(task => ({
      ...task,
      sprintId: task.sprint_id,
      columnId: task.column_id,
      storyPoints: task.story_points,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }));
  };

  const fetchBacklogItems = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('backlog_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching backlog items",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    return data.map(item => ({
      ...item,
      projectId: item.project_id,
      storyPoints: item.story_points,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  };

  const fetchCollaborators = async () => {
    if (!user || !selectedProject) return [];
    
    const { data, error } = await supabase
      .from('collaborators')
      .select('*')
      .eq('project_id', selectedProject.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching collaborators",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    return data.map(collaborator => ({
      ...collaborator,
      projectId: collaborator.project_id,
      createdAt: new Date(collaborator.created_at),
      updatedAt: new Date(collaborator.updated_at)
    }));
  };

  // Queries
  const {
    data: projects = [],
    isLoading: isProjectsLoading
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: !!user
  });

  const {
    data: sprints = [],
    isLoading: isSprintsLoading
  } = useQuery({
    queryKey: ['sprints'],
    queryFn: fetchSprints,
    enabled: !!user
  });

  const {
    data: columnsData = [],
    isLoading: isColumnsLoading
  } = useQuery({
    queryKey: ['columns'],
    queryFn: fetchColumns,
    enabled: !!user
  });

  const {
    data: tasks = [],
    isLoading: isTasksLoading
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    enabled: !!user
  });

  const {
    data: backlogItems = [],
    isLoading: isBacklogItemsLoading
  } = useQuery({
    queryKey: ['backlogItems'],
    queryFn: fetchBacklogItems,
    enabled: !!user
  });

  const {
    data: collaborators = [],
    isLoading: isCollaboratorsLoading
  } = useQuery({
    queryKey: ['collaborators', selectedProject?.id],
    queryFn: fetchCollaborators,
    enabled: !!user && !!selectedProject
  });

  // Combine tasks with columns
  const columns = columnsData.map(column => ({
    ...column,
    tasks: tasks.filter(task => task.columnId === column.id)
  }));

  const isLoading = 
    isProjectsLoading || 
    isSprintsLoading || 
    isColumnsLoading || 
    isTasksLoading || 
    isBacklogItemsLoading || 
    isCollaboratorsLoading;

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      if (!user) throw new Error("You must be signed in to create a project");
      
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          title: data.title,
          description: data.description,
          end_goal: data.endGoal
        })
        .select()
        .single();
      
      if (error) throw error;
      return newProject;
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
      const { error } = await supabase
        .from('projects')
        .update({
          title: data.title,
          description: data.description,
          end_goal: data.endGoal,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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

  const createSprintMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: SprintFormData }) => {
      const { error } = await supabase
        .from('sprints')
        .insert({
          project_id: projectId,
          title: data.title,
          description: data.description,
          start_date: data.startDate.toISOString(),
          end_date: data.endDate.toISOString(),
          is_completed: false
        });
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('sprints')
        .update({
          title: data.title,
          description: data.description,
          start_date: data.startDate.toISOString(),
          end_date: data.endDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('sprints')
        .update({
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
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

  const createColumnMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          title
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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

  const createTaskMutation = useMutation({
    mutationFn: async ({ sprintId, columnId, data }: { sprintId: string, columnId: string, data: TaskFormData }) => {
      const { error } = await supabase
        .from('tasks')
        .insert({
          sprint_id: sprintId,
          column_id: columnId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          assignee: data.assignee,
          story_points: data.storyPoints
        });
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('tasks')
        .update({
          title: data.title,
          description: data.description,
          priority: data.priority,
          assignee: data.assignee,
          story_points: data.storyPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('tasks')
        .update({
          column_id: destinationColumnId,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);
      
      if (error) throw error;
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

  const createBacklogItemMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: BacklogItemFormData }) => {
      const { error } = await supabase
        .from('backlog_items')
        .insert({
          project_id: projectId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          story_points: data.storyPoints
        });
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('backlog_items')
        .update({
          title: data.title,
          description: data.description,
          priority: data.priority,
          story_points: data.storyPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('backlog_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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

  const addCollaboratorMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: CollaboratorFormData }) => {
      const { error } = await supabase
        .from('collaborators')
        .insert({
          project_id: projectId,
          email: data.email,
          role: data.role,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', selectedProject?.id] });
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
      const { error } = await supabase
        .from('collaborators')
        .update({
          email: data.email,
          role: data.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', selectedProject?.id] });
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
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', selectedProject?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing collaborator",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    const createDefaultColumns = async () => {
      if (!user || isLoading) return;
      
      const defaultColumns = ["TO DO", "IN PROGRESS", "DONE"];
      const existingColumnTitles = columns.map(col => col.title);
      
      for (const title of defaultColumns) {
        if (!existingColumnTitles.includes(title)) {
          await createColumnMutation.mutateAsync(title);
        }
      }
    };
    
    createDefaultColumns();
  }, [user, isLoading, columns]);

  const createProject = async (data: ProjectFormData) => {
    try {
      const newProject = await createProjectMutation.mutateAsync(data);
      toast({
        title: "Project created",
        description: `${data.title} has been created successfully.`,
      });
      setSelectedProject(newProject);
    } catch (error) {
      console.error(error);
    }
  };

  const updateProject = async (id: string, data: ProjectFormData) => {
    try {
      await updateProjectMutation.mutateAsync({ id, data });
      
      if (selectedProject && selectedProject.id === id) {
        const updatedProject = {
          ...selectedProject,
          ...data,
          updatedAt: new Date()
        };
        setSelectedProject(updatedProject);
      }
      
      toast({
        title: "Project updated",
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const projectToDelete = projects.find(project => project.id === id);
      if (!projectToDelete) return;
      
      await deleteProjectMutation.mutateAsync(id);
      
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject(null);
      }
      
      toast({
        title: "Project deleted",
        description: `${projectToDelete.title} has been deleted successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const selectProject = (id: string) => {
    if (!id) {
      setSelectedProject(null);
      return;
    }
    
    const project = projects.find(p => p.id === id);
    if (project) {
      setSelectedProject(project);
    }
  };

  const createSprint = async (data: SprintFormData) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createSprintMutation.mutateAsync({ 
        projectId: selectedProject.id, 
        data 
      });
      
      toast({
        title: "Sprint created",
        description: `${data.title} has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateSprint = async (id: string, data: SprintFormData) => {
    try {
      await updateSprintMutation.mutateAsync({ id, data });
      
      toast({
        title: "Sprint updated",
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const completeSprint = async (id: string) => {
    try {
      await completeSprintMutation.mutateAsync(id);
      
      const sprint = sprints.find(s => s.id === id);
      if (sprint) {
        toast({
          title: "Sprint completed",
          description: `${sprint.title} has been marked as completed.`,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createColumn = async (sprintId: string, title: string) => {
    const columnExists = columns.some(col => col.title === title);
    
    if (columnExists) {
      toast({
        title: "Column already exists",
        description: `A column named "${title}" already exists.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createColumnMutation.mutateAsync(title);
      
      toast({
        title: "Column created",
        description: `${title} column has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteColumn = async (id: string) => {
    const columnToDelete = columns.find(column => column.id === id);
    if (!columnToDelete) return;
    
    if (columnToDelete.tasks.length > 0) {
      toast({
        title: "Cannot delete column",
        description: "This column still has tasks. Move or delete them first.",
        variant: "destructive"
      });
      return;
    }
    
    if (["TO DO", "IN PROGRESS", "DONE"].includes(columnToDelete.title)) {
      toast({
        title: "Cannot delete default column",
        description: "The default columns (TO DO, IN PROGRESS, DONE) cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await deleteColumnMutation.mutateAsync(id);
      
      toast({
        title: "Column deleted",
        description: `${columnToDelete.title} column has been deleted successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createTask = async (sprintId: string, columnId: string, data: TaskFormData) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) {
      toast({
        title: "Error",
        description: "Column not found.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createTaskMutation.mutateAsync({
        sprintId,
        columnId,
        data
      });
      
      toast({
        title: "Task created",
        description: `${data.title} has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateTask = async (id: string, data: TaskFormData) => {
    try {
      await updateTaskMutation.mutateAsync({ id, data });
      
      toast({
        title: "Task updated",
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id: string) => {
    let taskTitle = "";
    
    for (const column of columns) {
      const taskToDelete = column.tasks.find(task => task.id === id);
      if (taskToDelete) {
        taskTitle = taskToDelete.title;
        break;
      }
    }
    
    try {
      await deleteTaskMutation.mutateAsync(id);
      
      if (taskTitle) {
        toast({
          title: "Task deleted",
          description: `${taskTitle} has been deleted successfully.`,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const moveTask = async (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    const sourceColumn = columns.find(col => col.id === sourceColumnId);
    if (!sourceColumn) return;
    
    const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    try {
      await moveTaskMutation.mutateAsync({
        taskId,
        destinationColumnId
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createBacklogItem = async (data: BacklogItemFormData) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createBacklogItemMutation.mutateAsync({
        projectId: selectedProject.id,
        data
      });
      
      toast({
        title: "Backlog item created",
        description: `${data.title} has been added to the backlog.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateBacklogItem = async (id: string, data: BacklogItemFormData) => {
    try {
      await updateBacklogItemMutation.mutateAsync({ id, data });
      
      toast({
        title: "Backlog item updated",
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteBacklogItem = async (id: string) => {
    const itemToDelete = backlogItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    try {
      await deleteBacklogItemMutation.mutateAsync(id);
      
      toast({
        title: "Backlog item deleted",
        description: `${itemToDelete.title} has been deleted from the backlog.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const moveBacklogItemToSprint = async (backlogItemId: string, sprintId: string) => {
    const backlogItem = backlogItems.find(item => item.id === backlogItemId);
    if (!backlogItem) return;
    
    const todoColumn = columns.find(col => col.title === "TO DO");
    if (!todoColumn) {
      toast({
        title: "Error",
        description: "TO DO column not found. Please create a sprint first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createTaskMutation.mutateAsync({
        sprintId,
        columnId: todoColumn.id,
        data: {
          title: backlogItem.title,
          description: backlogItem.description,
          priority: backlogItem.priority,
          assignee: "",
          storyPoints: backlogItem.storyPoints
        }
      });
      
      await deleteBacklogItemMutation.mutateAsync(backlogItemId);
      
      toast({
        title: "Item moved to sprint",
        description: `${backlogItem.title} has been moved to the selected sprint.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const addCollaborator = async (data: CollaboratorFormData) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addCollaboratorMutation.mutateAsync({ 
        projectId: selectedProject.id, 
        data 
      });
      
      toast({
        title: "Collaborator invited",
        description: `Invitation sent to ${data.email}.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateCollaborator = async (id: string, data: CollaboratorFormData) => {
    try {
      await updateCollaboratorMutation.mutateAsync({ id, data });
      
      toast({
        title: "Collaborator updated",
        description: `Collaborator details updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const removeCollaborator = async (id: string) => {
    const collaboratorToRemove = collaborators.find(collab => collab.id === id);
    if (!collaboratorToRemove) return;
    
    try {
      await removeCollaboratorMutation.mutateAsync(id);
      
      toast({
        title: "Collaborator removed",
        description: `${collaboratorToRemove.email} has been removed from the project.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isOwner = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.ownerId === user?.id;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        sprints,
        columns,
        backlogItems,
        collaborators,
        isLoading,
        createProject,
        updateProject,
        deleteProject,
        selectProject,
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
        moveBacklogItemToSprint,
        addCollaborator,
        updateCollaborator,
        removeCollaborator,
        isOwner
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
