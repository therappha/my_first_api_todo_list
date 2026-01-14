from django.contrib import admin
from .models import Workspace, WorkspaceMember
# Register your models here.
@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'description', 'owner', 'created_at']

@admin.register(WorkspaceMember)
class WorkspaceMemberAdmin(admin.ModelAdmin):
	list_display = ['workspace', 'user', 'role', 'joined_at']
