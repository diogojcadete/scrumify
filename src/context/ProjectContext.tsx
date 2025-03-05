
import React, { createContext, useContext } from "react";
import { ProjectContextType } from "./project/types";
import { useAuthState } from "@/hooks/useAuthState";
import { useProjectData } from "./project/useProjectData";
import { useProjectOperations } from "./project/useProjectOperations";
import { useSprintOperations } from "./project/useSprintOperations";
import { useColumnOperations } from "./project/useColumnOperations";
import { useTaskOperations } from "./project/useTaskOperations";
import { useBacklogOperations } from "./project/useBacklogOperations";
import { useCollaboratorOperations } from "./project/useCollaboratorOperations";
import { useDefaultColumns } from "./project/useDefaultColumns";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthState();

  const {
    selectedProject,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    isOwner
  } = useProjectOperations(user, [], [], [], []);

  const {
    projects,
    sprints,
    columns,
    backlogItems,
    collaborators,
    isLoading
  } = useProjectData(user, selectedProject);

  // Initialize the project operations with actual data
  const projectOps = useProjectOperations(user, projects, columns, backlogItems, collaborators);
  
  const {
    createSprint,
    updateSprint,
    completeSprint
  } = useSprintOperations(user, sprints, selectedProject);

  const {
    createColumn,
    deleteColumn
  } = useColumnOperations(user, columns);

  const {
    createTask,
    updateTask,
    deleteTask,
    moveTask
  } = useTaskOperations(user, columns);

  const {
    createBacklogItem,
    updateBacklogItem,
    deleteBacklogItem,
    moveBacklogItemToSprint
  } = useBacklogOperations(user, backlogItems, columns, selectedProject);

  const {
    addCollaborator,
    updateCollaborator,
    removeCollaborator,
    acceptCollaboratorInvite,
    declineCollaboratorInvite
  } = useCollaboratorOperations(user, collaborators, selectedProject);

  // Initialize default columns
  useDefaultColumns(user, isLoading, columns);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject: projectOps.selectedProject || selectedProject,
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
        isOwner,
        acceptCollaboratorInvite,
        declineCollaboratorInvite
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
