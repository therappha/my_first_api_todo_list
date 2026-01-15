
from rest_framework import serializers
from .models import Workspace, WorkspaceMember, Project, Task
from rest_framework.decorators import action

class WorkspaceSerializer(serializers.ModelSerializer):
	member_count = serializers.SerializerMethodField()
	project_count = serializers.SerializerMethodField()
	class Meta:
		model = Workspace
		fields = ['id', 'name', 'description', 'member_count', 'project_count']

	def get_member_count(self, obj):
		return (WorkspaceMember.objects.filter(workspace = obj).count())

	def get_project_count(self, obj):
		return (Project.objects.filter(workspace = obj).count())

class WorkspaceMemberSerializer(serializers.ModelSerializer):
	class Meta:
		model = WorkspaceMember
		fields = ['id', 'role', 'joined_at', 'user']

class TaskSerializer(serializers.ModelSerializer):
	class Meta:
		model = Task
		fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
	class Meta:
		model = Project
		fields = ['id', 'name', 'description', 'goal']


class ProjectDetailSerializer(serializers.ModelSerializer):
	tasks = serializers.SerializerMethodField()
	class Meta:
		model = Project
		fields = ['id', 'name', 'description', 'workspace', 'goal', 'tasks']

	def get_tasks(self, obj):
		tasks = Task.objects.filter(project = obj)
		return TaskSerializer(tasks, many=True).data

class WorkspaceDetailSerializer(serializers.ModelSerializer):
	members = serializers.SerializerMethodField()
	projects = serializers.SerializerMethodField()

	class Meta:
		model = Workspace
		fields = ['id', 'name', 'description', 'created_at','members', 'projects']

	def get_members(self, obj):
		workspace_members = WorkspaceMember.objects.filter(workspace = obj)
		return WorkspaceMemberSerializer(workspace_members, many=True).data

	def get_projects(self, obj):
		project = Project.objects.filter(workspace = obj)
		return ProjectSerializer(project, many=True).data
