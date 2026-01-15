# OBJECTIVE: CREATE A TODO-LIST APPLICATION WITH THE KNOWLEDGE YOU GAINED IN THE TWO WEEKS OF ONBOARDING.

Simple todo-list endpoints using DJANGO REST FRAMEWORK


## ENDPOINTS


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
returns 201 success if created or 400 bad request if username already exists


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
