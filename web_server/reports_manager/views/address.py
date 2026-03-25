from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.db import transaction
from ..serializers import AddressSerializer
from ..models import Address, Provider
from rest_framework.exceptions import ValidationError

class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

    @csrf_exempt
    @action(detail=False, methods=['post'], url_path='save_address')
    def save_address(self, request):
        try:
            data = request.data 
            provider_id = data.get('provider')

            # Validación de datos
            self.validate_address_data(
                data.get('address'), 
                data.get('city'), 
                data.get('state'), 
                provider_id
            )

            provider = Provider.objects.get(id=provider_id)

            address_obj = Address.objects.create(
                address=data.get('address'),
                city=data.get('city'),
                state=data.get('state'),
                provider=provider
            )

            return JsonResponse({
                'message': 'Dirección guardada exitosamente',
                'id': address_obj.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            message = e.detail[0] if hasattr(e, 'detail') else str(e)
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    @csrf_exempt
    @action(detail=True, methods=['get'], url_path='get_address_by_id')
    def get_address_by_id(self, request, pk=None):
        try:
            address_obj = Address.objects.get(id=pk)
            serializer = self.get_serializer(address_obj)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except Address.DoesNotExist:
            return JsonResponse({'error': 'Dirección no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @csrf_exempt
    @action(detail=True, methods=['put', 'patch'], url_path='update_address')
    def update_address(self, request, pk=None):
        try:
            address_obj = Address.objects.get(id=pk)
            data = request.data
            provider_id = data.get('provider')
            
            self.validate_address_data(
                data.get('address'), 
                data.get('city'), 
                data.get('state'), 
                provider_id
            )

            with transaction.atomic():
                address_obj.address = data.get('address', address_obj.address)
                address_obj.city = data.get('city', address_obj.city)
                address_obj.state = data.get('state', address_obj.state)
                
                if provider_id:
                    address_obj.provider = Provider.objects.get(id=provider_id)
                
                address_obj.save()

            return JsonResponse({'message': 'Dirección actualizada con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            message = e.detail[0] if hasattr(e, 'detail') else str(e)
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    @csrf_exempt
    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_address(self, request, pk=None):
        try:
            address_obj = Address.objects.get(id=pk)
            address_obj.delete()
            return JsonResponse({'message': 'Dirección eliminada con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def validate_address_data(self, address, city, state, provider_id):
        if not address or len(address) > 255:
            raise ValidationError('La dirección es requerida y debe tener máximo 255 caracteres.')
        
        if not city or len(city) > 100:
            raise ValidationError('La ciudad es requerida y debe tener máximo 100 caracteres.')
        
        if not state or len(state) > 100:
            raise ValidationError('El estado es requerido y debe tener máximo 100 caracteres.')
        
        if not provider_id:
            raise ValidationError('El proveedor es requerido.')
            
        try:
            Provider.objects.get(id=provider_id)
        except Provider.DoesNotExist:
            raise ValidationError('El proveedor seleccionado no existe.')
            
        return True