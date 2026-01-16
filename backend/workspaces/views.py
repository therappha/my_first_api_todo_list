from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Workspace, WorkspaceMember, Project, Task
from users.models import User
from .serializers import WorkspaceSerializer, WorkspaceDetailSerializer, ProjectSerializer, ProjectDetailSerializer, TaskSerializer
from .permissions import CanEditWorkspace, HasWorkspaceAuthority

class Pagination(PageNumberPagination):
	page_size=10
	max_page_size=50

class WorkspaceViewSet(viewsets.ModelViewSet):
	pagination_class = Pagination
	permission_classes = [IsAuthenticated]
	def get_queryset(self):
		user = self.request.user
		if user.is_superuser or user.is_staff:
			return Workspace.objects.all()
		return Workspace.objects.filter(memberships__user=user)

		
	def get_serializer_class(self):
		if (self.action == 'retrieve'):
			return WorkspaceDetailSerializer
		else:
			return WorkspaceSerializer

	def perform_create(self, serializer):
		newworkspace = serializer.save(owner = self.request.user)
		WorkspaceMember.objects.create(workspace=newworkspace, user = self.request.user, role='owner')
	
	def	perform_destroy(self, instance):
		return super().perform_destroy(instance) #raise PermissionDenied

	def get_permissions(self):
		if self.action in ['destroy','invite', 'change_role']:
			return [HasWorkspaceAuthority()]
		elif self.action in ['update', 'partial_update', 'add_project']:
			return [CanEditWorkspace()]
		else:
			return [IsAuthenticated()]
		

	@action(
			detail=True, 
		 	methods=['post'], 
			url_path='invite')
	def add_member(self, request, pk=None):
		workspace = self.get_object()
		username = request.data.get("username")
		if not username:
			return Response({"username is mandatory"}, status=400)
		user = User.objects.filter(username=username).first()
		if not user:
			return Response ({'user not found!'}, status=400)
		member, created = WorkspaceMember.objects.get_or_create(workspace=workspace, user=user)
		if created:
			member.role = "viewer"
			member.save()
			return Response({"member added with succcess"}, status=201)
		else:
			return Response({"User already in workspace"}, status=400)
		
	@action(
		detail=True,
		methods=['post'],
		url_path='kick',
	)
	def kick_member(self, request, pk=None):
		workspace = self.get_object()
		username = request.data.get("username")
		if not username:
			return Response({"username is mandatory"}, status=400)
		user = User.objects.filter(username=username).first()
		if not user:
			return Response({'user not found!'}, status=400)
		has_authority = HasWorkspaceAuthority().has_object_permission(request, self, workspace)
		if not (has_authority or user == request.user):
			return Response({'Not allowed to delete this user.'}, status=403)
		member = WorkspaceMember.objects.filter(workspace=workspace, user=user).first()
		if not member:
			return Response({'User is not a member of this workspace.'}, status=404)
		if member.role == 'owner':
			return Response({'Owner Cannot leave workspace, you need to promote another user or delete it'}, status=400)
		member.delete()
		return Response({'Member removed successfully.'}, status=200)
	
	@action(
		detail=True, 
		methods=['post'], 
		url_path='add_project', 
		permission_classes=[CanEditWorkspace])
	def add_project(self, request, pk=None):
		workspace = self.get_object()
		name = request.data.get("name")
		description = request.data.get("description")
		goal = request.data.get("goal")
		if not (name and goal):
			return Response({"Missing parameters"}, status=400)
		project = Project.objects.create(workspace = workspace, 
								   		name = name, 
										goal = goal, 
										description = description
										)
		if not project:
			return Response({"Error while creating project"}, status=400)
		return Response({"Project Created!"}, status=201)


	@action(
    detail=True,
    methods=['patch'],
    url_path='change_role')
	def change_role(self, request, pk=None):
		workspace = self.get_object()
		username = request.data.get("username")
		new_role = request.data.get("role")
		if not username or not new_role:
			return Response({"username and role are required."}, status=400)
		user = User.objects.filter(username=username).first()
		if not user:
			return Response({'User not found.'}, status=404)
		member = WorkspaceMember.objects.filter(workspace=workspace, user=user).first()
		if not member:
			return Response({'Member not found in this workspace.'}, status=404)
		if new_role == 'owner' and  not (self.request.user.is_staff or self.request.user.is_superuser):
			current_user = WorkspaceMember.objects.filter(user=self.request.user, workspace=workspace).first()
			if current_user and current_user.role != "owner":
				return Response({"Cannot promote to owner."}, status=403)
			else:
				current_user.role = 'admin'
				current_user.save()
		member.role = new_role
		member.save()
		return Response({'Role updated successfully.'}, status=200)

class ProjectViewSet(viewsets.ModelViewSet):
	serializer_class = ProjectSerializer
	pagination_class = Pagination

	def get_queryset(self):
		user = self.request.user

		if user.is_superuser or user.is_staff:
			return Project.objects.all()

		user_workspaces = Workspace.objects.filter(memberships__user=user)
		return Project.objects.filter(workspace__in=user_workspaces)

	def get_serializer_class(self):
		if (self.action == 'retrieve'):
			return ProjectDetailSerializer
		else:
			return ProjectSerializer

	def get_permissions(self):
		if self.action == 'destroy':
			return [HasWorkspaceAuthority()]
		elif self.action in ['update', 'partial_update', 'create', 'create_task']:
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
			return Response({"task name is required."}, status=400)
		task = Task.objects.create(name=name, project=project, status=Task.StatusChoices.NOT_STARTED)
		if (task):
			return (Response({"Created task"}, status=201))
		else:
			return Response({"Internal error"}, status=500)

		

			
	

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
		
	def create(self, request, *args, **kwargs):
		return Response({"Use /projects/<project_id>/create_task/ instead."}, status=400)

		return Task.objects.filter(project__workspace__memberships__user=user)



