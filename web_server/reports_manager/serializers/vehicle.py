from rest_framework import serializers
from ..models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    provider_name = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = ('id', 'brand', 'model', 'plate', 'color', 'is_main', 'provider', 'provider_name')

    def get_provider_name(self, obj):
    # 'obj' es la instancia de Address. Accedemos al objeto Provider relacionado.
        if obj.provider:
            return f"{obj.provider.name} - {obj.provider.id_number}"
        return "Sin proveedor"