from django.db import models
from django.core.validators import MinValueValidator
from .provider import Provider



class Address(models.Model):
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    #zip_code = models.CharField(max_length=20) de ser necesario

    provider = models.ForeignKey('Provider', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.address}, {self.city}, {self.state}"