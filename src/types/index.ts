
export interface Project {
  id: string;
  title: string;
  description: string;
  endGoal: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  projectId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee: string;
  storyPoints: number;
  columnId: string;
  sprintId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BacklogItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  storyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFormData {
  title: string;
  description: string;
  endGoal: string;
}

export interface SprintFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  justification?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee: string;
  storyPoints: number;
}

export interface BacklogItemFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  storyPoints: number;
}
