const API_BASE = 'http://localhost:8000';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  username: string;
  name: string;
  avatarUrl: string;
}

export interface WorkspaceMember {
  id: number;
  role: string;
  joined_at: string;
  user_name: string;
  full_name: string;
  user?: {
    id: number;
    username: string;
    name: string;
    avatarUrl?: string;
  } | number; // Support legacy format for backward compatibility
}

export interface ProjectSummary {
  id: number;
  name: string;
  description: string;
  goal: string;
}

export interface Workspace {
  id: number;
  name: string;
  description: string;
  created_at: string;
  member_count: number;
  project_count: number;
}

export interface WorkspaceDetail {
  id: number;
  name: string;
  description: string;
  created_at: string;
  members: WorkspaceMember[];
  projects: ProjectSummary[];
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'in_review' | 'archived';
  project: number;
  label?: {
    label_name: string;
    label_color: string;
  };
}

export interface Label {
  id: number;
  label_name: string;
  label_color: string;
}

export interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  workspace: number;
  goal: string;
  tasks: Task[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const getAuthHeaders = (): HeadersInit => {
  const tokens = localStorage.getItem('auth_tokens');
  if (tokens) {
    const { access } = JSON.parse(tokens) as AuthTokens;
    return {
      'Authorization': `Bearer ${access}`,
      'Content-Type': 'application/json',
    };
  }
  return { 'Content-Type': 'application/json' };
};

export const api = {
  // Auth
  register: async (username: string, full_name: string, password: string) => {
    const res = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, full_name, password }),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res;
  },

  login: async (username: string, password: string): Promise<AuthTokens> => {
    const res = await fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  // User
  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/me/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  updateProfile: async (full_name: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/me/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ full_name }),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  getUser: async (id: number): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/${id}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const tokens = localStorage.getItem('auth_tokens');
    const headers: HeadersInit = {};
    if (tokens) {
      const { access } = JSON.parse(tokens) as AuthTokens;
      headers['Authorization'] = `Bearer ${access}`;
    }

    const res = await fetch(`${API_BASE}/users/me/avatar/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload avatar');
    return res.json();
  },

  // Workspaces
  getWorkspaces: async (page = 1): Promise<PaginatedResponse<Workspace>> => {
    const res = await fetch(`${API_BASE}/workspaces/?page=${page}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch workspaces');
    return res.json();
  },

  getWorkspace: async (id: number): Promise<WorkspaceDetail> => {
    const res = await fetch(`${API_BASE}/workspaces/${id}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch workspace');
    return res.json();
  },

  createWorkspace: async (name: string, description: string): Promise<Workspace> => {
    const res = await fetch(`${API_BASE}/workspaces/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error('Failed to create workspace');
    return res.json();
  },

  updateWorkspace: async (id: number, name: string, description: string): Promise<Workspace> => {
    const res = await fetch(`${API_BASE}/workspaces/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error('Failed to update workspace');
    return res.json();
  },

  deleteWorkspace: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/workspaces/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete workspace');
  },

  inviteToWorkspace: async (workspaceId: number, username: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/invite/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error('Failed to send invite');
  },
  kickMember: async (workspaceId: number, username: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/kick/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error('Failed to kick member');
  },
  changeMemberRole: async (workspaceId: number, username: string, role: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/change_role/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, role }),
    });
    if (!res.ok) throw new Error('Failed to change member role');
  },
  // Projects
  getProjects: async (page = 1): Promise<PaginatedResponse<ProjectSummary>> => {
    const res = await fetch(`${API_BASE}/projects/?page=${page}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  getProject: async (id: number): Promise<ProjectDetail> => {
    const res = await fetch(`${API_BASE}/projects/${id}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  createProject: async (workspace: number, name: string, description: string, goal: string): Promise<ProjectSummary> => {
    const res = await fetch(`${API_BASE}/workspaces/${workspace}/add_project/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, goal }),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  updateProject: async (id: number, name: string, description: string, goal: string): Promise<ProjectSummary> => {
    const res = await fetch(`${API_BASE}/projects/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, goal }),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  deleteProject: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/projects/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  createProjectTask: async (projectId: number, name: string, description?: string): Promise<Task> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/create_task/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  // Tasks
  createTask: async (project: number, name: string, additionalData?: any): Promise<Task> => {
    const taskData = {
      project,
      name,
      status: 'not_started',
      ...additionalData
    };

    const res = await fetch(`${API_BASE}/tasks/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  updateTask: async (id: number, data: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  deleteTask: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/tasks/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },
};
