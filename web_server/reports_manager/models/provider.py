from django.db import models
from django.core.validators import MinValueValidator

#Chofer
class Provider(models.Model):
    name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=20)
    #signature 
    #implementacion futura para fotos de las firmas 

    def __str__(self):
        return f"{self.name} ci: {self.id_number}"