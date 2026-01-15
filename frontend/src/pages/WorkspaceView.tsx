import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, WorkspaceDetail, ProjectSummary } from '@/lib/api';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Plus, Trash2, Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const WorkspaceView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchWorkspace();
    }
  }, [id, isAuthenticated]);

  const fetchWorkspace = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWorkspace(Number(id));
      setWorkspace(data);
    } catch {
      toast.error('Failed to load workspace');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      await api.createProject(Number(id), newName, newDesc, newGoal);
      toast.success('Project created');
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
      setNewGoal('');
      fetchWorkspace();
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!confirm('Delete this workspace?')) return;
    try {
      await api.deleteWorkspace(Number(id));
      toast.success('Workspace deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete workspace');
    }
  };

  const handleInviteUser = async () => {
    if (!inviteUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }
    try {
      await api.inviteToWorkspace(Number(id), inviteUsername.trim());
      toast.success('Invite sent successfully');
      setInviteOpen(false);
      setInviteUsername('');
      fetchWorkspace(); // Refresh to show new member
    } catch {
      toast.error('Failed to send invite');
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!workspace) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar-background">
        <div className="p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="px-4 py-2">
          <h2 className="mb-2 text-lg font-semibold">{workspace.name}</h2>
          <p className="text-sm text-muted-foreground">{workspace.description}</p>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Members ({workspace.members.length})
            </div>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Enter username"
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                  />
                  <Button onClick={handleInviteUser} className="w-full">
                    Send Invite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="mt-2 h-48">
            {workspace.members.map((member) => {
              // Use full_name as display name and user_name as username handle
              const displayName = member.full_name || member.user_name || `User ${member.id}`;
              const username = member.user_name || 'unknown';
              const initials = displayName.charAt(0).toUpperCase();

              return (
                <div key={member.id} className="flex items-center gap-2 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      @{username} • {member.role}
                    </p>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </div>
        <div className="mt-auto p-4">
          <Button variant="destructive" size="sm" onClick={handleDeleteWorkspace} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Workspace
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Project name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Textarea
                  placeholder="Description"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <Textarea
                  placeholder="Goal"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                />
                <Button onClick={handleCreateProject} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {workspace.projects.length === 0 ? (
          <p className="text-center text-muted-foreground">No projects yet. Create one!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspace.projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.goal}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkspaceView;
