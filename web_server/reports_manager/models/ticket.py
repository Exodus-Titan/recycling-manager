from django.db import models
from django.core.validators import MinValueValidator
from .provider import Provider


class Ticket(models.Model):
    """
    Representa la cabecera de la Nota de Recibo.
    """
    ticket_number = models.CharField(max_length=20, unique=True, verbose_name="Número de Nota (Rojo)")
    date  = models.DateField(verbose_name="Fecha del Recibo")
    #client_name = models.CharField(max_length=255, verbose_name="Señor(es)")
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, verbose_name="Proveedor", related_name='tickets', null=True, blank=True)
    employee_name = models.CharField(max_length=100, verbose_name="Empleado que registra")
    
    # Imagen del ticket para respaldo
    # Comentado para implementacion posterior
    #foto_ticket = models.ImageField(upload_to='tickets/%Y/%m/%d/', null=True, blank=True)
    
    # Datos de totales al pie de la nota
    total_weight = models.DecimalField(max_digits=10, decimal_places=2, help_text="Suma total de pesos")
    installment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    #Abono

    # Metadatos para control
    creation_date = models.DateTimeField(auto_now_add=True)


    # Comentado para implementacion posterior
    #id_google_drive = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Nota {self.ticket_number}"