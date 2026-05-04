from django.db import models
from django.core.validators import MinValueValidator
from .vehicle import Vehicle
from .provider import Provider

class VehiclePhoto(models.Model):

    def vehicle_photos_path(instance, filename):
        return f'providers/{instance.vehicle.provider.id}/vehicles/{instance.vehicle.id}/photos/{filename}'

    # Con related_name='photos', podrás hacer: mi_vehiculo.photos.all()
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to=vehicle_photos_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Foto de {self.vehicle.plate}"