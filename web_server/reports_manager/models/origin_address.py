from django.db import models
from django.core.validators import MinValueValidator
from .provider import Provider



class OriginAddress(models.Model):
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    #zip_code = models.CharField(max_length=20) de ser necesario

    def __str__(self):
        return f"{self.address}, {self.city}, {self.state}"