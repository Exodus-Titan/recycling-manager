from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.http import JsonResponse
from ..models import DeliveryNote, Company, Ticket, Provider
from ..serializers import DeliveryNoteSerializer

class DeliveryNoteViewSet(viewsets.ModelViewSet):
    queryset = DeliveryNote.objects.all()
    serializer_class = DeliveryNoteSerializer

    def validate_delivery_note_data(self, data):
        # Campos obligatorios de texto y sus límites según el modelo
        text_fields = {
            'truck_brand': 50, 'truck_model': 50, 'truck_plate': 20, 'truck_color': 20,
            'start_address': 200, 'start_city': 100, 'start_state': 100,
            'end_address': 200, 'end_city': 100, 'end_state': 100
        }
        
        for field, limit in text_fields.items():
            val = data.get(field)
            if not val:
                raise ValidationError(f"El campo {field.replace('_', ' ')} es requerido.")
            if len(str(val)) > limit:
                raise ValidationError(f"El campo {field} no puede exceder los {limit} caracteres.")

        # Validar relaciones y fechas
        if not data.get('ticket'):
            raise ValidationError("Debe asociar un ticket a la nota de entrega.")
        if not data.get('provider'):
            raise ValidationError("El proveedor es requerido.")
        if not data.get('startdate') or not data.get('enddate'):
            raise ValidationError("Las fechas de inicio y fin son requeridas.")
        
        return True

    @transaction.atomic
    @action(detail=False, methods=['post'], url_path='save_delivery_note')
    def save_delivery_note(self, request):
        try:
            data = request.data
            self.validate_delivery_note_data(data)

            # Obtenemos instancias relacionadas
            # Asumimos ID 1 para la compañía como en tu ejemplo anterior
            company = Company.objects.get(id=1)
            ticket = Ticket.objects.get(id=data.get('ticket'))
            provider = Provider.objects.get(id=data.get('provider'))

            delivery_note = DeliveryNote.objects.create(
                company=company,
                ticket=ticket,
                provider=provider,
                truck_brand=data.get('truck_brand'),
                truck_model=data.get('truck_model'),
                truck_plate=data.get('truck_plate'),
                truck_color=data.get('truck_color'),
                start_address=data.get('start_address'),
                start_city=data.get('start_city'),
                start_state=data.get('start_state'),
                end_address=data.get('end_address'),
                end_city=data.get('end_city'),
                end_state=data.get('end_state'),
                startdate=data.get('startdate'),
                enddate=data.get('enddate')
            )

            return JsonResponse({
                'message': 'Nota de entrega creada con éxito',
                'id': delivery_note.id
            }, status=status.HTTP_201_CREATED)

        except (Ticket.DoesNotExist, Provider.DoesNotExist):
            return JsonResponse({'error': 'Ticket o Proveedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            message = e.detail[0] if isinstance(e.detail, list) else e.detail
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='get_note_by_id')
    def get_note_by_id(self, request, pk=None):
        try:
            note = DeliveryNote.objects.get(id=pk)
            serializer = DeliveryNoteSerializer(note)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except DeliveryNote.DoesNotExist:
            return JsonResponse({'error': 'Nota de entrega no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @transaction.atomic
    @action(detail=True, methods=['patch'], url_path='update_delivery_note')
    def update_delivery_note(self, request, pk=None):
        try:
            note = DeliveryNote.objects.get(id=pk)
            data = request.data
            self.validate_delivery_note_data(data)

            # Actualizamos campos
            note.ticket = Ticket.objects.get(id=data.get('ticket'))
            note.provider = Provider.objects.get(id=data.get('provider'))
            note.truck_brand = data.get('truck_brand')
            note.truck_model = data.get('truck_model')
            note.truck_plate = data.get('truck_plate')
            note.truck_color = data.get('truck_color')
            note.start_address = data.get('start_address')
            note.start_city = data.get('start_city')
            note.start_state = data.get('start_state')
            note.end_address = data.get('end_address')
            note.end_city = data.get('end_city')
            note.end_state = data.get('end_state')
            note.startdate = data.get('startdate')
            note.enddate = data.get('enddate')
            
            note.save()

            return JsonResponse({'message': 'Nota de entrega actualizada con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_delivery_note(self, request, pk=None):
        try:
            note = DeliveryNote.objects.get(id=pk)
            note.delete()
            return JsonResponse({'message': 'Nota de entrega eliminada con éxito'}, status=status.HTTP_200_OK)
        except DeliveryNote.DoesNotExist:
            return JsonResponse({'error': 'Nota no encontrada'}, status=status.HTTP_404_NOT_FOUND)