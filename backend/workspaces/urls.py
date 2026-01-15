from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkspaceViewSet, ProjectViewSet

router = DefaultRouter()
router.register(r'workspaces', WorkspaceViewSet, basename='workspace')
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
	path('', include(router.urls)),
]
