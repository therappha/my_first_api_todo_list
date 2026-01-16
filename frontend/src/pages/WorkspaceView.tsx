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
import { ArrowLeft, Plus, Trash2, Users, UserPlus, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

const WorkspaceView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user: currentUser } = useAuthContext();
  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberConfig, setMemberConfig] = useState<null | { id: number, username: string, full_name: string, role: string }>(null);
  const [newRole, setNewRole] = useState('');
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


  const handleKickMember = async (username: string) => {
    if (!confirm(`Remove ${username} from this workspace?`)) return;
    try {
      await api.kickMember(Number(id), username);
      toast.success('Member removed successfully');
      setMemberConfig(null);
      fetchWorkspace();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const handleChangeRole = async () => {
    if (!memberConfig || !newRole) return;
    try {
      await api.changeMemberRole(Number(id), memberConfig.username, newRole);
      toast.success('Role updated successfully');
      setMemberConfig(null);
      fetchWorkspace();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const canKickMember = (member: any) => {
    console.log('=== Debugging canKickMember ===');
    console.log('currentUser:', currentUser);
    console.log('workspace:', workspace);
    console.log('member:', member);

    if (!currentUser || !workspace) {
      console.log('Missing currentUser or workspace');
      return false;
    }

    // Cannot kick yourself
    if (member.user_name === currentUser.username) {
      console.log('Cannot kick yourself');
      return false;
    }

    // Find current user's role in this workspace
    const currentUserMember = workspace.members.find(
      m => m.user_name === currentUser.username
    );

    console.log('currentUserMember:', currentUserMember);

    if (!currentUserMember) {
      console.log('Current user not found in workspace members');
      return false;
    }

    const currentUserRole = currentUserMember.role;
    const targetRole = member.role;

    console.log('currentUserRole:', currentUserRole);
    console.log('targetRole:', targetRole);

    // Owner can kick anyone except other owners
    if (currentUserRole === 'owner' && targetRole !== 'owner') {
      console.log('Owner can kick this member');
      return true;
    }

    // Admin can kick editors and viewers
    if (currentUserRole === 'admin' && (targetRole === 'editor' || targetRole === 'viewer')) {
      console.log('Admin can kick this member');
      return true;
    }

    console.log('No permission to kick this member');
    return false;
  };

  if (authLoading || isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!workspace) return null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}> 
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{workspace.name}</h1>
              <p className="text-sm text-muted-foreground">{workspace.description}</p>
            </div>
          </div>
          {/* Always show current user's full name */}
          <span className="text-xs text-muted-foreground font-medium">
            {(() => {
              if (workspace && currentUser) {
                const member = workspace.members.find(m => m.user_name === currentUser.username);
                return (member && member.full_name) || currentUser.name || currentUser.username;
              }
              return 'DJANGO TODOLIST';
            })()}
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-sidebar-background">
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
              const displayName = member.full_name || member.user_name || `User ${member.id}`;
              const username = member.user_name || 'unknown';
              const initials = displayName.charAt(0).toUpperCase();
              return (
                <div key={member.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMemberConfig({
                        id: member.id,
                        username: username,
                        full_name: displayName,
                        role: member.role
                      });
                      setNewRole(member.role);
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                    title={`Config ${username}`}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            {/* Member Config Modal */}
            {memberConfig && (
              <Dialog open={!!memberConfig} onOpenChange={() => setMemberConfig(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Member Config</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="mb-2">
                      <div className="font-medium">{memberConfig.full_name} (@{memberConfig.username})</div>
                      <div className="text-xs text-muted-foreground mb-2">Current role: {memberConfig.role}</div>
                      <label className="block mb-1 text-sm">Change role:</label>
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={newRole}
                        onChange={e => setNewRole(e.target.value)}
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <Button onClick={handleChangeRole} className="w-full">Change Role</Button>
                    <Button variant="destructive" onClick={() => handleKickMember(memberConfig.username)} className="w-full">Kick</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
  )
}
  </main>
</div>
</div>
  )}
export default WorkspaceView;
