import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getLabels } from '@/api/labels.js';
import { mockUsers } from '@/api/mock-data.js';

interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title?: string;    // Estrutura antiga
  name?: string;     // Estrutura nova da API
  description?: string;
  status: string;
  assignees: string[];
  labelId?: string | null;
}

interface EditTaskDialogProps {
  task: Task | null;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: {
    title?: string;
    name?: string;
    description?: string;
    status: string;
    assignees: string[];
    labelId?: string | null;
  }) => Promise<void>;
}

export function EditTaskDialog({ task, workspaceId, open, onOpenChange, onSubmit }: EditTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('NOT_STARTED');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [labelId, setLabelId] = useState<string | null>(null);
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || task.name || '');  // Compatibilidade com ambas estruturas
      setDescription(task.description || '');
      setStatus(task.status);
      setAssignees(task.assignees || []);
      setLabelId(task.labelId || null);
    }
  }, [task]);

  useEffect(() => {
    if (open && workspaceId) {
      loadLabels();
    }
  }, [open, workspaceId]);

  const loadLabels = async () => {
    const result = await getLabels(workspaceId);
    if (result.success && result.data) {
      setLabels(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setIsLoading(true);
    await onSubmit(task.id, {
      title,
      name: title,  // Enviar ambos para compatibilidade
      description,
      status,
      assignees,
      labelId
    });
    setIsLoading(false);
    onOpenChange(false);
  };

  const toggleAssignee = (userId: string) => {
    setAssignees(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-task-title">Title</Label>
            <Input
              id="edit-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-description">Description</Label>
            <Textarea
              id="edit-task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Label</Label>
              <Select value={labelId || ''} onValueChange={(v) => setLabelId(v || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  {labels.map((label) => (
                    <SelectItem key={label.id} value={label.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignees</Label>
            <div className="flex flex-wrap gap-2">
              {mockUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-1.5 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                >
                  <Checkbox
                    checked={assignees.includes(user.id)}
                    onCheckedChange={() => toggleAssignee(user.id)}
                  />
                  <span className="text-sm">{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
