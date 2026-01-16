import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Workspace } from '@/lib/api';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, FolderOpen, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuthContext();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces();
    }
  }, [page, isAuthenticated]);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWorkspaces(page);
      setWorkspaces(data.results);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workspaces';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.createWorkspace(newName, newDesc);
      toast.success('Workspace created');
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
      fetchWorkspaces();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create workspace';
      toast.error(errorMessage);
    }
  };

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">DJANGO TODOLIST</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              {user?.name || user?.username}
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">Select a workspace to get started</p>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Workspace name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Textarea
                  placeholder="Description"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <Button onClick={handleCreate} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : workspaces.length === 0 ? (
          <p className="text-center text-muted-foreground">No workspaces yet. Create one!</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((ws) => (
                <Card
                  key={ws.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => navigate(`/workspace/${ws.id}`)}
                >
                  <CardHeader>
                    <CardTitle>{ws.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{ws.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {ws.member_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <FolderOpen className="h-4 w-4" />
                        {ws.project_count}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" disabled={!hasPrev} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
