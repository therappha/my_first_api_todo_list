// Authentication API mock functions
// Replace the logic inside these functions with real API calls

import {setAuthToken, getAuthToken, setCurrentUser, getCurrentUser } from './mock-data.js';

/**
 * Login user with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{success: boolean, data?: {token: string}, error?: string}>}
 */
export async function login(username, password) {

	const response = await fetch('http://localhost:8000/login/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, password })
	});
	if (response.status != 200)
	{
		return { sucess: false, error:response.error}

	}
	const data = await response.json();
	const token = data.access
	const refresh = data.refresh


  	setAuthToken(token);

	const getuser = await getMe();
	const user = getuser.data;
  // Store in localStorage for persistence
  localStorage.setItem('auth_token', token);
  localStorage.setItem('current_user', JSON.stringify(user));
  localStorage.setItem('refresh', refresh);

  return {
    success: true,
    data: {
      user,
      token
    }
  };
}

/**
 * Register a new user
 * @param {object} userData - { username, name, password }
 * @returns {Promise<{success: boolean, data?: {user: object, token: string}, error?: string}>}
 */
export async function register(userData) {

	const username = userData.username
	const full_name = userData.name
	const password = userData.password
	const response = await fetch('http://localhost:8000/register/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},


		body: JSON.stringify({username, full_name, password})
	});
	if (response.status != 201)
	{
		return { sucess: false, error:response.error}
	}

  const newUser = {
    username: userData.username,
    name: userData.name,
    avatar: null,
  };


  const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;

  setAuthToken(token);
  setCurrentUser(newUser);

  localStorage.setItem('auth_token', token);
  localStorage.setItem('current_user', JSON.stringify(newUser));

  return {
    success: true,
    data: {
      user: newUser,
      token
    }
  };
}

/**
 * Logout current user
 * @returns {Promise<{success: boolean}>}
 */
export async function logout() {

	const token = getAuthToken() || localStorage.getItem('auth_token');
	const response = await fetch('http://localhost:8000/logout/', {
	method: 'POST',
	headers: {
		'Authorization': `Bearer ${token}`,
		'Content-Type': 'application/json',
	}
	});


  setAuthToken(null);
  setCurrentUser(null);

  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');

  return { success: true };
}

/**
 * Get current authenticated user
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */


export async function getMe() {
  const token = getAuthToken() || localStorage.getItem('auth_token');

  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  // Aqui é onde deveria chamar users/me
  const response = await fetch('http://localhost:8000/users/me/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (response.status !== 200) {
    return { success: false, error: 'Failed to get user data' };
  }

  const user = await response.json();
  setCurrentUser(user);
  localStorage.setItem('current_user', JSON.stringify(user));

  return { success: true, data: user };
}


/**
 * Update user profile
 * @param {object} updates - { name?, avatar? }
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function updateProfile(updates) {
  // TODO: Replace with real API call
  // PUT /api/auth/profile
  // Headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  // Body: updates

  await new Promise(resolve => setTimeout(resolve, 300));

  const currentUser = getCurrentUser();

  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const updatedUser = { ...currentUser, ...updates };

  // Update in mockUsers array
  const index = mockUsers.findIndex(u => u.id === currentUser.id);
  if (index !== -1) {
    mockUsers[index] = updatedUser;
  }

  setCurrentUser(updatedUser);
  localStorage.setItem('current_user', JSON.stringify(updatedUser));

  return { success: true, data: updatedUser };
}

/**
 * Upload user avatar
 * @param {File} file
 * @returns {Promise<{success: boolean, data?: {avatarUrl: string}, error?: string}>}
 */
export async function uploadAvatar(file) {
  // TODO: Replace with real API call
  // POST /api/auth/avatar
  // Headers: { 'Authorization': `Bearer ${token}` }
  // Body: FormData with file

  await new Promise(resolve => setTimeout(resolve, 500));

  // Create a local URL for the file (in real app, this would be a server URL)
  const avatarUrl = URL.createObjectURL(file);

  const result = await updateProfile({ avatar: avatarUrl });

  if (result.success) {
    return { success: true, data: { avatarUrl } };
  }

  return { success: false, error: 'Failed to upload avatar' };
}
