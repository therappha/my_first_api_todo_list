
from rest_framework import serializers
from .models import Workspace, WorkspaceMember

class WorkspaceSerializer(serializers.ModelSerializer):
	member_count = serializers.SerializerMethodField()
	class Meta:
		model = Workspace
		fields = ['id', 'name', 'description', 'created_at', 'member_count']

	def get_member_count(self, obj):
		wor = WorkspaceMember.objects.filter(workspace = obj).count()
		
		return (wor)
		

