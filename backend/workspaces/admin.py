from django.contrib import admin
from .models import Workspace, WorkspaceMember, Project, Task

def set_default_description(modeladmin, request, queryset):
	"""Admin action para definir descrição padrão para tasks selecionadas"""
	updated = queryset.filter(description='').update(description='Default task description - please update me!')
	modeladmin.message_user(request, f'{updated} tasks were updated with default description.')

set_default_description.short_description = "Set default description for selected tasks"

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
	list_display = ['id', 'name', 'project', 'status', 'description']
	list_filter = ['status', 'project']
	search_fields = ['name', 'description']
	actions = [set_default_description]
	list_editable = ['description']  # Permite editar description diretamente na lista

