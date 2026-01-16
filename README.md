# OBJECTIVE: CREATE A TODO-LIST APPLICATION WITH THE KNOWLEDGE YOU GAINED IN THE TWO WEEKS OF ONBOARDING.

Simple todo-list endpoints using DJANGO REST FRAMEWORK


## ENDPOINTS



1. POST /register/ - Register new user
2. POST /login/ - Login user
3. POST /verify/ - Verify token
4. POST /refresh/ - Refresh access token

5. GET /users/me/ - Get current user profile
6. GET /workspaces/ - List all workspaces the current user have access
7. GET /workspaces/<workspace_id>/ - Retrieve workspace details if user have access
8. GET /projects/ - List all projects the current user have access
9. GET /projects/<project_id>/ - Retrieve project details
10. POST /workspaces/<workspace_id>/invite/ - Add member to workspace
11. POST /workspaces/<workspace_id>/kick/ - Remove member from workspace
12. PATCH /workspaces/<workspace_id>/change_role/ - Change member role
13. POST /workspaces/<workspace_id>/add_project/ - Create project
14. POST /projects/<project_id>/create_task/ - Create task
15. PATCH /tasks/<task_id>/ - Update task
16. DELETE /tasks/<task_id>/ - Delete task
17. DELETE /projects/<project_id>/ - Delete project




POST /register/
```
	headers:
	{
		"Content-Type": "application/json"
	}
	body:
	{
		"username": "string",
		"full_name": "string",
		"password": "string"
	}

```
returns 201 success if created or 400 bad request if username already exists but returns nothing!


POST /login/


```
	headers:
	{
		"Content-Type": "application/json"
	}
	body:
	{
		"username": "string",
		"password": "string"
	}
```
returns 200 success with tokens
```
	{
		"refresh": "token_string",
		"access": "token_string"
	}
```


GET /users/me/
```
	headers:
	{
		"Authorization": "Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body: none
```
returns 200 with user details for profile page
```
{
	{"username":"username","name":"full_name","avatarUrl":"avatarurl"}
}
```

GET /workspaces/
need: authentication
```
	headers:
	{
		"Authorization: ""Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body: none
```

returns 200 success with list of workspaces user is member of or all workspaces if admin
```
	{
		"count": 3,
		"next": null,
		"previous": null,
		"results": [
			{
				"id": 4,
				"name": "WORKSPACE I DO HAVE ACCESS",
				"description": "I HOPE SO",
				"created_at": "2026-01-14",
				"member_count": 2
				"project_count": 5
			},
			{
				"id": 5,
				"name": "Test WORKSPACE",
				"description": "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
				"created_at": "2026-01-14",
				"member_count": 2
				"project_count": 0
			},
			{
				"id": 6,
				"name": "another workspace",
				"description": "workspaceasdsadasdas",
				"created_at": "2026-01-14",
				"member_count": 2
				"project_count": 2
			}
		]
	}

```


GET /workspaces/<workspace_id>/
```
need: authentication
```
	headers:
	{
		"Authorization: ""Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body: none
```
returns 200 success with workspace details if user is member or admin
```
{
	"id": 4,
	"name": "WORKSPACE I DO HAVE ACCESS",
	"description": "I HOPE SO",
	"created_at": "2026-01-14",
	"memberships": [
		{
			"id": 2,
			"role": "admin",
			"joined_at": "2026-01-14T17:59:25.027696Z",
			"user": 2
		},
		{
			"id": 9,
			"role": "admin",
			"joined_at": "2026-01-14T19:45:55.543345Z",
			"user": 7
		}
	],
	"projects": [
		{
			"id": 1,
			"name": "First Project",
			"description": "Create a todo list",
			"goal": "The goal of this project is to learn DJANGO and create endpoints for a todo-list application!"
		}
	]
	}
```
POST /workspaces/${workspaceId}/invite/
need: authentication, admin role in workspace
```
	headers:
	{
		"Authorization: ""Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body:
	{
		"username": "string",
	}
```
returns 200 success if user invited or 403 if not admin or 404 if user or workspace not found
```
{
	"detail": "member added with succcess"
}
```


POST /workspaces/${workspaceId}/kick/
need: authentication, admin role in workspace
```
	headers:
	{
		"Authorization: ""Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body:
	{
		"username": "string",
	}
```
returns 200 success if user removed or 403 if not admin or 404 if user or workspace not found

PATCH /workspaces/${workspaceId}/change_role/
need: authentication, admin role in workspace
```
	headers:
	{
		"Authorization: ""Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body:
	{
		"username": "string",
		"role": "string"  // "owner", "admin", "editor", "viewer"
	}
```
returns 200 success if role changed or 403 if not admin or 404 if user or
GET /projects/
need: authentication
```
	headers:
	{
		"Authorization: ""Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body: none
```
returns 200 sucess with list of projects user has access to or all projects if admin
```
{
	"count": 6,
	"next": null,
	"previous": null,
	"results": [
		{
			"id": 1,
			"name": "Onboarding of new It crew",
			"description": "Guide and lead the new it guys",
			"goal": "Treat them well, please."
		},
		{
			"id": 2,
			"name": "Pedagogy",
			"description": "Ricardo's onboarding",
			"goal": "Ricardo need to do all Rafael did"
		},
		{
			"id": 5,
			"name": "Delete Me",
			"description": "test project for ricardo to delete",
			"goal": "make sure editor can delete and viewer no!"
		},

	]
}

```

GET /projects/<project_id>/
need: authentication
```
	headers:
	{
		"Authorization: ""Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body: none
```
returns 200 success with project details and tasks if user has access or admin
```
	{
	"id": 1,
	"name": "First Project",
	"description": "Create a todo list",
	"workspace": 4,
	"goal": "The goal of this project is to learn DJANGO and create endpoints for a todo-list application!",
	"tasks": [
		{
			"id": 2,
			"name": "MY FIRST TASK",
			"description": "This is my first task in the todo-list application",
			"status": "not_started",
			"project": 1,
			"labels": [],
			"assignees": []
		},
		{
			"id": 3,
			"name": "Review what react boilerplate is.",
			"status": "not_started",
			"description": "",
			"project": 1,
			"labels": [],
			"assignees": []
		},

	]
	}
```

GET /tasks/
need: authentication
```
	headers:
	{
		"Authorization: ""Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body: none
```
returns 200 success with list of tasks user has access to or all tasks if admin
```
{
	"count": 20,
	"next": "http://localhost:8000/tasks/?page=2",
	"previous": null,
	"results": [
		{
			"id": 1,
			"name": "TODO_LIST",
			"status": "in_review",
			"description": "I hope i did well",
			"project": 1,
			"labels": [],
			"assignees": []
		},
		{
			"id": 2,
			"name": "Make the new django course!",
			"status": "not_started",
			"description": "",
			"project": 1,
			"labels": [],
			"assignees": []
		},
		{
			"id": 3,
			"name": "Review what react boilerplate is.",
			"status": "not_started",
			"description": "",
			"project": 1,
			"labels": [],
			"assignees": []
		}
	]
}
```

PATCH /tasks/<task_id>/ - Update task
need: authentication, editor or higher role in project workspace
```
	headers:
	{
		"Authorization: ""Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body:
	{
		"name": "string",               // optional
		"description": "string",        // optional
		"status": "string",             // optional // "not_started", "in_progress", "archived","in_review"
	}
```
returns 200 success with updated task details or 403 if no permission or 404 if task not found
```
DELETE /tasks/<task_id>/
```
need: authentication, editor or higher role in project workspace
```
	headers:
	{
		"Authorization: ""Bearer <access_token>"
		"Content-Type": "application/json"
	}
	body: none
```
returns 204 success if deleted or 403 if no permission or 404 if task not found
