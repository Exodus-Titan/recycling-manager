from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.db import transaction
from ..serializers import OriginAddressSerializer
from ..models import OriginAddress
from rest_framework.exceptions import ValidationError

class OriginAddressViewSet(viewsets.ModelViewSet):
    queryset = OriginAddress.objects.all()
    serializer_class = OriginAddressSerializer

    @csrf_exempt
    @action(detail=False, methods=['post'], url_path='save_address')
    def save_address(self, request):
        try:
            data = request.data 

            # Validación de datos
            self.validate_address_data(
                data.get('address'), 
                data.get('city'), 
                data.get('state'), 
            )


            address_obj = OriginAddress.objects.create(
                address=data.get('address'),
                city=data.get('city'),
                state=data.get('state'),
            )

            return JsonResponse({
                'message': 'Dirección guardada exitosamente',
                'id': address_obj.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            message = e.detail[0] if hasattr(e, 'detail') else str(e)
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['get'], url_path='get_addresses')
    def get_addresses(self, request):
        addresses = OriginAddress.objects.all()
        serializer = self.get_serializer(addresses, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    @csrf_exempt
    @action(detail=True, methods=['get'], url_path='get_address_by_id')
    def get_address_by_id(self, request, pk=None):
        try:
            address_obj = OriginAddress.objects.get(id=pk)
            serializer = self.get_serializer(address_obj)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except OriginAddress.DoesNotExist:
            return JsonResponse({'error': 'Dirección no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @csrf_exempt
    @action(detail=True, methods=['put', 'patch'], url_path='update_address')
    def update_address(self, request, pk=None):
        try:
            address_obj = OriginAddress.objects.get(id=pk)
            data = request.data
            
            self.validate_address_data(
                data.get('address'), 
                data.get('city'), 
                data.get('state'), 
            )

            with transaction.atomic():
                address_obj.address = data.get('address', address_obj.address)
                address_obj.city = data.get('city', address_obj.city)
                address_obj.state = data.get('state', address_obj.state)
                
                
                address_obj.save()

            return JsonResponse({'message': 'Dirección actualizada con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            message = e.detail[0] if hasattr(e, 'detail') else str(e)
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    @csrf_exempt
    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_address(self, request, pk=None):
        try:
            address_obj = OriginAddress.objects.get(id=pk)
            address_obj.delete()
            return JsonResponse({'message': 'Dirección eliminada con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def validate_address_data(self, address, city, state):
        if not address or len(address) > 255:
            raise ValidationError('La dirección es requerida y debe tener máximo 255 caracteres.')
        
        if not city or len(city) > 100:
            raise ValidationError('La ciudad es requerida y debe tener máximo 100 caracteres.')
        
        if not state or len(state) > 100:
            raise ValidationError('El estado es requerido y debe tener máximo 100 caracteres.')
        
        return True