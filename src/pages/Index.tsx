
import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import Project from "@/components/Project";
import ProjectForm from "@/components/ProjectForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserButton, useUser } from "@clerk/clerk-react";

const Index: React.FC = () => {
  const { projects, selectedProject, selectProject } = useProject();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const { user } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check-square">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <h1 className="text-xl font-bold">Agile Sprint Manager</h1>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden md:inline-block">
                  {user.firstName || user.emailAddresses[0]?.emailAddress}
                </span>
                <UserButton afterSignOutUrl="/sign-in" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-6">
        {!selectedProject ? (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your agile projects and sprints
                </p>
              </div>
              <Button onClick={() => setShowProjectForm(true)}>
                <PlusIcon className="h-4 w-4 mr-1" /> New Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="bg-accent/30 rounded-lg border border-border p-8 text-center">
                <h2 className="text-xl font-medium mb-2">No Projects Yet</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first project to start managing sprints and tasks
                  using the Agile methodology.
                </p>
                <Button onClick={() => setShowProjectForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => selectProject(project.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription>
                        Created on{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-2">{project.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Project project={selectedProject} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Agile Sprint Manager. All rights reserved.
        </div>
      </footer>

      {showProjectForm && (
        <ProjectForm onClose={() => setShowProjectForm(false)} />
      )}
    </div>
  );
};

export default Index;
