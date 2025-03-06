import React from "react";
import { Project as ProjectType } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckCircle2, ListChecks } from "lucide-react";

interface ProjectProps {
  project: ProjectType;
}

const Project: React.FC<ProjectProps> = ({ project }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Created at:{" "}
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">End Goal:</span>
            <p className="text-md">{project.endGoal}</p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button>
            <ListChecks className="h-4 w-4 mr-2" /> View Tasks
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sprint Progress</CardTitle>
          <CardDescription>Overview of current sprint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm">All tasks completed</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Project;
