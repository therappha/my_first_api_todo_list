from django.contrib import admin
from .models import Workspace, WorkspaceMember, Project, Task

@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description', 'owner', 'created_at']

@admin.register(WorkspaceMember)
class WorkspaceMemberAdmin(admin.ModelAdmin):
    list_display = ['workspace', 'user', 'role', 'joined_at']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'workspace', 'description']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'project', 'status']
