from django.db import models
from django.core.validators import MinValueValidator
from .ticket import Ticket
from .company import Company

class Guide(models.Model):
    status = models.CharField(max_length=30)
    date = models.DateField()
    # Metadatos para control
    creation_date = models.DateTimeField(auto_now_add=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    inspection_record_number = models.CharField(max_length=20, null=True, blank=True)

    #Los datos de los materiales los obtendre en base a los materiales de cada item del ticket

    def __str__(self):
        return f"Guía {self.id} - Ticket {self.ticket.ticket_number} - {self.status}"