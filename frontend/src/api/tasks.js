// Tasks API mock functions
// Replace the logic inside these functions with real API calls

import { mockTasks, mockLabels, mockUsers, getAuthToken } from './mock-data.js';

/**
 * Get all tasks for a project (non-archived)
 * @param {string} projectId 
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export async function getTasks(projectId) {
  // TODO: Replace with real API call
  // GET /api/projects/{projectId}/tasks?archived=false
  // Headers: { 'Authorization': `Bearer ${token}` }
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const token = getAuthToken() || localStorage.getItem('auth_token');
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }
  
  const tasks = mockTasks
    .filter(t => t.projectId === projectId && !t.archived)
    .map(task => ({
      ...task,
      label: mockLabels.find(l => l.id === task.labelId),
      assigneeDetails: task.assignees.map(userId => 
        mockUsers.find(u => u.id === userId)
      ).filter(Boolean)
    }))
    .sort((a, b) => a.order - b.order);
  
  return { success: true, data: tasks };
}

/**
 * Get archived tasks for a project with pagination
 * @param {string} projectId 
 * @param {object} options - { page?: number, limit?: number }
 * @returns {Promise<{success: boolean, data?: {tasks: array, total: number, page: number, totalPages: number}, error?: string}>}
 */
export async function getArchivedTasks(projectId, options = {}) {
  // TODO: Replace with real API call
  // GET /api/projects/{projectId}/tasks?archived=true&page={page}&limit={limit}
  // Headers: { 'Authorization': `Bearer ${token}` }
  
  const { page = 1, limit = 10 } = options;
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const archivedTasks = mockTasks
    .filter(t => t.projectId === projectId && t.archived)
    .map(task => ({
      ...task,
      label: mockLabels.find(l => l.id === task.labelId),
      assigneeDetails: task.assignees.map(userId => 
        mockUsers.find(u => u.id === userId)
      ).filter(Boolean)
    }));
  
  const total = archivedTasks.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginatedTasks = archivedTasks.slice(start, start + limit);
  
  return {
    success: true,
    data: {
      tasks: paginatedTasks,
      total,
      page,
      totalPages
    }
  };
}

/**
 * Get a single task by ID
 * @param {string} taskId 
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getTask(taskId) {
  // TODO: Replace with real API call
  // GET /api/tasks/{taskId}
  // Headers: { 'Authorization': `Bearer ${token}` }
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const task = mockTasks.find(t => t.id === taskId);
  
  if (!task) {
    return { success: false, error: 'Task not found' };
  }
  
  return { 
    success: true, 
    data: {
      ...task,
      label: mockLabels.find(l => l.id === task.labelId),
      assigneeDetails: task.assignees.map(userId => 
        mockUsers.find(u => u.id === userId)
      ).filter(Boolean)
    }
  };
}

/**
 * Create a new task
 * @param {string} projectId 
 * @param {object} taskData - { title, description, status, assignees, labelId }
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function createTask(projectId, taskData) {
  // TODO: Replace with real API call
  // POST /api/projects/{projectId}/tasks
  // Headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  // Body: taskData
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const projectTasks = mockTasks.filter(t => t.projectId === projectId && !t.archived);
  const maxOrder = Math.max(...projectTasks.map(t => t.order), -1);
  
  const newTask = {
    id: `task-${Date.now()}`,
    title: taskData.title,
    description: taskData.description || '',
    status: taskData.status || 'NOT_STARTED',
    assignees: taskData.assignees || [],
    labelId: taskData.labelId || null,
    projectId,
    archived: false,
    createdAt: new Date().toISOString(),
    order: maxOrder + 1
  };
  
  mockTasks.push(newTask);
  
  return { 
    success: true, 
    data: {
      ...newTask,
      label: mockLabels.find(l => l.id === newTask.labelId),
      assigneeDetails: newTask.assignees.map(userId => 
        mockUsers.find(u => u.id === userId)
      ).filter(Boolean)
    }
  };
}

/**
 * Update a task
 * @param {string} taskId 
 * @param {object} updates - { title?, description?, status?, assignees?, labelId?, archived?, order? }
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function updateTask(taskId, updates) {
  // TODO: Replace with real API call
  // PUT /api/tasks/{taskId}
  // Headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  // Body: updates
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockTasks.findIndex(t => t.id === taskId);
  
  if (index === -1) {
    return { success: false, error: 'Task not found' };
  }
  
  mockTasks[index] = { ...mockTasks[index], ...updates };
  
  return { 
    success: true, 
    data: {
      ...mockTasks[index],
      label: mockLabels.find(l => l.id === mockTasks[index].labelId),
      assigneeDetails: mockTasks[index].assignees.map(userId => 
        mockUsers.find(u => u.id === userId)
      ).filter(Boolean)
    }
  };
}

/**
 * Update task status (for drag and drop)
 * @param {string} taskId 
 * @param {string} newStatus - 'NOT_STARTED' | 'ONGOING' | 'IN_REVIEW'
 * @param {number} newOrder 
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function updateTaskStatus(taskId, newStatus, newOrder) {
  // TODO: Replace with real API call
  // PATCH /api/tasks/{taskId}/status
  // Headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  // Body: { status: newStatus, order: newOrder }
  
  return updateTask(taskId, { status: newStatus, order: newOrder });
}

/**
 * Archive a task
 * @param {string} taskId 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function archiveTask(taskId) {
  // TODO: Replace with real API call
  // PATCH /api/tasks/{taskId}/archive
  // Headers: { 'Authorization': `Bearer ${token}` }
  
  return updateTask(taskId, { archived: true });
}

/**
 * Unarchive a task
 * @param {string} taskId 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function unarchiveTask(taskId) {
  // TODO: Replace with real API call
  // PATCH /api/tasks/{taskId}/unarchive
  // Headers: { 'Authorization': `Bearer ${token}` }
  
  return updateTask(taskId, { archived: false });
}

/**
 * Delete a task
 * @param {string} taskId 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteTask(taskId) {
  // TODO: Replace with real API call
  // DELETE /api/tasks/{taskId}
  // Headers: { 'Authorization': `Bearer ${token}` }
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockTasks.findIndex(t => t.id === taskId);
  
  if (index === -1) {
    return { success: false, error: 'Task not found' };
  }
  
  mockTasks.splice(index, 1);
  
  return { success: true };
}
