// Workspaces API mock functions
// Replace the logic inside these functions with real API calls

import { mockWorkspaces, mockUsers, getAuthToken, getCurrentUser } from './mock-data.js';

/**
 * Get all workspaces for current user with pagination
 * @param {object} options - { page?: number, limit?: number }
 * @returns {Promise<{success: boolean, data?: {workspaces: array, total: number, page: number, totalPages: number}, error?: string}>}
 */
export async function getWorkspaces(options = {}) {
  const { page = 1, limit = 6 } = options;

  const token = localStorage.getItem('auth_token');
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

	const response = await fetch(`http://localhost:8000/workspaces/?page=${page}&page_size=${limit}`, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		return { success: false, error: errorData.detail || 'Failed to fetch workspaces' };
	}

	const data = await response.json();

	// A API retorna: { count, next, previous, results }
	const totalPages = Math.ceil(data.count / limit);

  return {
    success: true,
    data: {
      workspaces: data.results,
      total: data.count,
      page,
      totalPages,
      hasNext: data.next !== null,
      hasPrevious: data.previous !== null
    }
  };
}

/**
 * Get a single workspace by ID
 * @param {string} workspaceId
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getWorkspace(workspaceId) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`http://localhost:8000/workspaces/${workspaceId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Workspace not found' };
      }
      const errorData = await response.json();
      return { success: false, error: errorData.detail || 'Failed to fetch workspace' };
    }

    const workspace = await response.json();

    return { success: true, data: workspace };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Create a new workspace
 * @param {object} workspaceData - { name, description }
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function createWorkspace(workspaceData) {
  // TODO: Replace with real API call
  // POST /api/workspaces
  // Headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  // Body: workspaceData

  await new Promise(resolve => setTimeout(resolve, 300));

  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const newWorkspace = {
    id: `workspace-${Date.now()}`,
    name: workspaceData.name,
    description: workspaceData.description || '',
    members: [currentUser.id],
    ownerId: currentUser.id,
    createdAt: new Date().toISOString()
  };

  mockWorkspaces.push(newWorkspace);

  return {
    success: true,
    data: {
      ...newWorkspace,
      memberDetails: [currentUser]
    }
  };
}

/**
 * Update a workspace
 * @param {string} workspaceId
 * @param {object} updates - { name?, description? }
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function updateWorkspace(workspaceId, updates) {
  // TODO: Replace with real API call
  // PUT /api/workspaces/{workspaceId}
  // Headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  // Body: updates

  await new Promise(resolve => setTimeout(resolve, 300));

  const index = mockWorkspaces.findIndex(w => w.id === workspaceId);

  if (index === -1) {
    return { success: false, error: 'Workspace not found' };
  }

  mockWorkspaces[index] = { ...mockWorkspaces[index], ...updates };

  return { success: true, data: mockWorkspaces[index] };
}

/**
 * Delete a workspace
 * @param {string} workspaceId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteWorkspace(workspaceId) {
  // TODO: Replace with real API call
  // DELETE /api/workspaces/{workspaceId}
  // Headers: { 'Authorization': `Bearer ${token}` }

  await new Promise(resolve => setTimeout(resolve, 300));

  const index = mockWorkspaces.findIndex(w => w.id === workspaceId);

  if (index === -1) {
    return { success: false, error: 'Workspace not found' };
  }

  mockWorkspaces.splice(index, 1);

  return { success: true };
}

/**
 * Add member to workspace
 * @param {string} workspaceId
 * @param {string} userId
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function addWorkspaceMember(workspaceId, userId) {
  // TODO: Replace with real API call
  // POST /api/workspaces/{workspaceId}/members
  // Headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  // Body: { userId }

  await new Promise(resolve => setTimeout(resolve, 300));

  const workspace = mockWorkspaces.find(w => w.id === workspaceId);

  if (!workspace) {
    return { success: false, error: 'Workspace not found' };
  }

  if (!workspace.members.includes(userId)) {
    workspace.members.push(userId);
  }

  return { success: true, data: workspace };
}

/**
 * Remove member from workspace
 * @param {string} workspaceId
 * @param {string} userId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function removeWorkspaceMember(workspaceId, userId) {
  // TODO: Replace with real API call
  // DELETE /api/workspaces/{workspaceId}/members/{userId}
  // Headers: { 'Authorization': `Bearer ${token}` }

  await new Promise(resolve => setTimeout(resolve, 300));

  const workspace = mockWorkspaces.find(w => w.id === workspaceId);

  if (!workspace) {
    return { success: false, error: 'Workspace not found' };
  }

  workspace.members = workspace.members.filter(id => id !== userId);

  return { success: true };
}
