from django.db import models
from django.core.validators import MinValueValidator

class Company(models.Model):
    name = models.CharField(max_length=100)
    company_id_number = models.CharField(max_length=20) #Rif
    rumpa_code = models.CharField(max_length=20) #Rumpa code

    class Meta:
        # Esto cambia el nombre físico de la tabla en SQL (la base de datos)
        db_table = 'companies' 
        
        # Esto cambia cómo se muestra en el panel de administrador de Django
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'

    def __str__(self):
        return f"{self.name} ci: {self.company_id_number}"