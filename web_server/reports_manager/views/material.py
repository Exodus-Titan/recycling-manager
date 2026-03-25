from django.http import JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.http import JsonResponse
from rest_framework.exceptions import ValidationError
from django.db import transaction
from ..models import Material
from ..serializers import MaterialSerializer

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

    @action(detail=False, methods=['post'], url_path='save_material')
    def save_material(self, request):
        try:
            data = request.data
            name = data.get('name')
            description = data.get('description', '')

            self.validate_material_data(name)

            material = Material.objects.create(name=name, description=description)

            return JsonResponse({
                'message': 'Material creado con éxito',
                'id': material.id
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return JsonResponse({'error': e.detail[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], url_path='update_material')
    def update_material(self, request, pk=None):
        try:
            material = self.get_object()
            data = request.data
            
            name = data.get('name')
            description = data.get('description', material.description)

            self.validate_material_data(name)

            with transaction.atomic():
                material.name = name
                material.description = description
                material.save()

            return JsonResponse({'message': 'Material actualizado con éxito'})
        except ValidationError as e:
            return JsonResponse({'error': e.detail[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_material(self, request, pk=None):
        try:
            material = Material.objects.get(id=pk)
            material.delete()
            return JsonResponse({'message': 'Proveedor eliminado con éxito'}, status=status.HTTP_200_OK)
        
        except Material.DoesNotExist:
            return JsonResponse({'error': 'Proveedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def validate_material_data(self, name):
        if not name or len(name.strip()) < 2:
            raise ValidationError("El nombre del material es obligatorio y debe ser válido.")
        
        if len(name.strip()) > 255:
            raise ValidationError("El nombre del material debe tener máximo 50 caracteres.")
        
        # Opcional: Evitar materiales duplicados por nombre
        if Material.objects.filter(name__iexact=name.strip()).exclude(id=self.kwargs.get('pk')).exists():
            raise ValidationError("Ya existe un material con este nombre.")