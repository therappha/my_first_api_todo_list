import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Header } from '@/components/layout/Header';
import { TaskColumn } from '@/components/task/TaskColumn';
import { ArchivedTasksList } from '@/components/task/ArchivedTasksList';
import { CreateTaskDialog } from '@/components/task/CreateTaskDialog';
import { EditTaskDialog } from '@/components/task/EditTaskDialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, ArrowLeft, ChevronDown, Target } from 'lucide-react';
import { getProject } from '@/api/projects.js';
import { getTasks, getArchivedTasks, createTask, updateTask, archiveTask, unarchiveTask, deleteTask } from '@/api/tasks.js';
import { toast } from 'sonner';

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
  status: string;
  assignees: string[];
  labelId: string | null;
  label?: Label | null;
  assigneeDetails: Assignee[];
  order: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  goal: string;
  workspaceId: string;
}

const STATUS_COLORS = {
  NOT_STARTED: 'hsl(215, 16%, 47%)',
  ONGOING: 'hsl(217, 91%, 60%)',
  IN_REVIEW: 'hsl(38, 92%, 50%)',
};

export default function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [archivedPage, setArchivedPage] = useState(1);
  const [archivedTotalPages, setArchivedTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && archivedOpen) {
      loadArchivedTasks();
    }
  }, [projectId, archivedPage, archivedOpen]);

  const loadData = async () => {
    setIsLoading(true);

    const [projectResult, tasksResult] = await Promise.all([
      getProject(projectId!),
      getTasks(projectId!)
    ]);

    if (projectResult.success && projectResult.data) {
      setProject(projectResult.data as Project);
    }

    if (tasksResult.success && tasksResult.data) {
      setTasks(tasksResult.data as Task[]);
    }

    setIsLoading(false);
  };

  const loadArchivedTasks = async () => {
    const result = await getArchivedTasks(projectId!, { page: archivedPage, limit: 10 });
    if (result.success && result.data) {
      setArchivedTasks(result.data.tasks as Task[]);
      setArchivedTotalPages(result.data.totalPages);
    }
  };

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    status: string;
    assignees: string[];
    labelId: string | null;
  }) => {
    const result = await createTask(projectId!, data);
    if (result.success) {
      toast.success('Task created successfully');
      loadData();
    } else {
      toast.error(result.error || 'Failed to create task');
    }
  };

  const handleEditTask = async (id: string, data: {
    title: string;
    description: string;
    status: string;
    assignees: string[];
    labelId: string | null;
  }) => {
    const result = await updateTask(id, data);
    if (result.success) {
      toast.success('Task updated successfully');
      loadData();
    } else {
      toast.error(result.error || 'Failed to update task');
    }
  };

  const handleArchiveTask = async (taskId: string) => {
    const result = await archiveTask(taskId);
    if (result.success) {
      toast.success('Task archived');
      loadData();
      if (archivedOpen) loadArchivedTasks();
    } else {
      toast.error(result.error || 'Failed to archive task');
    }
  };

  const handleUnarchiveTask = async (taskId: string) => {
    const result = await unarchiveTask(taskId);
    if (result.success) {
      toast.success('Task restored');
      loadData();
      loadArchivedTasks();
    } else {
      toast.error(result.error || 'Failed to restore task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const result = await deleteTask(taskId);
    if (result.success) {
      toast.success('Task deleted');
      loadData();
    } else {
      toast.error(result.error || 'Failed to delete task');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    let newStatus = activeTask.status;

    // Check if dropped on a column
    if (['NOT_STARTED', 'ONGOING', 'IN_REVIEW'].includes(overId)) {
      newStatus = overId;
    } else {
      // Dropped on another task - get its status
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (newStatus !== activeTask.status) {
      const result = await updateTask(activeTask.id, { status: newStatus });
      if (result.success) {
        loadData();
      }
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => navigate(`/workspace/${project?.workspaceId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project?.name}</h1>
            <p className="text-muted-foreground mt-1">{project?.description}</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {project?.goal && (
          <div className="flex items-start gap-2 p-4 bg-card rounded-lg border mb-6">
            <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">Project Goal</h3>
              <p className="text-sm text-muted-foreground">{project.goal}</p>
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            <TaskColumn
              id="NOT_STARTED"
              title="Not Started"
              tasks={getTasksByStatus('NOT_STARTED')}
              color={STATUS_COLORS.NOT_STARTED}
              onEditTask={(task) => setEditTask(task as Task)}
              onArchiveTask={handleArchiveTask}
              onDeleteTask={handleDeleteTask}
            />
            <TaskColumn
              id="ONGOING"
              title="Ongoing"
              tasks={getTasksByStatus('ONGOING')}
              color={STATUS_COLORS.ONGOING}
              onEditTask={(task) => setEditTask(task as Task)}
              onArchiveTask={handleArchiveTask}
              onDeleteTask={handleDeleteTask}
            />
            <TaskColumn
              id="IN_REVIEW"
              title="In Review"
              tasks={getTasksByStatus('IN_REVIEW')}
              color={STATUS_COLORS.IN_REVIEW}
              onEditTask={(task) => setEditTask(task as Task)}
              onArchiveTask={handleArchiveTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </DndContext>

        <Collapsible open={archivedOpen} onOpenChange={setArchivedOpen} className="mt-8">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="font-semibold">Archived Tasks</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${archivedOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <ArchivedTasksList
              tasks={archivedTasks}
              page={archivedPage}
              totalPages={archivedTotalPages}
              onPageChange={setArchivedPage}
              onUnarchive={handleUnarchiveTask}
            />
          </CollapsibleContent>
        </Collapsible>
      </main>

      <CreateTaskDialog
        workspaceId={project?.workspaceId || ''}
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleCreateTask}
      />

      <EditTaskDialog
        task={editTask}
        workspaceId={project?.workspaceId || ''}
        open={!!editTask}
        onOpenChange={(open) => !open && setEditTask(null)}
        onSubmit={handleEditTask}
      />
    </div>
  );
}
