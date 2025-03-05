
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useProject } from "@/context/ProjectContext";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ProjectInvite {
  id: string;
  projectId: string;
  projectTitle: string;
  role: string;
}

const CollaborationInvites = () => {
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projects } = useProject();

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user?.email) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('collaborators')
          .select('id, project_id, role, status')
          .eq('email', userData.user.email)
          .eq('status', 'pending');

        if (error) {
          throw error;
        }

        // Fetch project titles for the invites
        const projectIds = data.map(invite => invite.project_id);
        
        if (projectIds.length === 0) {
          setInvites([]);
          setIsLoading(false);
          return;
        }

        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, title')
          .in('id', projectIds);

        if (projectsError) {
          throw projectsError;
        }

        const invitesWithProjectTitles = data.map(invite => {
          const project = projectsData.find(p => p.id === invite.project_id);
          return {
            id: invite.id,
            projectId: invite.project_id,
            projectTitle: project ? project.title : 'Unknown Project',
            role: invite.role
          };
        });

        setInvites(invitesWithProjectTitles);
      } catch (error) {
        console.error('Error fetching invites:', error);
        toast({
          title: "Failed to load invitations",
          description: "There was a problem loading your collaboration invitations.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvites();
  }, [projects]);

  const respondToInvite = async (inviteId: string, accept: boolean) => {
    try {
      if (accept) {
        // Accept the invitation by updating status to 'accepted'
        const { error } = await supabase
          .from('collaborators')
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString()
          })
          .eq('id', inviteId);

        if (error) {
          throw error;
        }
      } else {
        // Decline by deleting the invitation completely
        const { error } = await supabase
          .from('collaborators')
          .delete()
          .eq('id', inviteId);

        if (error) {
          throw error;
        }
      }

      // Remove the invitation from the local state
      setInvites(invites.filter(invite => invite.id !== inviteId));
      
      toast({
        title: accept ? "Invitation accepted" : "Invitation declined",
        description: accept 
          ? "You now have access to this project" 
          : "You've declined the invitation",
      });
    } catch (error) {
      console.error('Error responding to invite:', error);
      toast({
        title: "Error",
        description: "There was a problem processing your response.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Project Invitations</CardTitle>
          <CardDescription>Loading your invitations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invites.length === 0) {
    return null; // Don't show the component if there are no invites
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Project Invitations</CardTitle>
        <CardDescription>
          You have {invites.length} pending project invitation{invites.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <h4 className="font-medium">{invite.projectTitle}</h4>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-muted-foreground mr-2">Role:</span>
                  <Badge variant="outline" className="capitalize">
                    {invite.role}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => respondToInvite(invite.id, false)}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" /> Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => respondToInvite(invite.id, true)}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" /> Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborationInvites;
