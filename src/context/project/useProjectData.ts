
import { useQuery } from "@tanstack/react-query";
import { 
  fetchProjects, 
  fetchSprints, 
  fetchColumns, 
  fetchTasks, 
  fetchBacklogItems, 
  fetchCollaborators 
} from "./queries";
import { combineTasksWithColumns } from "./utils";
import { Project } from "@/types";

export const useProjectData = (user: any, selectedProject: Project | null) => {
  const {
    data: projects = [],
    isLoading: isProjectsLoading
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(user),
    enabled: !!user
  });

  const {
    data: sprints = [],
    isLoading: isSprintsLoading
  } = useQuery({
    queryKey: ['sprints'],
    queryFn: () => fetchSprints(user),
    enabled: !!user
  });

  const {
    data: columnsData = [],
    isLoading: isColumnsLoading
  } = useQuery({
    queryKey: ['columns'],
    queryFn: () => fetchColumns(user),
    enabled: !!user
  });

  const {
    data: tasks = [],
    isLoading: isTasksLoading
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(user),
    enabled: !!user
  });

  const {
    data: backlogItems = [],
    isLoading: isBacklogItemsLoading
  } = useQuery({
    queryKey: ['backlogItems'],
    queryFn: () => fetchBacklogItems(user),
    enabled: !!user
  });

  const {
    data: collaborators = [],
    isLoading: isCollaboratorsLoading
  } = useQuery({
    queryKey: ['collaborators', selectedProject?.id],
    queryFn: () => fetchCollaborators(user, selectedProject?.id),
    enabled: !!user && !!selectedProject
  });

  const columns = combineTasksWithColumns(columnsData, tasks);

  const isLoading = 
    isProjectsLoading || 
    isSprintsLoading || 
    isColumnsLoading || 
    isTasksLoading || 
    isBacklogItemsLoading || 
    isCollaboratorsLoading;

  return {
    projects,
    sprints,
    columns,
    backlogItems,
    collaborators,
    isLoading
  };
};
