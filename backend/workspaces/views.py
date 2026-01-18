from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Workspace, WorkspaceMember, Project, Task
from django.contrib.auth import get_user_model
from .serializers import WorkspaceSerializer, WorkspaceDetailSerializer, ProjectSerializer, ProjectDetailSerializer, TaskSerializer, ChangeRoleSerializer, KickMemberSerializer
from .serializers import AddMemberSerializer
from .permissions import CanEditWorkspace, HasWorkspaceAuthority
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound


User = get_user_model()

class Pagination(PageNumberPagination):
	page_size=10
	max_page_size=50

class WorkspaceViewSet(viewsets.ModelViewSet):
	pagination_class = Pagination
	permission_classes = [IsAuthenticated]
	def get_queryset(self):
		user = self.request.user
		if user.is_superuser or user.is_staff:
			return Workspace.objects.all().prefetch_related("memberships__user", "projects")
		return Workspace.objects.filter(memberships__user=user).prefetch_related("memberships__user", "projects")
		#Ja que vc ja vai buscar workspaces, busca tambem memberships e projects!


	def get_serializer_class(self):
		if (self.action == 'retrieve'):
			return WorkspaceDetailSerializer
		else:
			return WorkspaceSerializer

	def perform_create(self, serializer):
		newworkspace = serializer.save(owner = self.request.user)
		WorkspaceMember.objects.create(workspace=newworkspace, user = self.request.user, role='owner')

	def get_permissions(self):
		if self.action in ['destroy','add_member', 'change_role']:
			return [HasWorkspaceAuthority()]
		elif self.action in ['update', 'partial_update', 'add_project']:
			return [CanEditWorkspace()]
		else:
			return [IsAuthenticated()]


	@action(
		detail=True,
		methods=['post'],
		url_path='invite',
		permission_classes=[CanEditWorkspace])
	def add_member(self, request, pk=None):
		serializer = AddMemberSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		username = serializer.validated_data['username']
		workspace = self.get_object()
		user = User.objects.filter(username=username).first()
		if not user:
			raise NotFound({"detail": "user not found"})
		member, created = WorkspaceMember.objects.get_or_create(workspace=workspace, user=user)
		if created:
			member.role = "viewer"
			member.save()
			return Response({"detail": "member added with succcess"}, status=201)
		else:
			raise ValidationError({"detail": "User already in workspace"})

	@action(
		detail=True,
		methods=['post'],
		url_path='kick',
	)
	def kick_member(self, request, pk=None):
		serializer = KickMemberSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		username = serializer.validated_data['username']
		workspace = self.get_object()
		user = User.objects.filter(username=username).first()
		if not user:
			raise NotFound({"detail": "user not found!"})
		has_authority = HasWorkspaceAuthority().has_object_permission(request, self, workspace)
		if not (has_authority or user == request.user):
			raise PermissionDenied({"detail": "Not allowed to delete this user."})
		member = WorkspaceMember.objects.filter(workspace=workspace, user=user).first()
		if not member:
			raise NotFound({"detail": "User is not a member of this workspace."})
		if member.role == 'owner':
			raise PermissionDenied({"detail": "Owner Cannot leave workspace, you need to promote another user or delete it"})
		member.delete()
		return Response({"detail": 'Member removed successfully.'}, status=200)

	@action(
		detail=True,
		methods=['post'],
		url_path='add_project',
		permission_classes=[CanEditWorkspace])
	def add_project(self, request, pk=None):
		workspace = self.get_object()
		project = ProjectSerializer(data = request.data) # WHY data= request.data? ??
		try:
			project.is_valid(raise_exception=True)
		except:
			raise ValidationError({"detail": "Invalid Parameters"})
		project.save(workspace=workspace)
		return Response({"detail": "Project Created!"}, status=201)


	@action(
		detail=True,
		methods=['patch'],
		url_path='change_role')
	def change_role(self, request, pk=None):
		serializer = ChangeRoleSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		username = serializer.validated_data['username']
		new_role = serializer.validated_data['role']
		workspace = self.get_object()
		user = User.objects.filter(username=username).first()
		if not user:
			raise NotFound({"detail": "User not found."})
		member = WorkspaceMember.objects.filter(workspace=workspace, user=user).first()
		if not member:
			raise NotFound({"detail": "Member not found in this workspace."})
		current_user = WorkspaceMember.objects.filter(user=self.request.user, workspace=workspace).first()

		if new_role == 'owner' or member.role == 'owner':
			if current_user and new_role == 'owner' and (current_user.role != "owner" and not (self.request.user.is_staff or self.request.user.is_superuser)):
				raise PermissionDenied({"detail": "Cannot promote to owner."})
			if not (self.request.user.is_staff or self.request.user.is_superuser or current_user.role == "owner"):
				raise PermissionDenied({"detail": "Cannot demote owner."})
			elif not (self.request.user.is_staff or self.request.user.is_superuser):
				current_user.role = 'admin'
				current_user.save()
		member.role = new_role
		member.save()
		return Response({"detail": 'Role updated successfully.'}, status=200)

class ProjectViewSet(viewsets.ModelViewSet):
	serializer_class = ProjectSerializer
	pagination_class = Pagination

	def get_queryset(self):
		user = self.request.user

		if user.is_superuser or user.is_staff:
			return Project.objects.all().prefetch_related("tasks")

		user_workspaces = Workspace.objects.filter(memberships__user=user)
		return Project.objects.filter(workspace__in=user_workspaces).prefetch_related("tasks")

	def get_serializer_class(self):
		if (self.action == 'retrieve'):
			return ProjectDetailSerializer
		else:
			return ProjectSerializer

	def get_permissions(self):

		if self.action in ['destroy', 'update', 'partial_update', 'create', 'create_task']:
			return [CanEditWorkspace()]
		else:
			return [IsAuthenticated()]
	@action(
		detail=True,
		methods=['post'],
		url_path='create_task',
		permission_classes=[CanEditWorkspace])
	def create_task(self, request, pk):
		project = self.get_object()
		name = request.data.get("name")
		description = request.data.get("description")
		if not name:
			raise ValidationError({"detail": "task name is required."})
		if not description:
			description = ""
		task = Task.objects.create(name=name, project=project, description=description, status=Task.StatusChoices.NOT_STARTED)
		if task:
			return Response({"detail": "Created task"}, status=201)
		else:
			raise ValidationError({"detail": "Internal error"})


class TaskViewSet(viewsets.ModelViewSet):
	serializer_class = TaskSerializer
	permission_classes = [IsAuthenticated]
	pagination_class = Pagination

	def get_permissions(self):
		if self.action in ['update', 'partial_update', 'destroy']:
			return [CanEditWorkspace()]
		else:
			return [IsAuthenticated()]

	def get_queryset(self):
		user = self.request.user

		if user.is_superuser or user.is_staff:
			return Task.objects.all()
		return Task.objects.filter(project__workspace__memberships__user=user)

	def create(self, request, *args, **kwargs):
		return Response({"detail": "Use /projects/<project_id>/create_task/ instead."}, status=400)





