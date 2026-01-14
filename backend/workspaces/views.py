from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from .models import Workspace
from .serializers import WorkspaceSerializer
# Create your views here.

class Pagination(PageNumberPagination):
	page_size=10
	max_page_size=50


class WorkspaceViewSet(viewsets.ModelViewSet):
	serializer_class = WorkspaceSerializer
	permission_classes = [IsAuthenticated]
	pagination_class = Pagination

	def get_queryset(self):
		user = self.request.user
		return Workspace.objects.filter(memberships__user=user)
