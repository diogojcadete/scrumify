
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import Project from "@/components/Project";
import ProjectForm from "@/components/ProjectForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusIcon, ExternalLinkIcon, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase, signOut, getUserData } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const { projects, selectedProject, selectProject } = useProject();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const userData = await getUserData();
      setUser(userData);
    };
    
    getUser();
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      {selectedProject ? (
        <div className="container mx-auto px-4">
          <div className="py-4">
            <Button
              variant="ghost"
              onClick={() => selectProject("")}
              className="mb-6"
            >
              ← Back to Projects
            </Button>
            <Project project={selectedProject} />
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Scrumify Hub</h1>
              <p className="text-muted-foreground mt-2">
                Manage your agile projects with ease
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">{user?.email}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" /> Sign Out
                </Button>
              </div>
              <Button onClick={() => setShowProjectForm(true)}>
                <PlusIcon className="h-4 w-4 mr-1" /> New Project
              </Button>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-accent/30 rounded-lg border border-border animate-fade-in">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold mb-2">Welcome to Scrumify Hub</h2>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first project.
                </p>
                <Button onClick={() => setShowProjectForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Create Project
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <Badge variant="outline">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground">End goal:</span>
                      <p className="text-sm line-clamp-3">{project.endGoal}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => selectProject(project.id)}
                    >
                      Open Project <ExternalLinkIcon className="h-3 w-3 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {showProjectForm && (
        <ProjectForm onClose={() => setShowProjectForm(false)} />
      )}
    </div>
  );
};

export default Index;
