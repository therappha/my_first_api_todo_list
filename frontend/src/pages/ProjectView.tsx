import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, ProjectDetail, Task } from '@/lib/api';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Archive, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

type TaskStatus = 'not_started' | 'in_progress' | 'in_review';

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'not_started', label: 'Not Started' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
];

const ProjectView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchProject();
    }
  }, [id, isAuthenticated]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProject(Number(id));
      setProject(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load project';
      toast.error(errorMessage);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskName.trim()) return;
    try {
      await api.createProjectTask(Number(id), newTaskName, newTaskDescription || undefined);
      toast.success('Task created');
      setCreateOpen(false);
      setNewTaskName('');
      setNewTaskDescription('');
      fetchProject();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      toast.error(errorMessage);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !editTaskName.trim()) return;
    try {
      const taskData: any = {
        name: editTaskName,
        description: editTaskDescription
      };

      await api.updateTask(editingTask.id, taskData);
      toast.success('Task updated');
      setEditOpen(false);
      setEditingTask(null);
      fetchProject();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      toast.error(errorMessage);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      toast.success('Task deleted');
      fetchProject();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      toast.error(errorMessage);
    }
  };

  const handleArchiveTask = async (taskId: number) => {
    try {
      await api.updateTask(taskId, { status: 'archived' });
      toast.success('Task archived');
      fetchProject();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive task';
      toast.error(errorMessage);
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: TaskStatus) => {
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }
    try {
      await api.updateTask(draggedTask.id, { status });
      fetchProject();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to move task';
      toast.error(errorMessage);
    }
    setDraggedTask(null);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditTaskName(task.name);
    setEditTaskDescription(task.description || '');
    setEditOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.deleteProject(Number(id));
      toast.success('Project deleted');
      navigate(`/workspace/${project?.workspace}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      toast.error(errorMessage);
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!project) return null;

  const getTasksByStatus = (status: TaskStatus) =>
    project.tasks.filter((t) => t.status === status);

  const getArchivedTasks = () =>
    project.tasks.filter((t) => t.status === 'archived');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/workspace/${project.workspace}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
            <span className="text-xs text-muted-foreground font-medium">DJANGO TODOLIST</span>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name *</label>
                    <Input
                      placeholder="Task name"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      placeholder="Task description (optional)"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* <div>
                    <label className="text-sm font-medium mb-2 block">Label</label>
                    <Select value={newTaskLabel ? newTaskLabel.toString() : 'none'} onValueChange={(value) => setNewTaskLabel(value === 'none' ? '' : Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a label (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No label</SelectItem>
                        {availableLabels.map((label) => (
                          <SelectItem key={label.id} value={label.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: label.label_color }}
                              />
                              {label.label_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}

                  <Button onClick={handleCreateTask} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" onClick={handleDeleteProject}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">Goal</p>
          <p className="text-muted-foreground">{project.goal}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className="rounded-lg border bg-card p-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
            >
              <h3 className="mb-4 font-medium">{col.label}</h3>
              <div className="space-y-2 min-h-[320px]">
                {getTasksByStatus(col.id).map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="cursor-grab transition-shadow hover:shadow-md active:cursor-grabbing"
                  >
                    <CardContent className="flex items-center gap-2 p-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 cursor-pointer" onClick={() => openEditDialog(task)}>
                        <div className="flex items-center gap-2">
                          <span>{task.name}</span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleArchiveTask(task.id)}
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {getTasksByStatus(col.id).length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Drop tasks here
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Archived Tasks Section */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-medium text-muted-foreground">
            Archived Tasks ({getArchivedTasks().length})
          </h3>
          {getArchivedTasks().length === 0 ? (
            <p className="text-sm text-muted-foreground">No archived tasks</p>
          ) : (
            <div className="space-y-2">
              {getArchivedTasks().map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => openEditDialog(task)}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground line-through">
                        {task.name}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => api.updateTask(task.id, { status: 'not_started' }).then(fetchProject)}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                placeholder="Task name"
                value={editTaskName}
                onChange={(e) => setEditTaskName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Task description (optional)"
                value={editTaskDescription}
                onChange={(e) => setEditTaskDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateTask} className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectView;
