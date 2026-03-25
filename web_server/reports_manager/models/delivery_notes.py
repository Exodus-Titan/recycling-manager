from django.db import models
from django.core.validators import MinValueValidator
from .ticket import Ticket
from .company import Company
from .provider import Provider

#probablemente sea mejor no usar este modelo sino sacar la info del Affidavit para generar este documento

class DeliveryNote(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE)
    truck_brand = models.CharField(max_length=50)
    truck_model = models.CharField(max_length=50)
    truck_plate = models.CharField(max_length=20)
    truck_color = models.CharField(max_length=20)
    start_address = models.CharField(max_length=200)
    start_city = models.CharField(max_length=100)
    start_state = models.CharField(max_length=100)
    end_address = models.CharField(max_length=200)
    end_city = models.CharField(max_length=100)
    end_state = models.CharField(max_length=100)

    # Metadatos para control
    creation_date = models.DateTimeField(auto_now_add=True)

    startdate = models.DateTimeField()
    enddate = models.DateTimeField()

    def __str__(self):
        return f"Delivery Note {self.id} - {self.company.name}"