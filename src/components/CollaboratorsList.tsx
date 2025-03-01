
import React, { useState } from "react";
import { useProject } from "@/context/project";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2 } from "lucide-react";
import CollaboratorForm from "./CollaboratorForm";
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

interface CollaboratorsListProps {
  projectId: string;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ projectId }) => {
  const { getProjectCollaborators, removeCollaborator, projects } = useProject();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<string | null>(null);

  const collaborators = getProjectCollaborators(projectId);
  const project = projects.find(p => p.id === projectId);

  const handleRemoveCollaborator = () => {
    if (collaboratorToRemove) {
      removeCollaborator(collaboratorToRemove);
      setCollaboratorToRemove(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xl font-bold">Collaborators</CardTitle>
        <Button 
          size="sm" 
          onClick={() => setShowInviteForm(true)}
          className="flex items-center gap-1"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite</span>
        </Button>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No collaborators yet</p>
            <p className="text-sm mt-2">
              Invite team members to collaborate on this project
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-3 bg-accent/30 rounded-md"
              >
                <div>
                  <div className="font-medium">{collaborator.email}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className={getRoleBadgeColor(collaborator.role)}>
                      {collaborator.role}
                    </Badge>
                    <Badge variant="outline" className={getStatusBadgeColor(collaborator.status)}>
                      {collaborator.status}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollaboratorToRemove(collaborator.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {showInviteForm && (
          <CollaboratorForm
            projectId={projectId}
            onClose={() => setShowInviteForm(false)}
          />
        )}

        <AlertDialog
          open={collaboratorToRemove !== null}
          onOpenChange={(open) => !open && setCollaboratorToRemove(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this collaborator from the project?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveCollaborator}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default CollaboratorsList;
