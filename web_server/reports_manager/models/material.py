from django.db import models
from django.core.validators import MinValueValidator

class Material(models.Model):
    """
    Catálogo de materiales (Cobre, Bronce, Plomo, etc.)
    Esto es lo que aparecerá en el Dropdown.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True, help_text="Notas sobre calidad o tipo")

    class Meta:
        verbose_name_plural = "Materiales"

    def __str__(self):
        return self.name