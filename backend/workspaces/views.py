from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Workspace, WorkspaceMember, Project
from .serializers import WorkspaceSerializer, WorkspaceDetailSerializer, ProjectSerializer, ProjectDetailSerializer, TaskSerializer
# Create your views here.

class Pagination(PageNumberPagination):
	page_size=10
	max_page_size=50

class WorkspaceViewSet(viewsets.ModelViewSet):
	permission_classes = [IsAuthenticated]
	pagination_class = Pagination

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


class ProjectViewSet(viewsets.ModelViewSet):
	serializer_class = ProjectSerializer
	permission_classes = [IsAuthenticated]
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

class TaskViewSet(viewsets.ModelViewSet):
	serializer_class = TaskSerializer
	permission_classes = [IsAuthenticated]
	pagination_class = Pagination



