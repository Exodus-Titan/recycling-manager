from django.db import models
from django.core.validators import MinValueValidator
from .provider import Provider


class Vehicle(models.Model):
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    plate = models.CharField(max_length=20)
    color = models.CharField(max_length=50)
    is_main = models.BooleanField(default=False)
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE)

    #fotos para implementacion proxima

    def __str__(self):
        return f"{self.brand} {self.model} - {self.plate}"