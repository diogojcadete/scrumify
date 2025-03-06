
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { BacklogItem, Column, Collaborator, Project, Sprint, Task } from "@/types";

export const fetchProjects = async (user: any) => {
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
  
  // Fetch projects where the user is a collaborator with 'accepted' status
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
    return ownedProjects.map(mapProject);
  }
  
  if (collaborations.length === 0) {
    return ownedProjects.map(mapProject);
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
    return ownedProjects.map(mapProject);
  }
  
  // Combine owned and collaborative projects
  const allProjects = [
    ...ownedProjects.map(mapProject),
    ...collabProjects.map(mapProject)
  ];
  
  // Remove duplicates (in case user is both owner and collaborator)
  return allProjects.filter((project, index, self) => 
    index === self.findIndex((p) => p.id === project.id)
  );
};

export const fetchSprints = async (user: any) => {
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
  
  return data.map(mapSprint);
};

export const fetchColumns = async (user: any) => {
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
  
  return data.map(mapColumn);
};

export const fetchTasks = async (user: any) => {
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
  
  return data.map(mapTask);
};

export const fetchBacklogItems = async (user: any) => {
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
  
  return data.map(mapBacklogItem);
};

export const fetchCollaborators = async (user: any, selectedProjectId: string | null) => {
  if (!user || !selectedProjectId) return [];
  
  const { data, error } = await supabase
    .from('collaborators')
    .select('*')
    .eq('project_id', selectedProjectId)
    .order('created_at', { ascending: false });
  
  if (error) {
    toast({
      title: "Error fetching collaborators",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
  
  return data.map(mapCollaborator);
};

// Helper functions to map database responses to our types
function mapProject(project: any): Project {
  return {
    ...project,
    ownerId: project.owner_id,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
    endGoal: project.end_goal
  };
}

function mapSprint(sprint: any): Sprint {
  return {
    ...sprint,
    projectId: sprint.project_id,
    startDate: new Date(sprint.start_date),
    endDate: new Date(sprint.end_date),
    isCompleted: sprint.is_completed,
    createdAt: new Date(sprint.created_at),
    updatedAt: new Date(sprint.updated_at)
  };
}

function mapColumn(column: any): Column {
  return {
    ...column,
    createdAt: new Date(column.created_at),
    updatedAt: new Date(column.updated_at),
    tasks: []
  };
}

function mapTask(task: any): Task {
  return {
    ...task,
    sprintId: task.sprint_id,
    columnId: task.column_id,
    storyPoints: task.story_points,
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at)
  };
}

function mapBacklogItem(item: any): BacklogItem {
  return {
    ...item,
    projectId: item.project_id,
    storyPoints: item.story_points,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  };
}

function mapCollaborator(collaborator: any): Collaborator {
  return {
    ...collaborator,
    projectId: collaborator.project_id,
    createdAt: new Date(collaborator.created_at),
    updatedAt: new Date(collaborator.updated_at)
  };
}
