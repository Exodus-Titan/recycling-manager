from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from ..models import DeliveryNoteItem, Material, DeliveryNote
from ..serializers import DeliveryNoteSerializer

class DeliveryNoteItemViewSet(viewsets.ModelViewSet):
    queryset = DeliveryNoteItem.objects.all()
    serializer_class = DeliveryNoteSerializer

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
        
    def delete_all_items_of_delivery_note(self, delivery_note_id):
        DeliveryNoteItem.objects.filter(delivery_note=delivery_note_id).delete()


    def process_delivery_note_items(self, delivery_note, items_data):
        """
        Lógica central: Crea, actualiza o elimina ítems basados en el payload.
        """
        incoming_ids = [item.get('id') for item in items_data if item.get('id')]

        # 1. Borrado: Eliminar ítems que no están en el nuevo payload (solo al editar)
        delivery_note.items.exclude(id__in=incoming_ids).delete()

        # 2. Guardar/Editar:
        for item_data in items_data:
            self.validate_item_data(item_data)
            
            item_id = item_data.get('id')
            material_id = item_data.get('material')
            
            # Update or Create
            DeliveryNoteItem.objects.update_or_create(
                id=item_id,
                delivery_note=delivery_note,
                defaults={
                    'material_id': material_id,
                    'amount': item_data.get('amount'),
                    'unit_type': item_data.get('unit_type')
                }
            )