
import React from "react";
import Project from "./Project";
import CollaboratorsList from "./CollaboratorsList";
import { useProject } from "@/context/ProjectContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProjectWrapper = () => {
  const { selectedProject } = useProject();

  if (!selectedProject) return null;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="project" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="project">Project</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
        </TabsList>
        <TabsContent value="project">
          <Project project={selectedProject} />
        </TabsContent>
        <TabsContent value="collaborators">
          <CollaboratorsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectWrapper;
