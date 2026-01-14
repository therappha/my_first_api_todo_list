from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import UserRegisterSerializer, CustomTokenObtainPairSerializer, CustomTokenRefreshViewSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

User = get_user_model()

class RegisterView(generics.CreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserRegisterSerializer
	permission_classes = [permissions.AllowAny]

class CustomTokenObtainPairView(TokenObtainPairView):
	serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefreshView(TokenRefreshView):
	serializer_class = CustomTokenRefreshViewSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
	user = request.user
	return Response({
		'username': user.username,
		'name' : user.full_name,
		'avatarUrl' : 'default_avatar'
			})
