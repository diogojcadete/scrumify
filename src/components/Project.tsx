
import React, { useState } from "react";
import { useProject } from "@/context/project";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Edit2, Trash } from "lucide-react";
import { Project as ProjectType } from "@/types";
import SprintForm from "./SprintForm";
import ProjectForm from "./ProjectForm";
import SprintBoard from "./SprintBoard";
import Backlog from "./Backlog";
import CollaboratorsList from "./CollaboratorsList";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectProps {
  project: ProjectType;
}

const Project: React.FC<ProjectProps> = ({ project }) => {
  const { sprints, deleteProject, user } = useProject();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  // Filter sprints for this project
  const projectSprints = sprints.filter(sprint => sprint.projectId === project.id);

  // Check if the user is the project owner
  const isOwner = user?.id === project.ownerId;
  
  const handleDeleteProject = () => {
    deleteProject(project.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground mt-1">{project.description}</p>
          <div className="mt-2">
            <span className="text-sm font-medium">End Goal:</span>
            <p className="text-sm mt-1">{project.endGoal}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isOwner && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowProjectForm(true)}
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="sprints">
        <TabsList className="mb-4">
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sprints">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Sprints</h2>
              <Button onClick={() => setShowSprintForm(true)}>
                Create Sprint
              </Button>
            </div>
            
            {projectSprints.length === 0 ? (
              <div className="p-8 text-center bg-accent/30 rounded-lg border border-border">
                <h3 className="text-lg font-medium mb-2">No sprints yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first sprint
                </p>
                <Button onClick={() => setShowSprintForm(true)}>
                  Create Sprint
                </Button>
              </div>
            ) : (
              <Tabs 
                defaultValue={projectSprints[0].id}
                onValueChange={(value) => setSelectedSprintId(value)}
              >
                <TabsList className="mb-4">
                  {projectSprints.map((sprint) => (
                    <TabsTrigger key={sprint.id} value={sprint.id}>
                      {sprint.title}
                      {sprint.isCompleted && " ✓"}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {projectSprints.map((sprint) => (
                  <TabsContent key={sprint.id} value={sprint.id}>
                    <SprintBoard sprint={sprint} />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="backlog">
          <Backlog projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="collaborators">
          <CollaboratorsList projectId={project.id} />
        </TabsContent>
      </Tabs>

      {showSprintForm && (
        <SprintForm onClose={() => setShowSprintForm(false)} />
      )}
      
      {showProjectForm && (
        <ProjectForm 
          onClose={() => setShowProjectForm(false)} 
          projectToEdit={project}
        />
      )}
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All sprints, tasks, and backlog items
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Project;
