import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Assignee {
  id: string;
  name: string;
  avatar: string | null;
}

interface ArchivedTask {
  id: string;
  title: string;
  description: string;
  label?: Label | null;
  assigneeDetails: Assignee[];
}

interface ArchivedTasksListProps {
  tasks: ArchivedTask[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUnarchive: (taskId: string) => void;
}

export function ArchivedTasksList({
  tasks,
  page,
  totalPages,
  onPageChange,
  onUnarchive,
}: ArchivedTasksListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (tasks.length === 0 && page === 1) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No archived tasks
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between py-3 px-4 bg-card rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm truncate">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-muted-foreground truncate">{task.description}</p>
              )}
            </div>

            {task.label && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                style={{
                  backgroundColor: task.label.color + '20',
                  color: task.label.color,
                }}
              >
                {task.label.name}
              </span>
            )}

            {task.assigneeDetails.length > 0 && (
              <div className="flex -space-x-1 shrink-0">
                {task.assigneeDetails.slice(0, 2).map((assignee) => (
                  <Avatar key={assignee.id} className="h-6 w-6 border border-card">
                    <AvatarImage src={assignee.avatar || undefined} alt={assignee.name} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px]">
                      {getInitials(assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUnarchive(task.id)}
            className="shrink-0 ml-4"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Restore
          </Button>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
