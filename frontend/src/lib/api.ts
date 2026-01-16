const API_BASE = 'http://localhost:8000';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface APIError {
  detail?: string;
  [key: string]: any;
}

export const extractErrorMessage = async (response: Response): Promise<string> => {
  try {
    const errorData: APIError = await response.json();
    return errorData.detail || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

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
  memberships: WorkspaceMember[];
  projects: ProjectSummary[];
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'in_review' | 'archived';
  project: number;
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
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    return {
      'Authorization': `Bearer ${accessToken}`,
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
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res;
  },

  login: async (username: string, password: string): Promise<AuthTokens> => {
    const res = await fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  // User
  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/me/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  updateProfile: async (full_name: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/me/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ full_name }),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  getUser: async (id: number): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/${id}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const accessToken = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      ...getAuthHeaders()
    };
    // Remove Content-Type para FormData (browser define automaticamente)
    delete (headers as any)['Content-Type'];

    const res = await fetch(`${API_BASE}/users/me/avatar/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  // Workspaces
  getWorkspaces: async (page = 1): Promise<PaginatedResponse<Workspace>> => {
    const res = await fetch(`${API_BASE}/workspaces/?page=${page}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  getWorkspace: async (id: number): Promise<WorkspaceDetail> => {
    const res = await fetch(`${API_BASE}/workspaces/${id}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  createWorkspace: async (name: string, description: string): Promise<Workspace> => {
    const res = await fetch(`${API_BASE}/workspaces/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  updateWorkspace: async (id: number, name: string, description: string): Promise<Workspace> => {
    const res = await fetch(`${API_BASE}/workspaces/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  deleteWorkspace: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/workspaces/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
  },

  inviteToWorkspace: async (workspaceId: number, username: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/invite/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username }),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
  },
  kickMember: async (workspaceId: number, username: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/kick/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username }),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
  },
  changeMemberRole: async (workspaceId: number, username: string, role: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/change_role/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, role }),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
  },
  // Projects
  getProjects: async (page = 1): Promise<PaginatedResponse<ProjectSummary>> => {
    const res = await fetch(`${API_BASE}/projects/?page=${page}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  getProject: async (id: number): Promise<ProjectDetail> => {
    const res = await fetch(`${API_BASE}/projects/${id}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  createProject: async (workspace: number, name: string, description: string, goal: string): Promise<ProjectSummary> => {
    const res = await fetch(`${API_BASE}/workspaces/${workspace}/add_project/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, goal }),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  updateProject: async (id: number, name: string, description: string, goal: string): Promise<ProjectSummary> => {
    const res = await fetch(`${API_BASE}/projects/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, goal }),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  deleteProject: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/projects/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
  },

  createProjectTask: async (projectId: number, name: string, description?: string): Promise<Task> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/create_task/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
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
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  updateTask: async (id: number, data: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  deleteTask: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/tasks/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorMessage = await extractErrorMessage(res);
      throw new Error(errorMessage);
    }
  },
};
