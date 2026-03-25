from django.shortcuts import render
from rest_framework import viewsets
from ..serializers import ProviderSerializer
from ..models import Provider
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.decorators import action
import re
from rest_framework.exceptions import ValidationError
from django.db import transaction
from rest_framework import status



class ProviderViewSet(viewsets.ModelViewSet):
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer

    @csrf_exempt
    @action(detail=False, methods=['post'])
    def save_provider(self, request):
        try:
            # DRF ya parsea el body si usas request.data, 
            # pero mantengo json.loads si prefieres manejar el raw body
            data = json.loads(request.body)
            
            name = data.get('name')
            id_number = data.get('id_number')

            self.validate_provider_data(name, id_number)

            provider = Provider.objects.create(name=name, id_number=id_number)

            return JsonResponse({
                'message': 'Proveedor guardado con éxito', 
                'id': provider.id
            }, status=status.HTTP_201_CREATED)
        
        except ValidationError as e:
            # Extraemos el mensaje de texto del error de validación
            message = e.detail[0] if isinstance(e.detail, list) else e.detail
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @csrf_exempt
    @action(detail=True, methods=['patch'])
    def update_provider(self, request, pk=None):
        try:
            data = json.loads(request.body)
            name = data.get('name')
            id_number = data.get('id_number')

            self.validate_provider_data(name, id_number)
            provider = Provider.objects.get(id=pk)

            with transaction.atomic():
                provider.name = name
                provider.id_number = id_number
                provider.save()

            return JsonResponse({'message': 'Proveedor actualizado con éxito'}, status=status.HTTP_200_OK)
        
        except Provider.DoesNotExist:
            return JsonResponse({'error': 'Proveedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            message = e.detail[0] if isinstance(e.detail, list) else e.detail
            return JsonResponse({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @csrf_exempt
    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_provider(self, request, pk=None):
        try:
            provider = Provider.objects.get(id=pk)
            provider.delete()
            return JsonResponse({'message': 'Proveedor eliminado con éxito'}, status=status.HTTP_200_OK)
        
        except Provider.DoesNotExist:
            return JsonResponse({'error': 'Proveedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @csrf_exempt
    @action(detail=True, methods=['get'], url_path='get_provider_by_id')
    def get_provider_by_id(self, request, pk=None):
        try:
            provider = Provider.objects.get(id=pk)
            serializer = ProviderSerializer(provider)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        
        except Provider.DoesNotExist:
            return JsonResponse({'error': 'Proveedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def validate_provider_data(self, name, id_number):
        if not name or len(name) > 50:
            raise ValidationError("El nombre debe tener máximo 50 caracteres.")
        
        if any(char.isdigit() for char in name):
            raise ValidationError("El nombre no puede contener números.")

        if not id_number:
            raise ValidationError("El número de cédula/RIF es requerido.")
            
        if not str(id_number).isdigit():
            raise ValidationError("El número de cédula/RIF debe contener solo números.")
            
        if not (8 <= len(str(id_number)) <= 14):
            raise ValidationError("El número de cédula/RIF debe tener entre 8 y 14 caracteres.")

        return True