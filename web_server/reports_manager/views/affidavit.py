from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.http import JsonResponse
from ..models import Affidavit, Company, Ticket, Provider
from ..serializers import AffidavitSerializer # Asegúrate de crear este serializer

class AffidavitViewSet(viewsets.ModelViewSet):
    queryset = Affidavit.objects.all()
    serializer_class = AffidavitSerializer

    def validate_affidavit_data(self, data):
        # Límites basados en tu modelo Affidavit
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

        # Validaciones de integridad
        if not data.get('ticket'):
            raise ValidationError("Debe asociar un ticket a la declaración jurada.")
        if not data.get('provider'):
            raise ValidationError("El proveedor es requerido.")
        if not data.get('startdate') or not data.get('enddate'):
            raise ValidationError("Las fechas de inicio y fin son requeridas.")
        
        return True

    @transaction.atomic
    @action(detail=False, methods=['post'], url_path='save_affidavit')
    def save_affidavit(self, request):
        try:
            data = request.data
            self.validate_affidavit_data(data)

            # Asumimos ID 1 para la compañía por defecto
            company = Company.objects.get(id=1)
            ticket = Ticket.objects.get(id=data.get('ticket'))
            provider = Provider.objects.get(id=data.get('provider'))

            affidavit = Affidavit.objects.create(
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
                'message': 'Declaración jurada creada con éxito',
                'id': affidavit.id
            }, status=status.HTTP_201_CREATED)

        except (Ticket.DoesNotExist, Provider.DoesNotExist):
            return JsonResponse({'error': 'Ticket o Proveedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            message = e.detail[0] if isinstance(e.detail, list) else e.detail
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='get_affidavit_by_id')
    def get_affidavit_by_id(self, request, pk=None):
        try:
            affidavit = Affidavit.objects.get(id=pk)
            serializer = AffidavitSerializer(affidavit)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except Affidavit.DoesNotExist:
            return JsonResponse({'error': 'Declaración jurada no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @transaction.atomic
    @action(detail=True, methods=['patch'], url_path='update_affidavit')
    def update_affidavit(self, request, pk=None):
        try:
            affidavit = Affidavit.objects.get(id=pk)
            data = request.data
            self.validate_affidavit_data(data)

            affidavit.ticket = Ticket.objects.get(id=data.get('ticket'))
            affidavit.provider = Provider.objects.get(id=data.get('provider'))
            affidavit.truck_brand = data.get('truck_brand')
            affidavit.truck_model = data.get('truck_model')
            affidavit.truck_plate = data.get('truck_plate')
            affidavit.truck_color = data.get('truck_color')
            affidavit.start_address = data.get('start_address')
            affidavit.start_city = data.get('start_city')
            affidavit.start_state = data.get('start_state')
            affidavit.end_address = data.get('end_address')
            affidavit.end_city = data.get('end_city')
            affidavit.end_state = data.get('end_state')
            affidavit.startdate = data.get('startdate')
            affidavit.enddate = data.get('enddate')
            
            affidavit.save()

            return JsonResponse({'message': 'Declaración jurada actualizada con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_affidavit(self, request, pk=None):
        try:
            affidavit = Affidavit.objects.get(id=pk)
            affidavit.delete()
            return JsonResponse({'message': 'Declaración jurada eliminada con éxito'}, status=status.HTTP_200_OK)
        except Affidavit.DoesNotExist:
            return JsonResponse({'error': 'Declaración no encontrada'}, status=status.HTTP_404_NOT_FOUND)