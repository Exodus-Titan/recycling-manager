from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from ..models import TicketItem, Material, Ticket
from ..serializers import TicketItemSerializer

class TicketItemViewSet(viewsets.ModelViewSet):
    queryset = TicketItem.objects.all()
    serializer_class = TicketItemSerializer

    def validate_item_data(self, item_data):
        material_id = item_data.get('material')
        amount = item_data.get('amount')
        unit_type = item_data.get('unit_type')

        if not material_id:
            raise ValidationError("Debe seleccionar un material.")
        
        try:
            amount_val = float(amount)
            if amount_val <= 0:
                raise ValidationError("La cantidad debe ser mayor a cero.")
        except (TypeError, ValueError):
            raise ValidationError("La cantidad debe ser un número válido.")

        if unit_type not in ['KG', 'PZ']:
            raise ValidationError("Tipo de unidad no válido.")
        
        if not Material.objects.filter(id=material_id).exists():
            raise ValidationError("El material seleccionado no existe.")
        
    def delete_all_items_of_ticket(self, ticket_id):
        TicketItem.objects.filter(report=ticket_id).delete()


    def process_ticket_items(self, ticket, items_data):
        """
        Lógica central: Crea, actualiza o elimina ítems basados en el payload.
        """
        incoming_ids = [item.get('id') for item in items_data if item.get('id')]

        # 1. Borrado: Eliminar ítems que no están en el nuevo payload (solo al editar)
        ticket.items.exclude(id__in=incoming_ids).delete()

        # 2. Guardar/Editar:
        for item_data in items_data:
            self.validate_item_data(item_data)
            
            item_id = item_data.get('id')
            material_id = item_data.get('material')
            
            # Update or Create
            TicketItem.objects.update_or_create(
                id=item_id,
                report=ticket,
                defaults={
                    'material_id': material_id,
                    'amount': item_data.get('amount'),
                    'unit_type': item_data.get('unit_type')
                }
            )