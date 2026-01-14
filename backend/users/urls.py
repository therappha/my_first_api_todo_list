from django.urls import path, include
from rest_framework_simplejwt.views import TokenVerifyView, TokenRefreshView
from .views import RegisterView, CustomTokenObtainPairView, me

urlpatterns = [

    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('refresh/', TokenRefreshView.as_view, name='token_refresh'),
	path('verify/', TokenVerifyView.as_view(), name='token_verify'),
	path('users/me/', me, name="user_get_me")
]
