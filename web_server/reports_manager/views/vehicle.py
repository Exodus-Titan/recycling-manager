from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.db import transaction
from ..serializers import VehicleSerializer
from ..models import Vehicle, Provider
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

    def remove_main(self, provider):
        Vehicle.objects.filter(
            provider=provider, 
            is_main=True
        ).update(is_main=False)

    @csrf_exempt
    @action(detail=False, methods=['post'], url_path='save_vehicle')
    def save_vehicle(self, request):
        try:
            data = request.data 
            provider_id = data.get('provider')
            is_main = True if data.get('is_main') == 'on' else False

            # Validación (mantiene su lógica interna de errores)
            self.validate_vehicle_data(
                data.get('plate'), 
                data.get('brand'), 
                data.get('model'), 
                data.get('color'), 
                provider_id
            )

            provider = Provider.objects.get(id=provider_id)

            if is_main:
                self.remove_main(provider)

            vehicle = Vehicle.objects.create(
                brand=data.get('brand'),
                model=data.get('model'),
                plate=data.get('plate'),
                color=data.get('color'),
                provider=provider,
                is_main=is_main
            )

            return JsonResponse({
                'message': 'Vehículo guardado exitosamente',
                'id': vehicle.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Extraemos el mensaje si es una ValidationError de DRF
            message = e.detail[0] if hasattr(e, 'detail') else str(e)
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    @csrf_exempt
    @action(detail=True, methods=['get'], url_path='get_vehicle_by_id')
    def get_vehicle_by_id(self, request, pk=None):
        try:
            vehicle = Vehicle.objects.get(id=pk)
            serializer = self.get_serializer(vehicle)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except Exception:
            return JsonResponse({'error': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @csrf_exempt
    @action(detail=True, methods=['put', 'patch'], url_path='update_vehicle')
    def update_vehicle(self, request, pk=None):
        try:
            vehicle = Vehicle.objects.get(id=pk)
            data = request.data
            
            is_main = True if data.get('is_main') == 'on' else False
            provider_id = data.get('provider')
            
            # Validamos antes de actualizar
            self.validate_vehicle_data(
                data.get('plate'), 
                data.get('brand'), 
                data.get('model'), 
                data.get('color'), 
                provider_id,
                id=vehicle.id
            )

            with transaction.atomic():
                if is_main:
                    self.remove_main(vehicle.provider)
                
                vehicle.brand = data.get('brand', vehicle.brand)
                vehicle.model = data.get('model', vehicle.model)
                vehicle.plate = data.get('plate', vehicle.plate)
                vehicle.color = data.get('color', vehicle.color)
                
                if provider_id:
                    vehicle.provider = Provider.objects.get(id=provider_id)
                
                vehicle.is_main = is_main
                vehicle.save()

            return JsonResponse({'message': 'Vehículo actualizado con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            message = e.detail[0] if hasattr(e, 'detail') else str(e)
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    @csrf_exempt
    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_vehicle(self, request, pk=None):
        try:
            vehicle = Vehicle.objects.get(id=pk)
            vehicle.delete()
            return JsonResponse({'message': 'Vehículo eliminado con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

    @action(detail=True, methods=['get'], url_path='get_vehicles_by_provider')
    def get_vehicles_by_provider(self, request, pk=None):
        try:
            vehicles = Vehicle.objects.filter(provider=pk)
            serializer = VehicleSerializer(vehicles, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)     
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
       

    def validate_vehicle_data(self, plate, brand, model, color, provider_id, id=None):
        # Mantiene su lógica original sin JsonResponse como pediste
        if not brand or len(brand) > 50:
            raise ValidationError('La marca del vehículo debe tener máximo 50 caracteres.')
        
        if not model or len(model) > 50:
            raise ValidationError('El modelo del vehículo debe tener máximo 50 caracteres.')
        
        if not color or len(color) > 50:
            raise ValidationError('El color del vehículo debe tener máximo 50 caracteres.')
        
        if not plate:
            raise ValidationError('La placa del vehículo es requerida.')

        if len(plate) > 12 or len(plate) < 6:
            raise ValidationError('La placa del vehículo debe tener entre 6 y 12 caracteres.')
        
        try:
            Provider.objects.get(id=provider_id)
        except Provider.DoesNotExist:
            raise ValidationError('El proveedor seleccionado no existe.')
        
        query = Vehicle.objects.filter(plate=plate)
        if id:
            query = query.exclude(id=id)
        
        if query.exists():
            raise ValidationError('Esta placa ya está registrada en el sistema.')
        return True