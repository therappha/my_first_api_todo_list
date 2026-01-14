import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { WorkspaceCard } from '@/components/workspace/WorkspaceCard';
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog';
import { EditWorkspaceDialog } from '@/components/workspace/EditWorkspaceDialog';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace } from '@/api/workspaces.js';
import { getProjects } from '@/api/projects.js';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  avatar: string | null;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  memberDetails: Member[];
}

export default function Workspaces() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, [page]);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    const result = await getWorkspaces({ page, limit: 6 });

    if (result.success && result.data) {
      setWorkspaces(result.data.workspaces);
      setTotalPages(result.data.totalPages);

      // Load project counts for each workspace
      const counts: Record<string, number> = {};
      for (const ws of result.data.workspaces) {
        const projectsResult = await getProjects(ws.id);
        counts[ws.id] = projectsResult.success ? projectsResult.data?.length || 0 : 0;
      }
      setProjectCounts(counts);
    }

    setIsLoading(false);
  };

  const handleCreateWorkspace = async (data: { name: string; description: string }) => {
    const result = await createWorkspace(data);
    if (result.success) {
      toast.success('Workspace created successfully');
      loadWorkspaces();
    } else {
      toast.error(result.error || 'Failed to create workspace');
    }
  };

  const handleEditWorkspace = async (id: string, data: { name: string; description: string }) => {
    const result = await updateWorkspace(id, data);
    if (result.success) {
      toast.success('Workspace updated successfully');
      loadWorkspaces();
    } else {
      toast.error(result.error || 'Failed to update workspace');
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) return;

    const result = await deleteWorkspace(id);
    if (result.success) {
      toast.success('Workspace deleted successfully');
      loadWorkspaces();
    } else {
      toast.error(result.error || 'Failed to delete workspace');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workspaces</h1>
            <p className="text-muted-foreground mt-1">Manage your workspaces and projects</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Workspace
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No workspaces yet</h2>
            <p className="text-muted-foreground mb-4">Create your first workspace to get started</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  id={workspace.id}
                  name={workspace.name}
                  description={workspace.description}
                  members={workspace.memberDetails || []}
                  projectCount={projectCounts[workspace.id] || 0}
                  onClick={() => navigate(`/workspace/${workspace.id}`)}
                  onEdit={() => setEditWorkspace(workspace)}
                  onDelete={() => handleDeleteWorkspace(workspace.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
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
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <CreateWorkspaceDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleCreateWorkspace}
      />

      <EditWorkspaceDialog
        workspace={editWorkspace}
        open={!!editWorkspace}
        onOpenChange={(open) => !open && setEditWorkspace(null)}
        onSubmit={handleEditWorkspace}
      />
    </div>
  );
}
