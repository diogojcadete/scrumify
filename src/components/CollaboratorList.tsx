
import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Collaborator } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { UserRoundIcon, MoreHorizontalIcon, PlusIcon, UserPlus } from "lucide-react";
import CollaboratorForm from "./CollaboratorForm";
import { useUser } from "@clerk/clerk-react";

interface CollaboratorListProps {
  projectId: string;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({ projectId }) => {
  const { projects, updateCollaboratorRole, removeCollaborator } = useProject();
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const { user } = useUser();

  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const isOwner = user?.id === project.ownerId;
  const userRole = project.collaborators.find(c => c.userId === user?.id)?.role;
  const canManageCollaborators = isOwner || userRole === "admin";

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "editor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "viewer":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Project Collaborators</h2>
        {canManageCollaborators && (
          <Button onClick={() => setShowCollaboratorForm(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> Add Collaborator
          </Button>
        )}
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Owner</CardTitle>
              <CardDescription>The user who created this project</CardDescription>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Owner</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserRoundIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{project.ownerId === user?.id ? "You" : project.ownerId}</p>
              <p className="text-sm text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress || "Email not available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h3 className="text-lg font-medium mt-6 mb-3">Collaborators</h3>

      {project.collaborators.length === 0 ? (
        <div className="text-center py-6 bg-accent/30 rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-2">No Collaborators Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Add team members to collaborate on this project.
          </p>
          {canManageCollaborators && (
            <Button onClick={() => setShowCollaboratorForm(true)}>
              <PlusIcon className="h-4 w-4 mr-1" /> Add First Collaborator
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {project.collaborators.map((collaborator) => (
            <Card key={collaborator.userId} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserRoundIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{collaborator.userId === user?.id ? "You" : collaborator.email}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getRoleBadgeClass(collaborator.role)}>
                          {collaborator.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Added {new Date(collaborator.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canManageCollaborators && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateCollaboratorRole(projectId, collaborator.userId, "viewer")}>
                          Make Viewer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateCollaboratorRole(projectId, collaborator.userId, "editor")}>
                          Make Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateCollaboratorRole(projectId, collaborator.userId, "admin")}>
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive" 
                          onClick={() => removeCollaborator(projectId, collaborator.userId)}
                        >
                          Remove Collaborator
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCollaboratorForm && (
        <CollaboratorForm 
          projectId={projectId} 
          onClose={() => setShowCollaboratorForm(false)} 
        />
      )}
    </div>
  );
};

export default CollaboratorList;
