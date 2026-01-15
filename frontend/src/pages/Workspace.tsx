import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { ProjectCard } from '@/components/project/ProjectCard';
import { CreateProjectDialog } from '@/components/project/CreateProjectDialog';
import { EditProjectDialog } from '@/components/project/EditProjectDialog';
import { ManageMembersDialog } from '@/components/workspace/ManageMembersDialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, ArrowLeft, Users } from 'lucide-react';
import { getWorkspace, addWorkspaceMember, removeWorkspaceMember } from '@/api/workspaces.js';
import { getProjects, createProject, updateProject, deleteProject } from '@/api/projects.js';
import { toast } from 'sonner';

// Helper function to get initials from username
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

interface Member {
  id: string;
  role: string;
  joined_at: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  goal: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  members: Member[];
}

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  useEffect(() => {
    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);

  const loadData = async () => {
    setIsLoading(true);

    const wsResult = await getWorkspace(workspaceId!);

    if (wsResult.success && wsResult.data) {
      setWorkspace(wsResult.data as Workspace);
      // A API já retorna os projetos dentro do workspace
      if (wsResult.data.projects) {
        setProjects(wsResult.data.projects);
      }
    } else {
      toast.error(wsResult.error || 'Failed to load workspace');
    }

    setIsLoading(false);
  };

  const handleCreateProject = async (data: { name: string; description: string; goal: string }) => {
    const result = await createProject(workspaceId!, data);
    if (result.success) {
      toast.success('Project created successfully');
      loadData();
    } else {
      toast.error(result.error || 'Failed to create project');
    }
  };

  const handleEditProject = async (id: string, data: { name: string; description: string; goal: string }) => {
    const result = await updateProject(id, data);
    if (result.success) {
      toast.success('Project updated successfully');
      loadData();
    } else {
      toast.error(result.error || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const result = await deleteProject(id);
    if (result.success) {
      toast.success('Project deleted successfully');
      loadData();
    } else {
      toast.error(result.error || 'Failed to delete project');
    }
  };

  const handleAddMember = async (userId: string) => {
    const result = await addWorkspaceMember(workspaceId!, userId);
    if (result.success) {
      toast.success('Member added successfully');
      loadData();
    } else {
      toast.error(result.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    const result = await removeWorkspaceMember(workspaceId!, userId);
    if (result.success) {
      toast.success('Member removed successfully');
      loadData();
    } else {
      toast.error(result.error || 'Failed to remove member');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
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
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workspaces
        </Button>

        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{workspace?.name}</h1>
            <p className="text-muted-foreground mt-1">{workspace?.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-muted px-3 py-2 rounded-lg transition-colors"
              onClick={() => setShowMembers(true)}
            >
              <div className="flex -space-x-2">
                {workspace?.members?.slice(0, 5).map((member) => (
                  <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={member.user?.avatar || undefined} alt={member.user?.username} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {getInitials(member.user?.username || 'U')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {(workspace?.members?.length || 0) > 5 && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{(workspace?.members.length || 0) - 5}
                    </span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Users className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-4">Create your first project to get started</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                goal={project.goal}
                onClick={() => navigate(`/project/${project.id}`)}
                onEdit={() => setEditProject(project)}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </main>

      <CreateProjectDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleCreateProject}
      />

      <EditProjectDialog
        project={editProject}
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
        onSubmit={handleEditProject}
      />

      <ManageMembersDialog
        workspaceId={workspaceId || ''}
        currentMembers={workspace?.members || []}
        open={showMembers}
        onOpenChange={setShowMembers}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
}
