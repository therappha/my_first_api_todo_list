// Mock data for the application
// Replace these with real API calls later

export const mockUsers = [
  {
    id: "user-1",
    username: "johndoe",
    name: "John Doe",
    avatar: null,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "user-2",
    username: "janedoe",
    name: "Jane Doe",
    avatar: null,
    createdAt: "2024-01-16T11:00:00Z"
  },
  {
    id: "user-3",
    username: "bobsmith",
    name: "Bob Smith",
    avatar: null,
    createdAt: "2024-01-17T12:00:00Z"
  }
];

export const mockLabels = [
  { id: "label-1", name: "Bug", color: "#ef4444", workspaceId: "workspace-1" },
  { id: "label-2", name: "Feature", color: "#3b82f6", workspaceId: "workspace-1" },
  { id: "label-3", name: "Improvement", color: "#10b981", workspaceId: "workspace-1" },
  { id: "label-4", name: "Documentation", color: "#8b5cf6", workspaceId: "workspace-1" },
  { id: "label-5", name: "Bug", color: "#f59e0b", workspaceId: "workspace-2" },
  { id: "label-6", name: "Feature", color: "#06b6d4", workspaceId: "workspace-2" },
];

export const mockTasks = [
  {
    id: "task-1",
    title: "Setup project structure",
    description: "Create the initial folder structure and configure build tools",
    status: "NOT_STARTED",
    assignees: ["user-1"],
    labelId: "label-2",
    projectId: "project-1",
    archived: false,
    createdAt: "2024-01-20T10:00:00Z",
    order: 0
  },
  {
    id: "task-2",
    title: "Design database schema",
    description: "Plan and document the database tables and relationships",
    status: "ONGOING",
    assignees: ["user-1", "user-2"],
    labelId: "label-2",
    projectId: "project-1",
    archived: false,
    createdAt: "2024-01-20T11:00:00Z",
    order: 1
  },
  {
    id: "task-3",
    title: "Implement authentication",
    description: "Add JWT-based authentication with login and registration",
    status: "IN_REVIEW",
    assignees: ["user-2"],
    labelId: "label-2",
    projectId: "project-1",
    archived: false,
    createdAt: "2024-01-20T12:00:00Z",
    order: 2
  },
  {
    id: "task-4",
    title: "Fix login bug",
    description: "Users cannot login with special characters in password",
    status: "NOT_STARTED",
    assignees: ["user-3"],
    labelId: "label-1",
    projectId: "project-1",
    archived: false,
    createdAt: "2024-01-21T10:00:00Z",
    order: 3
  },
  {
    id: "task-5",
    title: "Old feature implementation",
    description: "This task was completed and archived",
    status: "NOT_STARTED",
    assignees: ["user-1"],
    labelId: "label-2",
    projectId: "project-1",
    archived: true,
    createdAt: "2024-01-10T10:00:00Z",
    order: 0
  },
  {
    id: "task-6",
    title: "Archived bug fix",
    description: "This bug was fixed and archived",
    status: "NOT_STARTED",
    assignees: ["user-2"],
    labelId: "label-1",
    projectId: "project-1",
    archived: true,
    createdAt: "2024-01-08T10:00:00Z",
    order: 1
  },
  {
    id: "task-7",
    title: "Create landing page",
    description: "Design and implement the main landing page",
    status: "ONGOING",
    assignees: ["user-1"],
    labelId: "label-6",
    projectId: "project-3",
    archived: false,
    createdAt: "2024-01-22T10:00:00Z",
    order: 0
  }
];

export const mockProjects = [
  {
    id: "project-1",
    name: "Backend API",
    description: "REST API development",
    goal: "Build a scalable REST API with authentication, authorization, and CRUD operations",
    workspaceId: "workspace-1",
    createdAt: "2024-01-18T10:00:00Z"
  },
  {
    id: "project-2",
    name: "Mobile App",
    description: "React Native application",
    goal: "Create a cross-platform mobile app for iOS and Android",
    workspaceId: "workspace-1",
    createdAt: "2024-01-19T10:00:00Z"
  },
  {
    id: "project-3",
    name: "Website Redesign",
    description: "New company website",
    goal: "Redesign the company website with modern UI/UX",
    workspaceId: "workspace-2",
    createdAt: "2024-01-20T10:00:00Z"
  }
];

export const mockWorkspaces = [
  {
    id: "workspace-1",
    name: "Tech Startup",
    description: "Our main development workspace",
    members: ["user-1", "user-2", "user-3"],
    ownerId: "user-1",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "workspace-2",
    name: "Marketing Team",
    description: "Marketing and design projects",
    members: ["user-1", "user-2"],
    ownerId: "user-2",
    createdAt: "2024-01-16T10:00:00Z"
  },
  {
    id: "workspace-3",
    name: "Personal Projects",
    description: "Side projects and experiments",
    members: ["user-1"],
    ownerId: "user-1",
    createdAt: "2024-01-17T10:00:00Z"
  }
];

// Token storage simulation
let currentToken = null;
let currentUser = null;

export const setAuthToken = (token) => {
  currentToken = token;
};

export const getAuthToken = () => currentToken;

export const setCurrentUser = (user) => {
  currentUser = user;
};

export const getCurrentUser = () => currentUser;
