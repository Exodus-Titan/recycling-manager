from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.db import transaction
from ..serializers import TicketSerializer
from ..models import Ticket
from rest_framework.exceptions import ValidationError
from .ticket_item import TicketItemViewSet
from .provider import Provider
from rest_framework.response import Response


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

    @transaction.atomic
    @csrf_exempt
    @action(detail=False, methods=['post'], url_path='save_ticket')
    def save_ticket(self, request):
        try:
            data = request.data 
            items_data = data.pop('items', [])
            
            
            # Validación de datos antes de crear
            self.validate_ticket_data(data)

            provider = Provider.objects.get(id=data.get('provider'))

            ticket = Ticket.objects.create(
                ticket_number=data.get('ticket_number'),
                date=data.get('date'),
                #client_name=data.get('client_name'),
                provider=provider,
                employee_name=data.get('employee_name'),
                total_weight=data.get('total_weight'),
                installment_amount=data.get('installment_amount')
            )

            item_service = TicketItemViewSet()
            item_service.process_ticket_items(ticket, items_data)

            return JsonResponse({
                'message': 'Ticket guardado exitosamente',
                'id': ticket.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            message = e.detail[0] if hasattr(e, 'detail') else str(e)
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    @csrf_exempt
    @action(detail=True, methods=['get'], url_path='get_ticket_by_id')
    def get_ticket_by_id(self, request, pk=None):
        try:
            ticket = Ticket.objects.get(id=pk)
            serializer = self.get_serializer(ticket)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except Ticket.DoesNotExist:
            return JsonResponse({'error': 'Ticket no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @transaction.atomic
    @csrf_exempt
    @action(detail=True, methods=['put', 'patch'], url_path='update_ticket')
    def update_ticket(self, request, pk=None):
        try:
            ticket = Ticket.objects.get(id=pk)
            data = request.data
            items_data = data.pop('items', [])

            print(items_data)
            
            self.validate_ticket_data(data, ticket_id=ticket.id)

            provider = Provider.objects.get(id=data.get('provider'))

            with transaction.atomic():
                ticket.ticket_number = data.get('ticket_number', ticket.ticket_number)
                ticket.date = data.get('date', ticket.date)
                #ticket.client_name = data.get('client_name', ticket.client_name)
                ticket.provider = provider
                ticket.employee_name = data.get('employee_name', ticket.employee_name)
                ticket.total_weight = data.get('total_weight', ticket.total_weight)
                ticket.installment_amount = data.get('installment_amount', ticket.installment_amount)
                ticket.save()

                item_service = TicketItemViewSet()
                item_service.process_ticket_items(ticket, items_data)

            return JsonResponse({'message': 'Ticket actualizado con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            message = e.detail[0] if hasattr(e, 'detail') else str(e)
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    @csrf_exempt
    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_ticket(self, request, pk=None):
        try:
            item_service = TicketItemViewSet()
            item_service.delete_all_items_of_ticket(pk)
            ticket = Ticket.objects.get(id=pk)
            ticket.delete()
            return JsonResponse({'message': 'Ticket eliminado con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['get'], url_path='get_tickets_without_guide')
    def get_tickets_without_guide(self, request):
        try:
            tickets = Ticket.objects.filter(guide__isnull=True).values('id', 'ticket_number')

            return Response(list(tickets), status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['get'], url_path='get_tickets_without_delivery_note')
    def get_tickets_without_delivery_note(self, request):
        try:
            tickets = Ticket.objects.filter(deliverynote__isnull=True).values('id', 'ticket_number')

            return Response(list(tickets), status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['get'], url_path='get_tickets_without_affidavit')
    def get_tickets_without_affidavit(self, request):
        try:
            tickets = Ticket.objects.filter(affidavit__isnull=True).values('id', 'ticket_number')

            return Response(list(tickets), status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='get_actual_ticket')
    def get_actual_ticket(self, request, pk=None):
        try:
            ticket = Ticket.objects.filter(id=pk).values('id', 'ticket_number')
            return Response(ticket, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def validate_ticket_data(self, data, ticket_id=None):
        ticket_number = data.get('ticket_number')
        total_weight = data.get('total_weight')
        installment_amount = data.get('installment_amount')
        provider = data.get('provider')

        try:
            Provider.objects.get(id=provider)
        except Provider.DoesNotExist:
            raise ValidationError('El proveedor seleccionado no existe.')

        # 1. Validación de campos obligatorios
        if not ticket_number:
            raise ValidationError('El número de ticket es requerido.')
        
        if not data.get('date'):
            raise ValidationError('La fecha es requerida.')

        # 2. Validación de unicidad del número de ticket
        query = Ticket.objects.filter(ticket_number=ticket_number)
        if ticket_id:
            query = query.exclude(id=ticket_id)
        if query.exists():
            raise ValidationError('Este número de ticket ya existe en el sistema.')

        # 3. Validación de valores numéricos
        try:
            if float(total_weight) <= 0:
                raise ValidationError('El peso total debe ser mayor a 0.')
            if float(installment_amount) < 0:
                raise ValidationError('El monto no puede ser negativo.')
        except (TypeError, ValueError):
            raise ValidationError('El peso y el monto deben ser valores numéricos válidos.')

        return True