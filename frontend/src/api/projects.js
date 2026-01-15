// Projects API mock functions
// Replace the logic inside these functions with real API calls

import { mockProjects, getAuthToken } from './mock-data.js';

/**
 * Get all projects for a workspace
 * @param {string} workspaceId
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export async function getProjects(workspaceId) {
  // TODO: Replace with real API call
  // GET /api/workspaces/{workspaceId}/projects
  // Headers: { 'Authorization': `Bearer ${token}` }

  await new Promise(resolve => setTimeout(resolve, 200));

  const token = getAuthToken() || localStorage.getItem('auth_token');
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  const projects = mockProjects.filter(p => p.workspaceId === workspaceId);

  return { success: true, data: projects };
}

/**
 * Get a single project by ID
 * @param {string} projectId
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getProject(projectId) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`http://localhost:8000/projects/${projectId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Project not found' };
      }
      if (response.status === 403) {
        return { success: false, error: 'Access denied' };
      }
      const errorData = await response.json();
      return { success: false, error: errorData.detail || 'Failed to fetch project' };
    }

    const project = await response.json();
    return { success: true, data: project };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Create a new project
 * @param {string} workspaceId
 * @param {object} projectData - { name, description, goal }
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function createProject(workspaceId, projectData) {
  // TODO: Replace with real API call
  // POST /api/workspaces/{workspaceId}/projects
  // Headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  // Body: projectData

  await new Promise(resolve => setTimeout(resolve, 300));

  const newProject = {
    id: `project-${Date.now()}`,
    name: projectData.name,
    description: projectData.description || '',
    goal: projectData.goal || '',
    workspaceId,
    createdAt: new Date().toISOString()
  };

  mockProjects.push(newProject);

  return { success: true, data: newProject };
}

/**
 * Update a project
 * @param {string} projectId
 * @param {object} updates - { name?, description?, goal? }
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function updateProject(projectId, updates) {
  // TODO: Replace with real API call
  // PUT /api/projects/{projectId}
  // Headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  // Body: updates

  await new Promise(resolve => setTimeout(resolve, 300));

  const index = mockProjects.findIndex(p => p.id === projectId);

  if (index === -1) {
    return { success: false, error: 'Project not found' };
  }

  mockProjects[index] = { ...mockProjects[index], ...updates };

  return { success: true, data: mockProjects[index] };
}

/**
 * Delete a project
 * @param {string} projectId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteProject(projectId) {
  // TODO: Replace with real API call
  // DELETE /api/projects/{projectId}
  // Headers: { 'Authorization': `Bearer ${token}` }

  await new Promise(resolve => setTimeout(resolve, 300));

  const index = mockProjects.findIndex(p => p.id === projectId);

  if (index === -1) {
    return { success: false, error: 'Project not found' };
  }

  mockProjects.splice(index, 1);

  return { success: true };
}
