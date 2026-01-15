from rest_framework import permissions
from .models import WorkspaceMember
from .permissions import CanEditWorkspace, HasWorkspaceAuthority

class CanEditWorkspace(permissions.BasePermission):
	def has_object_permission(self, request, view, obj):
		if request.user.is_staff or request.user.is_superuser:
			return True
		membership = WorkspaceMember.objects.filter(
			workspace=obj,
			user=request.user
		).first()
		return membership and membership.role in ['owner', 'admin', 'editor']

class HasWorkspaceAuthority(permissions.BasePermission):
	def has_object_permission(self, request, view, obj):
		if request.user.is_staff or request.user.is_superuser:
			return True
		membership = WorkspaceMember.objects.filter(
			workspace=obj,
			user=request.user
		).first()

		return membership and membership.role in ['owner', 'admin']


