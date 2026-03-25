from django.db import models
from django.core.validators import MinValueValidator
from .material import Material
from .ticket import Ticket



class TicketItem(models.Model):
    """
    Representa cada fila dinámica de materiales (Cobre, Bronce, etc.)
    """
    report = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='items')
    
    # Aquí está el cambio: ForeignKey al catálogo de materiales
    material = models.ForeignKey(Material, on_delete=models.PROTECT, verbose_name="Material (Seleccionar)")
    
    # La cantidad puede ser peso (kg) o unidades (piezas)
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0.01)]
    )
    
    UNITS_CHOICES = [
        ('KG', 'Kilogramos'),
        ('PZ', 'Piezas/Unidad'),
    ]
    unit_type = models.CharField(max_length=2, choices=UNITS_CHOICES, default='KG')

    def __str__(self):
        return f"{self.material.name}: {self.amount} {self.unit_type}"