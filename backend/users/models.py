from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
	'''Default User Model, used for custom authentication!'''
	full_name = models.CharField(max_length=100,)
	username = models.CharField(max_length=15, null=False, unique=True)
	password = models.CharField("password", max_length=500, null=False)

	def __str__(self):
		return f"{self.full_name} (@{self.username})" if self.full_name else f"@{self.username}"

