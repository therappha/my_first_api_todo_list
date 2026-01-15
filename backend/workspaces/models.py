from django.db import models

class TaskLabel(models.Model):
	workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE, related_name="labels")
	text = models.CharField(max_length=15, default="Label")
	color = models.CharField(max_length=8, default = "#1073AD")

	def __str__(self):
		return f"{self.text} ({self.workspace.name})"

	class Meta:
		unique_together=[('workspace', 'text')]


class WorkspaceMember(models.Model):
	class RolesChoices(models.TextChoices):
		OWNER = "owner"
		ADMIN = "admin"
		EDITOR = "editor"
		VIEWER = "viewer"

	workspace = models.ForeignKey("workspaces.Workspace", related_name="memberships", on_delete=models.CASCADE)
	user = models.ForeignKey("users.User", on_delete=models.CASCADE,related_name="workspace_memberships")
	role = models.CharField(max_length=10, choices=RolesChoices.choices, null=False, default="viewer")
	joined_at = models.DateTimeField(auto_now_add=True, )

	def __str__(self):
		return f"{self.user.username} in {self.workspace.name} ({self.role})"

	class Meta:
		unique_together = [('workspace', 'user')]

class Workspace(models.Model):
	id = models.AutoField(primary_key=True)
	name = models.CharField(max_length=30, null=False, default="My Workspace")
	description = models.CharField(max_length=200, blank=True )
	#labels= models.ManyToManyField(Label, related_name="labels")
	owner = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="my_workspaces")
	created_at = models.DateField(auto_now_add=True )

	def __str__(self):
		return self.name

class Project(models.Model):
	id = models.AutoField(primary_key=True)
	name = models.CharField(max_length=30, null=False, default="My_Project")
	workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE, related_name="projects")
	description = models.CharField(max_length=50, blank=False, )
	goal = models.CharField(max_length=300, null=False, default="add project goal here")

	def __str__(self):
		return f"{self.name} ({self.workspace.name})"


class Task(models.Model):
	class StatusChoices(models.TextChoices):
		NOT_STARTED = "not_started"
		IN_PROGRESS = "in_progress"
		IN_REVIEW = "in_review"
		ARCHIVED = "archived"

	id = models.AutoField(primary_key=True)
	name = models.CharField(max_length=40, null=False, default="My_Task")
	project = models.ForeignKey("workspaces.Project", related_name="tasks", on_delete=models.CASCADE)
	status = models.CharField(max_length=50, choices=StatusChoices.choices, null=False, default=StatusChoices.NOT_STARTED)
	labels = models.ManyToManyField("workspaces.TaskLabel", related_name="tasks", blank=True)
	assignees = models.ManyToManyField("workspaces.WorkspaceMember", related_name="tasks", blank=True)

	def __str__(self):
		return f"{self.name} - {self.project.name}"
