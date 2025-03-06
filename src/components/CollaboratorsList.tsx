
import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2 } from "lucide-react";
import CollaboratorForm from "./CollaboratorForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CollaboratorsList = () => {
  const { collaborators, selectedProject, removeCollaborator } = useProject();
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<string | null>(null);

  const handleRemoveCollaborator = (id: string) => {
    removeCollaborator(id);
    setCollaboratorToDelete(null);
  };

  if (!selectedProject) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Collaborators</h3>
        <Button 
          size="sm" 
          onClick={() => setShowCollaboratorForm(true)}
          variant="outline"
        >
          <UserPlus className="h-4 w-4 mr-1" /> Invite
        </Button>
      </div>

      {collaborators.length === 0 ? (
        <Card className="border border-dashed bg-muted/50">
          <CardContent className="py-6 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No collaborators yet. Invite people to collaborate on this project.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCollaboratorForm(true)}
            >
              <UserPlus className="h-4 w-4 mr-1" /> Invite Collaborator
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {collaborators.map((collaborator) => (
            <Card key={collaborator.id} className="border">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{collaborator.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{collaborator.role}</Badge>
                    <Badge 
                      variant={collaborator.status === 'accepted' ? 'default' : 
                              collaborator.status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {collaborator.status}
                    </Badge>
                  </div>
                </div>
                <Dialog open={collaboratorToDelete === collaborator.id} onOpenChange={(open) => {
                  if (!open) setCollaboratorToDelete(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setCollaboratorToDelete(collaborator.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remove Collaborator</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to remove {collaborator.email} from this project?
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setCollaboratorToDelete(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                      >
                        Remove
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCollaboratorForm && (
        <CollaboratorForm onClose={() => setShowCollaboratorForm(false)} />
      )}
    </div>
  );
};

export default CollaboratorsList;
