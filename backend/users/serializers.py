from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True)
	class Meta:
		model = User
		fields = ['username', 'full_name', 'password']

	def create(self, validated_data):
		user = User.objects.create_user(
			username=validated_data['username'],
			full_name=validated_data['full_name'],
			password=validated_data['password']
		)
		return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
	@classmethod
	def get_token(cls, user):
		token = super().get_token(user)
		token['username'] = user.username
		return token
#	return Response({ 'username': user.username,'name' : user.full_name,'avatarUrl' : 'default_avatar'}, 200)

class MeSerializer(serializers.Serializer):
	username = serializers.CharField()
	name = serializers.CharField(source='full_name')
	avatarUrl = serializers.SerializerMethodField

	def get_avatarUrl(self, obj):
		# Retorna avatar url enquanto nao existe no usermodel ainda
		return "default_avatar"


class CustomTokenRefreshViewSerializer(TokenRefreshSerializer):
	pass
