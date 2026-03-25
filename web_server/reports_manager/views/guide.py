from django.shortcuts import render
from rest_framework import viewsets
from ..models import Company, Ticket
from ..serializers import GuideSerializer
from ..models import Guide
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.http import JsonResponse
from rest_framework import viewsets, status


class GuideViewSet(viewsets.ModelViewSet):
    queryset = Guide.objects.all()
    serializer_class = GuideSerializer


    def validate_guide_data(self, status, date, ticket, inspection_record_number):
        if not status or len(status) > 30:
            raise ValidationError("El estado de la guía es obligatorio y debe tener máximo 30 caracteres.")
        
        if not date:
            raise ValidationError("La fecha es requerida.")
        
        if not ticket:
            raise ValidationError("El ticket es requerido.")
        
        if not inspection_record_number or len(inspection_record_number) > 20:
            raise ValidationError("El número de registro de inspección es opcional y debe tener máximo 20 caracteres.")
        
        return True
        
    @transaction.atomic
    @action(detail=False, methods=['post'])
    def save_guide(self, request):
        try:
            
            data = request.data
            guide_status = data.get('status')
            date = data.get('date')
            ticket_id = data.get('ticket')
            inspection_record_number = data.get('inspection_record_number')


            self.validate_guide_data(guide_status, date, ticket_id, inspection_record_number)

            company = Company.objects.get(id=1)
            ticket = Ticket.objects.get(id=ticket_id)

            print(company)
            print(ticket)


            guide = Guide.objects.create(
                status=guide_status,
                date=date,
                ticket=ticket,
                inspection_record_number=inspection_record_number,
                company=company
            )

            return JsonResponse({
                'message': 'Guía guardada con éxito', 
                'id': guide.id
            }, status=status.HTTP_201_CREATED)
        
        except ValidationError as e:
            # Extraemos el mensaje de texto del error de validación
            message = e.detail[0] if isinstance(e.detail, list) else e.detail
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['get'], url_path='get_guide_by_id')
    def get_guide_by_id(self, pk):
        try:
            guide = Guide.objects.get(id=pk)
            serializer = GuideSerializer(guide)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except Guide.DoesNotExist:
            return JsonResponse({'error': 'Guía no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=True, methods=['patch'], url_path='update_guide')
    def update_guide(self, request, pk=None):
        try:
            guide = Guide.objects.get(id=pk)
            data = request.data
            ticket_id = data.get('ticket')
            guide_status = data.get('status')
            date = data.get('date')
            inspection_record_number = data.get('inspection_record_number')
            
            self.validate_guide_data(guide_status, date, ticket_id, inspection_record_number)

            ticket = Ticket.objects.get(id=ticket_id)


            with transaction.atomic():
                guide.status = guide_status
                guide.date = date
                guide.ticket = ticket
                guide.inspection_record_number = inspection_record_number
                guide.save()

            return JsonResponse({'message': 'Guía actualizada con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            message = e.detail[0] if hasattr(e, 'detail') else str(e)
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        

    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_guide(self, request, pk=None):
        try:
            guide = Guide.objects.get(id=pk)
            guide.delete()
            return JsonResponse({'message': 'Guía eliminada con éxito'}, status=status.HTTP_200_OK)
        except Guide.DoesNotExist: 
            return JsonResponse({'error': 'Guia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
            
        