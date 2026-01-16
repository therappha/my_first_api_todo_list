from rest_framework import permissions
from .models import WorkspaceMember

class CanEditWorkspace(permissions.BasePermission):
	def has_object_permission(self, request, view, obj):
		if hasattr(obj, 'memberships'):
			workspace = obj
		elif hasattr(obj, 'workspace'):
			workspace = obj.workspace
		elif hasattr(obj, 'project'):
			workspace = obj.project.workspace
		else:
			return False
		if request.user.is_staff or request.user.is_superuser:
			return True
		membership = WorkspaceMember.objects.filter(
			workspace=workspace,
			user=request.user).first()
		return membership and membership.role in ['owner', 'admin', 'editor']

class HasWorkspaceAuthority(permissions.BasePermission):
	def has_object_permission(self, request, view, obj):
		if hasattr(obj, 'memberships'):
			workspace = obj
		elif hasattr(obj, 'workspace'):
			workspace = obj.workspace
		elif hasattr(obj, 'project'):
			workspace = obj.project.workspace
		else:
			return False
		if not request.user or not request.user.is_authenticated:
			return False
		if request.user.is_staff or request.user.is_superuser:
			return True
		membership = WorkspaceMember.objects.filter(
			workspace=workspace,
			user=request.user
		).first()
		return membership and membership.role in ['owner', 'admin']