from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.db import transaction

from ..serializers import VehicleSerializer
from ..models import Vehicle, Provider, VehiclePhoto
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

            license_plate_file = request.FILES.get('license_plate_photo')
            img_name = str(vehicle.id).replace(" ", "_").lower() + "_plate.png"
            vehicle.license_plate_photo.save(img_name, license_plate_file)
            
            if request.FILES.getlist('vehicle_photos'):
                print("cantidad de fotos recibidas:", len(request.FILES.getlist('vehicle_photos')))
                vehicle_photos_files = request.FILES.getlist('vehicle_photos')
                for index, photo_file in enumerate(vehicle_photos_files):
                    img_name = f"{str(vehicle.id).replace(' ', '_').lower()}_photo_{index + 1}.png"
                    vehicle_photo = VehiclePhoto(vehicle=vehicle)
                    vehicle_photo.image.save(img_name, photo_file)

            return JsonResponse({
                'message': 'Vehículo guardado exitosamente',
                'id': vehicle.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Extraemos el mensaje si es una ValidationError de DRF
            message = e.detail[0] if hasattr(e, 'detail') else str(e)
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['post'])
    def upload_license_plate(self, request):
        try:
            vehicle = Vehicle.objects.get(id=request.data.get('vehicle_id'))
            license_plate_file = request.FILES.get('license_plate')

            if not vehicle:
                return JsonResponse({'error': 'Proveedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            if not license_plate_file:
                return JsonResponse({'error': 'No se ha proporcionado ningún archivo'}, status=status.HTTP_400_BAD_REQUEST)
            
            img_name = str(vehicle.id).replace(" ", "_").lower() + "_plate.png"

            vehicle.license_plate_photo.save(img_name, license_plate_file)
            vehicle.save()

            return JsonResponse({'message': 'Placa subida con éxito'}, status=status.HTTP_200_OK)
        except Vehicle.DoesNotExist:
            return JsonResponse({'error': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)  
        
    @action(detail=False, methods=['patch'])
    def update_license_plate(self, request):
        try:
            vehicle = Vehicle.objects.get(id=request.data.get('vehicle_id'))
            license_plate_file = request.FILES.get('license_plate')
            if not vehicle:
                return JsonResponse({'error': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            if not license_plate_file:
                return JsonResponse({'error': 'No se ha proporcionado ningún archivo'}, status=status.HTTP_400_BAD_REQUEST)
            # Eliminar la foto anterior si existe
            if vehicle.license_plate_photo:
                vehicle.license_plate_photo.delete()
            img_name = str(vehicle.id).replace(" ", "_").lower() + "_plate.png"
            vehicle.license_plate_photo.save(img_name, license_plate_file)
            vehicle.save()
            return JsonResponse({'message': 'Placa actualizada con éxito'}, status=status.HTTP_200_OK)
        except Vehicle.DoesNotExist:
            return JsonResponse({'error': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=True, methods=['get'], url_path='get_license_plate')
    def get_license_plate(self, request, pk=None):
        try:
            vehicle = Vehicle.objects.get(id=pk)
            return JsonResponse({'license_plate_photo': vehicle.license_plate_photo.url if vehicle.license_plate_photo else None}, status=status.HTTP_200_OK)
        except Vehicle.DoesNotExist:
            return JsonResponse({'error': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)  
        
    @action(detail=True, methods=['delete'], url_path='delete_license_plate')
    def delete_license_plate(self, request, pk=None):
        try:
            vehicle = Vehicle.objects.get(id=pk)
            vehicle.license_plate_photo.delete()
            return JsonResponse({'message': 'Placa eliminada con éxito'}, status=status.HTTP_200_OK)
        except Vehicle.DoesNotExist:
            return JsonResponse({'error': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        
    @action(detail=False, methods=['post'], url_path='upload_vehicle_photo')
    def upload_vehicle_photo(self, request):
        try:
            vehicle_id = request.data.get('vehicle_id')
            vehicle = Vehicle.objects.get(id=vehicle_id)
            
            # 1. Usar getlist() para atrapar el array de archivos
            # IMPORTANTE: El string aquí ('vehicle_photos') debe coincidir exactamente 
            # con el 'name' de tu <input type="file" multiple> en React.
            vehicle_photos_files = request.FILES.getlist('vehicle_photos')

            if not vehicle_photos_files:
                return JsonResponse({'error': 'No se ha proporcionado ningún archivo'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Obtenemos la cantidad actual de fotos para nombrar las nuevas secuencialmente
            # (Nota: si le pusiste related_name='photos' al modelo, usa vehicle.photos.count())
            current_count = vehicle.photos.count()

            # 2. Iterar sobre la lista de imágenes enviadas
            for index, photo_file in enumerate(vehicle_photos_files):
                # Sumamos el index para que no se sobreescriban los nombres en la misma iteración
                img_name = f"{str(vehicle.id).replace(' ', '_').lower()}_photo_{current_count + index + 1}.png"

                vehicle_photo = VehiclePhoto(vehicle=vehicle)
                # Asegúrate de que el campo de tu modelo se llame 'photo' (o cámbialo a 'image' según lo hayas definido)
                vehicle_photo.image.save(img_name, photo_file)
                vehicle_photo.save()

            # Respondemos con la cantidad exacta de fotos que se guardaron
            return JsonResponse({'message': f'{len(vehicle_photos_files)} foto(s) de vehículo subida(s) con éxito'}, status=status.HTTP_200_OK)
        
        except Vehicle.DoesNotExist:
            return JsonResponse({'error': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['post'], url_path='replace_vehicle_photo')
    def replace_vehicle_photo(self, request, pk=None):
        try:
            vehicle = Vehicle.objects.get(id=pk)
            vehicle_photos_files = request.FILES.getlist('vehicle_photos')
            current_count = vehicle.photos.count()

            if not vehicle_photos_files:
                return JsonResponse({'error': 'No se ha proporcionado ningún archivo'}, status=status.HTTP_400_BAD_REQUEST)
            
            old_photos = VehiclePhoto.objects.filter(vehicle=vehicle)
            old_photos.delete()  

            for index, photo_file in enumerate(vehicle_photos_files):
                vehicle_photo = VehiclePhoto(vehicle=vehicle)
                img_name = f"{str(vehicle.id).replace(' ', '_').lower()}_photo_{current_count + index + 1}.png"
                vehicle_photo.image.save(img_name, photo_file)  # Guardar la nueva foto
                vehicle_photo.save()

            return JsonResponse({'message': 'Foto de vehículo reemplazada con éxito'}, status=status.HTTP_200_OK)

        except Vehicle.DoesNotExist:
            return JsonResponse({'error': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['get'], url_path='get_vehicle_photos')
    def get_vehicle_photos(self, request, pk=None):
        try:
            vehicle = Vehicle.objects.get(id=pk)
            photos = VehiclePhoto.objects.filter(vehicle=vehicle)
            photos_urls = [{'id': photo.id, 'url': photo.image.url} for photo in photos]
            return JsonResponse({'vehicle_photos': photos_urls}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)  
    
    @action(detail=False, methods=['delete'], url_path='delete_vehicle_photo')
    def delete_vehicle_photo(self, request):
        try:   
            vehicle_photo = VehiclePhoto.objects.get(id=request.data.get('photo_id'))
            vehicle_photo.image.delete()  # Eliminar el archivo de la foto
            vehicle_photo.delete()  # Eliminar el registro de la base de datos

            return JsonResponse({'message': 'Foto de vehículo eliminada con éxito'}, status=status.HTTP_200_OK)
        
        except VehiclePhoto.DoesNotExist:
            return JsonResponse({'error': 'Foto de vehículo no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        except Vehicle.DoesNotExist:
            return JsonResponse({'error': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
            vehicle.license_plate_photo.delete()  # Eliminar la foto de la placa si existe
            for photo in vehicle.photos.all():
                photo.image.delete()  # Eliminar las fotos de vehículo si existen
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