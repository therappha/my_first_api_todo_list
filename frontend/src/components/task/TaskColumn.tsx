import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

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

interface Task {
  id: string;
  title: string;
  description: string;
  label?: Label | null;
  assigneeDetails: Assignee[];
}

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  onEditTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskColumn({
  id,
  title,
  tasks,
  color,
  onEditTask,
  onArchiveTask,
  onDeleteTask,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'space-y-2 min-h-[200px] p-2 rounded-lg transition-colors',
          isOver && 'bg-muted/50'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.name || task.title}  // Compatibilidade com ambas estruturas
              description={task.description || ''}
              label={task.label}
              assignees={task.assignees || task.assigneeDetails || []}  // Fallback seguro
              onEdit={() => onEditTask(task)}
              onArchive={() => onArchiveTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
