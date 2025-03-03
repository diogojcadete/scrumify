
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { useProject } from "@/context/project";
import { useNavigate } from "react-router-dom";
import { LogOut, CheckCircle, XCircle, User } from "lucide-react";
import { signOut } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { user, acceptInvitation, rejectInvitation, getInvitations } = useProject();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      if (!user?.email) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const result = await getInvitations(user.email);
      if (result.success && result.data) {
        console.log("Invitations loaded:", result.data);
        setInvitations(result.data);
      } else {
        console.error("Failed to load invitations:", result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to load invitations",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred loading invitations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvitations();
    } else {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      navigate("/sign-in");
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    const result = await acceptInvitation(invitationId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Invitation accepted successfully. The project is now available in your projects list.",
      });
      // Remove the invitation from the local state immediately
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      // Navigate to projects list to show the newly added project
      navigate("/");
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to accept invitation",
        variant: "destructive"
      });
      // Refresh invitations to get current state
      fetchInvitations();
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    const result = await rejectInvitation(invitationId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Invitation rejected successfully",
      });
      // Remove the invitation from the local state immediately
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reject invitation",
        variant: "destructive"
      });
      // Refresh invitations to get current state
      fetchInvitations();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account and project invitations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Projects
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="invitations">
          <TabsList className="mb-6">
            <TabsTrigger value="invitations">Project Invitations</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Project Invitations</CardTitle>
                <CardDescription>
                  Manage invitations to collaborate on projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No pending invitations</p>
                    <p className="text-sm mt-2">
                      When someone invites you to a project, it will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <Card key={invitation.id} className="bg-accent/20">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-xl">{invitation.projectTitle || "Unnamed Project"}</CardTitle>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              {invitation.role}
                            </Badge>
                          </div>
                          <CardDescription>
                            {invitation.projectDescription || "No description provided"}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-4 flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRejectInvitation(invitation.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1 text-destructive" />
                            Decline
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleAcceptInvitation(invitation.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/50 h-16 w-16 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{user?.email}</h3>
                    <p className="text-sm text-muted-foreground">Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
