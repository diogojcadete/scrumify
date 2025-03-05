
import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Collaborator } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import CollaboratorForm from "./CollaboratorForm";

const CollaboratorList = () => {
  const { collaborators, removeCollaborator, selectedProject, isOwner } = useProject();
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [collaboratorToEdit, setCollaboratorToEdit] = useState<Collaborator | null>(null);
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<Collaborator | null>(null);

  const isProjectOwner = selectedProject ? isOwner(selectedProject.id) : false;

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setCollaboratorToEdit(collaborator);
    setShowCollaboratorForm(true);
  };

  const handleRemoveCollaborator = async () => {
    if (collaboratorToRemove) {
      await removeCollaborator(collaboratorToRemove.id);
      setCollaboratorToRemove(null);
    }
  };

  const closeForm = () => {
    setShowCollaboratorForm(false);
    setCollaboratorToEdit(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "accepted":
        return <Badge variant="success">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Project Collaborators</CardTitle>
            <CardDescription>
              People with access to this project
            </CardDescription>
          </div>
          {isProjectOwner && (
            <Button
              onClick={() => setShowCollaboratorForm(true)}
              size="sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Add Collaborator
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No collaborators have been added to this project yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                {isProjectOwner && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell>{collaborator.email}</TableCell>
                  <TableCell className="capitalize">{collaborator.role}</TableCell>
                  <TableCell>{getStatusBadge(collaborator.status)}</TableCell>
                  {isProjectOwner && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCollaborator(collaborator)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollaboratorToRemove(collaborator)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {showCollaboratorForm && (
        <CollaboratorForm
          onClose={closeForm}
          collaboratorToEdit={
            collaboratorToEdit
              ? {
                  id: collaboratorToEdit.id,
                  email: collaboratorToEdit.email,
                  role: collaboratorToEdit.role as "editor" | "viewer",
                }
              : undefined
          }
        />
      )}

      <AlertDialog
        open={!!collaboratorToRemove}
        onOpenChange={(open) => !open && setCollaboratorToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {collaboratorToRemove?.email} from this project?
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
    </Card>
  );
};

export default CollaboratorList;
