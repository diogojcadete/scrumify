
import React from "react";
import { Task } from "@/types";
import { PencilIcon, TrashIcon, User } from "lucide-react";
import { useProject } from "@/context/project";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask } = useProject();
  
  const getPriorityClass = () => {
    switch (task.priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      taskId: task.id,
      sourceColumnId: task.columnId,
    }));
  };

  return (
    <Card
      className="mb-3 animate-fade-in border shadow-sm hover:shadow-md transition-all duration-200"
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={getPriorityClass()}>
            {task.priority}
          </Badge>
          <Badge variant="secondary">SP: {task.storyPoints}</Badge>
        </div>
        <CardTitle className="text-base mt-2">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{task.assignee}</span>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => onEdit(task)}
          >
            <PencilIcon className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-destructive"
            onClick={() => deleteTask(task.id)}
          >
            <TrashIcon className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
