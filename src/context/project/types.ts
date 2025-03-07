
import { 
  BacklogItem, 
  Collaborator, 
  Column, 
  Project, 
  Sprint, 
  Task,
  BacklogItemFormData,
  CollaboratorFormData,
  ProjectFormData,
  SprintFormData,
  TaskFormData 
} from "@/types";

export interface ProjectContextType {
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
