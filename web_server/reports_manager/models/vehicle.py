from django.db import models
from django.core.validators import MinValueValidator
from .provider import Provider


class Vehicle(models.Model):

    def license_plate_photo_path(instance, filename):
        return f'providers/{instance.provider.id}/vehicles/{instance.id}/licence_plate/{filename}'

    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    plate = models.CharField(max_length=20)
    color = models.CharField(max_length=50)
    is_main = models.BooleanField(default=False)
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE)
    license_plate_photo = models.ImageField(upload_to=license_plate_photo_path, null=True, blank=True)

    #fotos para implementacion proxima

    def __str__(self):
        return f"{self.brand} {self.model} - {self.plate}"