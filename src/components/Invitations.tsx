
import React from "react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Invitations = () => {
  const { invitations, updateInvitationStatus } = useProject();

  if (invitations.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Project Invitations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="border border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{invitation.projectTitle}</CardTitle>
              <CardDescription>
                You've been invited to collaborate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{invitation.role}</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => updateInvitationStatus(invitation.id, 'rejected')}
              >
                <X className="h-4 w-4 mr-1" /> Decline
              </Button>
              <Button 
                size="sm"
                onClick={() => updateInvitationStatus(invitation.id, 'accepted')}
              >
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Invitations;
