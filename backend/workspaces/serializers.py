
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
		#return (WorkspaceMember.objects.filter(workspace = obj).count())
		return obj.memberships.count()

	def get_project_count(self, obj):
		return obj.projects.count()

class WorkspaceMemberSerializer(serializers.ModelSerializer):
	user_name = serializers.SerializerMethodField()
	full_name = serializers.SerializerMethodField()

	class Meta:
		model = WorkspaceMember
		fields = ['id', 'role', 'joined_at', 'user_name', 'full_name']

	def get_user_name(self, obj):
		return obj.user.username
	def get_full_name(self, obj):
		return obj.user.full_name

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
	#tasks = TaskSerializer(many=True, read_only=True) #Maybe use Nested Serializers?
	class Meta:
		model = Project
		fields = ['id', 'name', 'description', 'workspace', 'goal', 'tasks']

	def get_tasks(self, obj):
		tasks = TaskSerializer(obj.tasks, many = True)
		return tasks.data

class WorkspaceDetailSerializer(serializers.ModelSerializer):

	#projects = ProjectSerializer(many=True, read_only=True)
	#memberships = WorkspaceMemberSerializer(many=True, read_only=True) # Nested Serializers only work if the name of the field has the same related_name;
	memberships = serializers.SerializerMethodField()
	projects = serializers.SerializerMethodField()
	class Meta:
		model = Workspace
		fields = ['id', 'name', 'description', 'created_at','memberships', 'projects']

	def get_memberships(self, obj):
		workspace_members = WorkspaceMemberSerializer(obj.memberships, many=True)
		return workspace_members.data

	def get_projects(self, obj):
		project = ProjectSerializer(obj.projects, many=True)
		return project.data
