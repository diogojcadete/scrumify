
import React, { useState } from "react";
import { useProject } from "@/context/project";
import { Sprint, Column, Task } from "@/types";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SprintBoardProps {
  sprint: Sprint;
}

const SprintBoard: React.FC<SprintBoardProps> = ({ sprint }) => {
  const { columns, createColumn, deleteColumn, moveTask, completeSprint } = useProject();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Only get the ONE instance of each standard column that we need
  const todoColumn = columns.find(column => column.title === "TO DO");
  const inProgressColumn = columns.find(column => column.title === "IN PROGRESS");
  const doneColumn = columns.find(column => column.title === "DONE");

  // Get custom columns that have tasks for this sprint
  const customColumns = columns.filter(column => 
    column.title !== "TO DO" && 
    column.title !== "IN PROGRESS" && 
    column.title !== "DONE" &&
    column.tasks.some(task => task.sprintId === sprint.id)
  );

  // Combine all columns used by this sprint
  const sprintColumns = [
    todoColumn,
    inProgressColumn,
    doneColumn,
    ...customColumns
  ].filter(Boolean) as Column[];

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowTaskForm(true);
  };

  const handleAddTask = (columnId: string) => {
    setActiveColumnId(columnId);
    setTaskToEdit(null);
    setShowTaskForm(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    
    if (data) {
      try {
        const { taskId, sourceColumnId } = JSON.parse(data);
        moveTask(taskId, sourceColumnId, columnId);
      } catch (error) {
        console.error("Error parsing drag data:", error);
      }
    }
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      createColumn(sprint.id, newColumnName.trim());
      setNewColumnName("");
      setShowAddColumn(false);
    }
  };

  // Check if all tasks are in DONE column
  const allTasksCompleted = () => {
    if (!doneColumn) return false;
    
    // Count total tasks for this sprint
    const totalTasks = sprintColumns.reduce(
      (count, column) => count + column.tasks.filter(task => task.sprintId === sprint.id).length,
      0
    );
    
    // Count tasks in DONE column
    const doneTasks = doneColumn.tasks.filter(task => task.sprintId === sprint.id).length;
    
    // If there are no tasks, sprint can't be completed
    if (totalTasks === 0) return false;
    
    // Check if all tasks are in DONE column
    return doneTasks === totalTasks;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{sprint.title}</h2>
          <p className="text-muted-foreground">
            {sprint.description}
          </p>
          <div className="flex gap-4 mt-2 text-sm">
            <span>Start: {new Date(sprint.startDate).toLocaleDateString()}</span>
            <span>End: {new Date(sprint.endDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!sprint.isCompleted && (
            <Button
              variant="outline" 
              onClick={() => completeSprint(sprint.id)}
              disabled={!allTasksCompleted()}
            >
              Complete Sprint
            </Button>
          )}
        </div>
      </div>

      {sprint.isCompleted && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>Sprint Completed</AlertTitle>
          <AlertDescription>
            This sprint has been marked as completed.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {sprintColumns.map((column) => (
          <div
            key={column.id}
            className="board-column border rounded-lg p-4 bg-background"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">{column.title}</h3>
              <div className="flex gap-1">
                {column.title !== "TO DO" && 
                 column.title !== "IN PROGRESS" && 
                 column.title !== "DONE" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => deleteColumn(column.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleAddTask(column.id)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {column.tasks
                .filter(task => task.sprintId === sprint.id)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                  />
                ))}
            </div>
          </div>
        ))}

        {!showAddColumn ? (
          <div 
            className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setShowAddColumn(true)}
          >
            <div className="flex flex-col items-center">
              <Plus className="h-5 w-5 mb-1 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add Column</span>
            </div>
          </div>
        ) : (
          <div className="board-column border rounded-lg p-4 bg-background">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddColumn}>
                  Add
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTaskForm && activeColumnId && (
        <TaskForm
          onClose={() => {
            setShowTaskForm(false);
            setTaskToEdit(null);
          }}
          sprintId={sprint.id}
          columnId={activeColumnId}
          taskToEdit={taskToEdit || undefined}
        />
      )}
    </div>
  );
};

export default SprintBoard;
